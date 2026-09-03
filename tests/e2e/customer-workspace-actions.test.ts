import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { DNAReviewService } from '../../src/core/saas/dna-review-service';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { AgentRegistry } from '../../src/core/agents';
import { ContextBuilder } from '../../src/core/context';
import { WorkflowEngine } from '../../src/core/automation/workflows';
import { ApprovalManager } from '../../src/core/automation/approvals';
import { CustomerWorkspaceService } from '../../src/core/saas/customer-workspace-service';
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

test('Phase 12B E2E: Customer Workspace Actions (Login -> Workspace Access -> DNA Approval -> Campaign -> Agent Exec -> Approval Workflow -> Audit Logging -> Notifications)', async () => {
  // 1. Initialize Platform Services
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const notificationDispatcher = new NotificationDispatcher();
  const notificationService = new CustomerNotificationService(notificationDispatcher);
  const dnaReviewService = new DNAReviewService(dnaRepo, auditRepo);

  const onboardingService = new CustomerOnboardingService(
    authManager,
    billingManager,
    stateManager,
    dnaRepo
  );

  // 2. Customer Onboarding Setup
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'ceo@brandfirst-client.com',
    userName: 'Alex Founder',
    userRole: 'ADMIN',
    organizationName: 'BrandFirst Client Corp',
    planTier: 'growth',
    companyName: 'BrandFirst Client Corp',
    websiteUrl: 'https://brandfirst-client.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // 3. Customer Session Validation & Workspace Access
  const validatedSession = authManager.validateSession(session.token);
  assert.ok(validatedSession);
  assert.equal(validatedSession.organizationId, organizationId);

  // 4. Business DNA Review & Approval Workflow
  const reviewBefore = dnaReviewService.getReviewStatus(businessId);
  assert.equal(reviewBefore.approvalState, 'PENDING_REVIEW');

  // Customer corrects mission and approves DNA
  await dnaReviewService.applyCustomerCorrection({
    organizationId,
    businessId,
    correctedBy: session.email,
    updates: { mission: 'Empowering brands with deterministic AI.' },
  });

  const approvalStatus = await dnaReviewService.approveDNA({
    organizationId,
    businessId,
    approvedBy: session.email,
    notes: 'Approved after mission adjustment',
  });

  assert.equal(approvalStatus.approvalState, 'APPROVED');

  // Verify Audit Log entry for DNA approval
  const dnaAuditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(dnaAuditEvents.some((e) => e.action === 'approve'));

  // 5. Campaign Creation & Agent Execution via CustomerWorkspaceService
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(onboarding.businessDNA);

  const agentRegistry = new AgentRegistry(contextBuilder);
  const approvalManager = new ApprovalManager();
  const workflowEngine = new WorkflowEngine(agentRegistry, approvalManager);

  const workspaceService = new CustomerWorkspaceService(
    agentRegistry,
    workflowEngine,
    approvalManager,
    auditRepo,
    notificationService,
    stateManager,
    dnaReviewService
  );

  const campaignResult = await workspaceService.launchCampaign({
    organizationId,
    businessId,
    campaignName: 'Q4 Product Blitz',
    prompt: 'Create LinkedIn launch announcement',
    targetChannel: 'LinkedIn',
    createdBy: session.email,
  });

  assert.ok(campaignResult.collaboration);
  assert.equal(campaignResult.collaboration.consultationSteps.length, 4);
  assert.ok(campaignResult.collaboration.overallQualityScore > 0);

  // 6. Approval Workflow Execution & Hard-Halt Verification
  workflowEngine.registerWorkflow({
    id: 'wf_client_launch',
    name: 'Client Governed Launch',
    autoApproveLowRisk: true,
    steps: [
      {
        id: 'step_1',
        name: 'Draft Announcement',
        agentRole: 'content',
        promptTemplate: 'Draft social post',
        requiresApproval: true,
      },
      {
        id: 'step_2',
        name: 'Publish Announcement',
        agentRole: 'publishing',
        promptTemplate: 'Publish social post',
        requiresApproval: false,
      },
    ],
  });

  const workflowRun = await workspaceService.executeWorkflow(
    organizationId,
    businessId,
    'wf_client_launch',
    session.email
  );

  assert.equal(workflowRun.status, 'waiting_approval');

  // Verify pending approval notification delivered
  const unreadAlerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(unreadAlerts.some((a) => a.title.includes('[APPROVAL_REQUIRED]')));

  // Resolve pending approval request
  const pendingRequests = approvalManager.listPendingRequests(businessId);
  assert.equal(pendingRequests.length, 1);

  const resolveResult = await workspaceService.resolveApprovalRequest({
    organizationId,
    businessId,
    requestId: pendingRequests[0].id,
    decision: 'approved',
    resolvedBy: session.email,
  });

  assert.equal(resolveResult.request.status, 'approved');
  assert.ok(resolveResult.resumedRun);
  assert.equal(resolveResult.resumedRun.status, 'completed');

  // 7. Verify Audit Activity Timeline & Notification Delivery
  const fullTimeline = await workspaceService.getActivityTimeline({ organizationId, businessId });
  assert.ok(fullTimeline.length >= 3);
  assert.ok(fullTimeline.some((e) => e.action === 'approve'));
  assert.ok(fullTimeline.some((e) => e.action === 'create'));
  assert.ok(fullTimeline.some((e) => e.action === 'update'));
});
