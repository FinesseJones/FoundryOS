import { z } from 'zod';
import { ApprovalStatusSchema } from '../knowledge';

export const PlanStepSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  targetAgent: z.enum(['brand_intelligence', 'content_strategy', 'publishing', 'website', 'learning']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  dependencies: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high']),
});

export const ExecutionPlanSchema = z.object({
  id: z.string().min(1),
  goal: z.string().min(1),
  steps: z.array(PlanStepSchema),
  estimatedComplexity: z.enum(['simple', 'moderate', 'complex']),
  createdAt: z.string().datetime(),
});

export const ReasoningNodeSchema = z.object({
  perspective: z.string().min(1),
  hypothesis: z.string(),
  findings: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const ReasoningTraceSchema = z.object({
  id: z.string().min(1),
  taskType: z.string(),
  nodes: z.array(ReasoningNodeSchema),
  summaryRationale: z.string(),
  alignmentScore: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
});

export const DecisionOptionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  estimatedRisk: z.number().min(0).max(1),
});

export const DecisionResultSchema = z.object({
  id: z.string().min(1),
  selectedOption: DecisionOptionSchema,
  alternativeOptions: z.array(DecisionOptionSchema),
  rationale: z.string(),
  approvalStatus: ApprovalStatusSchema,
  approvalReason: z.string().optional(),
  requiresHumanReview: z.boolean(),
  decidedAt: z.string().datetime(),
});

export const CritiqueIssueSchema = z.object({
  ruleCategory: z.enum(['voice_tone', 'forbidden_words', 'missing_uvp', 'formatting', 'risk']),
  severity: z.enum(['warning', 'error']),
  message: z.string(),
  suggestedFix: z.string().optional(),
});

export const CritiqueResultSchema = z.object({
  id: z.string().min(1),
  passed: z.boolean(),
  qualityScore: z.number().min(0).max(1),
  issues: z.array(CritiqueIssueSchema),
  revisionInstructions: z.string().optional(),
  critiquedAt: z.string().datetime(),
});

export const ConfidenceEvaluationSchema = z.object({
  aggregateScore: z.number().min(0).max(1),
  breakdown: z.object({
    contextRichness: z.number().min(0).max(1),
    reasoningStrength: z.number().min(0).max(1),
    critiquePassRate: z.number().min(0).max(1),
    sourceReliability: z.number().min(0).max(1),
  }),
  tier: z.enum(['high', 'medium', 'low']),
  explanation: z.string(),
  evaluatedAt: z.string().datetime(),
});

export const RecommendationSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['brand_voice', 'content_strategy', 'positioning', 'workflow']),
  title: z.string().min(1),
  description: z.string(),
  expectedImpact: z.enum(['low', 'medium', 'high']),
  actionableSteps: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
});
