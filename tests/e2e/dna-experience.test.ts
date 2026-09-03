import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA, validateBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { BrandAgent } from '../../src/core/agents';
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
      text = 'HyperDrive AI Systems audit: authoritative enterprise brand with high signal clarity.';
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

test('Phase Two E2E: Website Upload -> Signal Analysis -> Progress -> Beautified DNA Report', async () => {
  // 1. Simulate website URL input & digital footprint crawl
  const websiteUrl = 'https://hyperdrive-ai.com';
  const companyName = 'HyperDrive AI Systems';

  // 2. Extract Business DNA from crawling signals
  const extractedDNA = createDefaultBusinessDNA('biz_phase_2_dna', {
    companyIdentity: {
      companyName: { value: companyName },
      industry: { value: 'saas' },
      stage: { value: 'growth' },
      mission: { value: 'Accelerating AI workflow latency by 10x with zero infrastructure overhead.' },
      uniqueValueProposition: { value: 'The fastest, most reliable self-learning AI Knowledge Engine on the market.' },
      coreValues: { value: ['Ultra Latency', 'Zero Latency Drift', 'Enterprise Integrity'] },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      secondaryTones: { value: ['technical', 'confident'] },
      wordsToUse: { value: ['ultra-fast', 'deterministic', 'seamless', 'scale'] },
      wordsToAvoid: { value: ['cheap', 'synergy', 'disruptive'] },
    },
    customerProfile: {
      targetAudience: { value: 'Senior AI System Architects & VP of Marketing Leaders' },
      primaryPainPoints: { value: ['AI model hallucinations', 'Slow execution latency'] },
    },
    websiteAnalysis: {
      primaryUrl: { value: websiteUrl },
    },
  });

  // 3. Validate Zod Schema Contracts & Cross-field Rules
  const validation = validateBusinessDNA(extractedDNA);
  assert.equal(validation.valid, true);
  assert.ok(validation.data);

  // 4. Context Engine Integration
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(extractedDNA);

  const context = await contextBuilder.buildContext({
    businessId: 'biz_phase_2_dna',
    taskType: 'brand_analysis',
    userPrompt: 'Audit brand signal clarity and health score',
  });

  assert.equal(context.request.businessId, 'biz_phase_2_dna');
  assert.ok(context.formattedPromptContext.includes('HyperDrive AI Systems'));

  // 5. Brand Agent Audit & Confidence Verification
  const brandAgent = new BrandAgent(contextBuilder);
  const auditResult = await brandAgent.executeTask({
    taskId: 'task_phase2_audit',
    businessId: 'biz_phase_2_dna',
    role: 'brand',
    taskType: 'brand_analysis',
    prompt: 'Audit extracted signals',
  });

  assert.equal(auditResult.agentRole, 'brand');
  assert.ok(auditResult.outputSummary.includes('HyperDrive AI Systems'));
  assert.equal(auditResult.cognitiveResult.critique.passed, true);
});
