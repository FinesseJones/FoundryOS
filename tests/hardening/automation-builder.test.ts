import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import {
  AutomationBuilderService,
  CustomWorkflowDefinition,
} from '../../src/core/automation/automation-builder-service';

test('Prompt 4: Automation Builder Workflow Schema Validation & Graph Integrity', () => {
  const dnaRepo = new BusinessDNARepository();
  const builderService = new AutomationBuilderService(dnaRepo);

  // 1. Invalid Definition: Missing entry node
  const invalidNoEntry: CustomWorkflowDefinition = {
    workflowId: 'wf_invalid_01',
    organizationId: 'org_test',
    businessId: 'biz_test',
    name: 'Invalid No Entry',
    description: 'Test',
    domain: 'marketing',
    triggers: [{ type: 'MANUAL' }],
    conditions: [],
    actions: [{ nodeId: 'n1', name: 'Step 1', type: 'RECORD_MEMORY', params: {} }],
    entryNodeId: 'n_missing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const val1 = builderService.validateWorkflowDefinition(invalidNoEntry);
  assert.equal(val1.valid, false);
  assert.ok(val1.errors.some((e) => e.includes('must match a valid action node ID')));

  // 2. Invalid Definition: Missing targetAgent for DELEGATE_AGENT
  const invalidNoAgent: CustomWorkflowDefinition = {
    ...invalidNoEntry,
    entryNodeId: 'n1',
    actions: [{ nodeId: 'n1', name: 'Step 1', type: 'DELEGATE_AGENT', params: {} }],
  };

  const val2 = builderService.validateWorkflowDefinition(invalidNoAgent);
  assert.equal(val2.valid, false);
  assert.ok(val2.errors.some((e) => e.includes('requires targetAgent')));

  // 3. Invalid Definition: Cycle Detection (Infinite Loop)
  const invalidCycle: CustomWorkflowDefinition = {
    ...invalidNoEntry,
    entryNodeId: 'n1',
    actions: [
      { nodeId: 'n1', name: 'Step 1', type: 'RECORD_MEMORY', params: {}, nextNodes: ['n2'] },
      { nodeId: 'n2', name: 'Step 2', type: 'RECORD_MEMORY', params: {}, nextNodes: ['n1'] },
    ],
  };

  const val3 = builderService.validateWorkflowDefinition(invalidCycle);
  assert.equal(val3.valid, false);
  assert.ok(val3.errors.some((e) => e.includes('infinite execution cycle')));
});

test('Prompt 4: Condition Evaluation Engine', () => {
  const dnaRepo = new BusinessDNARepository();
  const builderService = new AutomationBuilderService(dnaRepo);

  const conditions = [
    { field: 'leadScore', operator: 'GREATER_THAN' as const, value: 75 },
    { field: 'industry', operator: 'EQUALS' as const, value: 'SaaS' },
    { field: 'region', operator: 'IN_LIST' as const, value: ['US', 'CA', 'EU'] },
  ];

  // Test Pass
  const passContext = { leadScore: 85, industry: 'SaaS', region: 'US' };
  assert.equal(builderService.evaluateConditions(conditions, passContext), true);

  // Test Fail (low score)
  const failContext = { leadScore: 60, industry: 'SaaS', region: 'US' };
  assert.equal(builderService.evaluateConditions(conditions, failContext), false);
});

test('Prompt 4: Workflow Definition Creation & Audit Logging', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const orgId = 'org_builder_1';
  const bizId = 'biz_builder_1';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const builderService = new AutomationBuilderService(dnaRepo, auditRepo);

  const validDef: CustomWorkflowDefinition = {
    workflowId: 'wf_valid_01',
    organizationId: orgId,
    businessId: bizId,
    name: 'Lead Qualification Workflow',
    description: 'Qualifies incoming leads and notifies sales team',
    domain: 'sales',
    triggers: [{ type: 'EVENT_BASED', eventType: 'LEAD_CAPTURED' }],
    conditions: [{ field: 'budget', operator: 'GREATER_THAN', value: 10000 }],
    actions: [
      { nodeId: 'n1', name: 'Qualify Lead', type: 'DELEGATE_AGENT', targetAgent: 'analytics', params: {}, nextNodes: ['n2'] },
      { nodeId: 'n2', name: 'Require Manager Signoff', type: 'REQUIRE_APPROVAL', params: {}, nextNodes: ['n3'] },
      { nodeId: 'n3', name: 'Record Learning', type: 'RECORD_MEMORY', params: {} },
    ],
    entryNodeId: 'n1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = await builderService.createWorkflowDefinition({ definition: validDef, actor: 'builder@test.com' });
  assert.equal(created.workflowId, 'wf_valid_01');

  const fetched = await builderService.getWorkflowDefinition(orgId, bizId, 'wf_valid_01');
  assert.equal(fetched.name, 'Lead Qualification Workflow');

  // Verify Audit Logged
  const events = await auditRepo.listEvents({ organizationId: orgId, businessId: bizId });
  assert.ok(events.some((e) => (e.details as any)?.eventType === 'WORKFLOW_DEFINITION_CREATED'));
});

test('Prompt 4: Tenant Isolation Enforcement in Builder Service', async () => {
  const dnaRepo = new BusinessDNARepository();
  const orgA = 'org_builder_a';
  const bizA = 'biz_builder_a';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizA), orgA);

  const builderService = new AutomationBuilderService(dnaRepo);

  const defA: CustomWorkflowDefinition = {
    workflowId: 'wf_org_a',
    organizationId: orgA,
    businessId: bizA,
    name: 'Workflow Org A',
    description: 'Org A Workflow',
    domain: 'operations',
    triggers: [{ type: 'MANUAL' }],
    conditions: [],
    actions: [{ nodeId: 'n1', name: 'Run', type: 'RECORD_MEMORY', params: {} }],
    entryNodeId: 'n1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await builderService.createWorkflowDefinition({ definition: defA, actor: 'admin@orga.com' });

  // Cross tenant lookup attempt
  await assert.rejects(
    async () => {
      await builderService.getWorkflowDefinition('unauthorized_hacker_org', bizA, 'wf_org_a');
    },
    /Tenant Security Violation/i,
    'Cross-tenant workflow definition access must throw Tenant Security Violation'
  );
});
