import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { ApiKeyManager } from '../../src/core/saas/api-keys';

test('Epic 11B: SaaSAuthManager generates 256-bit entropy random tokens without predictable patterns', () => {
  const auth = new SaaSAuthManager();

  const session1 = auth.createSession({
    userId: 'user_crypto_1',
    email: 'user1@company.com',
    name: 'User One',
    role: 'ADMIN',
    organizationId: 'org_crypto_1',
    organizationName: 'Crypto Org',
  });

  const session2 = auth.createSession({
    userId: 'user_crypto_1',
    email: 'user1@company.com',
    name: 'User One',
    role: 'ADMIN',
    organizationId: 'org_crypto_1',
    organizationName: 'Crypto Org',
  });

  // Verify 256-bit token length (64 hex chars)
  assert.equal(session1.token.length, 64);
  assert.equal(session2.token.length, 64);

  // Assert tokens are uniquely generated from crypto randomness (not predictable timestamps or user IDs)
  assert.notEqual(session1.token, session2.token);
  assert.equal(session1.token.includes('user_crypto_1'), false);
});

test('Epic 11B: ApiKeyManager generates production prefix keys and stores SHA-256 digest hash without raw key leakage', () => {
  const keyMgr = new ApiKeyManager();

  const { rawKey, record } = keyMgr.generateApiKey('org_secure_saas', 'Production App Server');

  // Assert raw key format
  assert.ok(rawKey.startsWith('bf_live_'));
  assert.equal(rawKey.length, 56); // "bf_live_" (8) + 48 hex chars = 56

  // Assert stored record contains ONLY prefix and SHA-256 keyHash
  assert.ok(record.prefix.startsWith('bf_live_'));
  assert.equal(record.keyHash.length, 64); // SHA-256 hex string length
  assert.notEqual(record.keyHash, rawKey);

  // Assert stored record object contains NO raw key string property
  const storedJson = JSON.stringify(record);
  assert.equal(storedJson.includes(rawKey), false, 'Stored ApiKeyRecord must NOT contain the secret raw key');

  // Assert validation succeeds using raw key, matching SHA-256 hash
  const validated = keyMgr.validateApiKey(rawKey);
  assert.ok(validated);
  assert.equal(validated.id, record.id);

  // Assert invalid raw key fails validation
  const invalidKey = `bf_live_fake_key_attempt_00000000000000000000000000000000`;
  assert.equal(keyMgr.validateApiKey(invalidKey), null);
});
