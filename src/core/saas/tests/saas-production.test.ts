import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../auth';
import { SaaSBillingManager } from '../billing';
import { ApiKeyManager } from '../api-keys';

test('SaaSAuthManager: 256-bit random session creation, expiration, and role permissions', () => {
  const auth = new SaaSAuthManager();

  const session = auth.createSession({
    userId: 'user_100',
    email: 'admin@acmecorp.com',
    name: 'Alex Rivera',
    role: 'ADMIN',
    organizationId: 'org_acme_100',
    organizationName: 'Acme Corp Workspace',
  });

  // Verify 256-bit hex token format (64 hex characters)
  assert.equal(session.token.length, 64);
  assert.ok(auth.validateSession(session.token));
  assert.equal(auth.validateSession(session.token)?.userId, 'user_100');

  assert.equal(auth.hasPermission(session, 'manage_billing'), true);
  assert.equal(auth.hasPermission(session, 'manage_team'), true);
  assert.equal(auth.hasPermission(session, 'execute_agent'), true);

  const memberSession = auth.createSession({
    userId: 'user_200',
    email: 'member@acmecorp.com',
    name: 'Team Member',
    role: 'MEMBER',
    organizationId: 'org_acme_100',
    organizationName: 'Acme Corp Workspace',
  });

  assert.equal(auth.hasPermission(memberSession, 'manage_billing'), false);
  assert.equal(auth.hasPermission(memberSession, 'execute_agent'), true);
});

test('SaaSBillingManager: Plan limits, token deduction, and Stripe webhook handling', () => {
  const billing = new SaaSBillingManager();
  const sub = billing.initializeSubscription('org_test_billing', 'starter');

  assert.equal(sub.planTier, 'starter');
  assert.equal(sub.tokenLimit, 50000);

  const usage1 = billing.recordTokenUsage('org_test_billing', 40000);
  assert.equal(usage1.allowed, true);
  assert.equal(usage1.remainingTokens, 10000);

  const usage2 = billing.recordTokenUsage('org_test_billing', 20000);
  assert.equal(usage2.allowed, false); // Exceeds 50,000 Starter limit

  // Simulate Stripe plan upgrade webhook
  const webhookHandled = billing.handleStripeWebhook({
    type: 'customer.subscription.updated',
    customerId: sub.stripeCustomerId,
    subscriptionId: sub.stripeSubscriptionId,
    newTier: 'growth',
  });

  assert.equal(webhookHandled, true);
  const upgradedSub = billing.getSubscription('org_test_billing');
  assert.equal(upgradedSub.planTier, 'growth');
  assert.equal(upgradedSub.tokenLimit, 500000);
});

test('ApiKeyManager: Cryptographic key generation, SHA-256 hashing, and key validation', () => {
  const keyMgr = new ApiKeyManager();
  const { rawKey, record } = keyMgr.generateApiKey('org_test_key', 'Production SDK Key');

  // Verify raw secret format and prefix
  assert.ok(rawKey.startsWith('bf_live_'));
  assert.ok(record.prefix.startsWith('bf_live_'));
  assert.notEqual(record.keyHash, rawKey);
  assert.equal(record.keyHash, ApiKeyManager.hashKey(rawKey));

  // Validate raw key against SHA-256 hash lookup
  const validated = keyMgr.validateApiKey(rawKey);
  assert.ok(validated);
  assert.equal(validated.requestCount, 1);
  assert.ok(validated.lastUsedAt);

  const keys = keyMgr.listApiKeys('org_test_key');
  assert.equal(keys.length, 1);
});
