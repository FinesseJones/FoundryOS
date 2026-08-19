import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { AgentRegistry, AccessControlError } from '../../src/core/agents';
import { MultiAgentCollaborationOrchestrator } from '../../src/core/agents/collaboration-orchestrator';
import { WorkflowEngine, WorkflowExecutionBlockedError } from '../../src/core/automation/workflows';
import { ApprovalManager } from '../../src/core/automation/approvals';

test('Epic 11D: MultiAgentCollaborationOrchestrator validates domain matrix checks during inter-agent delegation and blocks unauthorized writes', () => {
  const dna = createDefaultBusinessDNA('biz_gov_1');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const registry = new AgentRegistry(contextBuilder);
  const orchestrator = new MultiAgentCollaborationOrchestrator(registry);

  // ContentAgent attempting to write to 'security' domain directly should be rejected by orchestrator matrix check
  assert.throws(
    () => {
      orchestrator.validateAgentDelegation('content', 'security');
    },
    (err: Error) => {
      assert.ok(err instanceof AccessControlError);
      assert.equal((err as AccessControlError).agentRole, 'content');
      assert.equal((err as AccessControlError).targetDomain, 'security');
      return true;
    },
    'Orchestrator must throw AccessControlError when agent requests write access outside allowed matrix'
  );
});

test('Epic 11D: WorkflowEngine hard-halts workflow execution on pending approval and blocks downstream steps', async () => {
  const dna = createDefaultBusinessDNA('biz_gov_2');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const registry = new AgentRegistry(contextBuilder);
  const approvalManager = new ApprovalManager();
  const workflowEngine = new WorkflowEngine(registry, approvalManager);

  // Register workflow requiring approval on step 1
  workflowEngine.registerWorkflow({
    id: 'wf_governed_launch',
    name: 'Governed Product Launch',
    autoApproveLowRisk: true,
    steps: [
      {
        id: 'step_1',
        name: 'Draft Announcement',
        agentRole: 'content',
        promptTemplate: 'Draft social announcement',
        requiresApproval: true,
      },
      {
        id: 'step_2',
        name: 'Publish Announcement',
        agentRole: 'publishing',
        promptTemplate: 'Publish social post',
        requiresApproval: false,
      },
    ],
  });

  // Execute workflow - Step 1 requires approval
  const run = await workflowEngine.executeWorkflow('wf_governed_launch', 'biz_gov_2');
  assert.equal(run.status, 'waiting_approval');
  assert.equal(run.results.length, 1);

  const pendingRequests = approvalManager.listPendingRequests('biz_gov_2');
  assert.equal(pendingRequests.length, 1);

  // Attempting to execute workflow again while pending approval exists throws WorkflowExecutionBlockedError
  await assert.rejects(
    async () => {
      await workflowEngine.executeWorkflow('wf_governed_launch', 'biz_gov_2');
    },
    (err: Error) => err instanceof WorkflowExecutionBlockedError,
    'WorkflowEngine must hard-halt execution when step is pending human approval'
  );

  // Operator resolves approval request
  approvalManager.resolveRequest(pendingRequests[0].id, 'approved', 'operator_1');

  // Resume workflow execution
  const resumedRun = await workflowEngine.resumeWorkflow(run.id);
  assert.equal(resumedRun.status, 'completed');
  assert.equal(resumedRun.results.length, 2);
});
