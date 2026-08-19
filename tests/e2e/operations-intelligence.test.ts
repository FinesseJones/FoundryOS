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
import { OperationsIntelligenceService } from '../../src/core/operations/operations-intelligence-service';

test('Phase 16 E2E: Operations Intelligence (Login -> DNA -> Process Analysis -> Efficiency Opportunity -> Process Recommendation -> Outcome -> Memory -> Audit -> Isolation)', async () => {
  // ── 1. Bootstrap ──────────────────────────────────────────────────────────
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
    userEmail: 'coo@vertexops.com',
    userName: 'Vertex COO',
    userRole: 'ADMIN',
    organizationName: 'Vertex Operations Group',
    planTier: 'growth',
    companyName: 'Vertex Operations Group',
    websiteUrl: 'https://vertexops.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const opsService = new OperationsIntelligenceService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService
  );

  // ── 3. Analyze Operations — Process Bottleneck ────────────────────────────
  const bottleneckInsight = await opsService.analyzeOperations({
    organizationId,
    businessId,
    insightType: 'PROCESS_BOTTLENECK',
    processArea: 'Contract approval pipeline',
    actor: session.email,
  });

  assert.ok(bottleneckInsight.id);
  assert.equal(bottleneckInsight.organizationId, organizationId);
  assert.equal(bottleneckInsight.insightType, 'PROCESS_BOTTLENECK');
  assert.ok(bottleneckInsight.title);
  assert.ok(bottleneckInsight.currentState);
  assert.ok(bottleneckInsight.recommendedChange);
  assert.ok(bottleneckInsight.estimatedImpact);
  assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(bottleneckInsight.implementationEffort));
  assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(bottleneckInsight.priority));
  assert.equal(bottleneckInsight.status, 'IDENTIFIED');

  // ── 4. Analyze Operations — Automation Opportunity ────────────────────────
  const automationInsight = await opsService.analyzeOperations({
    organizationId,
    businessId,
    insightType: 'AUTOMATION_OPPORTUNITY',
    processArea: 'Invoice processing and vendor payments',
    actor: session.email,
  });

  assert.equal(automationInsight.insightType, 'AUTOMATION_OPPORTUNITY');
  assert.ok(automationInsight.confidence >= 0 && automationInsight.confidence <= 1);

  // ── 5. Identify Efficiency Opportunity ────────────────────────────────────
  const efficiencyOpp = await opsService.identifyEfficiencyOpportunity({
    organizationId,
    businessId,
    processArea: 'Customer support ticket routing',
    opportunityType: 'Automation',
    actor: session.email,
  });

  assert.ok(efficiencyOpp.id);
  assert.equal(efficiencyOpp.organizationId, organizationId);
  assert.ok(efficiencyOpp.timesSavingEstimate, 'Must include time saving estimate');
  assert.ok(efficiencyOpp.costSavingEstimate, 'Must include cost saving estimate');
  assert.ok(efficiencyOpp.requiredActions.length >= 3, 'Must include at least 3 required actions');
  assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(efficiencyOpp.priority));

  // ── 6. Generate Process Recommendation ────────────────────────────────────
  const recommendation = await opsService.generateProcessRecommendation({
    organizationId,
    businessId,
    recommendationType: 'Process Automation',
    actor: session.email,
  });

  assert.ok(recommendation.id);
  assert.equal(recommendation.organizationId, organizationId);
  assert.ok(recommendation.title.includes('Vertex Operations Group'));
  assert.ok(recommendation.steps.length >= 4, 'Plan must include at least 4 implementation steps');
  assert.ok(recommendation.successMetrics.length >= 3, 'Plan must include success metrics');
  assert.ok(recommendation.timeline, 'Plan must include timeline');

  // ── 7. Verify notification delivered ─────────────────────────────────────
  const alerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alerts.some((a) => a.title.includes('Operations Recommendation Ready')),
    'Customer must receive Operations Recommendation notification'
  );

  // ── 8. Get all operations insights (org-scoped) ───────────────────────────
  const allInsights = opsService.getOperationsInsights(organizationId, businessId);
  assert.equal(allInsights.insights.length, 2);
  assert.equal(allInsights.efficiencyOpportunities.length, 1);
  assert.equal(allInsights.recommendations.length, 1);

  // ── 9. Record Operational Outcome with memory write-back ──────────────────
  const outcome = await opsService.recordOperationalOutcome({
    organizationId,
    businessId,
    insightId: bottleneckInsight.id,
    result: 'IMPROVED',
    measuredImpact: 'Contract approval cycle reduced from 14 days to 3 days (78% improvement)',
    learnings: [
      'Parallel approval lanes eliminated 68% of sequential wait time',
      'Auto-approval threshold for contracts under $10k removed 40% of manual reviews',
      'WorkflowEngine automation handled 85% of routing decisions without human intervention',
    ],
    actor: session.email,
  });

  assert.equal(outcome.result, 'IMPROVED');
  assert.equal(outcome.learnings.length, 3);

  // Verify insight status updated to COMPLETED
  const updatedInsights = opsService.getOperationsInsights(organizationId, businessId);
  const updatedBottleneck = updatedInsights.insights.find((i) => i.id === bottleneckInsight.id);
  assert.equal(updatedBottleneck?.status, 'COMPLETED', 'Insight status must update to COMPLETED after IMPROVED outcome');

  // Verify learnings written to memory
  const memories = await memoryRepo.queryMemories({
    organizationId,
    businessId,
    category: 'decision',
    minImportance: 0.5,
  });
  assert.ok(memories.length >= 3, 'Operational learnings must be written to memory repository');

  // ── 10. Audit event trail verification ───────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'OPERATIONS_INSIGHT_CREATED'),
    'OPERATIONS_INSIGHT_CREATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EFFICIENCY_OPPORTUNITY_IDENTIFIED'),
    'EFFICIENCY_OPPORTUNITY_IDENTIFIED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'PROCESS_RECOMMENDATION_GENERATED'),
    'PROCESS_RECOMMENDATION_GENERATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'OPERATIONAL_OUTCOME_RECORDED'),
    'OPERATIONAL_OUTCOME_RECORDED audit event required'
  );

  // ── 11. Tenant isolation enforcement ─────────────────────────────────────
  await assert.rejects(
    async () => {
      await opsService.analyzeOperations({
        organizationId: 'unauthorized_org_999',
        businessId: 'fake_biz_999',
        insightType: 'PROCESS_BOTTLENECK',
        processArea: 'stolen process data',
        actor: 'attacker@evil.com',
      });
    },
    /access denied/i,
    'OperationsIntelligenceService must block cross-tenant access'
  );

  const crossTenantData = opsService.getOperationsInsights('unauthorized_org_999', 'fake_biz_999');
  assert.equal(crossTenantData.insights.length, 0, 'Cross-tenant insight read must return empty');
  assert.equal(crossTenantData.efficiencyOpportunities.length, 0);
});

test('Phase 16: OperationsIntelligenceService — all 6 insight types generate with correct structure', async () => {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();

  const onboardingService = new CustomerOnboardingService(
    authManager, billingManager, stateManager, dnaRepo
  );

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'ops@clearstream.co',
    userName: 'ClearStream Ops',
    userRole: 'ADMIN',
    organizationName: 'ClearStream Co',
    planTier: 'starter',
    companyName: 'ClearStream Co',
    websiteUrl: 'https://clearstream.co',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const opsService = new OperationsIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  const insightTypes = [
    'PROCESS_BOTTLENECK', 'AUTOMATION_OPPORTUNITY', 'RESOURCE_ALLOCATION',
    'WORKFLOW_INEFFICIENCY', 'QUALITY_IMPROVEMENT', 'COST_REDUCTION',
  ] as const;

  const generated = await Promise.all(
    insightTypes.map((type) =>
      opsService.analyzeOperations({
        organizationId,
        businessId,
        insightType: type,
        processArea: `${type.replace(/_/g, ' ').toLowerCase()} test area`,
        actor: session.email,
      })
    )
  );

  assert.equal(generated.length, 6, 'All 6 insight types must be generated');
  assert.ok(generated.every((i) => i.organizationId === organizationId), 'All insights must be org-scoped');
  assert.ok(generated.every((i) => i.title), 'All insights must have titles');
  assert.ok(generated.every((i) => i.currentState), 'All insights must have current state');
  assert.ok(generated.every((i) => i.recommendedChange), 'All insights must have recommended change');
  assert.ok(generated.every((i) => i.estimatedImpact), 'All insights must have estimated impact');
  assert.ok(generated.every((i) => ['LOW', 'MEDIUM', 'HIGH'].includes(i.implementationEffort)));
  assert.ok(generated.every((i) => ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(i.priority)));
  assert.ok(generated.every((i) => i.confidence >= 0 && i.confidence <= 1));

  // Verify all insights are org-scoped and isolated
  const all = opsService.getOperationsInsights(organizationId, businessId);
  assert.equal(all.insights.length, 6);
});
