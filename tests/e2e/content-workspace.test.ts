import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { AgentRegistry } from '../../src/core/agents';
import { AutomationEngine } from '../../src/core/automation';
import { RecommendationEngine, ReasoningTrace, CritiqueResult } from '../../src/core/cognitive';
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
