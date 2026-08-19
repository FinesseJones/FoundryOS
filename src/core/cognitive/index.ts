/**
 * Cognitive Engine — Barrel Exports (Stage 3)
 *
 * Exposes all types, Zod schemas, planners, reasoning engines, decision tools,
 * reflection engines, confidence evaluators, recommendation generators, and cognitive orchestrators.
 */

// ─── Types & Schemas ─────────────────────────────────────────────────────────
export type {
  PlanStep,
  ExecutionPlan,
  ReasoningNode,
  ReasoningTrace,
  DecisionOption,
  DecisionResult,
  CritiqueIssue,
  CritiqueResult,
  ConfidenceEvaluation,
  Recommendation,
  CognitiveProcessResult,
} from './cognitive.types';

export {
  PlanStepSchema,
  ExecutionPlanSchema,
  ReasoningNodeSchema,
  ReasoningTraceSchema,
  DecisionOptionSchema,
  DecisionResultSchema,
  CritiqueIssueSchema,
  CritiqueResultSchema,
  ConfidenceEvaluationSchema,
  RecommendationSchema,
} from './cognitive.schema';

// ─── Core Cognitive Modules ──────────────────────────────────────────────────
export { Planner } from './planner';
export { ReasoningEngine } from './reasoning';
export { DecisionEngine } from './decision';
export { ReflectionEngine } from './reflection';
export { ConfidenceEvaluator } from './confidence-evaluator';
export { RecommendationEngine } from './recommendations';
export { CognitiveEngine } from './cognitive-engine';
export type { CognitiveEngineOptions } from './cognitive-engine';
