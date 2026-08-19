import { EngineContext } from '../context';
import { CognitiveProcessResult } from './cognitive.types';
import { Planner } from './planner';
import { ReasoningEngine } from './reasoning';
import { DecisionEngine } from './decision';
import { ReflectionEngine } from './reflection';
import { ConfidenceEvaluator } from './confidence-evaluator';
import { RecommendationEngine } from './recommendations';

export interface CognitiveEngineOptions {
  candidateText?: string;
}

/**
 * Production Cognitive Engine Orchestrator.
 * Coordinates Planning → Reasoning → Decision Making → Reflection → Confidence Evaluation → Recommendation Generation.
 */
export class CognitiveEngine {
  /**
   * Main entry point: Process EngineContext through the full cognitive architecture pipeline.
   */
  static process(
    context: EngineContext,
    options?: CognitiveEngineOptions
  ): CognitiveProcessResult {
    // 1. Planning: Formulate DAG execution plan
    const plan = Planner.generatePlan(context.request.userPrompt, context);

    // 2. Reasoning: Multi-perspective Chain-of-Thought analysis
    const reasoning = ReasoningEngine.evaluateReasoning(context);

    // 3. Decision Making: Option selection & governance check
    const decision = DecisionEngine.makeDecision(context, reasoning);

    // 4. Reflection: Self-critique of candidate output
    const candidateText = options?.candidateText ?? context.formattedPromptContext;
    const critique = ReflectionEngine.critiqueOutput(candidateText, context);

    // 5. Confidence Evaluation: Multi-factor confidence scoring
    const confidence = ConfidenceEvaluator.evaluate(context, reasoning, critique);

    // 6. Recommendations: Strategic insight generation
    const recommendations = RecommendationEngine.generateRecommendations(context, reasoning, critique);

    return {
      context,
      plan,
      reasoning,
      decision,
      critique,
      confidence,
      recommendations,
      processedAt: new Date().toISOString(),
    };
  }
}
