import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository, MemoryRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { ContextBuilder } from '../../src/core/context';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { ApprovalManager } from '../../src/core/automation/approvals';
import { WorkflowEngine } from '../../src/core/automation/workflows';
import { AgentRegistry } from '../../src/core/agents/agent-registry';
import { AutonomousExecutionService } from '../../src/core/execution/autonomous-execution-service';
import { LLMProviderGateway } from '../../src/core/providers/llm-provider-factory';
import { WebCrawler } from '../../src/core/ingestion/crawler';

const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
const originalStructured = LLMProviderGateway.generateStructured.bind(LLMProviderGateway);
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
  LLMProviderGateway.executeWithFallback = async (request) => {
    const prompt = request.prompt || '';
    let text = '{"result": "mocked test double"}';

    if (prompt.includes('channelOptimizedContent') || prompt.includes('complianceStatus')) {
      text = JSON.stringify({
        targetChannel: 'x',
        scheduledTimeIso: new Date(Date.now() + 3600000).toISOString(),
        channelOptimizedContent: 'Pulse Dynamics Q3 Update: Transforming commercial operations.',
        complianceStatus: 'COMPLIANT',
        hashtags: ['#Growth', '#Operations'],
        characterCount: 65,
        requiresHumanApproval: true,
        distributionStrategy: 'Priority multi-channel broadcasting',
        riskFactor: 'LOW',
      });
    } else if (prompt.includes('reputationRiskScore') || prompt.includes('impersonationAttemptsDetected')) {
      text = JSON.stringify({
        reputationRiskScore: 0.04,
        threatLevel: 'LOW',
        impersonationAttemptsDetected: 0,
        activeAlerts: [],
        brandVoiceViolations: [],
        recommendedMitigations: ['Monitor weekly social brand mentions'],
        reputationSummary: 'Brand reputation remains strong with zero critical threats detected.',
      });
    } else if (prompt.includes('contentRoi') || prompt.includes('topPerformingTopics')) {
      text = JSON.stringify({
        contentRoi: 3.4,
        conversionRate: 0.048,
        topPerformingTopics: ['Industrial Automation', 'Zero Downtime', 'Energy Efficiency'],
        underperformingTopics: ['Generic Tech Buzzwords'],
        keyInsights: ['Measurable uptime SLAs convert 3x higher than general feature lists.'],
        recommendedAction: 'Double down on quantifiable commercial ROI case studies.',
      });
    } else if (prompt.includes('winningPatterns') || prompt.includes('voiceEvolutionRecommendation')) {
      text = JSON.stringify({
        memoriesAnalyzed: 5,
        winningPatterns: ['Guaranteed sub-15m dispatch response SLA', '20% lower seasonal overhead'],
        underperformingTropes: ['Generic efficiency claims'],
        proposedVocabularyAdditions: ['Zero Downtime', 'Telemetric Monitoring'],
        proposedVocabularyRetirements: ['Cheap Service'],
        voiceEvolutionRecommendation: 'Lead with measurable SLA guarantees in commercial contractor outreach.',
        confidenceScore: 0.95,
      });
    } else if (prompt.includes('discoveredLeads')) {
      text = JSON.stringify({
        industry: 'SAAS',
        targetRegion: 'National',
        discoveredLeads: [
          {
            id: 101,
            companyName: 'Apex Cloud',
            website: 'https://apexcloud.io',
            targetRole: 'VP Operations & Growth',
            primaryContact: 'Target Role: VP Operations (Unverified - Verify Before Outreach)',
            currentStage: 'Discovery',
            status: 'High Priority',
            pillarFinancialPain: '$680k annual funnel drop-off loss',
            pillarProcessGap: 'Legacy non-responsive onboarding',
            pillarStakeholderAlignment: 'CMO & VP Product (Target Role)',
            industry: 'SAAS',
            estimatedRevenueLoss: '$680k/yr',
            opportunityScore: 94,
            isAiSourced: true,
            isAiEstimated: true,
            dataSource: 'AI-Estimated Domain Signal Analysis (Verify Before Outreach)',
            verificationStatus: 'AI_ESTIMATED_VERIFY_BEFORE_OUTREACH',
            verificationWarning: 'AI-estimated opportunity model. Confirm executive contact details before initiating outreach.',
            discoveredAt: new Date().toISOString(),
          },
        ],
        executiveProspectingSummary: 'Identified 1 high-priority prospect.',
      });
    } else {
      text = 'Pulse Dynamics launch announcement: Accelerating commercial transformation with authoritative solutions.';
    }

    return {
      text,
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150, estimatedCostUsd: 0.0001, latencyMs: 5 },
    };
  };

  LLMProviderGateway.generateStructured = async (request, schema) => {
    const resp = await LLMProviderGateway.executeWithFallback(request);
    let parsedData: any;
    try {
      parsedData = JSON.parse(resp.text);
    } catch {
      parsedData = { result: resp.text };
    }
    return {
      data: parsedData,
      response: resp,
    };
  };
});

afterEach(() => {
  LLMProviderGateway.executeWithFallback = originalExecute;
  LLMProviderGateway.generateStructured = originalStructured;
  WebCrawler.prototype.crawlWebsite = originalCrawl;
});

test('Phase 19 E2E Test 1: Full Execution Lifecycle (Login -> Recommendation -> Create Plan -> Risk Eval -> Request Approval -> Approve -> Execute -> Monitor -> Record Learning -> Audit -> Notifications)', async () => {
  // ── 1. Bootstrap ──────────────────────────────────────────────────────────
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const notificationDispatcher = new NotificationDispatcher();
  const notificationService = new CustomerNotificationService(notificationDispatcher);
  const contextBuilder = new ContextBuilder();
  const approvalManager = new ApprovalManager();
  const agentRegistry = new AgentRegistry(contextBuilder);
  const workflowEngine = new WorkflowEngine(agentRegistry, approvalManager);

  const onboardingService = new CustomerOnboardingService(
    authManager, billingManager, stateManager, dnaRepo
  );

  // ── 2. Customer Onboarding ─────────────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'head-ops@hyperdrive.io',
    userName: 'HyperDrive Ops',
    userRole: 'ADMIN',
    organizationName: 'HyperDrive Inc',
    planTier: 'growth',
    companyName: 'HyperDrive Inc',
    websiteUrl: 'https://hyperdrive.io',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const execService = new AutonomousExecutionService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService, approvalManager, workflowEngine
  );

  // ── 3. Create Execution Plan (HIGH Risk) ──────────────────────────────────
  const plan = await execService.createExecutionPlan({
    organizationId,
    businessId,
    objective: 'Deploy Automated Customer Re-engagement Workflow',
    domain: 'sales',
    riskLevel: 'HIGH',
    actor: session.email,
  });

  assert.ok(plan.executionId);
  assert.equal(plan.organizationId, organizationId);
  assert.equal(plan.riskLevel, 'HIGH');
  assert.equal(plan.approvalRequired, true);
  assert.equal(plan.status, 'PLANNED');

  // ── 4. Evaluate Execution Risk ─────────────────────────────────────────────
  const riskEval = await execService.evaluateExecutionRisk({
    organizationId,
    businessId,
    executionId: plan.executionId,
    actor: session.email,
  });

  assert.equal(riskEval.executionId, plan.executionId);
  assert.equal(riskEval.riskLevel, 'HIGH');
  assert.ok(riskEval.riskScore >= 0.7);
  assert.ok(riskEval.concerns.length >= 1);
  assert.ok(riskEval.safeguards.length >= 2);

  // ── 5. Request Execution Approval ──────────────────────────────────────────
  const approvalReq = await execService.requestExecutionApproval({
    organizationId,
    businessId,
    executionId: plan.executionId,
    actor: session.email,
  });

  assert.ok(approvalReq.approvalId);
  assert.equal(approvalReq.status, 'PENDING');

  // Verify notification sent for approval request
  const alertsPostReq = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostReq.some((a) => a.title.includes('Execution Approval Required')),
    'Notification must be sent when execution requires approval'
  );

  // Attempting unapproved execution must throw / be blocked
  await assert.rejects(
    async () => {
      await execService.executeApprovedWorkflow({
        organizationId,
        businessId,
        executionId: plan.executionId,
        approvalId: approvalReq.approvalId,
        actor: session.email,
      });
    },
    /Execution blocked/i,
    'Unapproved HIGH risk execution must be blocked'
  );

  // ── 6. Approve Request ────────────────────────────────────────────────────
  await execService.resolveApproval({
    organizationId,
    businessId,
    approvalId: approvalReq.approvalId,
    decision: 'APPROVED',
    actor: session.email,
  });

  // ── 7. Execute Approved Workflow ──────────────────────────────────────────
  const executedPlan = await execService.executeApprovedWorkflow({
    organizationId,
    businessId,
    executionId: plan.executionId,
    approvalId: approvalReq.approvalId,
    actor: session.email,
  });

  assert.equal(executedPlan.status, 'COMPLETED');
  assert.equal(executedPlan.completionPercent, 100);
  assert.ok(executedPlan.results.length >= 2);

  // Verify notifications sent for execution start and completion
  const alertsPostExec = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alertsPostExec.some((a) => a.title.includes('Execution Started')),
    'Notification must be sent when execution starts'
  );
  assert.ok(
    alertsPostExec.some((a) => a.title.includes('Execution Completed')),
    'Notification must be sent when execution completes'
  );

  // ── 8. Monitor Execution Outcome ──────────────────────────────────────────
  const outcome = execService.monitorExecutionOutcome({
    organizationId,
    businessId,
    executionId: plan.executionId,
  });

  assert.equal(outcome.executionStatus, 'COMPLETED');
  assert.equal(outcome.completionPercent, 100);
  assert.ok(outcome.impactMeasured);

  // ── 9. Record Execution Learning ──────────────────────────────────────────
  const learning = await execService.recordExecutionLearning({
    organizationId,
    businessId,
    executionId: plan.executionId,
    outcome: 'SUCCESS',
    learnings: [
      'Automated sales re-engagement workflow achieved 100% completion without human intervention',
      'Approval Manager gating ensured authorization before launching customer touchpoints',
    ],
    actor: session.email,
  });

  assert.equal(learning.outcome, 'SUCCESS');
  assert.equal(learning.learnings.length, 2);

  // Verify memory write-back under category 'execution_learning'
  const memories = await memoryRepo.queryMemories({
    organizationId,
    businessId,
    category: 'execution_learning',
    minImportance: 0.5,
  });
  assert.ok(memories.length >= 2, 'Execution learnings must be written back to MemoryRepository under category execution_learning');

  // ── 10. Verify Audit Events ───────────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EXECUTION_PLAN_CREATED'),
    'EXECUTION_PLAN_CREATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EXECUTION_RISK_EVALUATED'),
    'EXECUTION_RISK_EVALUATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EXECUTION_APPROVAL_REQUESTED'),
    'EXECUTION_APPROVAL_REQUESTED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EXECUTION_STARTED'),
    'EXECUTION_STARTED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EXECUTION_COMPLETED'),
    'EXECUTION_COMPLETED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'EXECUTION_LEARNING_RECORDED'),
    'EXECUTION_LEARNING_RECORDED audit event required'
  );
});

test('Phase 19 E2E Test 2: Risk Controls (LOW executes automatically, HIGH/CRITICAL requires/blocks until approval)', async () => {
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
    userEmail: 'admin@risktest.com',
    userName: 'RiskTest Admin',
    userRole: 'ADMIN',
    organizationName: 'Risk Test Systems',
    planTier: 'growth',
    companyName: 'Risk Test Systems',
    websiteUrl: 'https://risktest.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const execService = new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  // 1. LOW Risk Plan: executes automatically without approval
  const lowPlan = await execService.createExecutionPlan({
    organizationId,
    businessId,
    objective: 'Routine content draft compilation',
    domain: 'marketing',
    riskLevel: 'LOW',
    actor: session.email,
  });

  assert.equal(lowPlan.riskLevel, 'LOW');
  assert.equal(lowPlan.approvalRequired, false);

  const executedLow = await execService.executeApprovedWorkflow({
    organizationId,
    businessId,
    executionId: lowPlan.executionId,
    actor: session.email,
  });

  assert.equal(executedLow.status, 'COMPLETED', 'LOW risk plan must execute automatically');

  // 2. CRITICAL Risk Plan: blocked until approval requested & approved
  const criticalPlan = await execService.createExecutionPlan({
    organizationId,
    businessId,
    objective: 'Zero-Trust Security Key Rotation',
    domain: 'security',
    riskLevel: 'CRITICAL',
    actor: session.email,
  });

  assert.equal(criticalPlan.riskLevel, 'CRITICAL');
  assert.equal(criticalPlan.approvalRequired, true);

  // Attempt execution without approval -> throws
  await assert.rejects(
    async () => {
      await execService.executeApprovedWorkflow({
        organizationId,
        businessId,
        executionId: criticalPlan.executionId,
        actor: session.email,
      });
    },
    /Execution blocked/i,
    'CRITICAL risk plan must be blocked prior to approval'
  );

  // Request & Approve
  const approvalReq = await execService.requestExecutionApproval({
    organizationId,
    businessId,
    executionId: criticalPlan.executionId,
    actor: session.email,
  });

  await execService.resolveApproval({
    organizationId,
    businessId,
    approvalId: approvalReq.approvalId,
    decision: 'APPROVED',
    actor: session.email,
  });

  const executedCritical = await execService.executeApprovedWorkflow({
    organizationId,
    businessId,
    executionId: criticalPlan.executionId,
    approvalId: approvalReq.approvalId,
    actor: session.email,
  });

  assert.equal(executedCritical.status, 'COMPLETED', 'CRITICAL risk plan completes once approved');
});

test('Phase 19 E2E Test 3: Cross Domain Unified Execution Engine (Marketing + Sales + Operations + Security)', async () => {
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
    userEmail: 'director@omniexec.com',
    userName: 'OmniExec Director',
    userRole: 'ADMIN',
    organizationName: 'OmniExec Global',
    planTier: 'growth',
    companyName: 'OmniExec Global',
    websiteUrl: 'https://omniexec.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const execService = new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  const domains = ['marketing', 'sales', 'operations', 'security'] as const;

  for (const domain of domains) {
    const plan = await execService.createExecutionPlan({
      organizationId,
      businessId,
      objective: `Unified execution for ${domain}`,
      domain,
      riskLevel: 'LOW',
      actor: session.email,
    });

    const executed = await execService.executeApprovedWorkflow({
      organizationId,
      businessId,
      executionId: plan.executionId,
      actor: session.email,
    });

    assert.equal(executed.status, 'COMPLETED');
  }

  const dash = execService.getExecutionDashboard(organizationId, businessId);
  assert.equal(dash.plans.length, 4, 'Unified engine must manage all 4 domain execution plans');
});

test('Phase 19 E2E Test 4: Tenant Isolation Security Enforcement', async () => {
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
    userEmail: 'admin@exec-a.com',
    userName: 'Exec A Admin',
    userRole: 'ADMIN',
    organizationName: 'Exec A Corp',
    planTier: 'growth',
    companyName: 'Exec A Corp',
    websiteUrl: 'https://exec-a.com',
  });

  const orgB = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@exec-b.com',
    userName: 'Exec B Admin',
    userRole: 'ADMIN',
    organizationName: 'Exec B Corp',
    planTier: 'growth',
    companyName: 'Exec B Corp',
    websiteUrl: 'https://exec-b.com',
  });

  const contextBuilder = new ContextBuilder();
  const execService = new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder);

  // Org A creates execution plan
  const planA = await execService.createExecutionPlan({
    organizationId: orgA.session.organizationId,
    businessId: orgA.customerState.businessId!,
    objective: 'Org A confidential execution',
    actor: orgA.session.email,
  });

  assert.ok(planA.executionId);

  // Org B cannot view Org A execution plans
  const dashB = execService.getExecutionDashboard(
    orgB.session.organizationId,
    orgB.customerState.businessId!
  );
  assert.equal(dashB.plans.length, 0, 'Org B must not see Org A execution plans');

  // Unauthorized org ID attempting service calls throws AutonomousExecution: access denied
  await assert.rejects(
    async () => {
      await execService.createExecutionPlan({
        organizationId: 'unauthorized_hacker_org',
        businessId: 'unauthorized_hacker_biz',
        objective: 'Stolen execution',
        actor: 'hacker@evil.com',
      });
    },
    /AutonomousExecution: access denied/i,
    'Cross-tenant plan creation must be denied'
  );

  await assert.rejects(
    async () => {
      await execService.executeApprovedWorkflow({
        organizationId: 'unauthorized_hacker_org',
        businessId: 'unauthorized_hacker_biz',
        executionId: planA.executionId,
        actor: 'hacker@evil.com',
      });
    },
    /AutonomousExecution: access denied/i,
    'Cross-tenant workflow execution must be denied'
  );
});
