import { EngineContext } from '../context';
import { ExecutionPlan, PlanStep } from './cognitive.types';

export class Planner {
  /**
   * Decomposes a high-level goal and context into a multi-step execution plan.
   */
  static generatePlan(goal: string, context: EngineContext): ExecutionPlan {
    const taskType = context.request.taskType;
    const steps: PlanStep[] = [];

    // Step 1: Intelligence Retrieval / Analysis Step
    steps.push({
      id: 'step_1_intel',
      stepNumber: 1,
      title: 'Analyze Brand & Audience Alignment',
      description: 'Audit Business DNA parameters, target audience pain points, and campaign constraints.',
      targetAgent: 'brand_intelligence',
      status: 'pending',
      dependencies: [],
      riskLevel: 'low',
    });

    // Step 2: Content / Action Strategy Formulation
    steps.push({
      id: 'step_2_strategy',
      stepNumber: 2,
      title: 'Formulate Content Directive & Narrative',
      description: `Draft narrative structure tailored to ${context.request.targetChannel ?? 'primary channel'}.`,
      targetAgent: 'content_strategy',
      status: 'pending',
      dependencies: ['step_1_intel'],
      riskLevel: taskType === 'content_generation' ? 'medium' : 'low',
    });

    // Step 3: Synthesis / Execution Step
    if (taskType === 'content_generation' || taskType === 'customer_response') {
      steps.push({
        id: 'step_3_execution',
        stepNumber: 3,
        title: 'Generate Production Draft',
        description: 'Synthesize context into production-ready content output.',
        targetAgent: 'content_strategy',
        status: 'pending',
        dependencies: ['step_2_strategy'],
        riskLevel: 'medium',
      });
    }

    // Step 4: Final Publishing / Workflow Scheduling Step
    steps.push({
      id: 'step_4_publishing',
      stepNumber: steps.length + 1,
      title: 'Verify Compliance & Stage Delivery',
      description: 'Check brand compliance and stage item for delivery/publishing.',
      targetAgent: 'publishing',
      status: 'pending',
      dependencies: [steps[steps.length - 1].id],
      riskLevel: 'low',
    });

    const estimatedComplexity = steps.length > 3 ? 'complex' : steps.length === 3 ? 'moderate' : 'simple';

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      goal,
      steps,
      estimatedComplexity,
      createdAt: new Date().toISOString(),
    };
  }
}
