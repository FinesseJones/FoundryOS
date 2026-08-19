import { test } from 'node:test';
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
