import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { AgentRegistry } from '../../src/core/agents';
import { AutomationEngine } from '../../src/core/automation';

test('E2E Customer Journey: Onboarding -> DNA Report -> Content Gen -> Approval -> Publishing -> Analytics', async () => {
  // 1. Onboarding & Business DNA Upload Wizard
  const newDNA = createDefaultBusinessDNA('biz_e2e_cust', {
    companyIdentity: {
      companyName: { value: 'HyperDrive SaaS' },
      industry: { value: 'saas' },
      stage: { value: 'growth' },
      uniqueValueProposition: { value: '10x faster AI data pipelines' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToAvoid: { value: ['cheap', 'synergy'] },
    },
  });

  assert.equal(newDNA.companyIdentity.companyName.value, 'HyperDrive SaaS');

  // 2. Initialize Core Engines
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(newDNA);

  const agentRegistry = new AgentRegistry(contextBuilder);
  const automationEngine = new AutomationEngine({ contextBuilder, agentRegistry });

  // 3. Generate Content via AI Workbench (ContentAgent)
  const taskResult = await agentRegistry.dispatchTask({
    taskId: 'task_e2e_gen',
    businessId: 'biz_e2e_cust',
    role: 'content',
    taskType: 'content_generation',
    prompt: 'Write LinkedIn product launch post for HyperDrive SaaS',
    targetChannel: 'linkedin',
  });

  assert.equal(taskResult.agentRole, 'content');
  assert.ok(taskResult.cognitiveResult.plan.steps.length > 0);
  assert.ok(taskResult.cognitiveResult.reasoning.alignmentScore > 0);

  // 4. Human-in-the-Loop Approval
  const approvalReq = automationEngine.approvalManager.createRequest({
    workflowRunId: 'run_e2e_1',
    businessId: 'biz_e2e_cust',
    actionTitle: 'Publish LinkedIn Launch Post',
    description: 'Generated draft awaiting executive review',
    proposedByAgent: 'content',
  });

  assert.equal(approvalReq.status, 'pending');

  const resolved = automationEngine.approvalManager.resolveRequest(
    approvalReq.id,
    'approved',
    'user/executive@hyperdrive.ai',
    'Approved for publication'
  );

  assert.equal(resolved.status, 'approved');
  assert.equal(resolved.reviewedBy, 'user/executive@hyperdrive.ai');

  // 5. Publishing Staging via PublishingAgent
  const pubResult = await agentRegistry.dispatchTask({
    taskId: 'task_e2e_pub',
    businessId: 'biz_e2e_cust',
    role: 'publishing',
    taskType: 'content_generation',
    prompt: 'Stage post for delivery',
    targetChannel: 'linkedin',
  });

  assert.equal(pubResult.agentRole, 'publishing');
  assert.equal(pubResult.outputData.publishingStatus, 'staged');

  // 6. Analytics Evaluation via AnalyticsAgent
  const anaResult = await agentRegistry.dispatchTask({
    taskId: 'task_e2e_ana',
    businessId: 'biz_e2e_cust',
    role: 'analytics',
    taskType: 'brand_analysis',
    prompt: 'Audit campaign ROI',
  });

  assert.equal(anaResult.agentRole, 'analytics');
  assert.ok((anaResult.outputData.contentRoi as number) > 1.0);
});
