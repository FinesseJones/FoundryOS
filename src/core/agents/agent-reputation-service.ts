import { AgentRole } from './agent.types';
import { AgentIdentityRegistry } from './agent-identity';
import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';

// ─── Metric & Scoring Schemas ───────────────────────────────────────────────

export interface AgentExecutionMetric {
  metricId: string;
  organizationId: string;
  businessId: string;
  agentIdOrRole: string;
  executionTimeMs: number;
  tokensUsed: number;
  success: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  feedbackScore?: number; // 1.0 - 5.0
  timestamp: string;
}

export type ReputationBadge = 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_RISK';

export interface AgentPerformanceSummary {
  agentIdOrRole: string;
  role: AgentRole;
  name: string;
  totalExecutions: number;
  successRate: number; // 0.0 - 1.0
  avgExecutionTimeMs: number;
  avgTokensPerTask: number;
  avgFeedbackScore: number; // 1.0 - 5.0
  reputationScore: number; // 0 - 100
  reputationBadge: ReputationBadge;
}

export interface AgentAnalyticsDashboard {
  organizationId: string;
  businessId: string;
  totalAgentExecutions: number;
  overallSystemReputation: number;
  activeAgentCount: number;
  summaries: AgentPerformanceSummary[];
  recentMetrics: AgentExecutionMetric[];
  recommendations: string[];
}

// ─── Agent Reputation Service ───────────────────────────────────────────────

export class AgentReputationService {
  private metricsStore: Map<string, AgentExecutionMetric[]> = new Map();

  constructor(
    private dnaRepo: BusinessDNARepository,
    private identityRegistry: AgentIdentityRegistry,
    private auditRepo?: AuditRepository
  ) {}

  private async assertTenant(organizationId: string, businessId: string): Promise<void> {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) {
      throw new Error(`Tenant Security Violation: Access denied for org '${organizationId}' to business '${businessId}'`);
    }
  }

  /**
   * Record execution metrics for an agent and update its identity reputation score.
   */
  async recordExecutionMetric(params: {
    organizationId: string;
    businessId: string;
    agentIdOrRole: string;
    executionTimeMs: number;
    tokensUsed: number;
    success: boolean;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    feedbackScore?: number;
    actor?: string;
  }): Promise<AgentExecutionMetric> {
    await this.assertTenant(params.organizationId, params.businessId);

    const metricId = `met_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const metric: AgentExecutionMetric = {
      metricId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      agentIdOrRole: params.agentIdOrRole,
      executionTimeMs: params.executionTimeMs,
      tokensUsed: params.tokensUsed,
      success: params.success,
      riskLevel: params.riskLevel ?? 'LOW',
      feedbackScore: params.feedbackScore ?? (params.success ? 5.0 : 1.0),
      timestamp: new Date().toISOString(),
    };

    const key = `${params.organizationId}_${params.businessId}`;
    const list = this.metricsStore.get(key) || [];
    list.push(metric);
    this.metricsStore.set(key, list);

    // Update reputation score in identity registry
    this.identityRegistry.recordTaskOutcome(params.agentIdOrRole, params.success);

    if (this.auditRepo && !params.success) {
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'update',
        changedBy: params.actor ?? params.agentIdOrRole,
        details: {
          eventType: 'AGENT_METRIC_FAILED',
          agentIdOrRole: params.agentIdOrRole,
          executionTimeMs: params.executionTimeMs,
          tokensUsed: params.tokensUsed,
        },
      });
    }

    return metric;
  }

  /**
   * Calculate performance summary and weighted reputation score for a specific agent.
   */
  async getAgentPerformanceSummary(
    organizationId: string,
    businessId: string,
    agentIdOrRole: string
  ): Promise<AgentPerformanceSummary> {
    await this.assertTenant(organizationId, businessId);

    const key = `${organizationId}_${businessId}`;
    const list = (this.metricsStore.get(key) || []).filter((m) => m.agentIdOrRole === agentIdOrRole);

    let identity;
    try {
      identity = this.identityRegistry.getAgentIdentity(agentIdOrRole);
    } catch {
      identity = {
        agentId: agentIdOrRole,
        role: agentIdOrRole as AgentRole,
        name: agentIdOrRole,
      };
    }

    if (list.length === 0) {
      return {
        agentIdOrRole,
        role: identity.role,
        name: identity.name,
        totalExecutions: 0,
        successRate: 1.0,
        avgExecutionTimeMs: 0,
        avgTokensPerTask: 0,
        avgFeedbackScore: 5.0,
        reputationScore: 100,
        reputationBadge: 'EXCELLENT',
      };
    }

    const totalExecutions = list.length;
    const successes = list.filter((m) => m.success).length;
    const successRate = successes / totalExecutions;

    const totalTime = list.reduce((acc, m) => acc + m.executionTimeMs, 0);
    const avgExecutionTimeMs = Math.round(totalTime / totalExecutions);

    const totalTokens = list.reduce((acc, m) => acc + m.tokensUsed, 0);
    const avgTokensPerTask = Math.round(totalTokens / totalExecutions);

    const totalFeedback = list.reduce((acc, m) => acc + (m.feedbackScore ?? (m.success ? 5 : 1)), 0);
    const avgFeedbackScore = Number((totalFeedback / totalExecutions).toFixed(1));

    // Reputation Scoring Algorithm (0 - 100)
    // 50% Success Rate + 30% User Feedback + 10% Time Efficiency + 10% Token Efficiency
    const successScore = successRate * 50;
    const feedbackScoreNorm = (avgFeedbackScore / 5.0) * 30;
    const speedScoreNorm = Math.max(0, 10 - Math.min(10, avgExecutionTimeMs / 1000));
    const tokenScoreNorm = Math.max(0, 10 - Math.min(10, avgTokensPerTask / 1000));

    const rawReputation = Math.round(successScore + feedbackScoreNorm + speedScoreNorm + tokenScoreNorm);
    const reputationScore = Math.min(100, Math.max(0, rawReputation));

    let reputationBadge: ReputationBadge = 'EXCELLENT';
    if (reputationScore < 60) reputationBadge = 'CRITICAL_RISK';
    else if (reputationScore < 75) reputationBadge = 'NEEDS_IMPROVEMENT';
    else if (reputationScore < 90) reputationBadge = 'GOOD';

    return {
      agentIdOrRole,
      role: identity.role,
      name: identity.name,
      totalExecutions,
      successRate: Number(successRate.toFixed(2)),
      avgExecutionTimeMs,
      avgTokensPerTask,
      avgFeedbackScore,
      reputationScore,
      reputationBadge,
    };
  }

  /**
   * Return multi-agent performance analytics dashboard for customer workspace.
   */
  async getAgentAnalyticsDashboard(
    organizationId: string,
    businessId: string
  ): Promise<AgentAnalyticsDashboard> {
    await this.assertTenant(organizationId, businessId);

    const key = `${organizationId}_${businessId}`;
    const recentMetrics = (this.metricsStore.get(key) || []).slice(-20);

    const roles: AgentRole[] = ['brand', 'content', 'publishing', 'website', 'security', 'analytics', 'learning'];
    const summaries: AgentPerformanceSummary[] = [];

    for (const role of roles) {
      const summary = await this.getAgentPerformanceSummary(organizationId, businessId, role);
      summaries.push(summary);
    }

    const totalAgentExecutions = summaries.reduce((acc, s) => acc + s.totalExecutions, 0);

    const activeSummaries = summaries.filter((s) => s.totalExecutions > 0);
    const overallSystemReputation = activeSummaries.length > 0
      ? Math.round(activeSummaries.reduce((acc, s) => acc + s.reputationScore, 0) / activeSummaries.length)
      : 100;

    const recommendations: string[] = [];

    for (const s of summaries) {
      if (s.reputationBadge === 'CRITICAL_RISK' || s.reputationBadge === 'NEEDS_IMPROVEMENT') {
        recommendations.push(
          `Agent @${s.role} (${s.name}) has reputation badge '${s.reputationBadge}' (${s.reputationScore}/100). Consider reviewing permissions or token allocations.`
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All system agents operate at optimal reputation scores.');
    }

    return {
      organizationId,
      businessId,
      totalAgentExecutions,
      overallSystemReputation,
      activeAgentCount: roles.length,
      summaries,
      recentMetrics,
      recommendations,
    };
  }
}
