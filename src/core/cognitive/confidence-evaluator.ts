import { EngineContext } from '../context';
import { ReasoningTrace, CritiqueResult, ConfidenceEvaluation } from './cognitive.types';

export class ConfidenceEvaluator {
  /**
   * Evaluates aggregate confidence score based on context richness, reasoning, critique, and source reliability.
   */
  static evaluate(
    context: EngineContext,
    reasoning: ReasoningTrace,
    critique: CritiqueResult
  ): ConfidenceEvaluation {
    // 1. Context Richness score (ratio of budget used vs total budget)
    const contextRichness = Math.min(1.0, context.tokenAllocation.totalUsed / 1200);

    // 2. Reasoning Strength score
    const reasoningStrength = reasoning.alignmentScore;

    // 3. Critique Pass Rate score
    const critiquePassRate = critique.qualityScore;

    // 4. Source Reliability score
    const sourceReliability = 0.85;

    // Composite multi-factor formula
    const aggregateScore =
      contextRichness * 0.35 +
      reasoningStrength * 0.30 +
      critiquePassRate * 0.20 +
      sourceReliability * 0.15;

    const roundedScore = Math.round(aggregateScore * 100) / 100;
    const tier = roundedScore >= 0.85 ? 'high' : roundedScore >= 0.65 ? 'medium' : 'low';

    return {
      aggregateScore: roundedScore,
      breakdown: {
        contextRichness: Math.round(contextRichness * 100) / 100,
        reasoningStrength: Math.round(reasoningStrength * 100) / 100,
        critiquePassRate: Math.round(critiquePassRate * 100) / 100,
        sourceReliability,
      },
      tier,
      explanation: `Aggregate cognitive confidence evaluated at ${Math.round(roundedScore * 100)}% (${tier.toUpperCase()} tier).`,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
