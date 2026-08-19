import { SaaSAuthManager } from '../src/core/saas/auth';
import { SaaSBillingManager } from '../src/core/saas/billing';
import { CustomerStateManager } from '../src/core/saas/customer-state';
import { BusinessDNARepository } from '../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../src/core/saas/onboarding-service';
import { ExtractionPipeline } from '../src/core/ingestion/extraction-pipeline';

async function runAudit() {
  console.log('=== STARTING BUSINESS DNA GENERATION PIPELINE AUDIT ===\n');

  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  const testBusinesses = [
    {
      companyName: 'Stripe Inc.',
      websiteUrl: 'https://stripe.com',
      userEmail: 'finance@stripe.com',
      organizationName: 'Stripe Global Org',
    },
    {
      companyName: 'Shopify Corp.',
      websiteUrl: 'https://shopify.com',
      userEmail: 'merchant@shopify.com',
      organizationName: 'Shopify Stores Org',
    },
    {
      companyName: 'HubSpot Inc.',
      websiteUrl: 'https://hubspot.com',
      userEmail: 'growth@hubspot.com',
      organizationName: 'HubSpot Marketing Org',
    },
  ];

  for (const biz of testBusinesses) {
    console.log(`\n=============================================================`);
    console.log(`>>> AUDITING ONBOARDING FLOW FOR: ${biz.companyName} (${biz.websiteUrl})`);
    console.log(`=============================================================`);

    const result = await onboardingService.executeCustomerOnboarding({
      userEmail: biz.userEmail,
      userName: `${biz.companyName} Admin`,
      organizationName: biz.organizationName,
      companyName: biz.companyName,
      websiteUrl: biz.websiteUrl,
    });

    console.log(`SUMMARY RESULT FOR ${biz.companyName}:`);
    console.log(`- Final Company Name: "${result.businessDNA.companyIdentity.companyName.value}"`);
    console.log(`- Final Industry: "${result.businessDNA.companyIdentity.industry.value}"`);
    console.log(`- Final Mission: "${result.businessDNA.companyIdentity.mission.value}"`);
    console.log(`- Final UVP: "${result.businessDNA.companyIdentity.uniqueValueProposition.value}"`);
    console.log(`- Final Primary Tone: "${result.businessDNA.brandVoice.primaryTone.value}"`);
    console.log(`- Final Target Audience: "${result.businessDNA.customerProfile.targetAudience.value}"`);
    console.log(`- Final Competitors: [${result.businessDNA.competitivePositioning.primaryCompetitors.value?.join(', ')}]`);
    console.log(`- Final Website Colors: [${result.businessDNA.websiteAnalysis?.colors?.value?.join(', ')}]`);
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit().catch(console.error);
