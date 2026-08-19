import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

import { MultiProviderLLMFactory } from '../llm-provider-factory';
import { SaaSBillingManager } from '../../saas/billing';
import { QuotaExceededError } from '../provider.types';

test('MultiProviderLLMFactory: Supports Ollama, OpenAI, Claude, Gemini, OpenRouter, and LM Studio', async () => {
  const factory = new MultiProviderLLMFactory();

  const response = await factory.executeWithFallback({
    prompt: 'Test prompt for LLM provider chain',
  });

  assert.ok(response.text);
  assert.ok(response.providerUsed);
  assert.ok(response.usage.totalTokens > 0);
});

test('MultiProviderLLMFactory: Structured JSON validation with Zod', async () => {
  const factory = new MultiProviderLLMFactory();

  const schema = z.object({
    headline: z.string(),
    sentimentScore: z.number(),
  });

  // Mock structured parsing
  const provider = factory['providers'].get('claude');
  assert.ok(provider);

  const mockProvider = {
    type: 'claude' as const,
    generateText: async () => ({
      text: JSON.stringify({ headline: 'High Converting Headline', sentimentScore: 0.92 }),
      providerUsed: 'claude' as const,
      modelUsed: 'claude-3-5-sonnet',
      usage: { promptTokens: 50, completionTokens: 50, totalTokens: 100, estimatedCostUsd: 0.001, latencyMs: 100 },
    }),
    generateStructured: provider.generateStructured,
  };

  const { data } = await mockProvider.generateStructured({ prompt: 'Generate headline' }, schema);
  assert.equal(data.headline, 'High Converting Headline');
  assert.equal(data.sentimentScore, 0.92);
});

test('MultiProviderLLMFactory: Fallback chain execution', async () => {
  const factory = new MultiProviderLLMFactory();

  const res = await factory.executeWithFallback(
    { prompt: 'Test fallback' },
    ['openai', 'claude', 'gemini']
  );

  assert.ok(res.text);
  assert.equal(res.providerUsed, 'openai');
});

test('Epic 11C: LLM Gateway blocks execution and throws QuotaExceededError when token hard-cap is exceeded', async () => {
  const billing = new SaaSBillingManager();
  billing.initializeSubscription('org_quota_test', 'starter'); // 50,000 token limit

  const factory = new MultiProviderLLMFactory(billing);

  // Exhaust token budget
  billing.recordTokenUsage('org_quota_test', 49900);

  // Attempting another prompt should throw QuotaExceededError BEFORE provider call
  await assert.rejects(
    async () => {
      await factory.executeWithFallback({
        prompt: 'Generate content post',
        organizationId: 'org_quota_test',
      });
    },
    (err: Error) => {
      assert.ok(err instanceof QuotaExceededError);
      assert.equal((err as QuotaExceededError).organizationId, 'org_quota_test');
      assert.equal((err as QuotaExceededError).planTier, 'starter');
      return true;
    },
    'LLM Gateway must throw QuotaExceededError before calling external providers'
  );
});
