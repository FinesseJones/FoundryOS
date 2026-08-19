import { KnowledgeField } from '../shared/metadata';
import { Timestamps } from '../shared/timestamps';
import { CompanyStage, IndustryCategory, VoiceTone, MarketPosition } from './enums';

/**
 * Core Company Identity attributes wrapped in KnowledgeField<T> containers.
 */
export interface CompanyIdentity {
  companyName: KnowledgeField<string>;
  legalName?: KnowledgeField<string | null>;
  industry: KnowledgeField<IndustryCategory | string>;
  stage: KnowledgeField<CompanyStage>;
  mission: KnowledgeField<string>;
  vision?: KnowledgeField<string | null>;
  coreValues: KnowledgeField<string[]>;
  brandStory?: KnowledgeField<string | null>;
  uniqueValueProposition: KnowledgeField<string>;
}

/**
 * Brand Voice & Style Attributes.
 */
export interface BrandVoiceProfile {
  primaryTone: KnowledgeField<VoiceTone | string>;
  secondaryTones: KnowledgeField<string[]>;
  toneDescriptors: KnowledgeField<string[]>;
  wordsToUse: KnowledgeField<string[]>;
  wordsToAvoid: KnowledgeField<string[]>;
  sampleCopy?: KnowledgeField<string[] | null>;
  styleGuidelines?: KnowledgeField<string | null>;
}

export interface BuyerPersona {
  id?: string;
  name: string;
  role: string;
  demographics?: string;
  psychographics?: string;
  goals: string[];
  challenges: string[];
  buyingTriggers?: string[];
  preferredChannels?: string[];
}

/**
 * Ideal Customer Profile & Audience Attributes.
 */
export interface IdealCustomerProfile {
  targetAudience: KnowledgeField<string>;
  primaryPainPoints: KnowledgeField<string[]>;
  keyBenefits: KnowledgeField<string[]>;
  demographics: KnowledgeField<Record<string, unknown>>;
  psychographics?: KnowledgeField<Record<string, unknown> | null>;
  buyerPersonas: KnowledgeField<BuyerPersona[]>;
}

/**
 * Competitive Positioning & Market Landscape.
 */
export interface CompetitivePositioning {
  marketPosition: KnowledgeField<MarketPosition | string>;
  primaryCompetitors: KnowledgeField<string[]>;
  keyDifferentiators: KnowledgeField<string[]>;
  pricingStrategy?: KnowledgeField<string | null>;
  marketMoat?: KnowledgeField<string | null>;
}

/**
 * Ingested / Analyzed Website Signals.
 */
export interface WebsiteAnalysis {
  primaryUrl: KnowledgeField<string>;
  headerTagline?: KnowledgeField<string | null>;
  heroH1?: KnowledgeField<string | null>;
  mainCTAs: KnowledgeField<string[]>;
  keyPages: KnowledgeField<string[]>;
  valuePropsExtracted: KnowledgeField<string[]>;
  colors?: KnowledgeField<string[] | null>;
  fonts?: KnowledgeField<string[] | null>;
}

/**
 * Root Business DNA Object.
 *
 * Combines domain-specific metadata with sub-domain component trees.
 */
export interface BusinessDNA {
  id: string;
  businessId: string;
  schemaVersion: string; // e.g. "1.0"
  confidenceScore: number; // aggregate confidence score (0.0 to 1.0)
  timestamps: Timestamps;

  companyIdentity: CompanyIdentity;
  brandVoice: BrandVoiceProfile;
  customerProfile: IdealCustomerProfile;
  competitivePositioning: CompetitivePositioning;
  websiteAnalysis?: WebsiteAnalysis | null;
}
