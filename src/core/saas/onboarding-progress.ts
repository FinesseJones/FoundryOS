import { CustomerLifecycleState } from './customer-state';

export interface OnboardingChecklistItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface OnboardingProgressSummary {
  organizationId: string;
  currentState: CustomerLifecycleState;
  completionPercent: number;
  checklist: OnboardingChecklistItem[];
  nextActionRecommendation: string;
}

export class OnboardingProgressTracker {
  getProgressSummary(
    organizationId: string,
    currentState: CustomerLifecycleState,
    dnaApproved: boolean = false,
    campaignsCount: number = 0
  ): OnboardingProgressSummary {
    const isStep1Done = true;
    const isStep2Done = currentState === 'DNA_BUILDING' || currentState === 'ACTIVE';
    const isStep3Done = dnaApproved || currentState === 'ACTIVE';
    const isStep4Done = campaignsCount > 0;

    const checklist: OnboardingChecklistItem[] = [
      {
        id: 'step_1_org_details',
        stepNumber: 1,
        title: 'Company & Website Setup',
        description: 'Provide organization name and website URL for crawler ingestion.',
        isCompleted: isStep1Done,
      },
      {
        id: 'step_2_signal_extraction',
        stepNumber: 2,
        title: 'Business DNA Extraction',
        description: 'Extract OpenGraph, typography, colors, and content signals from site.',
        isCompleted: isStep2Done,
      },
      {
        id: 'step_3_dna_approval',
        stepNumber: 3,
        title: 'Review & Approve Business DNA',
        description: 'Audit brand voice guidelines, UVP, and target customer personas.',
        isCompleted: isStep3Done,
      },
      {
        id: 'step_4_launch_campaign',
        stepNumber: 4,
        title: 'Launch First Content Campaign',
        description: 'Deploy multi-agent collaboration loop for brand-first social copy.',
        isCompleted: isStep4Done,
      },
    ];

    const completedCount = checklist.filter((item) => item.isCompleted).length;
    const completionPercent = Math.round((completedCount / checklist.length) * 100);

    let nextActionRecommendation = 'Complete company registration and website details.';
    if (!isStep3Done) {
      nextActionRecommendation = 'Review and approve your extracted Business DNA profile in the DNA Profile view.';
    } else if (!isStep4Done) {
      nextActionRecommendation = 'Launch your first content campaign using the Campaign Workbench.';
    } else {
      nextActionRecommendation = 'Your workspace is fully active! Monitor content velocity and AI recommendations.';
    }

    return {
      organizationId,
      currentState,
      completionPercent,
      checklist,
      nextActionRecommendation,
    };
  }
}
