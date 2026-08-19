import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { BusinessDNARepository, MemoryRepository, AuditRepository } from '../../src/core/persistence/repositories';

test('ISOL-01: BusinessDNARepository requires organizationId and rejects cross-tenant reads', async () => {
  const repo = new BusinessDNARepository();

  const tenantADNA = createDefaultBusinessDNA('biz_tenant_a', {
    companyIdentity: { companyName: { value: 'Tenant A Inc' } },
  });

  const tenantBDNA = createDefaultBusinessDNA('biz_tenant_b', {
    companyIdentity: { companyName: { value: 'Tenant B Inc' } },
  });

  await repo.saveDNA(tenantADNA, 'org_tenant_a', 'user/admin@tenant-a.com');
  await repo.saveDNA(tenantBDNA, 'org_tenant_b', 'user/admin@tenant-b.com');

  // Verify Tenant A can fetch Tenant A DNA
  const tenantAFetch = await repo.getDNA({ organizationId: 'org_tenant_a', businessId: 'biz_tenant_a' });
  assert.ok(tenantAFetch);
  assert.equal(tenantAFetch.companyIdentity.companyName.value, 'Tenant A Inc');

  // Verify Tenant B CANNOT fetch Tenant A DNA by supplying businessId 'biz_tenant_a'
  const crossTenantFetch = await repo.getDNA({ organizationId: 'org_tenant_b', businessId: 'biz_tenant_a' });
  assert.equal(crossTenantFetch, null, 'Cross-tenant query must return null (access denied)');
});

test('ISOL-01: BusinessDNARepository blocks cross-tenant write attempts on existing businessId', async () => {
  const repo = new BusinessDNARepository();

  const dna = createDefaultBusinessDNA('biz_shared_target');
  await repo.saveDNA(dna, 'org_legit_owner', 'user/legit@owner.com');

  // Attempt to overwrite Tenant A's business DNA using Tenant B's organizationId
  await assert.rejects(
    async () => {
      await repo.saveDNA(dna, 'org_hacker_attacker', 'user/hacker@attacker.com');
    },
    (err: Error) => err.message.includes('Tenant Security Violation'),
    'Must throw Tenant Security Violation error on cross-tenant write attempt'
  );
});

test('ISOL-02: Memory model queries require organizationId and enforce security wall', async () => {
  const repo = new MemoryRepository();

  await repo.addMemory({
    organizationId: 'org_alpha',
    businessId: 'biz_alpha',
    category: 'brand',
    content: 'Secret alpha strategy',
    importance: 0.95,
    relevance: 1.0,
  });

  await repo.addMemory({
    organizationId: 'org_beta',
    businessId: 'biz_beta',
    category: 'brand',
    content: 'Secret beta roadmap',
    importance: 0.95,
    relevance: 1.0,
  });

  // Querying with org_alpha retrieves alpha memory
  const alphaMemories = await repo.queryMemories({ organizationId: 'org_alpha', businessId: 'biz_alpha' });
  assert.equal(alphaMemories.length, 1);
  assert.equal(alphaMemories[0].content, 'Secret alpha strategy');

  // Querying org_beta's businessId with org_alpha credentials returns zero results
  const leakedMemories = await repo.queryMemories({ organizationId: 'org_alpha', businessId: 'biz_beta' });
  assert.equal(leakedMemories.length, 0, 'Must return 0 records when organizationId does not match target tenant');
});
