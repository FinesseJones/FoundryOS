import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../knowledge';
import { BusinessDNARepository, MemoryRepository, AuditRepository } from '../repositories';

test('BusinessDNARepository: Saves DNA with organizationId and verifies tenant ownership', async () => {
  const repo = new BusinessDNARepository();
  const dna = createDefaultBusinessDNA('biz_repo_100', {
    companyIdentity: { companyName: { value: 'Apex AI' } },
  });

  const saved = await repo.saveDNA(dna, 'org_apex_1', 'user/admin@apex.ai');
  assert.equal(saved.businessId, 'biz_repo_100');

  // Valid tenant ownership query
  const retrieved = await repo.getDNA({ organizationId: 'org_apex_1', businessId: 'biz_repo_100' });
  assert.ok(retrieved);
  assert.equal(retrieved.companyIdentity.companyName.value, 'Apex AI');

  // Cross-tenant unauthorized access attempt returns null
  const unauthorized = await repo.getDNA({ organizationId: 'org_hacker_999', businessId: 'biz_repo_100' });
  assert.equal(unauthorized, null);

  const revisions = await repo.listRevisions({ organizationId: 'org_apex_1', businessId: 'biz_repo_100' });
  assert.equal(revisions.length, 1);
  assert.equal(revisions[0].versionNumber, 1);
  assert.equal(revisions[0].createdBy, 'user/admin@apex.ai');
});

test('MemoryRepository: Persists long-term memories with organizationId and blocks cross-tenant queries', async () => {
  const repo = new MemoryRepository();

  await repo.addMemory({
    organizationId: 'org_acme_1',
    businessId: 'biz_mem_1',
    category: 'brand',
    content: 'Brand voice requires authoritative tone and no buzzwords',
    importance: 0.9,
    relevance: 1.0,
  });

  await repo.addMemory({
    organizationId: 'org_acme_1',
    businessId: 'biz_mem_1',
    category: 'campaign',
    content: 'Summer 2026 campaign goal is 10x ROI',
    importance: 0.85,
    relevance: 1.0,
  });

  // Valid tenant query
  const brandMemories = await repo.queryMemories({
    organizationId: 'org_acme_1',
    businessId: 'biz_mem_1',
    category: 'brand',
  });
  assert.equal(brandMemories.length, 1);
  assert.ok(brandMemories[0].content.includes('authoritative'));

  // Cross-tenant unauthorized access attempt returns empty list
  const hackerMemories = await repo.queryMemories({
    organizationId: 'org_hacker_999',
    businessId: 'biz_mem_1',
    category: 'brand',
  });
  assert.equal(hackerMemories.length, 0);
});

test('AuditRepository: Logs append-only security audit events scoped by organizationId', async () => {
  const repo = new AuditRepository();

  const event = await repo.logEvent({
    organizationId: 'org_audit_1',
    businessId: 'biz_audit_1',
    action: 'update',
    changedBy: 'user/manager@company.com',
    details: { field: 'brandVoice' },
  });

  assert.equal(event.action, 'update');
  assert.equal(event.changedBy, 'user/manager@company.com');

  const events = await repo.listEvents({ organizationId: 'org_audit_1', businessId: 'biz_audit_1' });
  assert.equal(events.length, 1);
  assert.equal(events[0].id, event.id);

  const unauthorizedEvents = await repo.listEvents({ organizationId: 'org_hacker_999' });
  assert.equal(unauthorizedEvents.length, 0);
});
