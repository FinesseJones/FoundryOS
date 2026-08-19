import { executeCustomerOnboardingApi } from '../src/core/saas/onboarding-api';

async function testRealUrlOnboarding() {
  console.log('🚀 Running manual onboarding test with real URL: https://www.datadoghq.com ...');

  const result = await executeCustomerOnboardingApi({
    userEmail: 'manual_tester@datadoghq.com',
    userName: 'Datadog Ops Lead',
    organizationName: 'Datadog Inc',
    companyName: 'Datadog',
    websiteUrl: 'https://www.datadoghq.com',
  });

  console.log('✅ Onboarding completed!');
  console.log('  - Organization ID:', result.session.organizationId);
  console.log('  - Business ID:', result.businessDNA.businessId);
  console.log('  - Company Name:', result.businessDNA.companyIdentity.companyName.value);
  console.log('  - Industry (Inferred):', result.businessDNA.companyIdentity.industry?.value, 'Conf:', result.businessDNA.companyIdentity.industry?.confidence);
  console.log('  - Mission (Extracted):', result.businessDNA.companyIdentity.mission?.value?.substring(0, 70));
  console.log('  - UVP (Extracted):', result.businessDNA.companyIdentity.uniqueValueProposition?.value?.substring(0, 70));
  console.log('  - Primary Tone:', result.businessDNA.brandVoice.primaryTone?.value);
  console.log('  - Colors Extracted:', result.businessDNA.websiteAnalysis?.colors?.value?.length);

  // Check provenance tracking
  console.log('  - Mission Provenance:', {
    originType: result.businessDNA.companyIdentity.mission?.originType,
    confidence: result.businessDNA.companyIdentity.mission?.confidence,
    source: result.businessDNA.companyIdentity.mission?.source,
  });
}

testRealUrlOnboarding().catch(console.error);
