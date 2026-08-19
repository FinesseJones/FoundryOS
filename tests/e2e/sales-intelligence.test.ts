import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository, MemoryRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { ContextBuilder } from '../../src/core/context';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { SalesIntelligenceService } from '../../src/core/sales/sales-intelligence-service';
import { OpportunityDetectionService } from '../../src/core/sales/opportunity-detection-service';

test('Phase 15 E2E: Sales & Customer Intelligence (Login -> DNA -> Sales Insights -> Opportunity Analysis -> Next Best Action -> Outcome -> Memory -> Audit -> Isolation)', async () => {
  // ── 1. Bootstrap platform ──────────────────────────────────────────────────
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const notificationDispatcher = new NotificationDispatcher();
  const notificationService = new CustomerNotificationService(notificationDispatcher);

  const onboardingService = new CustomerOnboardingService(
    authManager, billingManager, stateManager, dnaRepo
  );

  // ── 2. Customer onboarding ─────────────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'vp-sales@meridian-crm.com',
    userName: 'Meridian VP Sales',
    userRole: 'ADMIN',
    organizationName: 'Meridian CRM Solutions',
    planTier: 'growth',
    companyName: 'Meridian CRM Solutions',
    websiteUrl: 'https://meridian-crm.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();

  // ── 3. Sales Intelligence Service ─────────────────────────────────────────
  const salesService = new SalesIntelligenceService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService
  );

  // ── 4. Create Sales Insights ───────────────────────────────────────────────
  const engagementInsight = await salesService.createSalesInsight({
    organizationId,
    businessId,
    insightType: 'ENGAGEMENT_PATTERN',
    customerSegment: 'SMB repeat buyers',
    actor: session.email,
  });

  assert.ok(engagementInsight.id);
  assert.equal(engagementInsight.organizationId, organizationId);
  assert.equal(engagementInsight.insightType, 'ENGAGEMENT_PATTERN');
  assert.ok(engagementInsight.title);
  assert.ok(engagementInsight.recommendedAction);
  assert.ok(engagementInsight.confidence >= 0 && engagementInsight.confidence <= 1);
  assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(engagementInsight.priority));

  const retentionInsight = await salesService.createSalesInsight({
    organizationId,
    businessId,
    insightType: 'RETENTION_RISK',
    customerSegment: 'Enterprise inactive accounts',
    actor: session.email,
  });

  assert.equal(retentionInsight.insightType, 'RETENTION_RISK');

  // ── 5. Analyze Customer Opportunity ───────────────────────────────────────
  const opportunity = await salesService.analyzeCustomerOpportunity({
    organizationId,
    businessId,
    opportunityType: 'UPSELL',
    customerSegment: 'Power users on starter plan',
    actor: session.email,
  });

  assert.ok(opportunity.id);
  assert.equal(opportunity.organizationId, organizationId);
  assert.equal(opportunity.status, 'OPEN');
  assert.ok(opportunity.nextBestAction);
  assert.ok(opportunity.estimatedValue, 'Opportunity must include estimated value');

  // ── 6. Generate Next Best Action ──────────────────────────────────────────
  const nba = await salesService.generateNextBestAction({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(nba.action, 'Next best action must be generated');
  assert.ok(nba.rationale, 'Next best action must include rationale');
  assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(nba.priority));

  // Verify notification delivered
  const alerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alerts.some((a) => a.title.includes('Next Best Action Ready')),
    'Customer must receive Next Best Action notification'
  );

  // ── 7. Get all sales insights (org-scoped) ────────────────────────────────
  const allInsights = salesService.getSalesInsights(organizationId, businessId);
  assert.equal(allInsights.insights.length, 2);
  assert.equal(allInsights.opportunities.length, 1);

  // ── 8. Record Sales Outcome with memory write-back ────────────────────────
  const outcome = await salesService.recordSalesOutcome({
    organizationId,
    businessId,
    insightId: engagementInsight.id,
    outcome: 'WON',
    revenueImpact: '$24,000 ARR expansion',
    learnings: [
      'SMB segment responds 3x better to case study content than product demos',
      'Personalized follow-up within 24h increased close rate by 40%',
    ],
    actor: session.email,
  });

  assert.equal(outcome.outcome, 'WON');
  assert.equal(outcome.learnings.length, 2);

  // Verify learnings written to memory for future LearningAgent cycles
  const memories = await memoryRepo.queryMemories({
    organizationId,
    businessId,
    category: 'customer',
    minImportance: 0.5,
  });
  assert.ok(memories.length >= 2, 'Sales learnings must be written to memory repository');

  // ── 9. Verify audit event trail ───────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'SALES_INSIGHT_CREATED'),
    'SALES_INSIGHT_CREATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'CUSTOMER_OPPORTUNITY_ANALYZED'),
    'CUSTOMER_OPPORTUNITY_ANALYZED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'NEXT_BEST_ACTION_GENERATED'),
    'NEXT_BEST_ACTION_GENERATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'SALES_OUTCOME_RECORDED'),
    'SALES_OUTCOME_RECORDED audit event required'
  );

  // ── 10. Tenant isolation enforcement ─────────────────────────────────────
  await assert.rejects(
    async () => {
      await salesService.createSalesInsight({
        organizationId: 'unauthorized_org_999',
        businessId: 'fake_biz_999',
        insightType: 'CUSTOMER_SEGMENT',
        customerSegment: 'stolen data',
        actor: 'attacker@evil.com',
      });
    },
    /access denied/i,
    'SalesIntelligenceService must block cross-tenant access'
  );

  const crossTenantData = salesService.getSalesInsights('unauthorized_org_999', 'fake_biz_999');
  assert.equal(crossTenantData.insights.length, 0, 'Cross-tenant insight access must return empty');
});

test('Phase 15: OpportunityDetectionService detects and prioritizes opportunities from Business DNA', async () => {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();

  const onboardingService = new CustomerOnboardingService(
    authManager, billingManager, stateManager, dnaRepo
  );

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'ops@peakflow.io',
    userName: 'PeakFlow Ops',
    userRole: 'ADMIN',
    organizationName: 'PeakFlow Analytics',
    planTier: 'growth',
    companyName: 'PeakFlow Analytics',
    websiteUrl: 'https://peakflow.io',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const opportunityService = new OpportunityDetectionService(dnaRepo, auditRepo, contextBuilder);

  // Detect all opportunity types
  const detected = await opportunityService.detectOpportunities({
    organizationId,
    businessId,
    opportunityTypes: ['RETURNING_CUSTOMER', 'CHURN_RISK', 'UPSELL', 'ENGAGEMENT_DROP', 'PRODUCT_INTEREST'],
    actor: session.email,
  });

  assert.equal(detected.length, 5, 'Should detect one opportunity per requested type');
  assert.ok(detected.every((o) => o.organizationId === organizationId), 'All detected opportunities must be org-scoped');
  assert.ok(detected.every((o) => o.businessId === businessId));
  assert.ok(detected.every((o) => o.confidenceScore >= 0 && o.confidenceScore <= 1));
  assert.ok(detected.every((o) => ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(o.priority)));
  assert.ok(detected.every((o) => o.recommendedAction), 'Every opportunity must have a recommended action');

  // Top opportunity must be highest priority
  const top = opportunityService.getTopOpportunity(organizationId, businessId);
  assert.ok(top, 'getTopOpportunity must return a result');
  const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  assert.ok(
    detected.every((o) => priorityOrder.indexOf(top.priority) <= priorityOrder.indexOf(o.priority)),
    'Top opportunity must be the highest priority'
  );

  // Audit event logged
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'OPPORTUNITIES_DETECTED'),
    'OPPORTUNITIES_DETECTED audit event required'
  );

  // Cross-tenant isolation
  const crossTenantOpps = opportunityService.getDetectedOpportunities('unauthorized_org_888', 'fake_biz_888');
  assert.equal(crossTenantOpps.length, 0, 'Cross-tenant opportunity access must return empty');

  await assert.rejects(
    async () => {
      await opportunityService.detectOpportunities({
        organizationId: 'unauthorized_org_888',
        businessId: 'fake_biz_888',
        actor: 'attacker@evil.com',
      });
    },
    /access denied/i,
    'OpportunityDetectionService must block cross-tenant scans'
  );
});
