import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { DataSourceService } from '../../src/core/ingestion/data-source-service';
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

test('Phase 13C E2E: Data Source Management (Login -> View Sources -> Add Website & Document -> Org Isolation -> Sync History -> Audit Logs)', async () => {
  // 1. Initialize Platform Services
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const notificationDispatcher = new NotificationDispatcher();
  const notificationService = new CustomerNotificationService(notificationDispatcher);

  const onboardingService = new CustomerOnboardingService(
    authManager,
    billingManager,
    stateManager,
    dnaRepo
  );

  // 2. Customer Onboarding Setup
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'data.lead@unifiedknowledge.com',
    userName: 'Mark Knowledge Lead',
    userRole: 'ADMIN',
    organizationName: 'Unified Knowledge Inc',
    planTier: 'growth',
    companyName: 'Unified Knowledge Inc',
    websiteUrl: 'https://unifiedknowledge.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // 3. Centralized DataSourceService Initialization
  const dataSourceService = new DataSourceService(auditRepo, notificationService);

  // 4. Add Website Data Source
  const websiteSource = await dataSourceService.createSource({
    organizationId,
    businessId,
    sourceType: 'WEBSITE',
    sourceName: 'https://unifiedknowledge.com',
    actor: session.email,
  });

  assert.equal(websiteSource.organizationId, organizationId);
  assert.equal(websiteSource.sourceType, 'WEBSITE');
  assert.equal(websiteSource.connectionStatus, 'CONNECTED');

  // 5. Add Document Data Source
  const docSource = await dataSourceService.createSource({
    organizationId,
    businessId,
    sourceType: 'DOCUMENT',
    sourceName: 'Product_Catalog_2026.pdf',
    actor: session.email,
  });

  assert.equal(docSource.sourceType, 'DOCUMENT');

  // 6. Retrieve Organization Sources
  const orgSources = dataSourceService.getSourcesByOrganization(organizationId, businessId);
  assert.equal(orgSources.length, 2);
  assert.ok(orgSources.some((s) => s.id === websiteSource.id));
  assert.ok(orgSources.some((s) => s.id === docSource.id));

  // 7. Record Sync Events
  const syncedWebsite = await dataSourceService.recordSync(
    organizationId,
    websiteSource.id,
    'CONNECTED',
    session.email
  );

  assert.equal(syncedWebsite.syncCount, 1);
  assert.ok(syncedWebsite.lastSyncAt);

  // Verify Customer Alert delivered on sync
  const unreadAlerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(unreadAlerts.some((a) => a.body.includes('https://unifiedknowledge.com')));

  // 8. Disconnect Data Source
  const disconnectedDoc = await dataSourceService.disconnectSource(
    organizationId,
    docSource.id,
    session.email
  );

  assert.equal(disconnectedDoc.connectionStatus, 'DISCONNECTED');
  assert.equal(disconnectedDoc.sourceStatus, 'INACTIVE');

  // 9. Verify Audit Event Trail
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(auditEvents.some((e) => (e.details as any)?.eventType === 'DATA_SOURCE_CREATED'));
  assert.ok(auditEvents.some((e) => (e.details as any)?.eventType === 'DATA_SOURCE_SYNCED'));
  assert.ok(auditEvents.some((e) => (e.details as any)?.eventType === 'DATA_SOURCE_DISCONNECTED'));

  // 10. Verify Organization Isolation Enforcement
  const crossTenantSources = dataSourceService.getSourcesByOrganization('unauthorized_org_999');
  assert.equal(crossTenantSources.length, 0);

  await assert.rejects(
    async () => {
      await dataSourceService.recordSync('unauthorized_org_999', websiteSource.id, 'CONNECTED', session.email);
    },
    /tenant access denied/i,
    'DataSourceService must enforce tenant isolation and block cross-tenant updates'
  );
});
