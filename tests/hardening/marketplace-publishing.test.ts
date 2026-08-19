import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { AutomationBuilderService, CustomWorkflowDefinition } from '../../src/core/automation/automation-builder-service';
import { MarketplaceService } from '../../src/core/marketplace/marketplace-service';

function createSampleWorkflow(orgId: string, bizId: string): CustomWorkflowDefinition {
  return {
    workflowId: `wf_sample_${Math.random().toString(36).substring(2, 6)}`,
    organizationId: orgId,
    businessId: bizId,
    name: 'Sample E-Commerce Lead Workflow',
    description: 'Sample marketplace workflow definition',
    domain: 'sales',
    triggers: [{ type: 'EVENT_BASED', eventType: 'ORDER_PLACED' }],
    conditions: [{ field: 'totalAmount', operator: 'GREATER_THAN', value: 100 }],
    actions: [
      { nodeId: 'n1', name: 'Follow up', type: 'DELEGATE_AGENT', targetAgent: 'content', params: {}, nextNodes: ['n2'] },
      { nodeId: 'n2', name: 'Record Learning', type: 'RECORD_MEMORY', params: {} },
    ],
    entryNodeId: 'n1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

test('Prompt 5: Marketplace Publishing Workflow (Submit -> Review & Approve -> Deprecate)', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const builderService = new AutomationBuilderService(dnaRepo, auditRepo);
  const marketplace = new MarketplaceService(dnaRepo, builderService, auditRepo);

  const orgId = 'org_creator_1';
  const bizId = 'biz_creator_1';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  // 1. Submit Package
  const submitted = await marketplace.submitPackageForReview({
    authorOrganizationId: orgId,
    authorName: 'Nexus Labs',
    name: 'E-Commerce Growth Engine',
    description: 'Automates customer retention and post-purchase follow-up',
    version: '1.0.0',
    domain: 'sales',
    workflowDefinition: createSampleWorkflow(orgId, bizId),
    requiredAgents: ['content', 'analytics'],
    priceMonthly: 49,
    actor: 'creator@nexus.com',
  });

  assert.equal(submitted.status, 'UNDER_REVIEW');
  assert.equal(submitted.priceMonthly, 49);

  // 2. Catalog must not include UNDER_REVIEW package
  assert.equal(marketplace.getCatalog().length, 0);

  // 3. Admin Reviews & Approves
  const published = await marketplace.reviewPackage({
    packageId: submitted.packageId,
    approved: true,
    reviewerActor: 'admin@platform.com',
  });

  assert.equal(published.status, 'PUBLISHED');

  // 4. Catalog now includes published package
  const catalog = marketplace.getCatalog();
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].packageId, submitted.packageId);

  // 5. Deprecate Package
  const deprecated = await marketplace.deprecatePackage(submitted.packageId, 'admin@platform.com');
  assert.equal(deprecated.status, 'DEPRECATED');
  assert.equal(marketplace.getCatalog().length, 0);
});

test('Prompt 5: Marketplace Catalog Discovery & Filtering', async () => {
  const dnaRepo = new BusinessDNARepository();
  const builderService = new AutomationBuilderService(dnaRepo);
  const marketplace = new MarketplaceService(dnaRepo, builderService);

  const orgId = 'org_creator_2';
  const bizId = 'biz_creator_2';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  // Submit & Approve 2 packages in different domains
  const pkg1 = await marketplace.submitPackageForReview({
    authorOrganizationId: orgId,
    authorName: 'Growth AI',
    name: 'Social Content Engine',
    description: 'Generates weekly social posts',
    version: '1.0.0',
    domain: 'marketing',
    workflowDefinition: createSampleWorkflow(orgId, bizId),
    requiredAgents: ['content', 'brand'],
    actor: 'creator@growth.com',
  });
  await marketplace.reviewPackage({ packageId: pkg1.packageId, approved: true, reviewerActor: 'admin' });

  const pkg2 = await marketplace.submitPackageForReview({
    authorOrganizationId: orgId,
    authorName: 'SecOps Inc',
    name: 'Zero Trust Audit Pack',
    description: 'Audits agent runtime permissions',
    version: '2.0.0',
    domain: 'security',
    workflowDefinition: createSampleWorkflow(orgId, bizId),
    requiredAgents: ['security'],
    actor: 'creator@secops.com',
  });
  await marketplace.reviewPackage({ packageId: pkg2.packageId, approved: true, reviewerActor: 'admin' });

  // Domain Filter test
  const marketingOnly = marketplace.getCatalog({ domain: 'marketing' });
  assert.equal(marketingOnly.length, 1);
  assert.equal(marketingOnly[0].name, 'Social Content Engine');

  // Search Filter test
  const searchResult = marketplace.getCatalog({ search: 'Zero Trust' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].name, 'Zero Trust Audit Pack');
});

test('Prompt 5: Package Installation & Uninstallation Engine', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const builderService = new AutomationBuilderService(dnaRepo, auditRepo);
  const marketplace = new MarketplaceService(dnaRepo, builderService, auditRepo);

  const authorOrg = 'org_creator_3';
  const authorBiz = 'biz_creator_3';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(authorBiz), authorOrg);

  const customerOrg = 'org_customer_3';
  const customerBiz = 'biz_customer_3';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(customerBiz), customerOrg);

  // Publish a package
  const pkg = await marketplace.submitPackageForReview({
    authorOrganizationId: authorOrg,
    authorName: 'Omni Automations',
    name: 'Customer Retention Bot',
    description: 'Re-engages inactive users',
    version: '1.1.0',
    domain: 'sales',
    workflowDefinition: createSampleWorkflow(authorOrg, authorBiz),
    requiredAgents: ['analytics'],
    actor: 'author@omni.com',
  });
  await marketplace.reviewPackage({ packageId: pkg.packageId, approved: true, reviewerActor: 'admin' });

  // Customer installs package
  const installation = await marketplace.installPackage({
    organizationId: customerOrg,
    businessId: customerBiz,
    packageId: pkg.packageId,
    actor: 'user@customer.com',
  });

  assert.equal(installation.status, 'ACTIVE');
  assert.equal(installation.organizationId, customerOrg);

  // Download count incremented
  assert.equal(marketplace.getPackageDetails(pkg.packageId).downloads, 1);

  // Verify workflow definition registered in customer's builder service
  const customerWorkflows = await builderService.listWorkflowDefinitions(customerOrg, customerBiz);
  assert.equal(customerWorkflows.length, 1);

  // Customer lists installed packages
  const installedList = await marketplace.listInstalledPackages(customerOrg, customerBiz);
  assert.equal(installedList.length, 1);

  // Customer uninstalls package
  const uninstalled = await marketplace.uninstallPackage({
    organizationId: customerOrg,
    businessId: customerBiz,
    packageId: pkg.packageId,
    actor: 'user@customer.com',
  });

  assert.equal(uninstalled.status, 'UNINSTALLED');
  assert.equal((await marketplace.listInstalledPackages(customerOrg, customerBiz)).length, 0);

  // Verify Audit Logged
  const events = await auditRepo.listEvents({ organizationId: customerOrg, businessId: customerBiz });
  assert.ok(events.some((e) => (e.details as any)?.eventType === 'MARKETPLACE_PACKAGE_INSTALLED'));
  assert.ok(events.some((e) => (e.details as any)?.eventType === 'MARKETPLACE_PACKAGE_UNINSTALLED'));
});

test('Prompt 5: Tenant Isolation Enforcement in Marketplace', async () => {
  const dnaRepo = new BusinessDNARepository();
  const builderService = new AutomationBuilderService(dnaRepo);
  const marketplace = new MarketplaceService(dnaRepo, builderService);

  const orgA = 'org_tenant_a';
  const bizA = 'biz_tenant_a';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizA), orgA);

  const pkg = await marketplace.submitPackageForReview({
    authorOrganizationId: orgA,
    authorName: 'Org A',
    name: 'Org A Bot',
    description: 'Bot',
    version: '1.0.0',
    domain: 'operations',
    workflowDefinition: createSampleWorkflow(orgA, bizA),
    requiredAgents: ['analytics'],
    actor: 'admin@orga.com',
  });
  await marketplace.reviewPackage({ packageId: pkg.packageId, approved: true, reviewerActor: 'admin' });

  // Hacker attempting install with invalid org ID throws Tenant Security Violation
  await assert.rejects(
    async () => {
      await marketplace.installPackage({
        organizationId: 'unauthorized_hacker_org',
        businessId: bizA,
        packageId: pkg.packageId,
        actor: 'hacker@evil.com',
      });
    },
    /Tenant Security Violation/i,
    'Cross-tenant package installation must throw Tenant Security Violation'
  );
});
