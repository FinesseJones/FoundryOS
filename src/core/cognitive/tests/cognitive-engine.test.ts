import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CognitiveEngine,
  Planner,
  ReasoningEngine,
  DecisionEngine,
  ReflectionEngine,
  ConfidenceEvaluator,
  RecommendationEngine,
} from '../index';
import { ContextBuilder } from '../../context';
import { createDefaultBusinessDNA } from '../../knowledge';

test('Planner generates valid DAG execution plan', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_1');
  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);

  const context = await builder.buildContext({
    businessId: 'biz_cog_1',
    taskType: 'content_generation',
    userPrompt: 'Draft a brand launch post',
  });

  const plan = Planner.generatePlan('Draft a brand launch post', context);

  assert.equal(plan.goal, 'Draft a brand launch post');
  assert.ok(plan.steps.length >= 3);
  assert.equal(plan.steps[0].targetAgent, 'brand_intelligence');
  assert.equal(plan.steps[1].dependencies[0], plan.steps[0].id);
});

test('ReasoningEngine evaluates multi-perspective reasoning trace', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_2', {
    companyIdentity: {
      companyName: { value: 'Quantum Labs' },
      uniqueValueProposition: { value: '100x faster quantum simulation' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToAvoid: { value: ['cheap', 'synergy'] },
    },
  });

  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);
  const context = await builder.buildContext({
    businessId: 'biz_cog_2',
    taskType: 'brand_analysis',
    userPrompt: 'Audit our quantum brand positioning',
  });

  const reasoning = ReasoningEngine.evaluateReasoning(context);

  assert.equal(reasoning.nodes.length, 3);
  assert.ok(reasoning.alignmentScore > 0);
  assert.ok(reasoning.summaryRationale.includes('3 brand perspectives'));
});

test('DecisionEngine enforces human approval triggers on low confidence / high risk', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_3');
  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);
  const context = await builder.buildContext({
    businessId: 'biz_cog_3',
    taskType: 'customer_response',
    userPrompt: 'Respond to angry customer',
  });

  const reasoning = ReasoningEngine.evaluateReasoning(context);

  // Force low alignment score to trigger human review
  reasoning.alignmentScore = 0.5;

  const decision = DecisionEngine.makeDecision(context, reasoning);

  assert.equal(decision.requiresHumanReview, true);
  assert.equal(decision.approvalStatus, 'pending');
  assert.ok(decision.approvalReason?.includes('human review'));
});

test('ReflectionEngine catches forbidden word violations and computes critique score', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_4', {
    brandVoice: {
      wordsToAvoid: { value: ['cheap', 'disruptive'] },
    },
  });

  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);
  const context = await builder.buildContext({
    businessId: 'biz_cog_4',
    taskType: 'content_generation',
    userPrompt: 'Write a headline',
  });

  // Text containing forbidden word "cheap"
  const badText = 'Our cheap solution is ultra disruptive for everyone!';
  const critique = ReflectionEngine.critiqueOutput(badText, context);

  assert.equal(critique.passed, false);
  assert.ok(critique.issues.length >= 2);
  assert.ok(critique.revisionInstructions?.includes('cheap'));
});

test('ConfidenceEvaluator calculates normalized multi-factor score', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_5');
  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);
  const context = await builder.buildContext({
    businessId: 'biz_cog_5',
    taskType: 'content_generation',
    userPrompt: 'Write newsletter',
  });

  const reasoning = ReasoningEngine.evaluateReasoning(context);
  const critique = ReflectionEngine.critiqueOutput('Great newsletter copy highlighting innovation', context);
  const confidence = ConfidenceEvaluator.evaluate(context, reasoning, critique);

  assert.ok(confidence.aggregateScore >= 0 && confidence.aggregateScore <= 1);
  assert.ok(['high', 'medium', 'low'].includes(confidence.tier));
});

test('RecommendationEngine generates strategic brand recommendations', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_6', {
    brandVoice: {
      wordsToAvoid: { value: ['synergy', 'leverage'] },
    },
  });

  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);
  const context = await builder.buildContext({
    businessId: 'biz_cog_6',
    taskType: 'content_generation',
    userPrompt: 'Write campaign slogan',
  });

  const reasoning = ReasoningEngine.evaluateReasoning(context);
  const critique = ReflectionEngine.critiqueOutput('Bad copy with synergy', context);
  const recs = RecommendationEngine.generateRecommendations(context, reasoning, critique);

  assert.ok(recs.length >= 1);
  assert.ok(recs.some((r) => r.category === 'brand_voice' || r.category === 'workflow'));
});

test('CognitiveEngine orchestrates full end-to-end cognitive process', async () => {
  const dna = createDefaultBusinessDNA('biz_cog_full', {
    companyIdentity: {
      companyName: { value: 'AeroPulse Systems' },
    },
  });

  const builder = new ContextBuilder();
  builder.registerBusinessDNA(dna);
  const context = await builder.buildContext({
    businessId: 'biz_cog_full',
    taskType: 'content_generation',
    userPrompt: 'Create launch post for AeroPulse Systems',
  });

  const result = CognitiveEngine.process(context, {
    candidateText: 'AeroPulse Systems launches next-gen aerospace telemetry software.',
  });

  assert.ok(result.plan.steps.length >= 3);
  assert.equal(result.reasoning.nodes.length, 3);
  assert.ok(result.decision.selectedOption);
  assert.equal(result.critique.passed, true);
  assert.ok(result.confidence.aggregateScore > 0);
  assert.ok(result.recommendations.length >= 0);
  assert.ok(result.processedAt);
});
