import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { WebsiteConnectionService } from '../../src/core/ingestion/website-connection-service';
import { WebsiteIngestionWorkflow } from '../../src/core/ingestion/website-ingestion-workflow';

test('Phase 13A E2E: Website Intelligence Connection (Add Website -> Crawl -> Extract -> DNA Update -> Customer Alert -> Audit Log)', async () => {
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
    userEmail: 'cto@scale-ai.com',
    userName: 'David CTO',
    userRole: 'ADMIN',
    organizationName: 'Scale AI Org',
    planTier: 'growth',
    companyName: 'Scale AI',
    websiteUrl: 'https://scale.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // 3. Register New Website Connection
  const connectionService = new WebsiteConnectionService();
  const connection = connectionService.createConnection({
    organizationId,
    businessId,
    url: 'https://scale.com',
  });

  assert.equal(connection.state, 'PENDING');
  assert.equal(connection.organizationId, organizationId);
  assert.equal(connection.businessId, businessId);

  // 4. Run Website Ingestion Workflow
  const ingestionWorkflow = new WebsiteIngestionWorkflow(
    connectionService,
    dnaRepo,
    auditRepo,
    notificationService
  );

  const result = await ingestionWorkflow.executeIngestion({
    organizationId,
    connectionId: connection.id,
    actor: session.email,
  });

  // 5. Verify Connection State & Pages Discovered
  assert.equal(result.connection.state, 'COMPLETED');
  assert.ok(result.connection.pagesDiscovered > 0);
  assert.ok(result.connection.lastCrawlTime);

  // 6. Verify Business DNA Update
  assert.ok(result.updatedDNA.websiteAnalysis);
  assert.ok(result.updatedDNA.websiteAnalysis.colors);

  const savedDNA = await dnaRepo.getDNA({ organizationId, businessId });
  assert.ok(savedDNA);
  assert.ok(savedDNA.websiteAnalysis);

  // 7. Verify Customer Notification Delivered
  const unreadAlerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(unreadAlerts.some((a) => a.title.includes('[DNA_UPDATED]')));

  // 8. Verify Audit Event Logging with Tenant Security
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(auditEvents.some((e) => (e.details as any)?.eventType === 'WEBSITE_INGESTION_COMPLETED'));

  // 9. Verify Tenant Isolation (Cross-tenant fetch rejected)
  const crossTenantConnection = connectionService.getConnection({
    organizationId: 'unauthorized_org_id',
    connectionId: connection.id,
  });
  assert.equal(crossTenantConnection, null);
});
