import { AgentRegistry, AgentTaskResult } from '../agents';
import { WorkflowDefinition, WorkflowRun } from './automation.types';
import { ApprovalManager } from './approvals';

export class WorkflowExecutionBlockedError extends Error {
  constructor(public runId: string, public stepName: string) {
    super(`Workflow execution hard-blocked for run '${runId}' on step '${stepName}'. Pending human approval required.`);
    this.name = 'WorkflowExecutionBlockedError';
  }
}

export class WorkflowEngine {
  private definitions: Map<string, WorkflowDefinition> = new Map();
  private runs: Map<string, WorkflowRun> = new Map();

  constructor(
    private agentRegistry: AgentRegistry,
    private approvalManager: ApprovalManager
  ) {}

  registerWorkflow(definition: WorkflowDefinition): void {
    this.definitions.set(definition.id, definition);
  }

  getWorkflow(id: string): WorkflowDefinition {
    const wf = this.definitions.get(id);
    if (!wf) throw new Error(`Workflow definition not found: ${id}`);
    return wf;
  }

  getRun(runId: string): WorkflowRun {
    const run = this.runs.get(runId);
    if (!run) throw new Error(`Workflow run not found: ${runId}`);
    return run;
  }

  /**
   * Resume execution of a paused/waiting workflow run after human approval.
   */
  async resumeWorkflow(runId: string): Promise<WorkflowRun> {
    const run = this.getRun(runId);

    // Verify approval request resolution
    const pending = this.approvalManager.listPendingRequests(run.businessId).find((r) => r.workflowRunId === runId);
    if (pending) {
      throw new WorkflowExecutionBlockedError(runId, `Step Index ${run.currentStepIndex}`);
    }

    const definition = this.getWorkflow(run.workflowId);
    run.status = 'running';

    // Resume from next step
    for (let i = run.currentStepIndex + 1; i < definition.steps.length; i++) {
      const step = definition.steps[i];
      run.currentStepIndex = i;

      const taskResult: AgentTaskResult = await this.agentRegistry.dispatchTask({
        taskId: `task_${run.id}_step_${i}`,
        businessId: run.businessId,
        role: step.agentRole,
        taskType: 'content_generation',
        prompt: step.promptTemplate,
        targetChannel: step.targetChannel,
      });

      run.results.push(taskResult);

      const needsApproval =
        step.requiresApproval ||
        (taskResult.cognitiveResult.decision.requiresHumanReview && !definition.autoApproveLowRisk);

      if (needsApproval) {
        run.status = 'waiting_approval';
        this.approvalManager.createRequest({
          workflowRunId: run.id,
          businessId: run.businessId,
          actionTitle: step.name,
          description: `Approval required for step "${step.name}" (${step.agentRole} agent).`,
          proposedByAgent: step.agentRole,
        });
        return run;
      }
    }

    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    return run;
  }

  /**
   * Execute a workflow definition for a target business ID.
   */
  async executeWorkflow(workflowId: string, businessId: string): Promise<WorkflowRun> {
    // Check if businessId has any unresolved pending approval requests
    const pendingRequests = this.approvalManager.listPendingRequests(businessId);
    if (pendingRequests.length > 0) {
      throw new WorkflowExecutionBlockedError(pendingRequests[0].workflowRunId, pendingRequests[0].actionTitle);
    }

    const definition = this.getWorkflow(workflowId);

    const run: WorkflowRun = {
      id: `wfrun_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workflowId,
      businessId,
      status: 'running',
      currentStepIndex: 0,
      results: [],
      startedAt: new Date().toISOString(),
    };
    this.runs.set(run.id, run);

    for (let i = 0; i < definition.steps.length; i++) {
      const step = definition.steps[i];
      run.currentStepIndex = i;

      // Execute step using AgentRegistry
      const taskResult: AgentTaskResult = await this.agentRegistry.dispatchTask({
        taskId: `task_${run.id}_step_${i}`,
        businessId,
        role: step.agentRole,
        taskType: 'content_generation',
        prompt: step.promptTemplate,
        targetChannel: step.targetChannel,
      });

      run.results.push(taskResult);

      // Check if step or cognitive result requires human approval
      const needsApproval =
        step.requiresApproval ||
        (taskResult.cognitiveResult.decision.requiresHumanReview && !definition.autoApproveLowRisk);

      if (needsApproval) {
        run.status = 'waiting_approval';
        // Create approval request in ApprovalManager
        this.approvalManager.createRequest({
          workflowRunId: run.id,
          businessId,
          actionTitle: step.name,
          description: `Approval required for step "${step.name}" (${step.agentRole} agent).`,
          proposedByAgent: step.agentRole,
        });
        return run;
      }
    }

    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    return run;
  }
}
