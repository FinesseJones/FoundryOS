import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountManager } from '../auth';
import { generateClientWebsite } from '../../website-builder/website-generator';
import { ContextBuilder } from '../../context';
import { BusinessDNARepository } from '../../persistence/repositories';
import { createDefaultBusinessDNA } from '../../knowledge';

describe('Phase 3: Feature & Authoritative Business DNA Connectivity Suite', () => {
  let manager: AccountManager;

  beforeEach(() => {
    manager = AccountManager.getInstance();
    manager.clearAll();
  });

  it('1. Authoritative Business DNA -> Branding Center connectivity (Zero Duplicate Entry)', async () => {
    // 1. Client enters company info once during onboarding
    const { session } = await manager.registerAccount({
      email: 'founder@cybercorp.io',
      password: 'CyberPassword123!',
      name: 'Cyber Founder',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'CyberCorp Autonomous',
      industry: 'technology_saas',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Primary WS',
    });

    await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'CyberCorp Autonomous',
      websiteUrl: 'https://cybercorp.io',
      industry: 'technology_saas',
      mission: 'Zero-latency autonomous cyber defense.',
      uvp: 'Self-healing cyber architecture and automated containment.',
      processGap: 'Siloed incident response queues and alert fatigue.',
      financialPain: '$3.2M lost annually to breach recovery downtime.',
      targetAudience: 'Enterprise CISOs, SOC Managers, and SecOps Teams.',
    });

    // 2. Branding Center retrieves authoritative DNA
    const dna = manager.getBusinessDNA(session.token, org.id);
    assert.ok(dna, 'Authoritative Business DNA must exist');

    // 3. Verify all Branding Center inputs are already known
    assert.strictEqual(dna?.companyIdentity.companyName, 'CyberCorp Autonomous');
    assert.strictEqual(dna?.companyIdentity.mission, 'Zero-latency autonomous cyber defense.');
    assert.strictEqual(dna?.companyIdentity.uniqueValueProposition, 'Self-healing cyber architecture and automated containment.');
    assert.strictEqual(dna?.opportunityPillars.financialPain, '$3.2M lost annually to breach recovery downtime.');
    assert.strictEqual(dna?.opportunityPillars.processGap, 'Siloed incident response queues and alert fatigue.');
    assert.strictEqual(dna?.opportunityPillars.stakeholderAlignment, 'Executive Leadership (Direct Sponsor)');
    assert.strictEqual(dna?.brandVoice.primaryTone, 'authoritative');
    assert.ok(dna?.brandVoice.wordsToUse.includes('autonomous'));
    assert.ok(dna?.customerProfile.buyerPersonas.length >= 2);
  });

  it('2. Authoritative Business DNA -> Website Studio compilation', async () => {
    const { session } = await manager.registerAccount({
      email: 'founder@fintechplus.com',
      password: 'FintechPassword123!',
      name: 'Fintech Founder',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'Fintech Plus',
      industry: 'saas',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Fintech WS',
    });

    const { businessDNA } = await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'Fintech Plus',
      websiteUrl: 'https://fintechplus.com',
      industry: 'saas',
      mission: 'Instant global settlement infrastructure.',
      uvp: 'Sub-second multi-currency settlement rails.',
      processGap: 'Multi-day wire delays and manual compliance reviews.',
      financialPain: '$4.1M in trapped liquidity fees.',
    });

    // Generate website model using the authoritative DNA values
    const generatedSite = generateClientWebsite({
      companyName: businessDNA.companyIdentity.companyName,
      industry: businessDNA.companyIdentity.industry,
      financialPain: businessDNA.opportunityPillars.financialPain,
      processGap: businessDNA.opportunityPillars.processGap,
      themeId: 'indigo',
    });

    assert.strictEqual(generatedSite.companyName, 'Fintech Plus');
    assert.ok(generatedSite.hero.headline.length > 5);
    assert.ok(generatedSite.hero.subheadline.includes('Fintech Plus'));
    assert.ok(generatedSite.services.length >= 3);
    assert.ok(generatedSite.metrics.length >= 3);
  });

  it('3. Authoritative Business DNA -> Business DNA OS Intelligence Context & Repositories', async () => {
    const { session } = await manager.registerAccount({
      email: 'founder@healthflow.com',
      password: 'HealthPassword123!',
      name: 'Health Founder',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'HealthFlow Systems',
      industry: 'healthcare',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Clinical WS',
    });

    const { businessDNA } = await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'HealthFlow Systems',
      websiteUrl: 'https://healthflow.org',
      industry: 'healthcare',
      mission: 'Streamlining clinical workflows and patient scheduling.',
      uvp: 'Autonomous patient intake and EHR synchronization.',
      processGap: 'Double-entry charting and appointment scheduling delays.',
      financialPain: '$1.8M in lost clinical provider capacity.',
    });

    // Populate runtime BusinessDNA object for intelligence engines
    const baseDna = createDefaultBusinessDNA(businessDNA.businessId);
    baseDna.companyIdentity.companyName.value = businessDNA.companyIdentity.companyName;
    baseDna.companyIdentity.mission.value = businessDNA.companyIdentity.mission;
    baseDna.companyIdentity.uniqueValueProposition.value = businessDNA.companyIdentity.uniqueValueProposition;
    baseDna.customerProfile.targetAudience.value = businessDNA.customerProfile.targetAudience;

    // Context builder register
    const contextBuilder = new ContextBuilder();
    contextBuilder.registerBusinessDNA(baseDna);

    const context = await contextBuilder.buildContext({
      businessId: businessDNA.businessId,
      taskType: 'content_generation',
      userPrompt: 'Generate homepage hero copy',
      targetChannel: 'web',
    });

    assert.ok(context.businessDNASlice);
    assert.strictEqual(context.businessDNASlice.companyIdentity?.companyName.value, 'HealthFlow Systems');
    assert.strictEqual(context.businessDNASlice.companyIdentity?.mission.value, 'Streamlining clinical workflows and patient scheduling.');
    assert.ok(context.formattedPromptContext.includes('HealthFlow Systems'));

    // Save in repository and verify strict isolation
    const repo = new BusinessDNARepository();
    await repo.create({
      organizationId: org.id,
      businessId: businessDNA.businessId,
      dna: baseDna,
    });

    const retrieved = await repo.findById({
      organizationId: org.id,
      businessId: businessDNA.businessId,
    });

    assert.ok(retrieved);
    assert.strictEqual(retrieved?.companyIdentity.companyName.value, 'HealthFlow Systems');
  });
});
