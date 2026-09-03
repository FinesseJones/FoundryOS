import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { DocumentConnectionService } from '../../src/core/ingestion/document-connection-service';
import { DocumentProcessingWorkflow } from '../../src/core/ingestion/document-processing-workflow';
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

test('Phase 13B E2E: Document Knowledge Import (Upload -> Parse -> Extract Signals -> Business DNA Update -> Customer Alert -> Audit Event)', async () => {
  // 1. Initialize Platform Infrastructure
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

  // 2. Customer Onboarding
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'head.content@doccorp.com',
    userName: 'Sarah Editor',
    userRole: 'ADMIN',
    organizationName: 'Doc Corp Enterprise',
    planTier: 'growth',
    companyName: 'Doc Corp',
    websiteUrl: 'https://doccorp.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // 3. Register Document Upload via DocumentConnectionService
  const docService = new DocumentConnectionService();
  const docRecord = docService.uploadDocument({
    organizationId,
    businessId,
    filename: 'Q4_Product_Strategy_Handbook.pdf',
    documentType: 'PDF',
    fileSize: 1048576, // 1MB
  });

  assert.equal(docRecord.uploadStatus, 'SUCCESS');
  assert.equal(docRecord.processingStatus, 'UPLOADED');
  assert.equal(docRecord.organizationId, organizationId);

  // 4. Execute Document Processing Workflow
  const processingWorkflow = new DocumentProcessingWorkflow(
    docService,
    dnaRepo,
    auditRepo,
    notificationService
  );

  const rawDocumentContent = `
    Q4 Enterprise Product Strategy:
    Product Offerings: Business DNA Platform v1, Self-Learning AI Engine.
    Pricing Tier: Growth ($199/mo) and Enterprise Custom.
    Mission: Empower enterprise marketing teams with brand-first AI governance.
  `;

  const result = await processingWorkflow.processDocument({
    organizationId,
    documentId: docRecord.id,
    rawTextContent: rawDocumentContent,
    actor: session.email,
  });

  // 5. Verify Document Processing Completion State
  assert.equal(result.document.processingStatus, 'COMPLETED');
  assert.ok(result.document.extractedSignalsCount > 0);

  // 6. Verify Business DNA Update in Repository
  const updatedDNA = await dnaRepo.getDNA({ organizationId, businessId });
  assert.ok(updatedDNA);
  assert.ok(updatedDNA.companyIdentity?.mission?.value.includes('Q4 Enterprise Product Strategy'));

  // 7. Verify Customer Notification Delivery
  const unreadAlerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(unreadAlerts.some((a) => a.body.includes('Q4_Product_Strategy_Handbook.pdf')));

  // 8. Verify Audit Event Logging with Tenant Isolation
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(auditEvents.some((e) => (e.details as any)?.eventType === 'DOCUMENT_IMPORTED'));

  // 9. Verify Tenant Isolation Guard
  const unauthorizedDoc = docService.getDocument({
    organizationId: 'unauthorized_org_id',
    documentId: docRecord.id,
  });
  assert.equal(unauthorizedDoc, null);
});
