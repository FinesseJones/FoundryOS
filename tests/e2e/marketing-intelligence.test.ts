import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { ContextBuilder } from '../../src/core/context';
import { MemoryRepository } from '../../src/core/persistence/repositories';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { MarketingIntelligenceService } from '../../src/core/marketing/marketing-intelligence-service';
import { ContentPlanningService } from '../../src/core/marketing/content-planning-service';
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

test('Phase 14 E2E: Marketing Intelligence Workflows (Login -> DNA -> Campaign Strategy -> Recommendations -> Opportunities -> Content Plan -> Audit)', async () => {
  // ── 1. Bootstrap platform ───────────────────────────────────────────────
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const notificationDispatcher = new NotificationDispatcher();
  const notificationService = new CustomerNotificationService(notificationDispatcher);

  const onboardingService = new CustomerOnboardingService(
    authManager,
    billingManager,
    stateManager,
    dnaRepo
  );

  // ── 2. Customer onboarding ───────────────────────────────────────────────
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'cmo@nexus-tech.com',
    userName: 'Nexus CMO',
    userRole: 'ADMIN',
    organizationName: 'Nexus Technology',
    planTier: 'growth',
    companyName: 'Nexus Technology',
    websiteUrl: 'https://nexus-tech.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // ── 3. Build ContextBuilder (reusing existing infra) ─────────────────────
  const contextBuilder = new ContextBuilder();

  // ── 4. Marketing Intelligence Service ────────────────────────────────────
  const marketingService = new MarketingIntelligenceService(
    dnaRepo,
    auditRepo,
    contextBuilder,
    notificationService
  );

  // ── 5. Create Marketing Strategy ─────────────────────────────────────────
  const strategy = await marketingService.createMarketingStrategy({
    organizationId,
    businessId,
    goal: 'Increase enterprise brand awareness and generate qualified leads in Q3',
    actor: session.email,
  });

  assert.ok(strategy.id, 'Strategy must have an ID');
  assert.equal(strategy.organizationId, organizationId, 'Strategy must be org-scoped');
  assert.equal(strategy.businessId, businessId);
  assert.equal(strategy.status, 'DRAFT');
  assert.ok(strategy.recommendedChannels.length > 0, 'Strategy must include channel recommendations');
  assert.ok(strategy.successMetrics.length > 0, 'Strategy must include success metrics');
  assert.ok(strategy.contentThemes.length > 0, 'Strategy must include content themes');
  assert.ok(strategy.campaignTimeline, 'Strategy must include campaign timeline');

  // ── 6. Generate Campaign Recommendation ──────────────────────────────────
  const recommendation = await marketingService.generateCampaignRecommendation({
    organizationId,
    businessId,
    campaignType: 'Lead Generation',
    actor: session.email,
  });

  assert.ok(recommendation.id, 'Recommendation must have an ID');
  assert.equal(recommendation.organizationId, organizationId);
  assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(recommendation.priority));
  assert.ok(recommendation.estimatedImpact, 'Recommendation must include estimated impact');
  assert.ok(recommendation.channels.length > 0);

  // ── 7. Analyze Marketing Opportunity ─────────────────────────────────────
  const opportunity = await marketingService.analyzeMarketingOpportunity({
    organizationId,
    businessId,
    opportunityContext: 'Educational content engagement rising 35% over past month',
    actor: session.email,
  });

  assert.ok(opportunity.id, 'Opportunity must have an ID');
  assert.equal(opportunity.organizationId, organizationId);
  assert.ok(['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM'].includes(opportunity.urgency));
  assert.ok(opportunity.recommendedAction, 'Opportunity must include a recommended action');

  // ── 8. Get Marketing Insights (org-scoped) ───────────────────────────────
  const insights = marketingService.getMarketingInsights(organizationId, businessId);
  assert.equal(insights.strategies.length, 1);
  assert.equal(insights.recommendations.length, 1);
  assert.equal(insights.opportunities.length, 1);

  // ── 9. Track Campaign Outcome ─────────────────────────────────────────────
  const outcome = await marketingService.trackCampaignOutcome({
    organizationId,
    businessId,
    campaignId: recommendation.id,
    result: 'SUCCESS',
    learnings: [
      'LinkedIn outperformed email by 2.4x for this audience segment',
      'Educational content drove 38% more engagement than promotional posts',
    ],
    actor: session.email,
  });

  assert.equal(outcome.result, 'SUCCESS');
  assert.equal(outcome.learnings.length, 2);

  // ── 10. Content Planning Service ─────────────────────────────────────────
  const contentPlanner = new ContentPlanningService(dnaRepo, auditRepo, contextBuilder);

  const socialPlan = await contentPlanner.generateChannelPlan({
    organizationId,
    businessId,
    channel: 'SOCIAL_MEDIA',
    numberOfItems: 4,
    theme: 'Thought Leadership',
    actor: session.email,
  });

  assert.equal(socialPlan.length, 4, 'Social plan must contain 4 items');
  assert.ok(socialPlan.every((p) => p.organizationId === organizationId), 'All plan items must be org-scoped');
  assert.ok(socialPlan.every((p) => p.channel === 'SOCIAL_MEDIA'));
  assert.ok(socialPlan.every((p) => p.status === 'PLANNED'));

  // ── 11. Generate full content calendar ───────────────────────────────────
  const calendar = await contentPlanner.generateContentCalendar({
    organizationId,
    businessId,
    planName: 'Nexus Technology Q3 Content Calendar',
    durationWeeks: 8,
    actor: session.email,
  });

  assert.ok(calendar.items.length > 0, 'Calendar must contain content items');
  assert.ok(calendar.startDate, 'Calendar must have a start date');
  assert.ok(calendar.endDate, 'Calendar must have an end date');

  // ── 12. Verify audit event trail ─────────────────────────────────────────
  const auditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'MARKETING_STRATEGY_CREATED'),
    'MARKETING_STRATEGY_CREATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'CAMPAIGN_RECOMMENDATION_GENERATED'),
    'CAMPAIGN_RECOMMENDATION_GENERATED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'MARKETING_OPPORTUNITY_IDENTIFIED'),
    'MARKETING_OPPORTUNITY_IDENTIFIED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'CAMPAIGN_OUTCOME_RECORDED'),
    'CAMPAIGN_OUTCOME_RECORDED audit event required'
  );
  assert.ok(
    auditEvents.some((e) => (e.details as any)?.eventType === 'CONTENT_PLAN_GENERATED'),
    'CONTENT_PLAN_GENERATED audit event required'
  );

  // ── 13. Verify notification delivered ────────────────────────────────────
  const alerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(
    alerts.some((a) => a.title.includes('Marketing Strategy Created')),
    'Customer must receive Marketing Strategy Created notification'
  );

  // ── 14. Tenant isolation — cross-org access denied ───────────────────────
  await assert.rejects(
    async () => {
      await marketingService.createMarketingStrategy({
        organizationId: 'unauthorized_org_999',
        businessId: 'fake_biz_999',
        goal: 'Attack competitor data',
        actor: 'attacker@evil.com',
      });
    },
    /access denied/i,
    'MarketingIntelligenceService must block cross-tenant access'
  );

  const crossTenantInsights = marketingService.getMarketingInsights('unauthorized_org_999', 'fake_biz_999');
  assert.equal(crossTenantInsights.strategies.length, 0);
  assert.equal(crossTenantInsights.recommendations.length, 0);
});

test('Phase 14: ContentPlanningService generates multi-channel content calendar with org-scoped items', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const memoryRepo = new MemoryRepository();
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();

  const onboardingService = new CustomerOnboardingService(
    authManager,
    billingManager,
    stateManager,
    dnaRepo
  );

  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'content@vaultbrands.com',
    userName: 'Vault Content Lead',
    userRole: 'ADMIN',
    organizationName: 'Vault Brands',
    planTier: 'starter',
    companyName: 'Vault Brands',
    websiteUrl: 'https://vaultbrands.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  const contextBuilder = new ContextBuilder();
  const contentPlanner = new ContentPlanningService(dnaRepo, auditRepo, contextBuilder);

  const calendar = await contentPlanner.generateContentCalendar({
    organizationId,
    businessId,
    planName: 'Vault Brands 12-Week Strategy',
    durationWeeks: 12,
    actor: session.email,
  });

  assert.equal(calendar.organizationId, organizationId);
  assert.ok(calendar.items.length > 0);
  assert.ok(calendar.items.every((i) => i.organizationId === organizationId), 'All items must be org-scoped');

  // Verify cross-org content isolation
  const isolatedPlan = contentPlanner.getContentPlan('unauthorized_org_777', 'fake_biz');
  assert.equal(isolatedPlan.length, 0, 'Cross-tenant content plan access must return empty');
});
