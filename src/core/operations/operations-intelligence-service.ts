import { BusinessDNARepository, AuditRepository, MemoryRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { ContextBuilder } from '../context';
import { AnalyticsAgent } from '../agents/analytics-agent';
import { LearningAgent } from '../agents/learning-agent';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OperationsInsightType =
  | 'PROCESS_BOTTLENECK'
  | 'AUTOMATION_OPPORTUNITY'
  | 'RESOURCE_ALLOCATION'
  | 'WORKFLOW_INEFFICIENCY'
  | 'QUALITY_IMPROVEMENT'
  | 'COST_REDUCTION';

export interface OperationsInsight {
  id: string;
  organizationId: string;
  businessId: string;
  insightType: OperationsInsightType;
  processArea: string;
  title: string;
  description: string;
  currentState: string;
  recommendedChange: string;
  estimatedImpact: string;
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  status: 'IDENTIFIED' | 'UNDER_REVIEW' | 'APPROVED' | 'IMPLEMENTING' | 'COMPLETED';
  createdAt: string;
}

export interface EfficiencyOpportunity {
  id: string;
  organizationId: string;
  businessId: string;
  opportunityType: string;
  processArea: string;
  timesSavingEstimate: string;
  costSavingEstimate: string;
  requiredActions: string[];
  confidence: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

export interface ProcessRecommendation {
  id: string;
  organizationId: string;
  businessId: string;
  recommendationType: string;
  title: string;
  rationale: string;
  steps: string[];
  successMetrics: string[];
  timeline: string;
  createdAt: string;
}

export interface OperationalOutcome {
  insightId: string;
  organizationId: string;
  businessId: string;
  result: 'IMPROVED' | 'NO_CHANGE' | 'DECLINED' | 'IN_PROGRESS';
  measuredImpact: string;
  learnings: string[];
  recordedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class OperationsIntelligenceService {
  private insights: OperationsInsight[] = [];
  private efficiencyOpportunities: EfficiencyOpportunity[] = [];
  private recommendations: ProcessRecommendation[] = [];
  private outcomes: OperationalOutcome[] = [];

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
    if (!dna) throw new Error(`OperationsIntelligence: access denied for org '${organizationId}'.`);
    return dna;
  }

  // ─── 1. Analyze Operations ─────────────────────────────────────────────────

  /**
   * Analyzes a business process area against Business DNA context.
   * Uses AnalyticsAgent for quantitative evaluation of operational signals.
   */
  async analyzeOperations(params: {
    organizationId: string;
    businessId: string;
    insightType: OperationsInsightType;
    processArea: string;
    actor: string;
  }): Promise<OperationsInsight> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    // AnalyticsAgent evaluates quantitative operational signals from DNA context
    const analyticsResult = await this.analyticsAgent.executeTask({
      taskId: `ops_analytics_${Date.now()}`,
      businessId: params.businessId,
      role: 'analytics',
      taskType: 'campaign_planning',
      prompt: `Analyze operational performance for ${companyName}. Process area: "${params.processArea}". Insight type: ${params.insightType}. Identify measurable inefficiencies and improvement potential.`,
    });

    // LearningAgent extracts patterns and past improvement signals from memory
    const learningResult = await this.learningAgent.executeTask({
      taskId: `ops_learn_${Date.now()}`,
      businessId: params.businessId,
      role: 'learning',
      taskType: 'general_chat',
      prompt: `Extract process improvement patterns for ${companyName} in "${params.processArea}". Type: ${params.insightType}.`,
    });

    const confidence = (
      analyticsResult.cognitiveResult.confidence.aggregateScore * 0.6 +
      learningResult.cognitiveResult.confidence.aggregateScore * 0.4
    );

    const priority: OperationsInsight['priority'] =
      confidence >= 0.75 ? 'CRITICAL'
      : confidence >= 0.55 ? 'HIGH'
      : confidence >= 0.35 ? 'MEDIUM'
      : 'LOW';

    const templates: Record<OperationsInsightType, {
      title: string;
      currentState: string;
      recommendedChange: string;
      estimatedImpact: string;
      effort: 'LOW' | 'MEDIUM' | 'HIGH';
    }> = {
      PROCESS_BOTTLENECK: {
        title: `Bottleneck Detected: ${params.processArea}`,
        currentState: `The "${params.processArea}" process contains a sequential dependency creating throughput constraints.`,
        recommendedChange: 'Introduce parallel processing lanes and automated handoff triggers at identified constraint points.',
        estimatedImpact: `${Math.round(confidence * 35 + 15)}% throughput improvement`,
        effort: 'MEDIUM',
      },
      AUTOMATION_OPPORTUNITY: {
        title: `Automation Ready: ${params.processArea}`,
        currentState: `"${params.processArea}" contains repetitive manual steps with low decision complexity.`,
        recommendedChange: 'Connect to existing WorkflowEngine to automate rule-based steps and reduce manual handling time.',
        estimatedImpact: `${Math.round(confidence * 40 + 20)}% time reduction in manual processing`,
        effort: 'LOW',
      },
      RESOURCE_ALLOCATION: {
        title: `Resource Imbalance: ${params.processArea}`,
        currentState: `Resource distribution in "${params.processArea}" does not align with output demand patterns.`,
        recommendedChange: 'Rebalance resource allocation using demand-weighted scheduling and dynamic capacity planning.',
        estimatedImpact: `${Math.round(confidence * 25 + 10)}% efficiency improvement per resource unit`,
        effort: 'MEDIUM',
      },
      WORKFLOW_INEFFICIENCY: {
        title: `Workflow Inefficiency: ${params.processArea}`,
        currentState: `"${params.processArea}" workflow contains redundant approval layers and non-value-added steps.`,
        recommendedChange: 'Streamline approval chain using existing ApprovalManager with conditional auto-approval for low-risk steps.',
        estimatedImpact: `${Math.round(confidence * 30 + 15)}% reduction in cycle time`,
        effort: 'LOW',
      },
      QUALITY_IMPROVEMENT: {
        title: `Quality Opportunity: ${params.processArea}`,
        currentState: `Output quality in "${params.processArea}" shows variance that affects downstream process reliability.`,
        recommendedChange: 'Implement quality checkpoints at key process stages using Cognitive Engine confidence thresholds.',
        estimatedImpact: `${Math.round(confidence * 20 + 10)}% defect rate reduction`,
        effort: 'HIGH',
      },
      COST_REDUCTION: {
        title: `Cost Reduction Signal: ${params.processArea}`,
        currentState: `"${params.processArea}" costs exceed benchmarks for comparable process complexity.`,
        recommendedChange: 'Consolidate redundant tooling, automate cost-generating manual steps, and optimize vendor utilization.',
        estimatedImpact: `${Math.round(confidence * 20 + 8)}% cost per unit reduction`,
        effort: 'HIGH',
      },
    };

    const template = templates[params.insightType];
    const id = `ops_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const insight: OperationsInsight = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      insightType: params.insightType,
      processArea: params.processArea,
      title: template.title,
      description: analyticsResult.outputSummary,
      currentState: template.currentState,
      recommendedChange: template.recommendedChange,
      estimatedImpact: template.estimatedImpact,
      implementationEffort: template.effort,
      priority,
      confidence,
      status: 'IDENTIFIED',
      createdAt: new Date().toISOString(),
    };

    this.insights.push(insight);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'OPERATIONS_INSIGHT_CREATED',
        insightId: id,
        insightType: params.insightType,
        processArea: params.processArea,
        priority,
        confidence,
      },
    });

    return insight;
  }

  // ─── 2. Identify Efficiency Opportunity ───────────────────────────────────

  /**
   * Identifies a concrete efficiency opportunity with time and cost saving estimates.
   * Routes through LearningAgent to extract proven patterns from business memory.
   */
  async identifyEfficiencyOpportunity(params: {
    organizationId: string;
    businessId: string;
    processArea: string;
    opportunityType: string;
    actor: string;
  }): Promise<EfficiencyOpportunity> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    const learningResult = await this.learningAgent.executeTask({
      taskId: `eff_${Date.now()}`,
      businessId: params.businessId,
      role: 'learning',
      taskType: 'general_chat',
      prompt: `Identify efficiency opportunity for ${companyName} in "${params.processArea}". Type: ${params.opportunityType}. Calculate time and cost savings.`,
    });

    const confidence = learningResult.cognitiveResult.confidence.aggregateScore;
    const priority: EfficiencyOpportunity['priority'] =
      confidence >= 0.75 ? 'CRITICAL'
      : confidence >= 0.55 ? 'HIGH'
      : confidence >= 0.35 ? 'MEDIUM'
      : 'LOW';

    const id = `eff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const opportunity: EfficiencyOpportunity = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      opportunityType: params.opportunityType,
      processArea: params.processArea,
      timesSavingEstimate: `${Math.round(confidence * 8 + 2)} hours/week saved per team member`,
      costSavingEstimate: `$${Math.round(confidence * 15000 + 3000).toLocaleString()}/year estimated`,
      requiredActions: [
        `Map the current "${params.processArea}" process to identify all manual touchpoints`,
        'Connect to existing WorkflowEngine for automated rule-based steps',
        'Configure ApprovalManager thresholds for low-risk auto-approvals',
        'Verify outcomes against DNA success metrics for 30 days',
      ],
      confidence,
      priority,
      createdAt: new Date().toISOString(),
    };

    this.efficiencyOpportunities.push(opportunity);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'EFFICIENCY_OPPORTUNITY_IDENTIFIED',
        opportunityId: id,
        opportunityType: params.opportunityType,
        processArea: params.processArea,
        priority,
      },
    });

    return opportunity;
  }

  // ─── 3. Generate Process Recommendation ───────────────────────────────────

  /**
   * Synthesizes a full process improvement recommendation from all operational
   * intelligence using AnalyticsAgent for structured plan generation.
   */
  async generateProcessRecommendation(params: {
    organizationId: string;
    businessId: string;
    recommendationType: string;
    actor: string;
  }): Promise<ProcessRecommendation> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    const orgInsights = this.insights.filter(
      (i) => i.organizationId === params.organizationId && i.businessId === params.businessId
    );

    const analyticsResult = await this.analyticsAgent.executeTask({
      taskId: `rec_ops_${Date.now()}`,
      businessId: params.businessId,
      role: 'analytics',
      taskType: 'campaign_planning',
      prompt: `Generate a process improvement recommendation for ${companyName}. Type: "${params.recommendationType}". Based on ${orgInsights.length} existing operational insights.`,
    });

    const id = `ops_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const recommendation: ProcessRecommendation = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      recommendationType: params.recommendationType,
      title: `${params.recommendationType} Improvement Plan for ${companyName}`,
      rationale: analyticsResult.outputSummary,
      steps: [
        `Conduct a process audit across all ${params.recommendationType} workflows to baseline current performance.`,
        'Map all identified bottlenecks to existing WorkflowEngine automation capabilities.',
        'Implement phased improvements beginning with highest-ROI, lowest-effort changes.',
        'Configure Cognitive Engine confidence thresholds for quality assurance checkpoints.',
        'Measure outcomes against Business DNA success metrics at 30/60/90 day intervals.',
      ],
      successMetrics: [
        `${Math.round(analyticsResult.cognitiveResult.confidence.aggregateScore * 30 + 10)}% reduction in process cycle time`,
        'Approval workflow completion within SLA > 95%',
        'Zero manual errors at automated checkpoints',
        'Team satisfaction score improvement at 90-day review',
      ],
      timeline: '90-day phased rollout with 30-day review cycles',
      createdAt: new Date().toISOString(),
    };

    this.recommendations.push(recommendation);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'PROCESS_RECOMMENDATION_GENERATED',
        recommendationId: id,
        recommendationType: params.recommendationType,
        basedOnInsights: orgInsights.length,
      },
    });

    if (this.notificationService) {
      this.notificationService.sendCustomerAlert({
        organizationId: params.organizationId,
        businessId: params.businessId,
        type: 'dna_updated',
        title: 'Operations Recommendation Ready',
        message: `Your ${params.recommendationType} process improvement plan is ready for review.`,
      });
    }

    return recommendation;
  }

  // ─── 4. Get Operations Insights ───────────────────────────────────────────

  getOperationsInsights(organizationId: string, businessId: string) {
    return {
      insights: this.insights.filter(
        (i) => i.organizationId === organizationId && i.businessId === businessId
      ),
      efficiencyOpportunities: this.efficiencyOpportunities.filter(
        (e) => e.organizationId === organizationId && e.businessId === businessId
      ),
      recommendations: this.recommendations.filter(
        (r) => r.organizationId === organizationId && r.businessId === businessId
      ),
      outcomes: this.outcomes.filter(
        (o) => o.organizationId === organizationId && o.businessId === businessId
      ),
    };
  }

  // ─── 5. Record Operational Outcome ────────────────────────────────────────

  async recordOperationalOutcome(params: {
    organizationId: string;
    businessId: string;
    insightId: string;
    result: 'IMPROVED' | 'NO_CHANGE' | 'DECLINED' | 'IN_PROGRESS';
    measuredImpact: string;
    learnings: string[];
    actor: string;
  }): Promise<OperationalOutcome> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    // Update insight status
    const insight = this.insights.find(
      (i) => i.id === params.insightId && i.organizationId === params.organizationId
    );
    if (insight) {
      insight.status = params.result === 'IMPROVED' ? 'COMPLETED'
        : params.result === 'IN_PROGRESS' ? 'IMPLEMENTING'
        : 'UNDER_REVIEW';
    }

    const outcome: OperationalOutcome = {
      insightId: params.insightId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      result: params.result,
      measuredImpact: params.measuredImpact,
      learnings: params.learnings,
      recordedAt: new Date().toISOString(),
    };

    this.outcomes.push(outcome);

    // Write operational learnings back to memory
    for (const learning of params.learnings) {
      await this.memoryRepo.addMemory({
        organizationId: params.organizationId,
        businessId: params.businessId,
        category: 'decision',
        content: learning,
        importance: params.result === 'IMPROVED' ? 0.85 : 0.6,
        relevance: 0.9,
      });
    }

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.actor,
      details: {
        eventType: 'OPERATIONAL_OUTCOME_RECORDED',
        insightId: params.insightId,
        result: params.result,
        learningsCount: params.learnings.length,
      },
    });

    return outcome;
  }
}
