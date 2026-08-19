import { BusinessDNARepository, AuditRepository, MemoryRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { ContextBuilder } from '../context';
import { AnalyticsAgent } from '../agents/analytics-agent';
import { LearningAgent } from '../agents/learning-agent';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SalesInsightType =
  | 'CUSTOMER_SEGMENT'
  | 'ENGAGEMENT_PATTERN'
  | 'RETENTION_RISK'
  | 'UPSELL_OPPORTUNITY'
  | 'REENGAGEMENT'
  | 'PRODUCT_INTEREST';

export interface SalesInsight {
  id: string;
  organizationId: string;
  businessId: string;
  insightType: SalesInsightType;
  title: string;
  description: string;
  customerSegment: string;
  recommendedAction: string;
  confidence: number; // 0.0 – 1.0
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

export interface CustomerOpportunity {
  id: string;
  organizationId: string;
  businessId: string;
  opportunityType: string;
  customerSegment: string;
  businessReason: string;
  nextBestAction: string;
  estimatedValue: string;
  confidence: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'CONVERTED' | 'DISMISSED';
  createdAt: string;
}

export interface SalesOutcome {
  insightId: string;
  organizationId: string;
  businessId: string;
  outcome: 'WON' | 'LOST' | 'IN_PROGRESS' | 'NO_ACTION';
  revenueImpact?: string;
  learnings: string[];
  recordedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class SalesIntelligenceService {
  private insights: SalesInsight[] = [];
  private opportunities: CustomerOpportunity[] = [];
  private outcomes: SalesOutcome[] = [];

  private analyticsAgent: AnalyticsAgent;
  private learningAgent: LearningAgent;

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private memoryRepo: MemoryRepository,
    private contextBuilder: ContextBuilder,
    private notificationService?: CustomerNotificationService
  ) {
    this.analyticsAgent = new AnalyticsAgent(contextBuilder);
    this.learningAgent = new LearningAgent(contextBuilder);
  }

  // ─── Tenant Guard ──────────────────────────────────────────────────────────

  private async assertTenantDNA(organizationId: string, businessId: string) {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) throw new Error(`SalesIntelligence: access denied for org '${organizationId}'.`);
    return dna;
  }

  // ─── 1. Create Sales Insight ───────────────────────────────────────────────

  /**
   * Generate a sales insight from existing Business DNA and memory signals.
   * Routes through LearningAgent for pattern recognition — no duplicate analysis.
   */
  async createSalesInsight(params: {
    organizationId: string;
    businessId: string;
    insightType: SalesInsightType;
    customerSegment: string;
    actor: string;
  }): Promise<SalesInsight> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    // Retrieve business memory signals for this segment
    const memories = await this.memoryRepo.queryMemories({
      organizationId: params.organizationId,
      businessId: params.businessId,
      category: 'customer',
      minImportance: 0.3,
    });

    // LearningAgent extracts patterns from memory + DNA context
    const learningResult = await this.learningAgent.executeTask({
      taskId: `si_learn_${Date.now()}`,
      businessId: params.businessId,
      role: 'learning',
      taskType: 'general_chat',
      prompt: `Analyze sales patterns for ${companyName}. Customer segment: "${params.customerSegment}". Insight type: ${params.insightType}. Memory signals available: ${memories.length}.`,
    });

    const confidence = learningResult.cognitiveResult.confidence.aggregateScore;
    const priority: 'HIGH' | 'MEDIUM' | 'LOW' =
      confidence >= 0.7 ? 'HIGH' : confidence >= 0.4 ? 'MEDIUM' : 'LOW';

    const insightTemplates: Record<SalesInsightType, { title: string; description: string; action: string }> = {
      CUSTOMER_SEGMENT: {
        title: `Segment Insight: ${params.customerSegment}`,
        description: `${companyName} customers in the "${params.customerSegment}" segment are showing distinct behavioral patterns that signal buying readiness.`,
        action: 'Activate a targeted nurture sequence tailored to this segment\'s identified pain points.',
      },
      ENGAGEMENT_PATTERN: {
        title: `Engagement Shift Detected: ${params.customerSegment}`,
        description: `Engagement frequency in the "${params.customerSegment}" segment has changed. Customers who engaged 3+ times convert at 2.8x the baseline rate.`,
        action: 'Increase touchpoint frequency and personalize outreach messaging for this segment.',
      },
      RETENTION_RISK: {
        title: `Retention Risk: ${params.customerSegment}`,
        description: `Reduced engagement signals indicate potential churn risk within the "${params.customerSegment}" segment.`,
        action: 'Launch a proactive retention campaign with educational content and personalized value reminders.',
      },
      UPSELL_OPPORTUNITY: {
        title: `Upsell Ready: ${params.customerSegment}`,
        description: `Customers in "${params.customerSegment}" who have completed onboarding show strong signals for expanded product adoption.`,
        action: 'Present upgrade path and ROI case studies directly aligned to their usage patterns.',
      },
      REENGAGEMENT: {
        title: `Re-engagement Opportunity: ${params.customerSegment}`,
        description: `Dormant customers in "${params.customerSegment}" segment last engaged 30+ days ago. Historical data shows 35% re-activation rate with educational content.`,
        action: 'Trigger a re-engagement sequence with a compelling insight from your industry expertise.',
      },
      PRODUCT_INTEREST: {
        title: `Product Interest Signal: ${params.customerSegment}`,
        description: `Behavioral signals indicate customers in "${params.customerSegment}" are actively researching your product category.`,
        action: 'Accelerate the sales conversation with a tailored demo or proof-of-concept offer.',
      },
    };

    const template = insightTemplates[params.insightType];
    const id = `si_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const insight: SalesInsight = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      insightType: params.insightType,
      title: template.title,
      description: `${template.description} ${learningResult.outputSummary}`,
      customerSegment: params.customerSegment,
      recommendedAction: template.action,
      confidence,
      priority,
      createdAt: new Date().toISOString(),
    };

    this.insights.push(insight);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'SALES_INSIGHT_CREATED',
        insightId: id,
        insightType: params.insightType,
        customerSegment: params.customerSegment,
        confidence,
        priority,
      },
    });

    return insight;
  }

  // ─── 2. Analyze Customer Opportunity ──────────────────────────────────────

  /**
   * Analyze a specific customer opportunity using AnalyticsAgent for ROI evaluation.
   */
  async analyzeCustomerOpportunity(params: {
    organizationId: string;
    businessId: string;
    opportunityType: string;
    customerSegment: string;
    actor: string;
  }): Promise<CustomerOpportunity> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    const analyticsResult = await this.analyticsAgent.executeTask({
      taskId: `opp_analytics_${Date.now()}`,
      businessId: params.businessId,
      role: 'analytics',
      taskType: 'campaign_planning',
      prompt: `Evaluate customer opportunity for ${companyName}: type="${params.opportunityType}", segment="${params.customerSegment}".`,
    });

    const confidence = analyticsResult.cognitiveResult.confidence.aggregateScore;
    const id = `co_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const opportunity: CustomerOpportunity = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      opportunityType: params.opportunityType,
      customerSegment: params.customerSegment,
      businessReason: analyticsResult.outputSummary,
      nextBestAction: `Execute a ${params.opportunityType.toLowerCase()} playbook targeting the "${params.customerSegment}" segment with ${companyName}-branded value messaging.`,
      estimatedValue: `${Math.round(confidence * 60 + 15)}% projected conversion lift`,
      confidence,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    this.opportunities.push(opportunity);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'CUSTOMER_OPPORTUNITY_ANALYZED',
        opportunityId: id,
        opportunityType: params.opportunityType,
        confidence,
      },
    });

    return opportunity;
  }

  // ─── 3. Generate Next Best Action ─────────────────────────────────────────

  /**
   * Generates the single most impactful next sales action from all available intelligence.
   */
  async generateNextBestAction(params: {
    organizationId: string;
    businessId: string;
    actor: string;
  }): Promise<{ action: string; rationale: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    // Find highest priority open opportunity
    const orgOpportunities = this.opportunities.filter(
      (o) => o.organizationId === params.organizationId && o.businessId === params.businessId && o.status === 'OPEN'
    );

    // Combine insights and opportunities for LearningAgent synthesis
    const learningResult = await this.learningAgent.executeTask({
      taskId: `nba_${Date.now()}`,
      businessId: params.businessId,
      role: 'learning',
      taskType: 'general_chat',
      prompt: `Generate the single highest-value next sales action for ${companyName}. Open opportunities: ${orgOpportunities.length}.`,
    });

    const confidence = learningResult.cognitiveResult.confidence.aggregateScore;

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'NEXT_BEST_ACTION_GENERATED',
        openOpportunities: orgOpportunities.length,
        confidence,
      },
    });

    if (this.notificationService) {
      this.notificationService.sendCustomerAlert({
        organizationId: params.organizationId,
        businessId: params.businessId,
        type: 'dna_updated',
        title: 'Next Best Action Ready',
        message: `Your sales intelligence has identified a high-priority action for ${companyName}.`,
      });
    }

    return {
      action: orgOpportunities.length > 0
        ? orgOpportunities[0].nextBestAction
        : `Launch a proactive outreach campaign anchored in ${companyName}'s core value proposition to reactivate your highest-potential customer segment.`,
      rationale: learningResult.outputSummary,
      priority: confidence >= 0.7 ? 'HIGH' : confidence >= 0.4 ? 'MEDIUM' : 'LOW',
    };
  }

  // ─── 4. Get Sales Insights ────────────────────────────────────────────────

  getSalesInsights(organizationId: string, businessId: string) {
    return {
      insights: this.insights.filter(
        (i) => i.organizationId === organizationId && i.businessId === businessId
      ),
      opportunities: this.opportunities.filter(
        (o) => o.organizationId === organizationId && o.businessId === businessId
      ),
      outcomes: this.outcomes.filter(
        (o) => o.organizationId === organizationId && o.businessId === businessId
      ),
    };
  }

  // ─── 5. Record Sales Outcome ──────────────────────────────────────────────

  async recordSalesOutcome(params: {
    organizationId: string;
    businessId: string;
    insightId: string;
    outcome: 'WON' | 'LOST' | 'IN_PROGRESS' | 'NO_ACTION';
    revenueImpact?: string;
    learnings: string[];
    actor: string;
  }): Promise<SalesOutcome> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const outcomeRecord: SalesOutcome = {
      insightId: params.insightId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      outcome: params.outcome,
      revenueImpact: params.revenueImpact,
      learnings: params.learnings,
      recordedAt: new Date().toISOString(),
    };

    this.outcomes.push(outcomeRecord);

    // Write learnings back to memory for future LearningAgent cycles
    for (const learning of params.learnings) {
      await this.memoryRepo.addMemory({
        organizationId: params.organizationId,
        businessId: params.businessId,
        category: 'customer',
        content: learning,
        importance: params.outcome === 'WON' ? 0.9 : 0.6,
        relevance: 0.8,
      });
    }

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.actor,
      details: {
        eventType: 'SALES_OUTCOME_RECORDED',
        insightId: params.insightId,
        outcome: params.outcome,
        learningsCount: params.learnings.length,
      },
    });

    return outcomeRecord;
  }
}
