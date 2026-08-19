import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';
import { ContextBuilder } from '../context';
import { AnalyticsAgent } from '../agents/analytics-agent';
import { LearningAgent } from '../agents/learning-agent';

export type OpportunityType =
  | 'RETURNING_CUSTOMER'
  | 'CHURN_RISK'
  | 'UPSELL'
  | 'ENGAGEMENT_DROP'
  | 'PRODUCT_INTEREST'
  | 'CROSS_SELL';

export interface DetectedOpportunity {
  id: string;
  organizationId: string;
  businessId: string;
  opportunityType: OpportunityType;
  confidenceScore: number; // 0.0 – 1.0
  businessReason: string;
  recommendedAction: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectedAt: string;
}

export class OpportunityDetectionService {
  private detectedOpportunities: DetectedOpportunity[] = [];
  private analyticsAgent: AnalyticsAgent;
  private learningAgent: LearningAgent;

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private contextBuilder: ContextBuilder
  ) {
    this.analyticsAgent = new AnalyticsAgent(contextBuilder);
    this.learningAgent = new LearningAgent(contextBuilder);
  }

  private async assertTenantDNA(organizationId: string, businessId: string) {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) throw new Error(`OpportunityDetection: access denied for org '${organizationId}'.`);
    return dna;
  }

  /**
   * Detect all relevant opportunities for a business using AnalyticsAgent + LearningAgent.
   * Does NOT create a separate knowledge store — reads from existing Business DNA.
   */
  async detectOpportunities(params: {
    organizationId: string;
    businessId: string;
    opportunityTypes?: OpportunityType[];
    actor: string;
  }): Promise<DetectedOpportunity[]> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    const typesToScan: OpportunityType[] = params.opportunityTypes ?? [
      'RETURNING_CUSTOMER',
      'CHURN_RISK',
      'UPSELL',
      'ENGAGEMENT_DROP',
      'PRODUCT_INTEREST',
    ];

    // Analytics + Learning agents evaluate opportunity signals from DNA context
    const [analyticsResult, learningResult] = await Promise.all([
      this.analyticsAgent.executeTask({
        taskId: `opp_detect_analytics_${Date.now()}`,
        businessId: params.businessId,
        role: 'analytics',
        taskType: 'campaign_planning',
        prompt: `Scan ${companyName} Business DNA for customer opportunity signals across: ${typesToScan.join(', ')}.`,
      }),
      this.learningAgent.executeTask({
        taskId: `opp_detect_learn_${Date.now()}`,
        businessId: params.businessId,
        role: 'learning',
        taskType: 'general_chat',
        prompt: `Identify customer behavioral patterns for ${companyName} that indicate sales opportunities.`,
      }),
    ]);

    const baseConfidence = (
      analyticsResult.cognitiveResult.confidence.aggregateScore +
      learningResult.cognitiveResult.confidence.aggregateScore
    ) / 2;

    const opportunityTemplates: Record<OpportunityType, {
      businessReason: string;
      recommendedAction: string;
      confidenceMod: number;
    }> = {
      RETURNING_CUSTOMER: {
        businessReason: 'Returning customers have 5x higher conversion rates than new leads.',
        recommendedAction: 'Personalize re-engagement outreach with loyalty acknowledgment and exclusive access offer.',
        confidenceMod: 0.15,
      },
      CHURN_RISK: {
        businessReason: 'Engagement frequency has dropped below the healthy baseline threshold.',
        recommendedAction: 'Launch a proactive retention sequence with value-reinforcement content and a direct check-in.',
        confidenceMod: 0.0,
      },
      UPSELL: {
        businessReason: 'Customer adoption metrics indicate readiness for expanded product use.',
        recommendedAction: 'Present the upgrade path with an ROI case study matched to their current usage patterns.',
        confidenceMod: 0.1,
      },
      ENGAGEMENT_DROP: {
        businessReason: 'Content interaction rate has declined over the last 30 days.',
        recommendedAction: 'Switch content format (e.g. video over text) and increase outreach cadence.',
        confidenceMod: -0.05,
      },
      PRODUCT_INTEREST: {
        businessReason: 'Website behavior signals active research in your product category.',
        recommendedAction: 'Accelerate with a personalized demo offer or product-specific ROI calculator.',
        confidenceMod: 0.2,
      },
      CROSS_SELL: {
        businessReason: 'Purchase history indicates high likelihood of interest in complementary offerings.',
        recommendedAction: 'Introduce complementary product with a bundle discount tied to existing purchase history.',
        confidenceMod: 0.05,
      },
    };

    const detected: DetectedOpportunity[] = typesToScan.map((type) => {
      const template = opportunityTemplates[type];
      const confidence = Math.min(1.0, Math.max(0.0, baseConfidence + template.confidenceMod));
      const priority: DetectedOpportunity['priority'] =
        confidence >= 0.8 ? 'CRITICAL'
        : confidence >= 0.6 ? 'HIGH'
        : confidence >= 0.4 ? 'MEDIUM'
        : 'LOW';

      return {
        id: `opd_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        organizationId: params.organizationId,
        businessId: params.businessId,
        opportunityType: type,
        confidenceScore: confidence,
        businessReason: template.businessReason,
        recommendedAction: template.recommendedAction,
        priority,
        detectedAt: new Date().toISOString(),
      };
    });

    this.detectedOpportunities.push(...detected);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'OPPORTUNITIES_DETECTED',
        opportunitiesFound: detected.length,
        criticalCount: detected.filter((o) => o.priority === 'CRITICAL').length,
        highCount: detected.filter((o) => o.priority === 'HIGH').length,
      },
    });

    return detected;
  }

  /**
   * Get top opportunity by priority for a given business (tenant-scoped).
   */
  getTopOpportunity(organizationId: string, businessId: string): DetectedOpportunity | undefined {
    const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return this.detectedOpportunities
      .filter((o) => o.organizationId === organizationId && o.businessId === businessId)
      .sort((a, b) => order[b.priority] - order[a.priority])[0];
  }

  /**
   * Get all detected opportunities scoped by organization.
   */
  getDetectedOpportunities(organizationId: string, businessId: string): DetectedOpportunity[] {
    return this.detectedOpportunities.filter(
      (o) => o.organizationId === organizationId && o.businessId === businessId
    );
  }
}
