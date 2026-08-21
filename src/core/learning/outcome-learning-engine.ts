import { DecisionRecord, MemoryAuthority } from '../context/context.types';
import { MemoryRetriever } from '../context/memory-retrieval';
import { ActionProposal } from '../connectors/governed-connectors';
import { MultiProviderLLMFactory, LLMProviderGateway } from '../providers/llm-provider-factory';

export interface OutcomeRecord {
  id: string;
  actionId: string;
  organizationId: string;
  businessId: string;
  actionTitle: string;
  expectedOutcome: string;
  actualOutcome: string;
  varianceSummary: string;
  impactScore: number; // 0.0 - 1.0
  lessonLearned: string;
  persistedToMemory: boolean;
  evaluatedAt: string;
}

/**
 * Outcome Telemetry & Closed-Loop Learning Engine
 *
 * Implements the full feedback loop:
 * Observation -> Interpretation -> Recommendation -> Decision -> Action -> Outcome -> Learning -> Memory
 */
export class OutcomeLearningEngine {
  private outcomes: Map<string, OutcomeRecord[]> = new Map();

  constructor(
    private memoryRetriever: MemoryRetriever,
    private llmGateway: MultiProviderLLMFactory = LLMProviderGateway
  ) {}

  /**
   * Record actual business results for an action, compute variance,
   * synthesize institutional lessons, and persist them back to Institutional Memory.
   */
  async recordOutcomeAndLearn(params: {
    action: ActionProposal;
    actualOutcome: string;
    impactScore?: number;
    authorityLevel?: MemoryAuthority;
  }): Promise<OutcomeRecord> {
    const { action, actualOutcome, impactScore = 0.85, authorityLevel = 'CAMPAIGN_DECISION' } = params;

    let variance = `Outcome recorded for ${action.title}: ${actualOutcome}`;
    let lesson = `Actions targeting ${action.connectorType} produced verified business telemetry.`;

    try {
      const aiEvaluation = await this.llmGateway.executeWithFallback({
        prompt: `Evaluate this business action outcome and extract an institutional lesson for future AI agents:\n` +
                `Action Title: "${action.title}" (${action.connectorType})\n` +
                `Expected Outcome: "${action.expectedOutcome}"\n` +
                `Actual Outcome: "${actualOutcome}"\n\n` +
                `Synthesize 2 short lines:\n` +
                `Variance: (Comparison of predicted vs actual results)\n` +
                `Lesson: (Actionable rule/guideline for future campaigns and positioning)\n`,
        temperature: 0.3,
        maxTokens: 250,
      });

      const lines = aiEvaluation.text.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().startsWith('variance:')) {
          variance = line.replace(/variance:\s*/i, '').trim();
        } else if (line.toLowerCase().startsWith('lesson:')) {
          lesson = line.replace(/lesson:\s*/i, '').trim();
        }
      }
    } catch {
      // Safe fallback from actual results
    }

    const outcomeRecord: OutcomeRecord = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actionId: action.id,
      organizationId: action.organizationId,
      businessId: action.businessId,
      actionTitle: action.title,
      expectedOutcome: action.expectedOutcome,
      actualOutcome,
      varianceSummary: variance,
      impactScore,
      lessonLearned: lesson,
      persistedToMemory: true,
      evaluatedAt: new Date().toISOString(),
    };

    // 1. Store in Outcome History
    const list = this.outcomes.get(action.businessId) || [];
    list.unshift(outcomeRecord);
    this.outcomes.set(action.businessId, list);

    // 2. Persist Lesson Back into Institutional Memory as an Authoritative Decision Record
    const learnedDecision: DecisionRecord = {
      id: `dec_learn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: action.organizationId,
      businessId: action.businessId,
      decision: lesson,
      rationale: `Derived from closed-loop outcome telemetry on "${action.title}". Expected: ${action.expectedOutcome} | Actual: ${actualOutcome}`,
      authorizedBy: 'TACF-Continuous-Learning-Engine',
      authorityLevel,
      decidedAt: new Date().toISOString(),
      expectedOutcome: action.expectedOutcome,
      actualOutcome,
      variance,
      lessonLearned: lesson,
      status: 'ACTIVE',
      tags: ['outcome_learning', action.connectorType, action.proposedByAgent],
    };

    this.memoryRetriever.addDecisionRecord(learnedDecision);

    return outcomeRecord;
  }

  getOutcomes(businessId: string): OutcomeRecord[] {
    return this.outcomes.get(businessId) || [];
  }
}
