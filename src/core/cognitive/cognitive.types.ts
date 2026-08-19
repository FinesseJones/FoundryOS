import { EngineContext } from '../context';
import { ApprovalStatus } from '../knowledge';

/**
 * Single step within an ExecutionPlan DAG.
 */
export interface PlanStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  targetAgent: 'brand_intelligence' | 'content_strategy' | 'publishing' | 'website' | 'learning';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[]; // step IDs that must complete first
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Execution Plan output by Planner.
 */
export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  createdAt: string;
}

/**
 * Single step reasoning node.
 */
export interface ReasoningNode {
  perspective: string; // e.g. "Brand Consistency", "Audience Alignment", "Market Differentiators"
  hypothesis: string;
  findings: string[];
  confidence: number;
}

/**
 * Multi-perspective Reasoning Trace output by ReasoningEngine.
 */
export interface ReasoningTrace {
  id: string;
  taskType: string;
  nodes: ReasoningNode[];
  summaryRationale: string;
  alignmentScore: number; // [0.0 - 1.0]
  createdAt: string;
}

/**
 * Candidate choice evaluated by DecisionEngine.
 */
export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedRisk: number; // [0.0 - 1.0]
}

/**
 * Decision Result output by DecisionEngine.
 */
export interface DecisionResult {
  id: string;
  selectedOption: DecisionOption;
  alternativeOptions: DecisionOption[];
  rationale: string;
  approvalStatus: ApprovalStatus;
  approvalReason?: string;
  requiresHumanReview: boolean;
  decidedAt: string;
}

/**
 * Reflection critique issue.
 */
export interface CritiqueIssue {
  ruleCategory: 'voice_tone' | 'forbidden_words' | 'missing_uvp' | 'formatting' | 'risk';
  severity: 'warning' | 'error';
  message: string;
  suggestedFix?: string;
}

/**
 * Critique Result output by ReflectionEngine.
 */
export interface CritiqueResult {
  id: string;
  passed: boolean;
  qualityScore: number; // [0.0 - 1.0]
  issues: CritiqueIssue[];
  revisionInstructions?: string;
  critiquedAt: string;
}

/**
 * Multi-factor Confidence Evaluation output.
 */
export interface ConfidenceEvaluation {
  aggregateScore: number; // [0.0 - 1.0]
  breakdown: {
    contextRichness: number;
    reasoningStrength: number;
    critiquePassRate: number;
    sourceReliability: number;
  };
  tier: 'high' | 'medium' | 'low';
  explanation: string;
  evaluatedAt: string;
}

/**
 * Strategic Recommendation output by RecommendationEngine.
 */
export interface Recommendation {
  id: string;
  category: 'brand_voice' | 'content_strategy' | 'positioning' | 'workflow';
  title: string;
  description: string;
  expectedImpact: 'low' | 'medium' | 'high';
  actionableSteps: string[];
  confidence: number;
  createdAt: string;
}

/**
 * Final unified output delivered by CognitiveEngine.
 */
export interface CognitiveProcessResult {
  context: EngineContext;
  plan: ExecutionPlan;
  reasoning: ReasoningTrace;
  decision: DecisionResult;
  critique: CritiqueResult;
  confidence: ConfidenceEvaluation;
  recommendations: Recommendation[];
  processedAt: string;
}
