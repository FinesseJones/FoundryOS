import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountManager } from '../auth';

describe('Phase 2: Business DNA Onboarding Verification Suite', () => {
  let manager: AccountManager;

  beforeEach(() => {
    manager = AccountManager.getInstance();
    manager.clearAll();
  });

  it('1. Company Information Form submission saves company profile and generates Business DNA', async () => {
    // 1. Account Signup & Org Setup
    const { session } = await manager.registerAccount({
      email: 'founder@apexai.com',
      password: 'ApexPassword123!',
      name: 'Apex Founder',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'Apex AI Systems',
      industry: 'technology_saas',
      planTier: 'growth',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Production Workspace',
    });

    // 2. Submit Company Information Form
    const result = await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'Apex AI Systems',
      websiteUrl: 'https://apexai.com',
      industry: 'technology_saas',
      mission: 'Pioneering autonomous intelligence for global enterprises.',
      uvp: 'Closed-loop business DNA and autonomous AI workforce.',
      processGap: 'Disjointed operational tools and manual marketing bottlenecks.',
      financialPain: '$2.4M lost annually to manual workflows.',
      targetAudience: 'Enterprise CTOs, VPs of Growth, and Operations Directors.',
    });

    // 3. Verify Company Profile Saved
    assert.strictEqual(result.companyProfile.companyName, 'Apex AI Systems');
    assert.strictEqual(result.companyProfile.websiteUrl, 'https://apexai.com');
    assert.strictEqual(result.companyProfile.businessId, `biz_${org.id.replace(/^org_/, '')}`);

    // 4. Verify Authoritative Business DNA Generated
    const { businessDNA } = result;
    assert.ok(businessDNA.id.startsWith('dna_'));
    assert.strictEqual(businessDNA.businessId, result.companyProfile.businessId);
    assert.strictEqual(businessDNA.confidenceScore, 0.94);
    assert.strictEqual(businessDNA.companyIdentity.companyName, 'Apex AI Systems');
    assert.strictEqual(businessDNA.companyIdentity.mission, 'Pioneering autonomous intelligence for global enterprises.');
    assert.strictEqual(businessDNA.companyIdentity.uniqueValueProposition, 'Closed-loop business DNA and autonomous AI workforce.');
    assert.strictEqual(businessDNA.opportunityPillars.financialPain, '$2.4M lost annually to manual workflows.');
    assert.strictEqual(businessDNA.opportunityPillars.processGap, 'Disjointed operational tools and manual marketing bottlenecks.');
    assert.ok(businessDNA.brandVoice.wordsToUse.length >= 4);
    assert.ok(businessDNA.customerProfile.buyerPersonas.length >= 2);
    assert.ok(businessDNA.websiteAnalysis.colors.length >= 3);
  });

  it('2. Business DNA persists permanently and can be retrieved across sessions', async () => {
    // 1. Register, create org, and save company info
    const reg = await manager.registerAccount({
      email: 'client@persist-test.com',
      password: 'PersistPassword123!',
      name: 'Persist Client',
    });

    const org = await manager.createOrganization({
      sessionToken: reg.session.token,
      name: 'Persist Enterprise',
    });

    const ws = await manager.createWorkspace({
      sessionToken: reg.session.token,
      organizationId: org.id,
      name: 'Main WS',
    });

    await manager.saveCompanyProfile({
      sessionToken: reg.session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'Persist Enterprise',
      websiteUrl: 'https://persist.io',
      mission: 'Zero-friction persistence verification.',
    });

    // 2. Query DNA directly with session
    const retrievedDna = manager.getBusinessDNA(reg.session.token, org.id);
    assert.ok(retrievedDna, 'Business DNA must be retrievable');
    assert.strictEqual(retrievedDna?.companyIdentity.companyName, 'Persist Enterprise');
    assert.strictEqual(retrievedDna?.companyIdentity.mission, 'Zero-friction persistence verification.');

    // 3. Simulate user re-login and verify DNA attached
    const loginResult = await manager.login({
      email: 'client@persist-test.com',
      password: 'PersistPassword123!',
    });

    assert.ok(loginResult.businessDNA, 'Business DNA must be returned upon re-login');
    assert.strictEqual(loginResult.businessDNA?.companyIdentity.companyName, 'Persist Enterprise');
  });

  it('3. Client can refine and update Business DNA in real time', async () => {
    const reg = await manager.registerAccount({
      email: 'editor@brandfirst.ai',
      password: 'EditorPassword123!',
      name: 'Brand Editor',
    });

    const org = await manager.createOrganization({
      sessionToken: reg.session.token,
      name: 'BrandFirst Studio',
    });

    const ws = await manager.createWorkspace({
      sessionToken: reg.session.token,
      organizationId: org.id,
      name: 'Creative Suite',
    });

    await manager.saveCompanyProfile({
      sessionToken: reg.session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'BrandFirst Studio',
      websiteUrl: 'https://brandfirst.ai',
    });

    // Update Business DNA
    const updated = manager.updateBusinessDNA(reg.session.token, org.id, {
      companyIdentity: {
        companyName: 'BrandFirst Studio Global',
        industry: 'consulting_services',
        stage: 'scale',
        mission: 'Transforming brand operations with verified AI systems.',
        uniqueValueProposition: 'Next-generation closed-loop brand intelligence.',
        coreValues: ['Speed', 'Excellence', 'Transparency'],
      },
      opportunityPillars: {
        financialPain: '$3.5M annual design drag.',
        processGap: 'Siloed agency handoffs.',
        stakeholderAlignment: 'CMO (Direct Sponsor)',
      },
    });

    assert.strictEqual(updated.companyIdentity.companyName, 'BrandFirst Studio Global');
    assert.strictEqual(updated.companyIdentity.mission, 'Transforming brand operations with verified AI systems.');
    assert.strictEqual(updated.opportunityPillars.financialPain, '$3.5M annual design drag.');

    // Verify retrieval reflects the update
    const freshQuery = manager.getBusinessDNA(reg.session.token, org.id);
    assert.strictEqual(freshQuery?.companyIdentity.companyName, 'BrandFirst Studio Global');
    assert.strictEqual(freshQuery?.opportunityPillars.stakeholderAlignment, 'CMO (Direct Sponsor)');
  });

  it('4. Multi-Tenant Isolation: Account B cannot read or modify Account A Business DNA', async () => {
    // Setup Account A
    const accA = await manager.registerAccount({
      email: 'ownerA@org-a.com',
      password: 'PasswordA123!',
      name: 'Owner A',
    });

    const orgA = await manager.createOrganization({
      sessionToken: accA.session.token,
      name: 'Company A Secret Org',
    });

    const wsA = await manager.createWorkspace({
      sessionToken: accA.session.token,
      organizationId: orgA.id,
      name: 'Secret Workspace A',
    });

    await manager.saveCompanyProfile({
      sessionToken: accA.session.token,
      organizationId: orgA.id,
      workspaceId: wsA.id,
      companyName: 'Company A Confidential',
      websiteUrl: 'https://comp-a.com',
      mission: 'Secret Project Alpha',
    });

    // Setup Account B
    const accB = await manager.registerAccount({
      email: 'ownerB@org-b.com',
      password: 'PasswordB456!',
      name: 'Owner B',
    });

    // 1. Account B trying to read Account A's DNA throws Security Violation
    assert.throws(() => {
      manager.getBusinessDNA(accB.session.token, orgA.id);
    }, /Security Violation: User '.*' is not authorized to access organization/);

    // 2. Account B trying to update Account A's DNA throws Security Violation
    assert.throws(() => {
      manager.updateBusinessDNA(accB.session.token, orgA.id, {
        companyIdentity: {
          companyName: 'Hacked Company A',
          industry: 'technology_saas',
          stage: 'growth',
          mission: 'Hacked Mission',
          uniqueValueProposition: 'Hacked UVP',
          coreValues: [],
        },
      });
    }, /Security Violation: User '.*' is not authorized to access organization/);
  });
});
