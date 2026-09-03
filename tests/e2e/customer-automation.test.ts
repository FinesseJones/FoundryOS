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
import { CustomerAutomationService } from '../../src/core/automation/customer-automation-service';
import { AutomationScheduler } from '../../src/core/automation/automation-scheduler';
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

test('Phase 20 E2E Test 1: Full automation lifecycle (Login -> Browse Templates -> Create -> Activate -> Trigger -> Risk Eval -> Approval -> Execution -> Completion -> Memory Write-back -> Audit -> Notification)', async () => {
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

  // ── 2. Customer Onboarding & Login ─────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'auto-vp@nexus-corp.com',
    userName: 'Nexus Automation VP',
    userRole: 'ADMIN',
    organizationName: 'Nexus Global Systems',
    planTier: 'growth',
    companyName: 'Nexus Global Systems',
    websiteUrl: 'https://nexus-corp.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const execService = new AutonomousExecutionService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, notificationService, approvalManager, workflowEngine
  );

  const autoService = new CustomerAutomationService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, execService, notificationService
  );

  // ── 3. Browse Templates ───────────────────────────────────────────────────
  const templates = autoService.getAutomationTemplates();
  assert.equal(templates.length, 8, 'Must browse all 8 prebuilt templates');

  // ── 4. Create Automation ──────────────────────────────────────────────────
  const automation = await autoService.createAutomation({
    organizationId,
    businessId,
    templateId: 'CONTENT_CREATION_PIPELINE',
    triggerType: 'SCHEDULED',
    schedule: 'Daily at 08:00 UTC',
    actor: session.email,
  });

  assert.ok(automation.id);
  assert.equal(automation.organizationId, organizationId);
  assert.equal(automation.status, 'DRAFT');

  // ── 5. Activate Automation ────────────────────────────────────────────────
  const activated = await autoService.activateAutomation({
    organizationId,
    businessId,
    automationId: automation.id,
    actor: session.email,
  });

  assert.equal(activated.status, 'ACTIVE');

  // ── 6. Trigger Automation -> Risk Eval -> Execution -> Completion ─────────
  const result = await autoService.executeAutomation({
    organizationId,
    businessId,
    automationId: automation.id,
    actor: session.email,
  });

  assert.ok(result.executionPlan.executionId);
  assert.equal(result.automation.executionCount, 1);
  assert.equal(result.executionPlan.status, 'COMPLETED');

  // ── 7. Verify Memory Write-back under category 'automation_learning' ─────
  const memories = await memoryRepo.queryMemories({
    organizationId,
    businessId,
    category: 'automation_learning',
    minImportance: 0.5,
  });

  assert.ok(memories.length >= 2, 'Automation learning must write back to MemoryRepository under category automation_learning');

  // ── 8. Verify Audit Events ───────────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'AUTOMATION_CREATED'),
    'AUTOMATION_CREATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'AUTOMATION_ACTIVATED'),
    'AUTOMATION_ACTIVATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'AUTOMATION_TRIGGERED'),
    'AUTOMATION_TRIGGERED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'AUTOMATION_COMPLETED'),
    'AUTOMATION_COMPLETED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'AUTOMATION_LEARNING_RECORDED'),
    'AUTOMATION_LEARNING_RECORDED audit event required'
  );

  // ── 9. Verify Notification ───────────────────────────────────────────────
  const alerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alerts.some((a) => a.title.includes('Automation Activated')),
    'Notification alert required on automation activation'
  );
});

test('Phase 20 E2E Test 2: Risk controls (LOW executes automatically, HIGH requires approval, CRITICAL blocked without approval)', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const contextBuilder = new ContextBuilder();
  const approvalManager = new ApprovalManager();
  const agentRegistry = new AgentRegistry(contextBuilder);
  const workflowEngine = new WorkflowEngine(agentRegistry, approvalManager);

  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'risk-admin@secure-tech.com',
    userName: 'Secure Tech Admin',
    userRole: 'ADMIN',
    organizationName: 'Secure Tech Corp',
    planTier: 'growth',
    companyName: 'Secure Tech Corp',
    websiteUrl: 'https://secure-tech.com',
  });

  const { organizationId } = onboarding.session;
  const businessId = onboarding.customerState.businessId!;
  const actor = onboarding.session.email;

  const execService = new AutonomousExecutionService(
    dnaRepo, auditRepo, memoryRepo, contextBuilder, undefined, approvalManager, workflowEngine
  );
  const autoService = new CustomerAutomationService(dnaRepo, auditRepo, memoryRepo, contextBuilder, execService);

  // 1. LOW Risk (CONTENT_CREATION_PIPELINE): executes automatically
  const lowAuto = await autoService.createAutomation({
    organizationId, businessId, templateId: 'CONTENT_CREATION_PIPELINE', actor,
  });
  await autoService.activateAutomation({ organizationId, businessId, automationId: lowAuto.id, actor });

  const lowExec = await autoService.executeAutomation({ organizationId, businessId, automationId: lowAuto.id, actor });
  assert.equal(lowExec.executionPlan.status, 'COMPLETED', 'LOW risk automation must execute automatically');

  // 2. HIGH Risk (LEAD_FOLLOW_UP_SEQUENCE): requires approval & enters AWAITING_APPROVAL
  const highAuto = await autoService.createAutomation({
    organizationId, businessId, templateId: 'LEAD_FOLLOW_UP_SEQUENCE', actor,
  });
  await autoService.activateAutomation({ organizationId, businessId, automationId: highAuto.id, actor });

  const highExec = await autoService.executeAutomation({ organizationId, businessId, automationId: highAuto.id, actor });
  assert.equal(highExec.executionPlan.status, 'AWAITING_APPROVAL', 'HIGH risk automation must require approval');

  // 3. CRITICAL Risk (SECURITY_MONITORING_CHECK): blocked without approval
  const criticalAuto = await autoService.createAutomation({
    organizationId, businessId, templateId: 'SECURITY_MONITORING_CHECK', actor,
  });
  await autoService.activateAutomation({ organizationId, businessId, automationId: criticalAuto.id, actor });

  const criticalExec = await autoService.executeAutomation({ organizationId, businessId, automationId: criticalAuto.id, actor });
  assert.equal(criticalExec.executionPlan.status, 'AWAITING_APPROVAL', 'CRITICAL risk automation must be blocked without approval');
});

test('Phase 20 E2E Test 3: Scheduler (Scheduled automation triggers correctly)', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const contextBuilder = new ContextBuilder();

  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'sched@cron-corp.com',
    userName: 'Cron Corp Lead',
    userRole: 'ADMIN',
    organizationName: 'Cron Corp',
    planTier: 'growth',
    companyName: 'Cron Corp',
    websiteUrl: 'https://cron-corp.com',
  });

  const { organizationId } = onboarding.session;
  const businessId = onboarding.customerState.businessId!;
  const actor = onboarding.session.email;

  const execService = new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder);
  const autoService = new CustomerAutomationService(dnaRepo, auditRepo, memoryRepo, contextBuilder, execService);
  const scheduler = new AutomationScheduler(dnaRepo, auditRepo, autoService);

  const automation = await autoService.createAutomation({
    organizationId, businessId, templateId: 'CONTENT_CREATION_PIPELINE', actor,
  });
  await autoService.activateAutomation({ organizationId, businessId, automationId: automation.id, actor });

  const job = await scheduler.scheduleAutomation({
    organizationId, businessId, automationId: automation.id, cronExpression: '0 9 * * *', actor,
  });

  assert.equal(job.state, 'WAITING');

  // Wait for job to become due
  await new Promise((r) => setTimeout(r, 1100));

  const triggered = await scheduler.triggerDueAutomations('cron_daemon');
  assert.equal(triggered.length, 1, 'Scheduled automation must trigger correctly');
  assert.equal(triggered[0].runCount, 1);
});

test('Phase 20 E2E Test 4: Tenant isolation (Organization A cannot access Organization B automations -> CustomerAutomation: access denied)', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const contextBuilder = new ContextBuilder();

  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  const orgA = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@org-a.com', userName: 'Org A Admin', userRole: 'ADMIN',
    organizationName: 'Org A Systems', planTier: 'growth', companyName: 'Org A Systems', websiteUrl: 'https://org-a.com',
  });

  const orgB = await onboardingService.executeCustomerOnboarding({
    userEmail: 'admin@org-b.com', userName: 'Org B Admin', userRole: 'ADMIN',
    organizationName: 'Org B Systems', planTier: 'growth', companyName: 'Org B Systems', websiteUrl: 'https://org-b.com',
  });

  const execService = new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder);
  const autoService = new CustomerAutomationService(dnaRepo, auditRepo, memoryRepo, contextBuilder, execService);

  const autoA = await autoService.createAutomation({
    organizationId: orgA.session.organizationId,
    businessId: orgA.customerState.businessId!,
    templateId: 'MARKETING_CAMPAIGN_LAUNCH',
    actor: orgA.session.email,
  });

  // Org B history must not contain Org A automations
  const historyB = autoService.getAutomationHistory(orgB.session.organizationId, orgB.customerState.businessId!);
  assert.equal(historyB.automations.length, 0);

  // Cross tenant access throws CustomerAutomation: access denied
  await assert.rejects(
    async () => {
      await autoService.executeAutomation({
        organizationId: 'unauthorized_org',
        businessId: 'unauthorized_biz',
        automationId: autoA.id,
        actor: 'hacker@evil.com',
      });
    },
    /CustomerAutomation: access denied/i,
    'Cross tenant automation execution must throw CustomerAutomation: access denied'
  );
});
