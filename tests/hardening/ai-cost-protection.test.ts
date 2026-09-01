import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MultiProviderLLMFactory } from '../../src/core/providers/llm-provider-factory';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { QuotaExceededError } from '../../src/core/providers/provider.types';

test('Epic 11C: LLM Gateway serves as gatekeeper, throwing QuotaExceededError and blocking LLM API calls', async () => {
  const billing = new SaaSBillingManager();
  const sub = billing.initializeSubscription('org_cost_protection_1', 'starter'); // 50,000 limit

  const factory = new MultiProviderLLMFactory(billing);

  // Consume 98,000 tokens out of 100,000 limit
  const firstCheck = billing.recordTokenUsage('org_cost_protection_1', 98000);
  assert.equal(firstCheck.allowed, true);

  // Request requiring 3,000 tokens will breach the 100,000 Starter limit
  await assert.rejects(
    async () => {
      await factory.executeWithFallback({
        prompt: 'Generate long-form blog article requiring token allocation',
        maxTokens: 3000,
        organizationId: 'org_cost_protection_1',
      });
    },
    (err: Error) => {
      assert.ok(err instanceof QuotaExceededError);
      assert.equal((err as QuotaExceededError).organizationId, 'org_cost_protection_1');
      assert.equal((err as QuotaExceededError).planTier, 'starter');
      return true;
    },
    'LLM Gateway must intercept request and throw QuotaExceededError'
  );
});

test('Epic 11C: Stripe Plan upgrade clears QuotaExceededError and resumes LLM Provider execution', async () => {
  const billing = new SaaSBillingManager();
  const sub = billing.initializeSubscription('org_cost_upgrade_1', 'starter');

  const factory = new MultiProviderLLMFactory(billing);
  const mockProvider = {
    generateText: async () => ({
      text: 'Generated copy',
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 50, completionTokens: 50, totalTokens: 100, estimatedCostUsd: 0.0001, latencyMs: 5 },
    }),
    generateStructured: async () => { throw new Error('Not implemented'); },
  };
  factory.registerProvider('nvidia', mockProvider as any);

  // Exhaust Starter quota
  billing.recordTokenUsage('org_cost_upgrade_1', 100000);

  // Quota is exceeded on Starter
  await assert.rejects(
    async () => {
      await factory.executeWithFallback({
        prompt: 'Generate campaign copy',
        organizationId: 'org_cost_upgrade_1',
      });
    },
    (err: Error) => err instanceof QuotaExceededError
  );

  // Process Stripe webhook upgrade to Growth plan (500,000 tokens)
  const webhookHandled = billing.handleStripeWebhook({
    type: 'customer.subscription.updated',
    customerId: sub.stripeCustomerId,
    subscriptionId: sub.stripeSubscriptionId,
    newTier: 'growth',
  });

  assert.equal(webhookHandled, true);

  // LLM Provider Gateway execution succeeds cleanly after plan upgrade
  const response = await factory.executeWithFallback({
    prompt: 'Generate campaign copy post upgrade',
    organizationId: 'org_cost_upgrade_1',
  });

  assert.ok(response.text);
  assert.ok(response.providerUsed);
});
