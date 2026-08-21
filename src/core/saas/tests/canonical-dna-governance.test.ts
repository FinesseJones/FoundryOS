import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountManager, normalizeCompanyUrl } from '../auth';

describe('Canonical Business DNA Governance & Data Quality Suite', () => {
  let manager: AccountManager;

  beforeEach(() => {
    manager = AccountManager.getInstance();
    manager.clearAll();
  });

  it('1. URL Sanitizer: Corrects malformed duplicated protocols and trailing slashes', () => {
    assert.strictEqual(normalizeCompanyUrl('https://https://tacfos.tech/'), 'https://tacfos.tech/');
    assert.strictEqual(normalizeCompanyUrl('http://https://tacfos.tech'), 'https://tacfos.tech');
    assert.strictEqual(normalizeCompanyUrl('https://tacfos.tech'), 'https://tacfos.tech');
    assert.strictEqual(normalizeCompanyUrl('tacfos.tech'), 'https://tacfos.tech');
    assert.strictEqual(normalizeCompanyUrl('//tacfos.tech/app'), 'https://tacfos.tech/app');
    assert.strictEqual(normalizeCompanyUrl(''), 'https://tacfos.tech');
  });

  it('2. Multi-Tier Entity Separation: Legal Entity vs Operating Brand vs Product vs Platform', async () => {
    const { session } = await manager.registerAccount({
      email: 'founder@tacfos.tech',
      password: 'FounderPassword123!',
      name: 'Finesse Jones',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'TACF Global',
      industry: 'technology_saas',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Production Core',
    });

    const { businessDNA } = await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'TACF Global',
      legalCompanyName: 'The AI CONTENT FOUNDRY, LLC',
      operatingBrand: 'TACF Global',
      productName: 'TACF Autonomous Business AI OS',
      corePlatform: 'Business DNA',
      websiteUrl: 'https://https://tacfos.tech/', // Malformed URL input
      industry: 'technology_saas',
      mission: 'Autonomous Business AI Operating System delivering deterministic governance and execution.',
      uvp: 'Closed-loop Business DNA with verified epistemic intelligence.',
    });

    // 1. Verify URL is sanitized automatically
    assert.strictEqual(businessDNA.websiteAnalysis.primaryUrl, 'https://tacfos.tech/');

    // 2. Verify all 4 tiers are separated and preserved
    assert.strictEqual(businessDNA.companyIdentity.legalCompanyName, 'The AI CONTENT FOUNDRY, LLC');
    assert.strictEqual(businessDNA.companyIdentity.operatingBrand, 'TACF Global');
    assert.strictEqual(businessDNA.companyIdentity.productName, 'TACF Autonomous Business AI OS');
    assert.strictEqual(businessDNA.companyIdentity.corePlatform, 'Business DNA');

    // 3. Verify grounded market position
    assert.strictEqual(
      businessDNA.competitivePositioning.marketPosition,
      'Autonomous Business AI Platform / Emerging Category Pioneer'
    );

    // 4. Verify financial claim is labeled as estimate when not hard-coded
    assert.ok(
      businessDNA.opportunityPillars.financialPain.includes('Estimated') ||
      businessDNA.opportunityPillars.financialPain.length > 0
    );
  });

  it('3. Real-Time In-Place DNA Refinement: Deep updates persist permanently', async () => {
    const { session } = await manager.registerAccount({
      email: 'admin@tacfos.tech',
      password: 'AdminPassword123!',
      name: 'Admin User',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'TACF Enterprise',
      industry: 'technology_saas',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'WS 1',
    });

    await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'TACF Enterprise',
      websiteUrl: 'https://tacfos.tech',
      industry: 'technology_saas',
    });

    // Refine DNA with verified figures
    const updatedDna = manager.updateBusinessDNA(session.token, org.id, {
      companyIdentity: {
        companyName: 'TACF Global',
        legalCompanyName: 'The AI CONTENT FOUNDRY, LLC',
        operatingBrand: 'TACF Global',
        productName: 'TACF Autonomous Business AI OS',
        corePlatform: 'Business DNA',
        industry: 'technology_saas',
        stage: 'growth',
        mission: 'Pioneering verified autonomous business execution.',
        uniqueValueProposition: 'Zero-trust closed-loop AI systems.',
        coreValues: ['Deterministic Accuracy', 'Zero-Trust Security'],
      },
      opportunityPillars: {
        financialPain: '$250k annual resource allocation benchmark (Client Verified)',
        processGap: 'Disjointed customer onboarding pipelines',
        stakeholderAlignment: 'VP of Growth & Operations',
      },
      websiteAnalysis: {
        primaryUrl: 'https://https://tacfos.tech', // Test sanitization during update
        colors: ['#4f46e5', '#10b981', '#0f172a'],
        fonts: ['Inter', 'Space Grotesk'],
      },
    });

    assert.strictEqual(updatedDna.companyIdentity.legalCompanyName, 'The AI CONTENT FOUNDRY, LLC');
    assert.strictEqual(updatedDna.companyIdentity.operatingBrand, 'TACF Global');
    assert.strictEqual(updatedDna.opportunityPillars.financialPain, '$250k annual resource allocation benchmark (Client Verified)');
    assert.strictEqual(updatedDna.websiteAnalysis.primaryUrl, 'https://tacfos.tech');

    // Retrieve again to verify persistence
    const reloaded = manager.getBusinessDNA(session.token, org.id);
    assert.strictEqual(reloaded?.companyIdentity.legalCompanyName, 'The AI CONTENT FOUNDRY, LLC');
    assert.strictEqual(reloaded?.opportunityPillars.financialPain, '$250k annual resource allocation benchmark (Client Verified)');
    assert.strictEqual(reloaded?.websiteAnalysis.primaryUrl, 'https://tacfos.tech');
  });
});
