import { test, beforeEach, afterEach } from 'node:test';
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
import { LLMProviderGateway } from '../../providers/llm-provider-factory';

const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);

beforeEach(() => {
  LLMProviderGateway.executeWithFallback = async (request) => {
    const prompt = request.prompt || '';
    let text = '{"result": "mocked test double"}';

    if (prompt.includes('channelOptimizedContent') || prompt.includes('complianceStatus')) {
      text = JSON.stringify({
        targetChannel: 'x',
        scheduledTimeIso: new Date(Date.now() + 3600000).toISOString(),
        channelOptimizedContent: 'Pulse Dynamics Q3 Update: Transforming commercial operations.',
        complianceStatus: 'COMPLIANT',
        hashtags: ['#Growth', '#Operations'],
        characterCount: 65,
        requiresHumanApproval: true,
        distributionStrategy: 'Priority multi-channel broadcasting',
        riskFactor: 'LOW',
      });
    } else if (prompt.includes('reputationRiskScore') || prompt.includes('impersonationAttemptsDetected')) {
      text = JSON.stringify({
        reputationRiskScore: 0.04,
        threatLevel: 'LOW',
        impersonationAttemptsDetected: 0,
        activeAlerts: [],
        brandVoiceViolations: [],
        recommendedMitigations: ['Monitor weekly social brand mentions'],
        reputationSummary: 'Brand reputation remains strong with zero critical threats detected.',
      });
    } else if (prompt.includes('contentRoi') || prompt.includes('topPerformingTopics')) {
      text = JSON.stringify({
        contentRoi: 3.4,
        conversionRate: 0.048,
        topPerformingTopics: ['Industrial Automation', 'Zero Downtime', 'Energy Efficiency'],
        underperformingTopics: ['Generic Tech Buzzwords'],
        keyInsights: ['Measurable uptime SLAs convert 3x higher than general feature lists.'],
        recommendedAction: 'Double down on quantifiable commercial ROI case studies.',
      });
    } else if (prompt.includes('winningPatterns') || prompt.includes('voiceEvolutionRecommendation')) {
      text = JSON.stringify({
        memoriesAnalyzed: 5,
        winningPatterns: ['Guaranteed sub-15m dispatch response SLA', '20% lower seasonal overhead'],
        underperformingTropes: ['Generic efficiency claims'],
        proposedVocabularyAdditions: ['Zero Downtime', 'Telemetric Monitoring'],
        proposedVocabularyRetirements: ['Cheap Service'],
        voiceEvolutionRecommendation: 'Lead with measurable SLA guarantees in commercial contractor outreach.',
        confidenceScore: 0.95,
      });
    } else if (prompt.includes('discoveredLeads')) {
      text = JSON.stringify({
        industry: 'SAAS',
        targetRegion: 'National',
        discoveredLeads: [
          {
            id: 101,
            companyName: 'Apex Cloud',
            website: 'https://apexcloud.io',
            primaryContact: 'Sarah Jenkins (VP Growth)',
            currentStage: 'Discovery',
            status: 'High Priority',
            pillarFinancialPain: '$680k annual funnel drop-off loss',
            pillarProcessGap: 'Legacy non-responsive onboarding',
            pillarStakeholderAlignment: 'CMO & VP Product',
            industry: 'SAAS',
            estimatedRevenueLoss: '$680k/yr',
            opportunityScore: 94,
            isAiSourced: true,
            discoveredAt: new Date().toISOString(),
          }
        ],
        executiveProspectingSummary: 'Identified 1 high-priority prospect.',
      });
    } else {
      text = 'Pulse Dynamics launch announcement: Accelerating commercial transformation with authoritative solutions.';
    }

    return {
      text,
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150, estimatedCostUsd: 0.0001, latencyMs: 5 },
    };
  };
});

afterEach(() => {
  LLMProviderGateway.executeWithFallback = originalExecute;
});

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
  assert.equal(result.outputData.requiresHumanApproval, true);
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
  assert.ok(typeof result.outputData.reputationRiskScore === 'number' && (result.outputData.reputationRiskScore as number) >= 0);
  assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(result.outputData.threatLevel as string));
  assert.ok(typeof result.outputData.impersonationAttemptsDetected === 'number');
  assert.ok(Array.isArray(result.outputData.recommendedMitigations) && result.outputData.recommendedMitigations.length > 0);
  assert.equal(result.outputData.accessAuthorized, true);
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
  assert.ok(Array.isArray(result.outputData.winningPatterns) && result.outputData.winningPatterns.length > 0);
  assert.ok(typeof result.outputData.confidenceScore === 'number' && (result.outputData.confidenceScore as number) >= 0);
  assert.ok(typeof result.outputData.voiceEvolutionRecommendation === 'string' && (result.outputData.voiceEvolutionRecommendation as string).length > 0);
  assert.equal(result.outputData.accessAuthorized, true);
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
