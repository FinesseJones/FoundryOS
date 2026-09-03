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
import { SalesIntelligenceService } from '../../src/core/sales/sales-intelligence-service';
import { OpportunityDetectionService } from '../../src/core/sales/opportunity-detection-service';
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
    } else if (prompt.includes('discoveredLeads') || prompt.includes('prospects') || prompt.includes('leads') || prompt.includes('opportunity')) {
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
