import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { ContextBuilder } from '../context';
import { ContentAgent } from '../agents/content-agent';
import { BrandAgent } from '../agents/brand-agent';
import { AnalyticsAgent } from '../agents/analytics-agent';
import { LearningAgent } from '../agents/learning-agent';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MarketingStrategy {
  id: string;
  organizationId: string;
  businessId: string;
  goal: string;
  targetAudience: string;
  messagingDirection: string;
  recommendedChannels: string[];
  contentThemes: string[];
  successMetrics: string[];
  campaignTimeline: string;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecommendation {
  id: string;
  organizationId: string;
  businessId: string;
  campaignType: string;
  headline: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedImpact: string;
  channels: string[];
  createdAt: string;
}

export interface MarketingOpportunity {
  id: string;
  organizationId: string;
  businessId: string;
  opportunityType: string;
  title: string;
  rationale: string;
  recommendedAction: string;
  urgency: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  createdAt: string;
}

export interface CampaignOutcome {
  campaignId: string;
  organizationId: string;
  businessId: string;
  result: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  learnings: string[];
  recordedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketingIntelligenceService {
  private strategies: Map<string, MarketingStrategy> = new Map();
  private recommendations: CampaignRecommendation[] = [];
  private opportunities: MarketingOpportunity[] = [];
  private outcomes: CampaignOutcome[] = [];

  // Existing agents — NOT duplicated
  private contentAgent: ContentAgent;
  private brandAgent: BrandAgent;
  private analyticsAgent: AnalyticsAgent;
  private learningAgent: LearningAgent;

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private contextBuilder: ContextBuilder,
    private notificationService?: CustomerNotificationService
  ) {
    this.contentAgent = new ContentAgent(contextBuilder);
    this.brandAgent = new BrandAgent(contextBuilder);
    this.analyticsAgent = new AnalyticsAgent(contextBuilder);
    this.learningAgent = new LearningAgent(contextBuilder);
  }

  // ─── Tenant Guard ───────────────────────────────────────────────────────────

  private async assertTenantDNA(organizationId: string, businessId: string) {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) throw new Error(`Marketing Intelligence: access denied for org '${organizationId}'.`);
    return dna;
  }

  // ─── 1. Create Marketing Strategy ──────────────────────────────────────────

  /**
   * Generates a full marketing strategy from a customer goal using Business DNA
   * context + existing BrandAgent and ContentAgent.
   */
  async createMarketingStrategy(params: {
    organizationId: string;
    businessId: string;
    goal: string;
    actor: string;
  }): Promise<MarketingStrategy> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);

    const companyName = dna.companyIdentity.companyName.value;
    const tone = (dna as any).brandVoice?.primaryTone?.value ?? 'professional';
    const industry = (dna as any).companyIdentity?.industry?.value ?? 'Technology';

    // Use existing ContentAgent for content strategy leg
    const contentResult = await this.contentAgent.executeTask({
      taskId: `strat_content_${Date.now()}`,
      businessId: params.businessId,
      role: 'content',
      taskType: 'content_generation',
      prompt: `Create a content strategy for: "${params.goal}" for ${companyName}.`,
    });

    // Use existing BrandAgent for brand alignment check
    const brandResult = await this.brandAgent.executeTask({
      taskId: `strat_brand_${Date.now()}`,
      businessId: params.businessId,
      role: 'brand',
      taskType: 'brand_analysis',
      prompt: `Review brand alignment for campaign goal: "${params.goal}".`,
    });

    const id = `mkt_strat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const strategy: MarketingStrategy = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      goal: params.goal,
      targetAudience: `Primary ${industry} decision-makers and early adopters who value ${tone} communication`,
      messagingDirection: `Emphasize ${companyName}'s unique value proposition with a ${tone} voice that builds trust and drives action.`,
      recommendedChannels: ['LinkedIn', 'Email Newsletter', 'Company Blog', 'Twitter/X'],
      contentThemes: [
        `${companyName} expertise and thought leadership`,
        'Customer success and transformation stories',
        'Industry insights and trends',
        'Educational how-to content',
      ],
      successMetrics: [
        'Engagement rate > 3% across social channels',
        'Email open rate > 25%',
        'Website traffic increase > 15% MoM',
        'Lead generation volume',
      ],
      campaignTimeline: '90-day sprint with weekly content cadence',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    this.strategies.set(id, strategy);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'MARKETING_STRATEGY_CREATED',
        strategyId: id,
        goal: params.goal,
        brandScore: brandResult.cognitiveResult.confidence.aggregateScore,
        contentApprovalStatus: contentResult.cognitiveResult.decision.approvalStatus,
      },
    });

    if (this.notificationService) {
      this.notificationService.sendCustomerAlert({
        organizationId: params.organizationId,
        businessId: params.businessId,
        type: 'dna_updated',
        title: 'Marketing Strategy Created',
        message: `Your marketing strategy for "${params.goal}" is ready for review.`,
      });
    }

    return strategy;
  }

  // ─── 2. Generate Campaign Recommendation ───────────────────────────────────

  /**
   * Generates a prioritized campaign recommendation using AnalyticsAgent insights.
   */
  async generateCampaignRecommendation(params: {
    organizationId: string;
    businessId: string;
    campaignType: string;
    actor: string;
  }): Promise<CampaignRecommendation> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    // Analytics Agent drives measurement recommendations
    const analyticsResult = await this.analyticsAgent.executeTask({
      taskId: `rec_analytics_${Date.now()}`,
      businessId: params.businessId,
      role: 'analytics',
      taskType: 'campaign_planning',
      prompt: `Analyze best campaign approach for ${companyName} running a ${params.campaignType} campaign.`,
    });

    const id = `mkt_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const confidenceScore = analyticsResult.cognitiveResult.confidence.aggregateScore;
    const priority: 'HIGH' | 'MEDIUM' | 'LOW' = confidenceScore >= 0.7 ? 'HIGH' : confidenceScore >= 0.4 ? 'MEDIUM' : 'LOW';

    const recommendation: CampaignRecommendation = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      campaignType: params.campaignType,
      headline: `Launch ${params.campaignType} campaign to accelerate ${companyName} growth`,
      description: analyticsResult.outputSummary,
      priority,
      estimatedImpact: `${Math.round(confidenceScore * 40 + 10)}% projected engagement lift based on current Business DNA profile`,
      channels: ['LinkedIn', 'Email', 'Content Marketing'],
      createdAt: new Date().toISOString(),
    };

    this.recommendations.push(recommendation);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'CAMPAIGN_RECOMMENDATION_GENERATED',
        recommendationId: id,
        campaignType: params.campaignType,
        priority,
      },
    });

    return recommendation;
  }

  // ─── 3. Analyze Marketing Opportunity ──────────────────────────────────────

  /**
   * Identifies marketing opportunities from Business DNA signals using LearningAgent.
   */
  async analyzeMarketingOpportunity(params: {
    organizationId: string;
    businessId: string;
    opportunityContext: string;
    actor: string;
  }): Promise<MarketingOpportunity> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    // LearningAgent extracts patterns from business memory
    const learningResult = await this.learningAgent.executeTask({
      taskId: `opp_learning_${Date.now()}`,
      businessId: params.businessId,
      role: 'learning',
      taskType: 'general_chat',
      prompt: `Identify marketing opportunity in: "${params.opportunityContext}"`,
    });

    const id = `mkt_opp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const opportunity: MarketingOpportunity = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      opportunityType: params.opportunityContext,
      title: `Opportunity: ${params.opportunityContext}`,
      rationale: learningResult.outputSummary,
      recommendedAction: 'Launch targeted content series addressing this audience segment immediately.',
      urgency: learningResult.cognitiveResult.confidence.aggregateScore >= 0.6 ? 'IMMEDIATE' : 'SHORT_TERM',
      createdAt: new Date().toISOString(),
    };

    this.opportunities.push(opportunity);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'MARKETING_OPPORTUNITY_IDENTIFIED',
        opportunityId: id,
        urgency: opportunity.urgency,
      },
    });

    return opportunity;
  }

  // ─── 4. Get Marketing Insights ─────────────────────────────────────────────

  getMarketingInsights(organizationId: string, businessId: string): {
    strategies: MarketingStrategy[];
    recommendations: CampaignRecommendation[];
    opportunities: MarketingOpportunity[];
    outcomes: CampaignOutcome[];
  } {
    return {
      strategies: Array.from(this.strategies.values()).filter(
        (s) => s.organizationId === organizationId && s.businessId === businessId
      ),
      recommendations: this.recommendations.filter(
        (r) => r.organizationId === organizationId && r.businessId === businessId
      ),
      opportunities: this.opportunities.filter(
        (o) => o.organizationId === organizationId && o.businessId === businessId
      ),
      outcomes: this.outcomes.filter(
        (c) => c.organizationId === organizationId && c.businessId === businessId
      ),
    };
  }

  // ─── 5. Track Campaign Outcome ─────────────────────────────────────────────

  async trackCampaignOutcome(params: {
    organizationId: string;
    businessId: string;
    campaignId: string;
    result: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    learnings: string[];
    actor: string;
  }): Promise<CampaignOutcome> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const outcome: CampaignOutcome = {
      campaignId: params.campaignId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      result: params.result,
      learnings: params.learnings,
      recordedAt: new Date().toISOString(),
    };

    this.outcomes.push(outcome);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.actor,
      details: {
        eventType: 'CAMPAIGN_OUTCOME_RECORDED',
        campaignId: params.campaignId,
        result: params.result,
        learningsCount: params.learnings.length,
      },
    });

    return outcome;
  }
}
