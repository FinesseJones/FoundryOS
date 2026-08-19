import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PersistenceFactory, PrismaBusinessDNARepository, PrismaMemoryRepository, PrismaAuditRepository } from '../prisma-repositories';
import { createDefaultBusinessDNA } from '../../knowledge';

test('Prisma Persistence: Factory switches drivers cleanly without rewriting codebase', () => {
  PersistenceFactory.setDriver('sqlite_prisma');
  assert.equal(PersistenceFactory.getDriver(), 'sqlite_prisma');

  const dnaRepo = PersistenceFactory.createBusinessDNARepository();
  const memRepo = PersistenceFactory.createMemoryRepository();
  const auditRepo = PersistenceFactory.createAuditRepository();

  assert.ok(dnaRepo instanceof PrismaBusinessDNARepository);
  assert.ok(memRepo instanceof PrismaMemoryRepository);
  assert.ok(auditRepo instanceof PrismaAuditRepository);

  // Reset driver back to default in_memory
  PersistenceFactory.setDriver('in_memory');
  assert.equal(PersistenceFactory.getDriver(), 'in_memory');
});

test('Prisma BusinessDNARepository: Enforces ISOL-01 tenant security wall on save & fetch', async () => {
  const repo = new PrismaBusinessDNARepository();
  const dna = createDefaultBusinessDNA('biz_prisma_001');

  await repo.saveDNA(dna, 'org_alpha', 'test_actor');
  const fetched = await repo.getDNA({ organizationId: 'org_alpha', businessId: 'biz_prisma_001' });
  assert.ok(fetched);
  assert.equal(fetched.businessId, 'biz_prisma_001');

  // Cross-tenant read returns null
  const crossRead = await repo.getDNA({ organizationId: 'org_beta_intruder', businessId: 'biz_prisma_001' });
  assert.equal(crossRead, null, 'Cross-tenant read must return null');

  // Cross-tenant write throws exception
  await assert.rejects(
    async () => {
      await repo.saveDNA(dna, 'org_beta_intruder', 'hacker');
    },
    /Tenant Security Violation/
  );
});

test('Prisma MemoryRepository & AuditRepository: Add memories and log audit events', async () => {
  const memRepo = new PrismaMemoryRepository();
  const auditRepo = new PrismaAuditRepository();

  const mem = await memRepo.addMemory({
    organizationId: 'org_alpha',
    businessId: 'biz_prisma_001',
    category: 'brand',
    content: 'Client prefers authoritative, data-driven brand voice.',
    importance: 0.9,
    relevance: 0.95,
  });
  assert.ok(mem.id);

  const queryMems = await memRepo.queryMemories({
    organizationId: 'org_alpha',
    businessId: 'biz_prisma_001',
  });
  assert.equal(queryMems.length, 1);
  assert.equal(queryMems[0].content, 'Client prefers authoritative, data-driven brand voice.');

  const audit = await auditRepo.logEvent({
    organizationId: 'org_alpha',
    businessId: 'biz_prisma_001',
    action: 'update',
    changedBy: 'user/test@company.com',
  });
  assert.ok(audit.id);

  const events = await auditRepo.listEvents({ organizationId: 'org_alpha', businessId: 'biz_prisma_001' });
  assert.equal(events.length, 1);
});
