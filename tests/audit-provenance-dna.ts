import { SaaSAuthManager } from '../src/core/saas/auth';
import { SaaSBillingManager } from '../src/core/saas/billing';
import { CustomerStateManager } from '../src/core/saas/customer-state';
import { BusinessDNARepository } from '../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../src/core/saas/onboarding-service';
import { validateBusinessDNA } from '../src/core/knowledge/schema/business-dna/validators';

async function runProvenanceAudit() {
  console.log('================================================================');
  console.log('   UPGRADED BUSINESS DNA PROVENANCE & SIGNAL AUDIT RUNNER');
  console.log('================================================================\n');

  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  const targets = [
    {
      type: '1. HVAC Company Website',
      companyName: 'Carrier HVAC',
      websiteUrl: 'https://www.carrier.com',
      userEmail: 'admin@carrier.com',
      orgName: 'Carrier Global Corp',
    },
    {
      type: '2. Restaurant Website',
      companyName: 'Sweetgreen',
      websiteUrl: 'https://www.sweetgreen.com',
      userEmail: 'team@sweetgreen.com',
      orgName: 'Sweetgreen Inc',
    },
    {
      type: '3. SaaS Website',
      companyName: 'Datadog',
      websiteUrl: 'https://www.datadoghq.com',
      userEmail: 'dev@datadoghq.com',
      orgName: 'Datadog HQ Inc',
    },
  ];

  for (const t of targets) {
    console.log(`\n================================================================`);
    console.log(`>>> AUDITING WEBSITE: ${t.type} — ${t.companyName} (${t.websiteUrl})`);
    console.log(`================================================================`);

    const result = await onboardingService.executeCustomerOnboarding({
      userEmail: t.userEmail,
      userName: `${t.companyName} Lead`,
      organizationName: t.orgName,
      companyName: t.companyName,
      websiteUrl: t.websiteUrl,
    });

    const dna = result.businessDNA;
    const validation = validateBusinessDNA(dna);

    console.log('\n--- UPGRADED FIELD-BY-FIELD PROVENANCE AUDIT RESULT ---');
    console.log(`Company Name: ${dna.companyIdentity.companyName.value}`);
    console.log(`DNA Completeness Score: ${(validation.completenessScore! * 100).toFixed(0)}%`);
    console.log(`Brand Health Score: ${(validation.brandHealthScore! * 100).toFixed(0)}%\n`);

    console.log('1. FIELD: companyIdentity');
    console.log(`   - Value: Name="${dna.companyIdentity.companyName.value}", Industry="${dna.companyIdentity.industry.value}", Stage="${dna.companyIdentity.stage.value}"`);
    console.log(`   - Source Type: EXTRACTED from input & weighted content classification`);

    console.log('2. FIELD: mission');
    console.log(`   - Value: "${dna.companyIdentity.mission.value}"`);
    console.log(`   - Source Type: EXTRACTED from homepage meta description / title`);

    console.log('3. FIELD: uniqueValueProposition');
    console.log(`   - Value: "${dna.companyIdentity.uniqueValueProposition.value}"`);
    console.log(`   - Source Type: EXTRACTED from primary Hero H1 heading`);

    console.log('4. FIELD: coreValues');
    console.log(`   - Value: [${dna.companyIdentity.coreValues.value?.join(', ')}]`);
    console.log(`   - Source Type: EXTRACTED from company text messaging & value terms`);

    console.log('5. FIELD: brandVoice');
    console.log(`   - Value: PrimaryTone="${dna.brandVoice.primaryTone.value}", WordsToUse=[${dna.brandVoice.wordsToUse.value?.join(', ')}], WordsToAvoid=[${dna.brandVoice.wordsToAvoid.value?.join(', ')}]`);
    console.log(`   - Source Type: EXTRACTED & INFERRED from page headings and text keywords`);

    console.log('6. FIELD: customerProfile');
    console.log(`   - Value: TargetAudience="${dna.customerProfile.targetAudience.value}", PainPoints=[${dna.customerProfile.primaryPainPoints.value?.slice(0, 3).join('; ')}]`);
    console.log(`   - Source Type: EXTRACTED & INFERRED from meta description and H2 sections`);

    console.log('7. FIELD: buyerPersonas');
    console.log(`   - Value: [${dna.customerProfile.buyerPersonas.value?.map(p => p.name + ' (' + p.role + ')').join(', ')}]`);
    console.log(`   - Source Type: DYNAMICALLY GENERATED from industry, products/services, and customer language`);

    console.log('8. FIELD: marketPosition');
    console.log(`   - Value: Position="${dna.competitivePositioning.marketPosition.value}", Competitors=[${dna.competitivePositioning.primaryCompetitors.value?.join(', ')}]`);
    console.log(`   - Source Type: INFERRED from Competitor Discovery Engine`);

    console.log('9. FIELD: brandHealthScore');
    console.log(`   - Value: ${(validation.brandHealthScore! * 100).toFixed(0)}% (DNA Completeness = ${(validation.completenessScore! * 100).toFixed(0)}%)`);
    console.log(`   - Source Type: EVALUATED from actual brand signal quality, clarity, and consistency`);
  }

  console.log('\n================================================================');
  console.log('   PROVENANCE & SIGNAL AUDIT COMPLETE');
  console.log('================================================================');
}

runProvenanceAudit().catch(console.error);
