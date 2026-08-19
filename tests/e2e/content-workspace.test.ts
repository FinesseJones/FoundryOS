import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { AgentRegistry } from '../../src/core/agents';
import { AutomationEngine } from '../../src/core/automation';
import { RecommendationEngine, ReasoningTrace, CritiqueResult } from '../../src/core/cognitive';

test('Phase Three E2E: Content Workspace (Tasks -> Campaigns -> Recommendations -> Generate -> Approve -> Publish)', async () => {
  // 1. Initialize DNA and Context
  const dna = createDefaultBusinessDNA('biz_phase_3', {
    companyIdentity: {
      companyName: { value: 'HyperDrive AI Systems' },
      industry: { value: 'saas' },
      stage: { value: 'growth' },
      uniqueValueProposition: { value: '10x Faster AI Pipelines' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToAvoid: { value: ['cheap', 'synergy'] },
    },
  });

  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const context = await contextBuilder.buildContext({
    businessId: 'biz_phase_3',
    taskType: 'content_generation',
    userPrompt: 'Generate LinkedIn post for product launch',
  });

  const agentRegistry = new AgentRegistry(contextBuilder);
  const automationEngine = new AutomationEngine({ contextBuilder, agentRegistry });

  // 2. Recommendations Engine Verification (CognitiveEngine Stage 3)
  const reasoning: ReasoningTrace = {
    id: 'trace_test_p3',
    taskType: 'content_generation',
    nodes: [
      {
        perspective: 'Brand Alignment',
        hypothesis: 'Validate UVP alignment',
        findings: ['UVP present'],
        confidence: 0.95,
      },
    ],
    summaryRationale: 'High alignment rationale',
    alignmentScore: 0.95,
    createdAt: new Date().toISOString(),
  };

  const critique: CritiqueResult = {
    id: 'crit_test_p3',
    passed: true,
    qualityScore: 0.9,
    issues: [],
    revisionInstructions: undefined,
    critiquedAt: new Date().toISOString(),
  };

  const recs = RecommendationEngine.generateRecommendations(context, reasoning, critique);

  assert.ok(recs.length > 0);
  assert.ok(recs[0].confidence > 0);

  // 3. Daily Task Stack Execution (ContentAgent Stage 4)
  const genResult = await agentRegistry.dispatchTask({
    taskId: 'task_phase3_gen',
    businessId: 'biz_phase_3',
    role: 'content',
    taskType: 'content_generation',
    prompt: 'Write product launch announcement for HyperDrive AI Systems',
    targetChannel: 'linkedin',
  });

  assert.equal(genResult.agentRole, 'content');
  assert.ok(genResult.cognitiveResult.plan.steps.length > 0);

  // 4. Human Approval Gating (ApprovalManager Stage 5)
  const req = automationEngine.approvalManager.createRequest({
    workflowRunId: 'run_p3_1',
    businessId: 'biz_phase_3',
    actionTitle: 'Publish LinkedIn Launch Announcement',
    description: 'High priority campaign post',
    proposedByAgent: 'content',
  });

  assert.equal(req.status, 'pending');

  const resolvedReq = automationEngine.approvalManager.resolveRequest(
    req.id,
    'approved',
    'user/executive@hyperdrive.ai',
    'Approved post'
  );

  assert.equal(resolvedReq.status, 'approved');

  // 5. Staging & Delivery Queue (PublishingAgent Stage 4)
  const pubResult = await agentRegistry.dispatchTask({
    taskId: 'task_phase3_pub',
    businessId: 'biz_phase_3',
    role: 'publishing',
    taskType: 'content_generation',
    prompt: 'Stage post for delivery',
    targetChannel: 'linkedin',
  });

  assert.equal(pubResult.agentRole, 'publishing');
  assert.equal(pubResult.outputData.publishingStatus, 'staged');
});
