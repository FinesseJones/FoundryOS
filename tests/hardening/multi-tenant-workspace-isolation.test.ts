import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, MemoryRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { WebCrawler } from '../../src/core/ingestion/crawler';

const originalCrawl = WebCrawler.prototype.crawlWebsite;

beforeEach(() => {
  WebCrawler.prototype.crawlWebsite = async function (targetUrl: string) {
    const normalizedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const urlObj = new URL(normalizedUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const fallbackPage = (this as any).generateFallbackCrawledPage(baseUrl);
    const targetPaths = ['/', '/about', '/pricing', '/services', '/faq', '/blog', '/contact'];
    const pages = targetPaths.map((path) => ({
      ...fallbackPage,
      url: `${baseUrl}${path}`,
    }));
    return {
      targetUrl,
      baseUrl,
      sitemapFound: true,
      robotsTxtFound: true,
      pages,
      discoveredNavItems: ['/about', '/pricing', '/services', '/products', '/contact'],
      pricingSignals: [
        `Why Customers Choose ${fallbackPage.title.split('—')[0].trim()}`,
        `${fallbackPage.title.split('—')[0].trim()} Core Solutions`,
        `Enterprise Plans for ${fallbackPage.title.split('—')[0].trim()}`,
        'Frequently Asked Questions',
      ],
      serviceSignals: ['Enterprise Knowledge Engine', 'Multi-Agent Automation', 'Brand Analytics'],
      faqItems: [{ question: 'How fast is setup?', answer: 'Instant onboarding.' }],
      totalBytesCrawled: pages.reduce((acc, p) => acc + p.rawHtml.length, 0),
      durationMs: 2,
    };
  };
});

afterEach(() => {
  WebCrawler.prototype.crawlWebsite = originalCrawl;
});

test('TACF Multi-Tenant Client Workspace Separation Security Tests', async (t) => {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const memoryRepo = new MemoryRepository();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  await t.test('1. Admin can view multiple client organizations and workspaces', async () => {
    const client1 = await onboardingService.executeCustomerOnboarding({
      userEmail: 'owner@hvac-corp.com',
      userName: 'HVAC Admin',
      organizationName: 'Carrier HVAC Corp',
      companyName: 'Carrier HVAC',
      websiteUrl: 'https://www.carrier.com',
    });

    const client2 = await onboardingService.executeCustomerOnboarding({
      userEmail: 'owner@sweetgreen.com',
      userName: 'Sweetgreen Admin',
      organizationName: 'Sweetgreen Inc',
      companyName: 'Sweetgreen',
      websiteUrl: 'https://www.sweetgreen.com',
    });

    assert.ok(client1.workspaceId);
    assert.ok(client2.workspaceId);
    assert.notStrictEqual(client1.workspaceId, client2.workspaceId);
    assert.notStrictEqual(client1.session.organizationId, client2.session.organizationId);

    // Verify both client records are distinct in repository
    const dna1 = await dnaRepo.getDNA({
      organizationId: client1.session.organizationId,
      businessId: client1.businessDNA.businessId,
    });
    const dna2 = await dnaRepo.getDNA({
      organizationId: client2.session.organizationId,
      businessId: client2.businessDNA.businessId,
    });

    assert.strictEqual(dna1?.companyIdentity.companyName.value, 'Carrier HVAC');
    assert.strictEqual(dna2?.companyIdentity.companyName.value, 'Sweetgreen');
  });

  await t.test('2. Client A cannot access Client B workspace data or Business DNA', async () => {
    const clientA = await onboardingService.executeCustomerOnboarding({
      userEmail: 'admin@clientA.com',
      userName: 'Client A Admin',
      organizationName: 'Client A Organization',
      companyName: 'Client A',
      websiteUrl: 'https://clienta.com',
    });

    const clientB = await onboardingService.executeCustomerOnboarding({
      userEmail: 'admin@clientB.com',
      userName: 'Client B Admin',
      organizationName: 'Client B Organization',
      companyName: 'Client B',
      websiteUrl: 'https://clientb.com',
    });

    // Client A attempts to fetch Client B's DNA using Client A's organizationId -> Returns null (blocked by tenant wall)
    const crossTenantResult = await dnaRepo.getDNA({
      organizationId: clientA.session.organizationId,
      businessId: clientB.businessDNA.businessId,
    });

    assert.strictEqual(crossTenantResult, null);
  });

  await t.test('3. New Business DNA creation creates a blank workspace with zero data leakage', async () => {
    // Save memory item into Client 1's workspace
    const client1Org = 'org_existing_client_101';
    const client1Biz = 'biz_existing_client_101';
    const client1DNA = createDefaultBusinessDNA(client1Biz, {
      companyIdentity: { companyName: { value: 'Legacy Client 1' } },
    });
    await dnaRepo.saveDNA(client1DNA, client1Org);
    await memoryRepo.addMemory({
      organizationId: client1Org,
      businessId: client1Biz,
      category: 'brand',
      content: 'Confidential Client 1 Marketing Strategy',
      importance: 0.9,
      relevance: 1.0,
    });

    // Create a brand new client onboarding
    const newClient = await onboardingService.executeCustomerOnboarding({
      userEmail: 'admin@freshbrand.com',
      userName: 'Fresh Admin',
      organizationName: 'Fresh Brand Corp',
      companyName: 'Fresh Brand',
      websiteUrl: 'https://freshbrand.com',
    });

    // Query memory for the new client -> Must be empty
    const newClientMemories = await memoryRepo.queryMemories({
      organizationId: newClient.session.organizationId,
      businessId: newClient.businessDNA.businessId,
    });

    assert.strictEqual(newClientMemories.length, 0);

    // New client's DNA must be clean and un-merged
    assert.strictEqual(newClient.businessDNA.companyIdentity.companyName.value, 'Fresh Brand');
    assert.notStrictEqual(newClient.session.organizationId, client1Org);
  });

  await t.test('4. Previous workspace data never appears in a newly launched client workspace', async () => {
    const freshClient = await onboardingService.executeCustomerOnboarding({
      userEmail: 'admin@hvac-solutions.com',
      userName: 'HVAC Solutions Lead',
      organizationName: 'HVAC Solutions LLC',
      companyName: 'HVAC Solutions',
      websiteUrl: 'https://hvac-solutions.com',
    });

    const dna = await dnaRepo.getDNA({
      organizationId: freshClient.session.organizationId,
      businessId: freshClient.businessDNA.businessId,
    });
    assert.ok(dna);
    assert.strictEqual(dna.companyIdentity.companyName.value, 'HVAC Solutions');
    assert.strictEqual(dna.businessId, freshClient.businessDNA.businessId);
  });

  await t.test('5. Business DNA generation attaches strictly to the created organization/workspace ID', async () => {
    const onboarded = await onboardingService.executeCustomerOnboarding({
      userEmail: 'dev@datadog-test.com',
      userName: 'Datadog Test User',
      organizationName: 'Datadog Test Org',
      companyName: 'Datadog Test',
      websiteUrl: 'https://www.datadoghq.com',
    });

    assert.ok(onboarded.workspaceId.startsWith('ws_'));
    assert.ok(onboarded.session.organizationId.startsWith('org_'));
    assert.ok(onboarded.businessDNA.businessId.startsWith('biz_ws_'));
    assert.strictEqual(onboarded.workspaceName, 'Datadog Test Workspace');
  });
});
