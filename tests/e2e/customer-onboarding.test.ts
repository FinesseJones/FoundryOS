import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';

test('Phase 12A E2E: Customer Onboarding Flow (Signup -> Org Creation -> Business DNA Init -> Extraction -> Active Workspace)', async () => {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();

  const onboardingService = new CustomerOnboardingService(
    authManager,
    billingManager,
    stateManager,
    dnaRepo
  );

  // Execute End-to-End Customer Onboarding Flow
  const result = await onboardingService.executeCustomerOnboarding({
    userEmail: 'founding.marketer@acmecorp.com',
    userName: 'Jane Marketer',
    userRole: 'ADMIN',
    organizationName: 'Acme Global Marketing',
    planTier: 'growth',
    companyName: 'Acme SaaS Corp',
    websiteUrl: 'https://acme.com',
  });

  // 1. Verify User Signup & Session Creation
  assert.ok(result.session);
  assert.ok(result.session.token.length > 20);
  assert.equal(result.session.email, 'founding.marketer@acmecorp.com');
  assert.equal(result.session.role, 'ADMIN');
  assert.equal(result.session.organizationName, 'Acme Global Marketing');

  // 2. Verify Organization Creation & Subscription Initialization
  assert.ok(result.subscription);
  assert.equal(result.subscription.organizationId, result.session.organizationId);
  assert.equal(result.subscription.planTier, 'growth');
  assert.equal(result.subscription.tokenLimit, 1000000);

  // 3. Verify Customer Lifecycle State Tracking
  assert.equal(result.customerState.state, 'ACTIVE');
  assert.equal(result.customerState.onboardingStep, 4);
  assert.equal(result.customerState.dnaCompletionPercent, 94);
  assert.ok(result.customerState.businessId);

  // 4. Verify Business DNA Initialization & Tenant Isolation Scoping
  assert.ok(result.businessDNA);
  assert.equal(result.businessDNA.companyIdentity?.companyName?.value, 'Acme SaaS Corp');

  // Verify database record retrieval enforces tenant scoping
  const fetchedDNA = await dnaRepo.getDNA({
    organizationId: result.session.organizationId,
    businessId: result.customerState.businessId!,
  });

  assert.ok(fetchedDNA);
  assert.equal(fetchedDNA.businessId, result.customerState.businessId);
  assert.equal(fetchedDNA.companyIdentity?.companyName?.value, 'Acme SaaS Corp');

  // Verify cross-tenant access rejection
  const unauthorizedDNA = await dnaRepo.getDNA({
    organizationId: 'unauthorized_tenant_org',
    businessId: result.customerState.businessId!,
  });
  assert.equal(unauthorizedDNA, null);
});
