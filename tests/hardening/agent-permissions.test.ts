import { test } from 'node:test';
import assert from 'node:assert/strict';

import { AgentIdentityRegistry } from '../../src/core/agents/agent-identity';
import { AgentAuthorizationService } from '../../src/core/agents/agent-permissions';
import { AuditRepository } from '../../src/core/persistence/repositories';

test('Prompt 2: RBAC Action Authorization & Permitted/Denied Actions', async () => {
  const identityRegistry = new AgentIdentityRegistry();
  const auditRepo = new AuditRepository();
  const authService = new AgentAuthorizationService(identityRegistry, auditRepo);

  const orgId = 'org_acme_123';
  const bizId = 'biz_acme_123';

  // Content Agent: permitted to write:content
  const res1 = await authService.authorizeAction({
    agentIdOrRole: 'content',
    organizationId: orgId,
    targetOrganizationId: orgId,
    businessId: bizId,
    action: 'write:content',
  });
  assert.equal(res1.authorized, true);
  assert.equal(res1.requiresApproval, false);

  // Content Agent: denied rotate:keys
  const res2 = await authService.authorizeAction({
    agentIdOrRole: 'content',
    organizationId: orgId,
    targetOrganizationId: orgId,
    businessId: bizId,
    action: 'rotate:keys',
  });
  assert.equal(res2.authorized, false);
  assert.ok(res2.reason?.includes('not permitted for role \'content\''));
});

test('Prompt 2: Tenant Isolation Enforcement in Authorization', async () => {
  const identityRegistry = new AgentIdentityRegistry();
  const authService = new AgentAuthorizationService(identityRegistry);

  const orgA = 'org_tenant_a';
  const orgB = 'org_tenant_b';
  const bizId = 'biz_123';

  // Cross tenant action attempt must fail
  const res = await authService.authorizeAction({
    agentIdOrRole: 'brand',
    organizationId: orgA,
    targetOrganizationId: orgB,
    businessId: bizId,
    action: 'read:dna',
  });

  assert.equal(res.authorized, false);
  assert.ok(res.reason?.includes('AgentAuthorization: access denied'));
});

test('Prompt 2: Lifecycle State Enforcement in Authorization', async () => {
  const identityRegistry = new AgentIdentityRegistry();
  const authService = new AgentAuthorizationService(identityRegistry);

  const orgId = 'org_acme_123';
  const bizId = 'biz_acme_123';

  // Pause security agent
  identityRegistry.updateAgentState('security', 'PAUSED', 'Maintenance');

  const res = await authService.authorizeAction({
    agentIdOrRole: 'security',
    organizationId: orgId,
    targetOrganizationId: orgId,
    businessId: bizId,
    action: 'read:security',
  });

  assert.equal(res.authorized, false);
  assert.ok(res.reason?.includes('is in \'PAUSED\' state'));
});

test('Prompt 2: Data Access Classification Policy Enforcement', async () => {
  const identityRegistry = new AgentIdentityRegistry();
  const authService = new AgentAuthorizationService(identityRegistry);

  const orgId = 'org_acme_123';
  const bizId = 'biz_acme_123';

  // Content Agent max classification is INTERNAL. Attempting to access RESTRICTED data fails.
  const resRestricted = await authService.authorizeAction({
    agentIdOrRole: 'content',
    organizationId: orgId,
    targetOrganizationId: orgId,
    businessId: bizId,
    action: 'read:dna',
    dataClassification: 'RESTRICTED',
  });
  assert.equal(resRestricted.authorized, false);
  assert.ok(resRestricted.reason?.includes('exceeds agent role max classification'));

  // Security Agent max classification is RESTRICTED.
  const resSecRestricted = await authService.authorizeAction({
    agentIdOrRole: 'security',
    organizationId: orgId,
    targetOrganizationId: orgId,
    businessId: bizId,
    action: 'read:security',
    dataClassification: 'RESTRICTED',
  });
  assert.equal(resSecRestricted.authorized, true);
});

test('Prompt 2: Approval Requirement Flag Validation', async () => {
  const identityRegistry = new AgentIdentityRegistry();
  const authService = new AgentAuthorizationService(identityRegistry);

  const orgId = 'org_acme_123';
  const bizId = 'biz_acme_123';

  // Publishing Agent: publish:external requires approval
  const resPublish = await authService.authorizeAction({
    agentIdOrRole: 'publishing',
    organizationId: orgId,
    targetOrganizationId: orgId,
    businessId: bizId,
    action: 'publish:external',
    dataClassification: 'PUBLIC',
  });

  assert.equal(resPublish.authorized, true);
  assert.equal(resPublish.requiresApproval, true);
});
