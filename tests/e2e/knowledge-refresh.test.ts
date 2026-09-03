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
import { KnowledgeRefreshService } from '../../src/core/ingestion/knowledge-refresh-service';
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

test('Phase 13D E2E: Knowledge Refresh System (Login -> View Sources -> Manual Refresh -> Change Detection -> DNA Revision -> Audit -> Notification)', async () => {
  // ── 1. Platform bootstrap ────────────────────────────────────────────────
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

  // ── 2. Customer onboarding ───────────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'refresh@cortexai.com',
    userName: 'CortexAI Content Lead',
    userRole: 'ADMIN',
    organizationName: 'CortexAI Labs',
    planTier: 'growth',
    companyName: 'CortexAI Labs',
    websiteUrl: 'https://cortexai.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // ── 3. Register data sources ─────────────────────────────────────────────
  const dataSourceService = new DataSourceService(auditRepo, notificationService);

  const websiteSource = await dataSourceService.createSource({
    organizationId,
    businessId,
    sourceType: 'WEBSITE',
    sourceName: 'https://cortexai.com',
    actor: session.email,
  });

  const docSource = await dataSourceService.createSource({
    organizationId,
    businessId,
    sourceType: 'DOCUMENT',
    sourceName: 'CortexAI_TechSpec_v2.pdf',
    actor: session.email,
  });

  // ── 4. Instantiate KnowledgeRefreshService ───────────────────────────────
  const refreshService = new KnowledgeRefreshService(
    dnaRepo,
    auditRepo,
    dataSourceService,
    notificationService
  );

  // ── 5. Schedule automated refresh ────────────────────────────────────────
  const schedule = await refreshService.scheduleRefresh({
    organizationId,
    businessId,
    sourceId: websiteSource.id,
    frequency: 'WEEKLY',
    actor: session.email,
  });

  assert.equal(schedule.status, 'SCHEDULED');
  assert.equal(schedule.frequency, 'WEEKLY');
  assert.ok(schedule.nextRefreshAt, 'Next refresh date must be set');

  // ── 6. Trigger manual refresh — website (changes expected) ───────────────
  const websiteRefresh = await refreshService.executeRefresh({
    organizationId,
    businessId,
    sourceId: websiteSource.id,
    actor: session.email,
    triggerMode: 'MANUAL',
  });

  assert.equal(websiteRefresh.organizationId, organizationId);
  assert.equal(websiteRefresh.status, 'COMPLETED');
  assert.ok(websiteRefresh.changesDetected > 0, 'Changes must be detected during refresh');
  assert.ok(websiteRefresh.changesDescription.length > 0);
  assert.ok(websiteRefresh.completedAt);

  // ── 7. Trigger manual refresh — document ────────────────────────────────
  const docRefresh = await refreshService.executeRefresh({
    organizationId,
    businessId,
    sourceId: docSource.id,
    actor: session.email,
    triggerMode: 'MANUAL',
  });

  assert.equal(docRefresh.status, 'COMPLETED');
  assert.ok(docRefresh.changesDetected > 0);

  // ── 8. Refresh history retrieval (tenant-scoped) ─────────────────────────
  const history = refreshService.getRefreshHistory(organizationId, businessId);
  assert.equal(history.length, 2);
  assert.ok(history.some((r) => r.sourceId === websiteSource.id));
  assert.ok(history.some((r) => r.sourceId === docSource.id));

  // ── 9. Verify DNA revision was created ───────────────────────────────────
  const revisions = await dnaRepo.listRevisions({ organizationId, businessId });
  // At least the onboarding revision + the refresh revision should exist
  assert.ok(revisions.length >= 2, 'At least 2 DNA revisions must exist (onboarding + refresh)');

  // ── 10. Verify audit event trail ────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'REFRESH_STARTED'),
    'REFRESH_STARTED audit event must be logged'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'REFRESH_COMPLETED'),
    'REFRESH_COMPLETED audit event must be logged'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'REFRESH_SCHEDULED'),
    'REFRESH_SCHEDULED audit event must be logged'
  );

  // ── 11. Verify customer notification delivered ────────────────────────────
  const alerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alerts.some((a) => a.title.includes('Knowledge Refreshed')),
    'Customer must receive Knowledge Refreshed alert'
  );
});

test('Phase 13D: No-change refresh returns NO_CHANGES status', async () => {
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

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'nochange@cortexai.com',
    userName: 'CortexAI QA',
    userRole: 'ADMIN',
    organizationName: 'CortexAI Labs QA',
    planTier: 'starter',
    companyName: 'CortexAI Labs QA',
    websiteUrl: 'https://qa.cortexai.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const dataSourceService = new DataSourceService(auditRepo, notificationService);

  // Register an API source type — detectChanges returns [] for API type
  const apiSource = await dataSourceService.createSource({
    organizationId,
    businessId,
    sourceType: 'API',
    sourceName: 'HubSpot CRM API',
    actor: session.email,
  });

  const refreshService = new KnowledgeRefreshService(
    dnaRepo,
    auditRepo,
    dataSourceService,
    notificationService
  );

  // Mock detectChanges to simulate no changes for this test
  const originalDetect = refreshService.detectChanges.bind(refreshService);
  (refreshService as any).detectChanges = async (orgId: string, bId: string, srcId: string) => {
    if (srcId === apiSource.id) return { hasChanges: false, changes: [] };
    return originalDetect(orgId, bId, srcId);
  };

  const result = await refreshService.executeRefresh({
    organizationId,
    businessId,
    sourceId: apiSource.id,
    actor: session.email,
    triggerMode: 'MANUAL',
  });

  assert.equal(result.status, 'NO_CHANGES', 'Refresh with no changes must return NO_CHANGES status');
  assert.equal(result.changesDetected, 0);
});

test('Phase 13D: Tenant isolation — cross-org refresh must be denied', async () => {
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

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'isolation@tenanta.com',
    userName: 'Tenant A Admin',
    userRole: 'ADMIN',
    organizationName: 'Tenant Alpha Corp',
    planTier: 'growth',
    companyName: 'Tenant Alpha Corp',
    websiteUrl: 'https://alphacorp.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const dataSourceService = new DataSourceService(auditRepo, notificationService);

  const source = await dataSourceService.createSource({
    organizationId,
    businessId,
    sourceType: 'WEBSITE',
    sourceName: 'https://alphacorp.com',
    actor: session.email,
  });

  const refreshService = new KnowledgeRefreshService(
    dnaRepo,
    auditRepo,
    dataSourceService,
    notificationService
  );

  // Attempt refresh from unauthorized organization
  await assert.rejects(
    async () => {
      await refreshService.executeRefresh({
        organizationId: 'unauthorized_org_999',
        businessId: 'fake_business_999',
        sourceId: source.id,
        actor: 'attacker@evil.com',
        triggerMode: 'MANUAL',
      });
    },
    /tenant access denied/i,
    'KnowledgeRefreshService must block cross-tenant refresh attempts'
  );

  // Verify history contains no leaked events for unauthorized org
  const leakedHistory = refreshService.getRefreshHistory('unauthorized_org_999');
  assert.equal(leakedHistory.length, 0, 'Cross-tenant history must return empty');
});
