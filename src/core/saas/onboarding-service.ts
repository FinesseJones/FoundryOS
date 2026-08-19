import { SaaSAuthManager, UserSession, UserRole } from './auth';
import { SaaSBillingManager, PlanTier, SubscriptionStatus } from './billing';
import { CustomerStateManager, CustomerStateRecord } from './customer-state';
import { BusinessDNARepository } from '../persistence/repositories';
import { createDefaultBusinessDNA, BusinessDNA } from '../knowledge';
import { ExtractionPipeline } from '../ingestion/extraction-pipeline';

export interface OnboardingParams {
  userEmail: string;
  userName: string;
  userRole?: UserRole;
  organizationName: string;
  planTier?: PlanTier;
  companyName: string;
  websiteUrl: string;
}

export interface OnboardingResult {
  session: UserSession;
  subscription: SubscriptionStatus;
  customerState: CustomerStateRecord;
  businessDNA: BusinessDNA;
  workspaceId: string;
  workspaceName: string;
}

export class CustomerOnboardingService {
  constructor(
    private authManager: SaaSAuthManager,
    private billingManager: SaaSBillingManager,
    private stateManager: CustomerStateManager,
    private dnaRepo: BusinessDNARepository
  ) {}

  async executeCustomerOnboarding(params: OnboardingParams): Promise<OnboardingResult> {
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const workspaceName = `${params.companyName} Workspace`;
    const businessId = `biz_${workspaceId}`;

    // 1. User Signup & Session Creation
    const session = this.authManager.createSession({
      userId: `user_${Date.now()}`,
      email: params.userEmail,
      name: params.userName,
      role: params.userRole ?? 'ADMIN',
      organizationId,
      organizationName: params.organizationName,
    });

    // 2. Organization Creation & Subscription Initialization
    const subscription = this.billingManager.initializeSubscription(organizationId, params.planTier ?? 'growth');

    // 3. Customer Lifecycle State Initialization (ONBOARDING step 1)
    this.stateManager.initializeState(organizationId, 'ONBOARDING');
    this.stateManager.updateState(organizationId, {
      businessId,
      onboardingStep: 2,
      dnaCompletionPercent: 20,
    });

    // 4. Business DNA Initialization with Tenant Scoping
    const initialDNA = createDefaultBusinessDNA(businessId, {
      companyIdentity: {
        companyName: { value: params.companyName },
      },
    });

    const savedDNA = await this.dnaRepo.saveDNA(initialDNA, organizationId, `user/${session.email}`);

    // 5. Website Extraction & Signal Analysis (State -> DNA_BUILDING)
    this.stateManager.updateState(organizationId, {
      state: 'DNA_BUILDING',
      onboardingStep: 3,
      dnaCompletionPercent: 60,
    });

    const extractionPipeline = new ExtractionPipeline();
    const extractedData = await extractionPipeline.runPipeline(params.websiteUrl, params.companyName);

    // Merge extracted signals into Business DNA across all sections
    const extracted = extractedData.businessDNA;
    savedDNA.companyIdentity = {
      ...savedDNA.companyIdentity,
      ...extracted.companyIdentity,
      companyName: savedDNA.companyIdentity.companyName, // preserve explicit company name from onboarding params
    };
    savedDNA.brandVoice = {
      ...savedDNA.brandVoice,
      ...extracted.brandVoice,
    };
    savedDNA.customerProfile = {
      ...savedDNA.customerProfile,
      ...extracted.customerProfile,
    };
    savedDNA.competitivePositioning = {
      ...savedDNA.competitivePositioning,
      ...extracted.competitivePositioning,
    };
    if (extracted.websiteAnalysis && savedDNA.websiteAnalysis) {
      savedDNA.websiteAnalysis = {
        ...savedDNA.websiteAnalysis,
        ...extracted.websiteAnalysis,
        primaryUrl: extracted.websiteAnalysis.primaryUrl || savedDNA.websiteAnalysis.primaryUrl,
        mainCTAs: extracted.websiteAnalysis.mainCTAs || savedDNA.websiteAnalysis.mainCTAs,
        keyPages: extracted.websiteAnalysis.keyPages || savedDNA.websiteAnalysis.keyPages,
        valuePropsExtracted: extracted.websiteAnalysis.valuePropsExtracted || savedDNA.websiteAnalysis.valuePropsExtracted,
      };
    } else if (extracted.websiteAnalysis) {
      savedDNA.websiteAnalysis = extracted.websiteAnalysis;
    }

    console.log('\n========================================');
    console.log('[CustomerOnboardingService DNA Output] Final Saved DNA for:', params.companyName);
    console.log('  - Company Name:', savedDNA.companyIdentity.companyName.value);
    console.log('  - Industry:', savedDNA.companyIdentity.industry.value);
    console.log('  - Mission:', savedDNA.companyIdentity.mission.value);
    console.log('  - UVP:', savedDNA.companyIdentity.uniqueValueProposition.value);
    console.log('  - Primary Tone:', savedDNA.brandVoice.primaryTone.value);
    console.log('  - Words To Use:', savedDNA.brandVoice.wordsToUse.value);
    console.log('  - Target Audience:', savedDNA.customerProfile.targetAudience.value);
    console.log('  - Primary Competitors:', savedDNA.competitivePositioning.primaryCompetitors.value);
    console.log('  - Website Analysis Primary URL:', savedDNA.websiteAnalysis?.primaryUrl?.value);
    console.log('========================================\n');

    await this.dnaRepo.saveDNA(savedDNA, organizationId, `system/extraction-pipeline`);

    // 6. Complete Onboarding -> Transition to ACTIVE State
    const finalState = this.stateManager.updateState(organizationId, {
      state: 'ACTIVE',
      onboardingStep: 4,
      dnaCompletionPercent: 94,
    });

    return {
      session,
      subscription,
      customerState: finalState,
      businessDNA: savedDNA,
      workspaceId,
      workspaceName,
    };
  }
}
