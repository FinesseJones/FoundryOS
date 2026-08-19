import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BusinessDNARepository } from '../repositories';
import { createDefaultBusinessDNA } from '../../knowledge';

test('BusinessDNARepository (Prompt 4B): create(), findById(), findByOrganization(), update(), version(), delete()', async () => {
  const repo = new BusinessDNARepository();
  const dna1 = createDefaultBusinessDNA('biz_4b_001');

  // 1. create() requires organizationId
  await repo.create({ organizationId: 'org_apex', businessId: 'biz_4b_001', dna: dna1, actor: 'user/admin' });
  await assert.rejects(
    async () => {
      await repo.create({ organizationId: '', businessId: 'biz_bad', dna: dna1 });
    },
    /Tenant Security Violation/
  );

  // 2. findById() requires organizationId & enforces tenant firewall
  const found = await repo.findById({ organizationId: 'org_apex', businessId: 'biz_4b_001' });
  assert.ok(found);
  assert.equal(found.businessId, 'biz_4b_001');

  const crossRead = await repo.findById({ organizationId: 'org_intruder', businessId: 'biz_4b_001' });
  assert.equal(crossRead, null, 'Cross-tenant read must return null');

  // 3. findByOrganization() returns all records for an org
  const dna2 = createDefaultBusinessDNA('biz_4b_002');
  await repo.create({ organizationId: 'org_apex', businessId: 'biz_4b_002', dna: dna2 });

  const orgRecords = await repo.findByOrganization({ organizationId: 'org_apex' });
  assert.equal(orgRecords.length, 2);

  // 4. update() increments revision version
  const updatedDna = { ...dna1 };
  updatedDna.companyIdentity.companyName.value = 'Apex HVAC Updated LLC';
  await repo.update({ organizationId: 'org_apex', businessId: 'biz_4b_001', dna: updatedDna, actor: 'user/editor' });

  // 5. version() lists revisions
  const revisions = await repo.version({ organizationId: 'org_apex', businessId: 'biz_4b_001' });
  assert.equal(revisions.length, 2);
  assert.equal(revisions[1].versionNumber, 2);

  // 6. delete() removes record & revisions
  const deleted = await repo.delete({ organizationId: 'org_apex', businessId: 'biz_4b_001' });
  assert.equal(deleted, true);

  const postDelete = await repo.findById({ organizationId: 'org_apex', businessId: 'biz_4b_001' });
  assert.equal(postDelete, null);
});
