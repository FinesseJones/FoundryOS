import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { AgentRegistry } from '../../src/core/agents';
import { AutomationEngine } from '../../src/core/automation';
import { LLMProviderGateway } from '../../src/core/providers/llm-provider-factory';

const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
const originalStructured = LLMProviderGateway.generateStructured.bind(LLMProviderGateway);

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
            targetRole: 'VP Operations & Growth',
            primaryContact: 'Target Role: VP Operations (Unverified - Verify Before Outreach)',
            currentStage: 'Discovery',
            status: 'High Priority',
            pillarFinancialPain: '$680k annual funnel drop-off loss',
            pillarProcessGap: 'Legacy non-responsive onboarding',
            pillarStakeholderAlignment: 'CMO & VP Product (Target Role)',
            industry: 'SAAS',
            estimatedRevenueLoss: '$680k/yr',
            opportunityScore: 94,
            isAiSourced: true,
            isAiEstimated: true,
            dataSource: 'AI-Estimated Domain Signal Analysis (Verify Before Outreach)',
            verificationStatus: 'AI_ESTIMATED_VERIFY_BEFORE_OUTREACH',
            verificationWarning: 'AI-estimated opportunity model. Confirm executive contact details before initiating outreach.',
            discoveredAt: new Date().toISOString(),
          },
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

  LLMProviderGateway.generateStructured = async (request, schema) => {
    const resp = await LLMProviderGateway.executeWithFallback(request);
    let parsedData: any;
    try {
      parsedData = JSON.parse(resp.text);
    } catch {
      parsedData = { result: resp.text };
    }
    return {
      data: parsedData,
      response: resp,
    };
  };
});

afterEach(() => {
  LLMProviderGateway.executeWithFallback = originalExecute;
  LLMProviderGateway.generateStructured = originalStructured;
});

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
