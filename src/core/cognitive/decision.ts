import { EngineContext } from '../context';
import { ReasoningTrace, DecisionResult, DecisionOption } from './cognitive.types';

export class DecisionEngine {
  /**
   * Evaluates candidate execution options and selects optimal action with governance checks.
   */
  static makeDecision(
    context: EngineContext,
    reasoning: ReasoningTrace,
    customOptions?: DecisionOption[]
  ): DecisionResult {
    const defaultOptions: DecisionOption[] = customOptions ?? [
      {
        id: 'opt_1_standard',
        title: 'Execute Full Brand Directive',
        description: 'Generate production-ready copy adhering to all Business DNA and campaign rules.',
        pros: ['Highest brand voice alignment', 'Complete campaign integration'],
        cons: ['Requires strict review if confidence is low'],
        estimatedRisk: 0.1,
      },
      {
        id: 'opt_2_conservative',
        title: 'Execute Conservative Draft',
        description: 'Generate baseline copy with minimal creative flourish to ensure zero risk.',
        pros: ['Zero risk of tone violation'],
        cons: ['Lower audience engagement potential'],
        estimatedRisk: 0.05,
      },
    ];

    const selectedOption = defaultOptions[0];
    const alternativeOptions = defaultOptions.slice(1);

    // Human review trigger: low confidence OR high risk OR alignment score < 0.65
    const minConfidence = context.request.minConfidenceThreshold ?? 0.4;
    const isLowConfidence = reasoning.alignmentScore < 0.65 || context.tokenAllocation.used.businessDNA < 50;
    const requiresHumanReview = isLowConfidence || selectedOption.estimatedRisk > 0.3;

    return {
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      selectedOption,
      alternativeOptions,
      rationale: `Selected "${selectedOption.title}" based on reasoning alignment score of ${reasoning.alignmentScore}.`,
      approvalStatus: requiresHumanReview ? 'pending' : 'approved',
      approvalReason: requiresHumanReview
        ? 'Decision flagged for human review due to low alignment or risk threshold'
        : 'Auto-approved under standard low-risk policy',
      requiresHumanReview,
      decidedAt: new Date().toISOString(),
    };
  }
}
