import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../knowledge';
import { ContextBuilder } from '../../context';
import { AgentRegistry } from '../agent-registry';
import { MultiAgentCollaborationOrchestrator } from '../collaboration-orchestrator';
import { AsyncTaskQueue } from '../task-queue';

test('MultiAgentCollaborationOrchestrator: Executes ContentAgent -> BrandAgent -> WebsiteAgent -> AnalyticsAgent loop', async () => {
  const dna = createDefaultBusinessDNA('biz_collab_1', {
    companyIdentity: { companyName: { value: 'HyperDrive SaaS' } },
  });

  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const registry = new AgentRegistry(contextBuilder);
  const orchestrator = new MultiAgentCollaborationOrchestrator(registry);

  const result = await orchestrator.runCollaborationLoop({
    businessId: 'biz_collab_1',
    initialPrompt: 'Write product launch announcement for HyperDrive SaaS',
    targetChannel: 'linkedin',
  });

  assert.equal(result.businessId, 'biz_collab_1');
  assert.equal(result.consultationSteps.length, 4);
  assert.ok(result.overallQualityScore > 0);
  assert.ok(result.finalContent.length > 0);
});

test('AsyncTaskQueue: Enqueues, processes, and tracks background agent tasks', async () => {
  const dna = createDefaultBusinessDNA('biz_queue_1');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const registry = new AgentRegistry(contextBuilder);
  const taskQueue = new AsyncTaskQueue(registry);

  const queuedTask = taskQueue.enqueueTask({
    taskId: 'task_async_1',
    businessId: 'biz_queue_1',
    role: 'content',
    taskType: 'content_generation',
    prompt: 'Generate product copy',
  });

  assert.equal(queuedTask.status, 'queued');

  const processed = await taskQueue.processNextTask();
  assert.ok(processed);
  assert.equal(processed.status, 'completed');
  assert.ok(processed.result);
  assert.equal(processed.result.agentRole, 'content');
});
