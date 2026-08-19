import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA, validateBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { BrandAgent } from '../../src/core/agents';

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
