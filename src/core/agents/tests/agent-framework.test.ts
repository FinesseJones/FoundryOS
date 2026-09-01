import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  AgentRegistry,
  BrandAgent,
  ContentAgent,
  PublishingAgent,
  WebsiteAgent,
  SecurityAgent,
  AnalyticsAgent,
  LearningAgent,
  AgentTaskRequest,
} from '../index';
import { ContextBuilder } from '../../context';
import { createDefaultBusinessDNA } from '../../knowledge';

test('AgentRegistry initializes and lists all 7 specialized agents', () => {
  const contextBuilder = new ContextBuilder();
  const registry = new AgentRegistry(contextBuilder);

  const agents = registry.listAgents();
  assert.equal(agents.length, 7);

  const roles = agents.map((a) => a.role);
  assert.ok(roles.includes('brand'));
  assert.ok(roles.includes('content'));
  assert.ok(roles.includes('publishing'));
  assert.ok(roles.includes('website'));
  assert.ok(roles.includes('security'));
  assert.ok(roles.includes('analytics'));
  assert.ok(roles.includes('learning'));
});

test('Access Control Matrix enforces domain write boundaries', () => {
  const contextBuilder = new ContextBuilder();
  const brandAgent = new BrandAgent(contextBuilder);
  const publishingAgent = new PublishingAgent(contextBuilder);
  const learningAgent = new LearningAgent(contextBuilder);

  assert.equal(brandAgent.canWriteDomain('brand'), true);
  assert.equal(brandAgent.canWriteDomain('publishing_history'), false);

  assert.equal(publishingAgent.canWriteDomain('publishing_history'), true);
  assert.equal(publishingAgent.canWriteDomain('brand'), false);

  assert.equal(learningAgent.canWriteDomain('learning'), true);
});

test('BrandAgent executes task with Context & Cognitive integration', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_1', {
    companyIdentity: { companyName: { value: 'Nova Tech' } },
  });
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const brandAgent = new BrandAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_brand_1',
    businessId: 'biz_ag_1',
    role: 'brand',
    taskType: 'brand_analysis',
    prompt: 'Audit Nova Tech brand identity',
  };

  const result = await brandAgent.executeTask(request);

  assert.equal(result.taskId, 'task_brand_1');
  assert.equal(result.agentRole, 'brand');
  assert.ok(result.outputSummary.includes('Nova Tech'));
  assert.ok(result.cognitiveResult.plan.steps.length > 0);
  assert.ok(result.cognitiveResult.confidence.aggregateScore > 0);
});

test('ContentAgent generates multi-channel copy draft', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_2', {
    companyIdentity: { companyName: { value: 'Pulse Dynamics' } },
    brandVoice: { primaryTone: { value: 'bold' } },
  });
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const contentAgent = new ContentAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_content_1',
    businessId: 'biz_ag_2',
    role: 'content',
    taskType: 'content_generation',
    prompt: 'Create LinkedIn launch announcement',
    targetChannel: 'linkedin',
  };

  const result = await contentAgent.executeTask(request);

  assert.equal(result.agentRole, 'content');
  assert.ok(result.outputSummary.toLowerCase().includes('linkedin'));
  assert.ok(String(result.outputData.draftText).includes('Pulse Dynamics'));
});

test('PublishingAgent stages content and enforces human approval gating', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_3');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const publishingAgent = new PublishingAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_pub_1',
    businessId: 'biz_ag_3',
    role: 'publishing',
    taskType: 'content_generation',
    prompt: 'Schedule post for delivery',
    targetChannel: 'x',
  };

  const result = await publishingAgent.executeTask(request);

  assert.equal(result.agentRole, 'publishing');
  assert.equal(result.outputData.publishingStatus, 'staged');
  assert.ok(result.outputData.scheduledTime);
  assert.ok(typeof result.outputData.channelOptimizedContent === 'string' && (result.outputData.channelOptimizedContent as string).length > 0);
  assert.ok(['COMPLIANT', 'NEEDS_REVISION', 'NON_COMPLIANT'].includes(result.outputData.complianceStatus as string));
  assert.equal(result.outputData.accessAuthorized, true);
});

test('WebsiteAgent evaluates web copy and conversion metrics', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_4');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const websiteAgent = new WebsiteAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_web_1',
    businessId: 'biz_ag_4',
    role: 'website',
    taskType: 'brand_analysis',
    prompt: 'Audit landing page CTAs',
  };

  const result = await websiteAgent.executeTask(request);

  assert.equal(result.agentRole, 'website');
  assert.ok(result.outputSummary.includes('Website Audit'));
  assert.ok((result.outputData.conversionScore as number) > 0);
});

test('SecurityAgent assesses brand risk and impersonation alerts', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_5');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const securityAgent = new SecurityAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_sec_1',
    businessId: 'biz_ag_5',
    role: 'security',
    taskType: 'brand_analysis',
    prompt: 'Screen comments for sentiment risk',
  };

  const result = await securityAgent.executeTask(request);

  assert.equal(result.agentRole, 'security');
  assert.ok(result.outputSummary.includes('Security audit completed'));
  assert.equal(result.outputData.impersonationAttemptsDetected, 0);
});

test('AnalyticsAgent computes content ROI and top topics', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_6');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const analyticsAgent = new AnalyticsAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_ana_1',
    businessId: 'biz_ag_6',
    role: 'analytics',
    taskType: 'brand_analysis',
    prompt: 'Evaluate content ROI',
  };

  const result = await analyticsAgent.executeTask(request);

  assert.equal(result.agentRole, 'analytics');
  assert.ok(typeof result.outputData.contentRoi === 'number' && (result.outputData.contentRoi as number) >= 0);
  assert.ok(Array.isArray(result.outputData.topPerformingTopics) && result.outputData.topPerformingTopics.length > 0);
  assert.equal(result.outputData.accessAuthorized, true);
});

test('LearningAgent extracts winning patterns from business memory', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_7');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const learningAgent = new LearningAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_learn_1',
    businessId: 'biz_ag_7',
    role: 'learning',
    taskType: 'brand_analysis',
    prompt: 'Analyze learning rules',
  };

  const result = await learningAgent.executeTask(request);

  assert.equal(result.agentRole, 'learning');
  assert.ok((result.outputData.winningPatterns as string[]).length > 0);
});

test('AgentRegistry dispatches tasks dynamically to target agents', async () => {
  const dna = createDefaultBusinessDNA('biz_ag_registry');
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const registry = new AgentRegistry(contextBuilder);

  const result = await registry.dispatchTask({
    taskId: 'task_dyn_1',
    businessId: 'biz_ag_registry',
    role: 'content',
    taskType: 'content_generation',
    prompt: 'Generate email subject line',
  });

  assert.equal(result.agentRole, 'content');
  assert.equal(result.taskId, 'task_dyn_1');
  assert.ok(result.cognitiveResult);
});
