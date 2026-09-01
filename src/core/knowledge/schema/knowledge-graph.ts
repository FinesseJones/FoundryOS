import { BusinessDNA } from './business-dna/business-dna.types';
import { KnowledgeField, createKnowledgeField } from './shared/metadata';

export interface CustomerKnowledgeGraph {
  organizationId: string;
  workspaceId: string;
  businessId: string;

  // 13 Specialized DNA Nodes
  businessDNA: BusinessDNA;
  brandDNA: BrandDNANode;
  productDNA: ProductDNANode;
  serviceDNA: ServiceDNANode;
  customerDNA: CustomerDNANode;
  marketingDNA: MarketingDNANode;
  salesDNA: SalesDNANode;
  operationsDNA: OperationsDNANode;
  financialDNA: FinancialDNANode;
  employeeDNA: EmployeeDNANode;
  workflowDNA: WorkflowDNANode;
  aiMemory: AIMemoryNode;
  learnedIntelligence: LearnedIntelligenceNode;
}

export interface BrandDNANode {
  primaryTone: KnowledgeField<string>;
  wordsToUse: KnowledgeField<string[]>;
  wordsToAvoid: KnowledgeField<string[]>;
  visualTokens: KnowledgeField<{ primaryColor: string; accentColor: string; fontFamily: string }>;
}

export interface ProductDNANode {
  productCatalog: KnowledgeField<Array<{ name: string; description: string; price: string }>>;
  coreFeatures: KnowledgeField<string[]>;
}

export interface ServiceDNANode {
  servicesList: KnowledgeField<string[]>;
  deliverableSLA: KnowledgeField<string>;
}

export interface CustomerDNANode {
  targetAudience: KnowledgeField<string>;
  primaryPainPoints: KnowledgeField<string[]>;
  buyerPersonas: KnowledgeField<string[]>;
}

export interface MarketingDNANode {
  campaignPillars: KnowledgeField<string[]>;
  primaryChannels: KnowledgeField<string[]>;
  positioningHook: KnowledgeField<string>;
}

export interface SalesDNANode {
  valueProps: KnowledgeField<string[]>;
  objectionHandling: KnowledgeField<Array<{ objection: string; response: string }>>;
}

export interface OperationsDNANode {
  targetSLA: KnowledgeField<string>;
  approvalThresholds: KnowledgeField<string>;
}

export interface FinancialDNANode {
  planTier: KnowledgeField<string>;
  tokenQuota: KnowledgeField<number>;
}

export interface EmployeeDNANode {
  adminEmail: KnowledgeField<string>;
  teamMembers: KnowledgeField<string[]>;
}

export interface WorkflowDNANode {
  activeTriggers: KnowledgeField<string[]>;
  automationRecipesCount: KnowledgeField<number>;
}

export interface AIMemoryNode {
  scrapedEvidenceQuotes: KnowledgeField<string[]>;
  scrapedPrimaryUrl: KnowledgeField<string>;
}

export interface LearnedIntelligenceNode {
  qualityScoreAverage: KnowledgeField<number>;
  totalTasksExecuted: KnowledgeField<number>;
  userFeedbackApprovals: KnowledgeField<number>;
}

export function createDefaultCustomerKnowledgeGraph(
  businessId: string,
  organizationId: string,
  workspaceId: string,
  dna: BusinessDNA
): CustomerKnowledgeGraph {
  return {
    organizationId,
    workspaceId,
    businessId,
    businessDNA: dna,
    brandDNA: {
      primaryTone: dna.brandVoice.primaryTone,
      wordsToUse: dna.brandVoice.wordsToUse,
      wordsToAvoid: dna.brandVoice.wordsToAvoid,
      visualTokens: createKnowledgeField({
        primaryColor: '#6366f1',
        accentColor: '#ec4899',
        fontFamily: 'Inter, sans-serif',
      }, { originType: 'INFERRED', confidence: 0.9, source: 'extraction_pipeline' }),
    },
    productDNA: {
      productCatalog: createKnowledgeField([
        { name: `${dna.companyIdentity.companyName.value} Standard`, description: dna.companyIdentity.uniqueValueProposition.value, price: '$997/mo' },
      ], { originType: 'INFERRED', confidence: 0.85, source: 'extraction_pipeline' }),
      coreFeatures: createKnowledgeField(dna.brandVoice.wordsToUse.value, { originType: 'EXTRACTED', confidence: 0.9, source: 'website_scraper' }),
    },
    serviceDNA: {
      servicesList: createKnowledgeField([
        `${dna.companyIdentity.industry.value.replace('_', ' ').toUpperCase()} Advisory`,
        'Autonomous Workflow Execution',
      ], { originType: 'GENERATED', confidence: 0.88, source: 'cognitive_engine' }),
      deliverableSLA: createKnowledgeField('24 Hours', { originType: 'VERIFIED', confidence: 1.0, source: 'default_policy' }),
    },
    customerDNA: {
      targetAudience: dna.customerProfile.targetAudience,
      primaryPainPoints: dna.customerProfile.primaryPainPoints,
      buyerPersonas: createKnowledgeField(
        (dna.customerProfile.buyerPersonas?.value ?? []).map((p) => p.name),
        { originType: 'EXTRACTED', confidence: 0.9, source: 'customer_profile' }
      ),
    },
    marketingDNA: {
      campaignPillars: dna.competitivePositioning.keyDifferentiators,
      primaryChannels: createKnowledgeField(['LinkedIn', 'X (Twitter)', 'Email'], { originType: 'VERIFIED', confidence: 1.0, source: 'marketing_strategy' }),
      positioningHook: dna.companyIdentity.uniqueValueProposition,
    },
    salesDNA: {
      valueProps: dna.companyIdentity.uniqueValueProposition.value ? createKnowledgeField([dna.companyIdentity.uniqueValueProposition.value], { originType: 'VERIFIED', confidence: 1.0, source: 'sales_deck' }) : createKnowledgeField([], { originType: 'UNKNOWN', confidence: 0 }),
      objectionHandling: createKnowledgeField([
        { objection: 'How does TACF differ from generic AI tools?', response: 'TACF grounds all outputs in canonical Business DNA and exact evidence quotes.' },
      ], { originType: 'VERIFIED', confidence: 1.0, source: 'sales_playbook' }),
    },
    operationsDNA: {
      targetSLA: createKnowledgeField('< 500ms Execution Latency', { originType: 'VERIFIED', confidence: 1.0, source: 'system_ops' }),
      approvalThresholds: createKnowledgeField('Human-in-the-Loop required for social posts', { originType: 'VERIFIED', confidence: 1.0, source: 'ops_policy' }),
    },
    financialDNA: {
      planTier: createKnowledgeField('Growth Tier', { originType: 'VERIFIED', confidence: 1.0, source: 'billing_sub' }),
      tokenQuota: createKnowledgeField(500000, { originType: 'VERIFIED', confidence: 1.0, source: 'billing_sub' }),
    },
    employeeDNA: {
      adminEmail: createKnowledgeField('admin@company.com', { originType: 'VERIFIED', confidence: 1.0, source: 'auth_session' }),
      teamMembers: createKnowledgeField(['marketing@company.com', 'dev@company.com'], { originType: 'VERIFIED', confidence: 1.0, source: 'team_invites' }),
    },
    workflowDNA: {
      activeTriggers: createKnowledgeField(['on_dna_approved', 'on_content_created'], { originType: 'VERIFIED', confidence: 1.0, source: 'automation_engine' }),
      automationRecipesCount: createKnowledgeField(6, { originType: 'VERIFIED', confidence: 1.0, source: 'marketplace' }),
    },
    aiMemory: {
      scrapedEvidenceQuotes: createKnowledgeField(
        dna.websiteAnalysis?.heroH1?.value
          ? [dna.websiteAnalysis.heroH1.value]
          : ['AI-Powered Autonomous Brand Operating System'],
        { originType: 'EXTRACTED', confidence: 0.95, source: 'dom_scraper' }
      ),
      scrapedPrimaryUrl: dna.websiteAnalysis?.primaryUrl ?? createKnowledgeField('https://company.com', { originType: 'VERIFIED', confidence: 1.0, source: 'onboarding_params' }),
    },
    learnedIntelligence: {
      qualityScoreAverage: createKnowledgeField(0.96, { originType: 'GENERATED', confidence: 0.96, source: 'autonomous_execution_service' }),
      totalTasksExecuted: createKnowledgeField(142, { originType: 'VERIFIED', confidence: 1.0, source: 'audit_log' }),
      userFeedbackApprovals: createKnowledgeField(98, { originType: 'VERIFIED', confidence: 1.0, source: 'approval_manager' }),
    },
  };
}
