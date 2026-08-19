import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { AutomationVersioningService } from '../../src/core/automation/automation-versioning-service';
import { AutomationRecord } from '../../src/core/automation/customer-automation-service';

test('Prompt 3: Automation Versioning Snapshot Creation & History Tracking', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const orgId = 'org_version_1';
  const bizId = 'biz_version_1';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const versioningService = new AutomationVersioningService(dnaRepo, auditRepo);

  const initialAutomation: AutomationRecord = {
    id: 'aut_test_001',
    organizationId: orgId,
    businessId: bizId,
    templateId: 'CONTENT_CREATION_PIPELINE',
    name: 'Content Pipeline v1',
    domain: 'marketing',
    triggerType: 'MANUAL',
    schedule: 'Daily 09:00',
    configuration: { maxPosts: 5 },
    status: 'DRAFT',
    executionCount: 0,
    createdAt: new Date().toISOString(),
  };

  // Create Version 1
  const v1 = await versioningService.createVersionSnapshot({
    organizationId: orgId,
    businessId: bizId,
    automation: initialAutomation,
    changeDescription: 'Initial v1 setup',
    actor: 'admin@version.com',
  });

  assert.equal(v1.versionNumber, 1);
  assert.equal(v1.automationId, 'aut_test_001');
  assert.equal(v1.migrationStatus, 'STABLE');

  // Create Version 2 (Config update)
  const v2Automation: AutomationRecord = {
    ...initialAutomation,
    name: 'Content Pipeline v2',
    schedule: 'Daily 12:00',
    configuration: { maxPosts: 10 },
  };

  const v2 = await versioningService.createVersionSnapshot({
    organizationId: orgId,
    businessId: bizId,
    automation: v2Automation,
    changeDescription: 'Updated schedule and maxPosts',
    actor: 'admin@version.com',
  });

  assert.equal(v2.versionNumber, 2);

  // Retrieve History
  const history = await versioningService.getAutomationVersions(orgId, bizId, 'aut_test_001');
  assert.equal(history.length, 2);
  assert.equal(history[0].versionNumber, 1);
  assert.equal(history[1].versionNumber, 2);
});

test('Prompt 3: Migration Safety Validation', async () => {
  const dnaRepo = new BusinessDNARepository();
  const orgId = 'org_version_2';
  const bizId = 'biz_version_2';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const versioningService = new AutomationVersioningService(dnaRepo);

  const automation: AutomationRecord = {
    id: 'aut_safety_01',
    organizationId: orgId,
    businessId: bizId,
    templateId: 'MARKETING_CAMPAIGN_LAUNCH',
    name: 'Campaign Launch',
    domain: 'marketing',
    triggerType: 'MANUAL',
    schedule: 'Weekly',
    configuration: {},
    status: 'ACTIVE',
    executionCount: 2,
    createdAt: new Date().toISOString(),
  };

  await versioningService.createVersionSnapshot({
    organizationId: orgId, businessId: bizId, automation, changeDescription: 'Initial', actor: 'admin@test.com',
  });

  // Validation for non-existent version v99
  const checkInvalid = await versioningService.validateMigrationSafety(
    orgId, bizId, 'aut_safety_01', 99, automation
  );

  assert.equal(checkInvalid.safe, false);
  assert.ok(checkInvalid.breakingChanges[0].includes('does not exist'));

  // Validation for existing version v1 while ACTIVE
  const checkValid = await versioningService.validateMigrationSafety(
    orgId, bizId, 'aut_safety_01', 1, automation
  );

  assert.equal(checkValid.safe, true);
  assert.ok(checkValid.warnings.some((w) => w.includes('currently ACTIVE')));
});

test('Prompt 3: Rollback Points & Version Restoration', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const orgId = 'org_rollback_3';
  const bizId = 'biz_rollback_3';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const versioningService = new AutomationVersioningService(dnaRepo, auditRepo);

  const currentAutomation: AutomationRecord = {
    id: 'aut_rollback_01',
    organizationId: orgId,
    businessId: bizId,
    templateId: 'OPERATIONS_OPTIMIZATION',
    name: 'Ops Optimizer Initial',
    domain: 'operations',
    triggerType: 'MANUAL',
    schedule: 'Daily',
    configuration: { threshold: 80 },
    status: 'ACTIVE',
    executionCount: 5,
    createdAt: new Date().toISOString(),
  };

  // Save Version 1
  await versioningService.createVersionSnapshot({
    organizationId: orgId, businessId: bizId, automation: currentAutomation, changeDescription: 'Version 1 setup', actor: 'ops@admin.com',
  });

  // Save Version 2 (Broken Config update)
  const brokenAutomation: AutomationRecord = {
    ...currentAutomation,
    name: 'Ops Optimizer Broken Config',
    configuration: { threshold: 9999 },
  };

  await versioningService.createVersionSnapshot({
    organizationId: orgId, businessId: bizId, automation: brokenAutomation, changeDescription: 'Version 2 broken config', actor: 'ops@admin.com',
  });

  // Perform Rollback to Version 1
  const rollbackResult = await versioningService.rollbackToVersion({
    organizationId: orgId,
    businessId: bizId,
    currentAutomation: brokenAutomation,
    targetVersionNumber: 1,
    actor: 'ops@admin.com',
  });

  assert.equal(rollbackResult.restoredAutomation.name, 'Ops Optimizer Initial');
  assert.equal((rollbackResult.restoredAutomation.configuration as any).threshold, 80);
  assert.equal(rollbackResult.rollbackVersion.versionNumber, 3);
  assert.ok(rollbackResult.rollbackVersion.changeDescription.includes('Rollback to version v1'));

  // Verify AUTOMATION_ROLLED_BACK Audit Logged
  const events = await auditRepo.listEvents({ organizationId: orgId, businessId: bizId });
  assert.ok(events.some((e) => (e.details as any)?.eventType === 'AUTOMATION_ROLLED_BACK'));
});

test('Prompt 3: Tenant Isolation Enforcement in Versioning', async () => {
  const dnaRepo = new BusinessDNARepository();
  const orgA = 'org_tenant_a';
  const bizA = 'biz_tenant_a';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizA), orgA);

  const versioningService = new AutomationVersioningService(dnaRepo);

  const automationA: AutomationRecord = {
    id: 'aut_tenant_a',
    organizationId: orgA,
    businessId: bizA,
    templateId: 'SECURITY_MONITORING_CHECK',
    name: 'Sec Monitor Org A',
    domain: 'security',
    triggerType: 'SCHEDULED',
    schedule: 'Hourly',
    configuration: {},
    status: 'ACTIVE',
    executionCount: 1,
    createdAt: new Date().toISOString(),
  };

  await versioningService.createVersionSnapshot({
    organizationId: orgA, businessId: bizA, automation: automationA, changeDescription: 'v1 Org A', actor: 'sec@orga.com',
  });

  // Hacker attempting cross-tenant access to Org A versions with wrong org ID
  await assert.rejects(
    async () => {
      await versioningService.getAutomationVersions('unauthorized_org_hacker', bizA, 'aut_tenant_a');
    },
    /Tenant Security Violation/i,
    'Cross tenant version access must throw Tenant Security Violation'
  );
});
