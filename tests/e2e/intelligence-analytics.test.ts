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
import { MarketingIntelligenceService } from '../../src/core/marketing/marketing-intelligence-service';
import { SalesIntelligenceService } from '../../src/core/sales/sales-intelligence-service';
import { OperationsIntelligenceService } from '../../src/core/operations/operations-intelligence-service';
import { SecurityIntelligenceService } from '../../src/core/security/security-intelligence-service';
import { IntelligenceAnalyticsService } from '../../src/core/intelligence/intelligence-analytics-service';

test('Phase 18 E2E Test 1: Full Intelligence Cycle (Login -> DNA Load -> Score -> Performance -> Patterns -> Improvements -> Outcome -> Memory Write-back -> Audit -> Notifications)', async () => {
  // ── 1. Bootstrap Platform ─────────────────────────────────────────────────
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

  // ── 2. Customer Onboarding ─────────────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'head-ai@apex-group.com',
    userName: 'Apex AI Lead',
    userRole: 'ADMIN',
    organizationName: 'Apex Enterprise Group',
    planTier: 'growth',
    companyName: 'Apex Enterprise Group',
    websiteUrl: 'https://apex-group.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const analyticsService = new IntelligenceAnalyticsService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService
  );

  // ── 3. Calculate Intelligence Score ────────────────────────────────────────
  const scoreReport = await analyticsService.calculateIntelligenceScore({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(scoreReport.id);
  assert.equal(scoreReport.organizationId, organizationId);
  assert.ok(scoreReport.intelligenceScore >= 60 && scoreReport.intelligenceScore <= 100);
  assert.ok(['FOUNDATION', 'DEVELOPING', 'OPTIMIZED', 'ADVANCED', 'AUTONOMOUS'].includes(scoreReport.maturityLevel));
  assert.ok(scoreReport.strengths.length >= 3);
  assert.ok(scoreReport.improvementAreas.length >= 2);

  // Verify notification sent
  const alertsPostScore = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostScore.some((a) => a.title.includes('Intelligence Score Updated')),
    'Customer notification must be sent when Intelligence Score is updated'
  );

  // ── 4. Analyze Performance ─────────────────────────────────────────────────
  const perfReports = await analyticsService.analyzePerformance({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.equal(perfReports.length, 4, 'Must analyze all 4 intelligence domains (marketing, sales, operations, security)');
  assert.ok(perfReports.every((p) => p.successRate > 0 && p.successRate <= 1));
  assert.ok(perfReports.every((p) => p.impactScore > 0 && p.impactScore <= 1));
  assert.ok(perfReports.every((p) => p.lessonsLearned.length >= 1));

  // ── 5. Identify Winning Patterns ───────────────────────────────────────────
  const winningPatterns = await analyticsService.identifyWinningPatterns({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(winningPatterns.length >= 2, 'Must identify winning patterns');
  assert.ok(winningPatterns.every((wp) => wp.pattern));
  assert.ok(winningPatterns.every((wp) => wp.evidence));
  assert.ok(winningPatterns.every((wp) => wp.futureRecommendation));

  // Verify winning pattern alert
  const alertsPostPatterns = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostPatterns.some((a) => a.title.includes('Winning Pattern Discovered')),
    'Customer notification must be sent when winning pattern is discovered'
  );

  // ── 6. Generate Improvement Recommendations ────────────────────────────────
  const recommendations = await analyticsService.generateImprovementRecommendations({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(recommendations.length >= 1);
  assert.ok(recommendations[0].implementationSteps.length >= 2);

  // ── 7. Get Intelligence Dashboard ──────────────────────────────────────────
  const dashboard = analyticsService.getIntelligenceDashboard(organizationId, businessId);
  assert.ok(dashboard.intelligenceScore);
  assert.equal(dashboard.performanceReports.length, 4);
  assert.ok(dashboard.winningPatterns.length >= 2);
  assert.ok(dashboard.recommendations.length >= 1);

  // ── 8. Record Learning Outcome ─────────────────────────────────────────────
  const learningOutcome = await analyticsService.recordLearningOutcome({
    organizationId,
    businessId,
    decisionId: recommendations[0].id,
    outcome: 'SUCCESS',
    details: 'Automated cross-domain recommendation execution improved action velocity by 48%',
    learnings: [
      'Auto-execution of recommendations with >85% confidence score produced zero regression errors',
      'Unified cross-domain triggers reduced decision lag from 7 days to under 2 hours',
    ],
    actor: session.email,
  });

  assert.equal(learningOutcome.outcome, 'SUCCESS');
  assert.equal(learningOutcome.learnings.length, 2);

  // Verify memory write-back under category 'intelligence_learning'
  const memories = await memoryRepo.queryMemories({
    organizationId,
    businessId,
    category: 'intelligence_learning',
    minImportance: 0.5,
  });
  assert.ok(memories.length >= 2, 'Learning outcome must write back to MemoryRepository under category intelligence_learning');

  // Verify learning cycle alert
  const alertsPostOutcome = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostOutcome.some((a) => a.title.includes('AI Learning Cycle Completed')),
    'Customer notification must be sent when learning cycle completes'
  );

  // ── 9. Audit Event Verification ───────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'INTELLIGENCE_SCORE_CALCULATED'),
    'INTELLIGENCE_SCORE_CALCULATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'PERFORMANCE_ANALYZED'),
    'PERFORMANCE_ANALYZED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'WINNING_PATTERN_IDENTIFIED'),
    'WINNING_PATTERN_IDENTIFIED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'IMPROVEMENT_RECOMMENDATION_GENERATED'),
    'IMPROVEMENT_RECOMMENDATION_GENERATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'LEARNING_OUTCOME_RECORDED'),
    'LEARNING_OUTCOME_RECORDED audit event required'
  );
});

test('Phase 18 E2E Test 2: Cross Intelligence Analysis (Marketing + Sales + Operations + Security -> Unified Score)', async () => {
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

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'ceo@omni-tech.io',
    userName: 'OmniTech CEO',
    userRole: 'ADMIN',
    organizationName: 'OmniTech Systems',
    planTier: 'growth',
    companyName: 'OmniTech Systems',
    websiteUrl: 'https://omni-tech.io',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();

  // Instantiate all domain services
  const mktService = new MarketingIntelligenceService(dnaRepo, auditRepo, contextBuilder, notificationService);
  const salesService = new SalesIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService);
  const opsService = new OperationsIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService);
  const secService = new SecurityIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService);
  const analyticsService = new IntelligenceAnalyticsService(dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService);

  // Execute actions across all 4 domain services
  await mktService.createMarketingStrategy({
    organizationId, businessId, goal: 'Brand awareness growth', actor: session.email,
  });

  await salesService.createSalesInsight({
    organizationId, businessId, insightType: 'UPSELL_OPPORTUNITY', customerSegment: 'Growth tier users', actor: session.email,
  });

  await opsService.analyzeOperations({
    organizationId, businessId, insightType: 'AUTOMATION_OPPORTUNITY', processArea: 'Customer onboarding', actor: session.email,
  });

  await secService.analyzeSecurityPosture({
    organizationId, businessId, actor: session.email,
  });

  // Calculate unified cross-domain Intelligence Score
  const scoreReport = await analyticsService.calculateIntelligenceScore({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(scoreReport.intelligenceScore >= 60);
  assert.ok(scoreReport.strengths.some((s) => s.includes('Multi-domain intelligence synthesis')));

  // Analyze performance across all domains
  const perfReports = await analyticsService.analyzePerformance({
    organizationId, businessId, actor: session.email,
  });
  assert.equal(perfReports.length, 4);
});

test('Phase 18 E2E Test 3: Tenant Isolation Security Enforcement', async () => {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();

  const onboardingService = new CustomerOnboardingService(
    authManager, billingManager, stateManager, dnaRepo
  );

  const orgA = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@alpha.com',
    userName: 'Alpha Admin',
    userRole: 'ADMIN',
    organizationName: 'Alpha Corp',
    planTier: 'growth',
    companyName: 'Alpha Corp',
    websiteUrl: 'https://alpha.com',
  });

  const orgB = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@beta.com',
    userName: 'Beta Admin',
    userRole: 'ADMIN',
    organizationName: 'Beta Corp',
    planTier: 'growth',
    companyName: 'Beta Corp',
    websiteUrl: 'https://beta.com',
  });

  const contextBuilder = new ContextBuilder();
  const analyticsService = new IntelligenceAnalyticsService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  // Org A calculates intelligence score
  await analyticsService.calculateIntelligenceScore({
    organizationId: orgA.session.organizationId,
    businessId: orgA.customerState.businessId!,
    actor: orgA.session.email,
  });

  // Org B cannot access Org A dashboard data
  const orgBDash = analyticsService.getIntelligenceDashboard(
    orgB.session.organizationId,
    orgB.customerState.businessId!
  );
  assert.equal(orgBDash.intelligenceScore, undefined, 'Org B must not see Org A score report');
  assert.equal(orgBDash.performanceReports.length, 0);

  // Unauthorized org ID attempting service calls throws IntelligenceAnalytics: access denied
  await assert.rejects(
    async () => {
      await analyticsService.calculateIntelligenceScore({
        organizationId: 'unauthorized_hacker_org',
        businessId: 'unauthorized_hacker_biz',
        actor: 'hacker@evil.com',
      });
    },
    /IntelligenceAnalytics: access denied/i,
    'Cross-tenant calculateIntelligenceScore must be denied'
  );

  await assert.rejects(
    async () => {
      await analyticsService.analyzePerformance({
        organizationId: 'unauthorized_hacker_org',
        businessId: 'unauthorized_hacker_biz',
        actor: 'hacker@evil.com',
      });
    },
    /IntelligenceAnalytics: access denied/i,
    'Cross-tenant analyzePerformance must be denied'
  );
});
