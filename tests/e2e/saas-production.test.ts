import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { ContextBuilder } from '../../src/core/context';
import { AgentRegistry } from '../../src/core/agents';
import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { ApiKeyManager } from '../../src/core/saas/api-keys';

test('Epic 10/11B E2E: SaaS Production (Cryptographic Auth -> RBAC -> SHA-256 API Keys -> Billing -> Agent Execution)', async () => {
  // 1. Organization Setup & Admin User Auth with 256-bit Token
  const auth = new SaaSAuthManager();
  const session = auth.createSession({
    userId: 'user_e2e_admin',
    email: 'admin@hyperdrive.ai',
    name: 'Executive Admin',
    role: 'ADMIN',
    organizationId: 'org_e2e_saas',
    organizationName: 'HyperDrive Enterprise',
  });

  assert.equal(session.token.length, 64);
  assert.ok(auth.hasPermission(session, 'manage_billing'));

  // 2. Cryptographic API Key Generation & SHA-256 Authorization
  const apiKeyMgr = new ApiKeyManager();
  const { rawKey, record } = apiKeyMgr.generateApiKey('org_e2e_saas', 'Main Production API Key');
  assert.ok(rawKey.startsWith('bf_live_'));
  assert.equal(record.keyHash, ApiKeyManager.hashKey(rawKey));

  const validKey = apiKeyMgr.validateApiKey(rawKey);
  assert.ok(validKey);

  // 3. Billing & Token Usage Metering
  const billing = new SaaSBillingManager();
  billing.initializeSubscription('org_e2e_saas', 'growth');

  // 4. Core Agent Task Execution with Token Metering
  const dna = createDefaultBusinessDNA('biz_e2e_saas', {
    companyIdentity: { companyName: { value: 'HyperDrive Enterprise' } },
  });

  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const registry = new AgentRegistry(contextBuilder);

  const taskResult = await registry.dispatchTask({
    taskId: 'task_e2e_saas_1',
    businessId: 'biz_e2e_saas',
    role: 'content',
    taskType: 'content_generation',
    prompt: 'Write press release for SaaS launch',
  });

  const tokenUsage = taskResult.context.tokenAllocation.totalUsed;
  assert.ok(tokenUsage > 0);

  const meterResult = billing.recordTokenUsage('org_e2e_saas', tokenUsage);
  assert.equal(meterResult.allowed, true);
  assert.ok(meterResult.remainingTokens < 500000);
});
