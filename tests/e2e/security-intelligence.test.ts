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
import { SecurityIntelligenceService } from '../../src/core/security/security-intelligence-service';

test('Phase 17 E2E Test 1: Full Security Intelligence Workflow (Login -> DNA Load -> Posture Analysis -> Risk Detection -> Recommendation -> Outcome -> Memory Write-back -> Audit Events -> Notifications)', async () => {
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

  // ── 2. Customer Onboarding ─────────────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'ciso@fortress-sec.com',
    userName: 'Fortress CISO',
    userRole: 'ADMIN',
    organizationName: 'Fortress Security Corp',
    planTier: 'growth',
    companyName: 'Fortress Security Corp',
    websiteUrl: 'https://fortress-sec.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const secService = new SecurityIntelligenceService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService
  );

  // ── 3. Security Posture Analysis ──────────────────────────────────────────
  const postureReport = await secService.analyzeSecurityPosture({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(postureReport.id);
  assert.equal(postureReport.organizationId, organizationId);
  assert.ok(postureReport.securityScore >= 0 && postureReport.securityScore <= 100);
  assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(postureReport.riskLevel));
  assert.ok(postureReport.strengths.length >= 3, 'Must include strengths');
  assert.ok(postureReport.weaknesses.length >= 2, 'Must include weaknesses');
  assert.ok(postureReport.recommendedActions.length >= 2, 'Must include recommended actions');

  // Verify notification sent for security review
  const alertsPostReview = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostReview.some((a) => a.title.includes('Security Review Completed')),
    'Customer alert must be sent upon completing security posture analysis'
  );

  // ── 4. Risk Detection ─────────────────────────────────────────────────────
  const detectedRisks = await secService.detectSecurityRisks({
    organizationId,
    businessId,
    actor: session.email,
  });

  assert.ok(detectedRisks.length >= 1);
  const criticalOrHigh = detectedRisks.find((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH');
  assert.ok(criticalOrHigh, 'Risk detection must identify critical or high severity risks');

  // Verify immediate alert sent for CRITICAL/HIGH risk
  const alertsPostRisk = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostRisk.some((a) => a.title.includes('Security Alert')),
    'Immediate customer alert must be sent for CRITICAL/HIGH security risks'
  );

  // ── 5. Generate Security Recommendation ───────────────────────────────────
  const recommendation = await secService.generateSecurityRecommendation({
    organizationId,
    businessId,
    recommendationType: 'Zero-Trust Remediation',
    actor: session.email,
  });

  assert.ok(recommendation.id);
  assert.equal(recommendation.organizationId, organizationId);
  assert.ok(recommendation.actionPlan.length >= 3, 'Recommendation must include action plan steps');
  assert.ok(recommendation.expectedImprovement);
  assert.ok(recommendation.timeline);

  // ── 6. Get Security Insights ──────────────────────────────────────────────
  const insights = secService.getSecurityInsights(organizationId, businessId);
  assert.equal(insights.postureReports.length, 1);
  assert.ok(insights.detectedRisks.length >= 1);
  assert.equal(insights.recommendations.length, 1);

  // ── 7. Record Security Outcome ────────────────────────────────────────────
  const targetRisk = detectedRisks[0];
  const outcome = await secService.recordSecurityOutcome({
    organizationId,
    businessId,
    riskId: targetRisk.id,
    outcome: 'RESOLVED',
    resolutionDetails: 'Rotated API keys and enforced Agent Orchestrator TACF governance checks',
    learnings: [
      'Enforcing strict TACF matrix checks stopped 100% of unapproved inter-agent calls',
      'API key 90-day rotation schedule eliminated stale permission credentials',
    ],
    actor: session.email,
  });

  assert.equal(outcome.outcome, 'RESOLVED');
  assert.equal(outcome.learnings.length, 2);

  // Verify memory write-back under category 'security'
  const memories = await memoryRepo.queryMemories({
    organizationId,
    businessId,
    category: 'security',
    minImportance: 0.5,
  });
  assert.ok(memories.length >= 2, 'Security learnings must be written back to MemoryRepository under category security');

  // Verify resolution notification
  const alertsPostOutcome = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostOutcome.some((a) => a.title.includes('Security Issue Resolved')),
    'Customer notification must be sent when security issue is resolved'
  );

  // ── 8. Verify Audit Trail ─────────────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'SECURITY_POSTURE_ANALYZED'),
    'SECURITY_POSTURE_ANALYZED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'SECURITY_RISK_DETECTED'),
    'SECURITY_RISK_DETECTED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'SECURITY_RECOMMENDATION_GENERATED'),
    'SECURITY_RECOMMENDATION_GENERATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'SECURITY_OUTCOME_RECORDED'),
    'SECURITY_OUTCOME_RECORDED audit event required'
  );
});

test('Phase 17 E2E Test 2: Verify all 6 Security Risk Types detection', async () => {
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
    userEmail: 'sec-lead@cyberguard.io',
    userName: 'CyberGuard Lead',
    userRole: 'ADMIN',
    organizationName: 'CyberGuard Inc',
    planTier: 'growth',
    companyName: 'CyberGuard Inc',
    websiteUrl: 'https://cyberguard.io',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const secService = new SecurityIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  const requiredTypes: import('../../src/core/security/security-intelligence-service').SecurityRiskType[] = [
    'ACCESS_PATTERN_CHANGE',
    'PERMISSION_RISK',
    'DATA_EXPOSURE',
    'AGENT_BEHAVIOR_RISK',
    'WORKFLOW_RISK',
    'COMPLIANCE_GAP',
  ];

  const detected = await secService.detectSecurityRisks({
    organizationId,
    businessId,
    riskTypes: requiredTypes,
    actor: session.email,
  });

  assert.equal(detected.length, 6, 'Must detect all 6 requested security risk types');

  for (const type of requiredTypes) {
    const risk = detected.find((r) => r.riskType === type);
    assert.ok(risk, `Must detect risk type: ${type}`);
    assert.ok(risk.evidence, `Risk ${type} must contain evidence`);
    assert.ok(risk.recommendedAction, `Risk ${type} must contain recommended action`);
    assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(risk.severity));
    assert.ok(risk.confidence >= 0 && risk.confidence <= 1);
  }
});

test('Phase 17 E2E Test 3: Tenant Isolation Security Enforcement', async () => {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();

  const onboardingService = new CustomerOnboardingService(
    authManager, billingManager, stateManager, dnaRepo
  );

  // Setup Org A
  const orgA = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@org-a.com',
    userName: 'Org A Admin',
    userRole: 'ADMIN',
    organizationName: 'Org A Security',
    planTier: 'growth',
    companyName: 'Org A Security',
    websiteUrl: 'https://org-a.com',
  });

  // Setup Org B
  const orgB = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@org-b.com',
    userName: 'Org B Admin',
    userRole: 'ADMIN',
    organizationName: 'Org B Security',
    planTier: 'growth',
    companyName: 'Org B Security',
    websiteUrl: 'https://org-b.com',
  });

  const contextBuilder = new ContextBuilder();
  const secService = new SecurityIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  // Org A creates security posture report
  const reportA = await secService.analyzeSecurityPosture({
    organizationId: orgA.session.organizationId,
    businessId: orgA.customerState.businessId!,
    actor: orgA.session.email,
  });

  assert.ok(reportA.id);

  // Org B cannot access Org A security intelligence
  const orgBInsights = secService.getSecurityInsights(
    orgB.session.organizationId,
    orgB.customerState.businessId!
  );
  assert.equal(orgBInsights.postureReports.length, 0, 'Org B must not see Org A posture reports');

  // Unauthorized org ID attempting to invoke service methods throws SecurityIntelligence: access denied
  await assert.rejects(
    async () => {
      await secService.analyzeSecurityPosture({
        organizationId: 'unauthorized_attacker_org',
        businessId: 'unauthorized_attacker_biz',
        actor: 'hacker@evil.com',
      });
    },
    /SecurityIntelligence: access denied/i,
    'Cross-tenant posture analysis must be denied'
  );

  await assert.rejects(
    async () => {
      await secService.detectSecurityRisks({
        organizationId: 'unauthorized_attacker_org',
        businessId: 'unauthorized_attacker_biz',
        actor: 'hacker@evil.com',
      });
    },
    /SecurityIntelligence: access denied/i,
    'Cross-tenant risk detection must be denied'
  );

  await assert.rejects(
    async () => {
      await secService.generateSecurityRecommendation({
        organizationId: 'unauthorized_attacker_org',
        businessId: 'unauthorized_attacker_biz',
        actor: 'hacker@evil.com',
      });
    },
    /SecurityIntelligence: access denied/i,
    'Cross-tenant recommendation generation must be denied'
  );
});
