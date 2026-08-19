import { BusinessDNA } from './business-dna.types';
import { createKnowledgeField, KnowledgeField } from '../shared/metadata';
import { createTimestamps } from '../shared/timestamps';

function resolveField<T>(input: any, defaultValue: T, defaultOptions: any): KnowledgeField<T> {
  if (input && typeof input === 'object' && 'value' in input) {
    return createKnowledgeField(input.value, {
      confidence: input.confidence ?? defaultOptions.confidence ?? 0.85,
      originType: input.originType ?? defaultOptions.originType ?? 'EXTRACTED',
      source: input.source ?? defaultOptions.source ?? 'override',
      evidenceText: input.evidenceText ?? defaultOptions.evidenceText ?? null,
      reasoningSummary: input.reasoningSummary ?? defaultOptions.reasoningSummary ?? null,
      approvalStatus: input.approvalStatus ?? defaultOptions.approvalStatus ?? 'pending',
    });
  }

  // When no input is provided, tag fallbacks as GENERATED with pending approval status and moderate confidence
  const isNullDefault = defaultValue === null;
  return createKnowledgeField(defaultValue, {
    originType: isNullDefault ? 'UNKNOWN' : 'GENERATED',
    confidence: isNullDefault ? 0.0 : 0.5,
    source: isNullDefault ? 'not_found' : 'synthetic_template_fallback',
    evidenceText: isNullDefault ? null : 'Default template fallback — requires owner review',
    approvalStatus: 'pending',
  });
}

/**
 * Creates a strongly-typed BusinessDNA object with optional overrides.
 * Accepts deep partial knowledge field inputs and resolves them cleanly into strongly-typed KnowledgeField containers.
 */
export function createDefaultBusinessDNA(
  businessId: string,
  overrides?: any
): BusinessDNA {
  const ci = overrides?.companyIdentity;
  const bv = overrides?.brandVoice;
  const cp = overrides?.customerProfile;
  const comp = overrides?.competitivePositioning;
  const web = overrides?.websiteAnalysis;

  return {
    id: `dna_${businessId}_${Date.now()}`,
    businessId,
    schemaVersion: '1.0',
    confidenceScore: overrides?.confidenceScore ?? 0.9,
    timestamps: createTimestamps(),

    companyIdentity: {
      companyName: resolveField(ci?.companyName, 'Acme Corp', { originType: 'OWNER_PROVIDED', confidence: 1.0, source: 'user_input' }),
      legalName: resolveField(ci?.legalName, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      industry: resolveField(ci?.industry, 'software_technology', { originType: 'INFERRED', confidence: 0.8 }),
      stage: resolveField(ci?.stage, 'early_traction', { originType: 'INFERRED', confidence: 0.75 }),
      mission: resolveField(ci?.mission, 'To empower teams with intelligent, brand-aligned AI content creation.', { originType: 'EXTRACTED', confidence: 0.85 }),
      vision: resolveField(ci?.vision, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      coreValues: resolveField(ci?.coreValues, ['Customer First', 'Integrity & Transparency', 'Continuous Innovation'], { originType: 'EXTRACTED', confidence: 0.85 }),
      brandStory: resolveField(ci?.brandStory, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      uniqueValueProposition: resolveField(ci?.uniqueValueProposition, 'The premier brand-first AI platform.', { originType: 'EXTRACTED', confidence: 0.9 }),
    },

    brandVoice: {
      primaryTone: resolveField(bv?.primaryTone, 'authoritative', { originType: 'INFERRED', confidence: 0.8 }),
      secondaryTones: resolveField(bv?.secondaryTones, ['confident', 'approachable'], { originType: 'INFERRED', confidence: 0.7 }),
      toneDescriptors: resolveField(bv?.toneDescriptors, ['clear', 'data-driven'], { originType: 'INFERRED', confidence: 0.7 }),
      wordsToUse: resolveField(bv?.wordsToUse, ['scalable', 'reliable', 'innovative'], { originType: 'EXTRACTED', confidence: 0.85 }),
      wordsToAvoid: resolveField(bv?.wordsToAvoid, ['cheap', 'outdated', 'manual'], { originType: 'OWNER_PROVIDED', confidence: 1.0 }),
      sampleCopy: resolveField(bv?.sampleCopy, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      styleGuidelines: resolveField(bv?.styleGuidelines, null, { originType: 'UNKNOWN', confidence: 0.0 }),
    },

    customerProfile: {
      targetAudience: resolveField(cp?.targetAudience, 'Modern business decision makers and marketing leads', { originType: 'EXTRACTED', confidence: 0.85 }),
      primaryPainPoints: resolveField(cp?.primaryPainPoints, ['Inconsistent brand voice', 'Slow manual production'], { originType: 'EXTRACTED', confidence: 0.8 }),
      keyBenefits: resolveField(cp?.keyBenefits, ['10x content velocity', 'Strict brand compliance'], { originType: 'INFERRED', confidence: 0.8 }),
      demographics: resolveField(cp?.demographics, { targetCompanySize: '10-500 employees', geo: 'Global' }, { originType: 'INFERRED', confidence: 0.7 }),
      psychographics: resolveField(cp?.psychographics, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      buyerPersonas: resolveField(cp?.buyerPersonas, [], { originType: 'UNKNOWN', confidence: 0.0 }),
    },

    competitivePositioning: {
      marketPosition: resolveField(comp?.marketPosition, 'leader', { originType: 'INFERRED', confidence: 0.75 }),
      primaryCompetitors: resolveField(comp?.primaryCompetitors, ['Market Competitor A', 'Market Competitor B'], { originType: 'INFERRED', confidence: 0.8 }),
      keyDifferentiators: resolveField(comp?.keyDifferentiators, ['Deep Business DNA knowledge graph', 'Multi-agent reflection loop'], { originType: 'INFERRED', confidence: 0.8 }),
      pricingStrategy: resolveField(comp?.pricingStrategy, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      marketMoat: resolveField(comp?.marketMoat, null, { originType: 'UNKNOWN', confidence: 0.0 }),
    },

    websiteAnalysis: {
      primaryUrl: resolveField(web?.primaryUrl, 'https://example.com', { originType: 'EXTRACTED', confidence: 1.0 }),
      headerTagline: resolveField(web?.headerTagline, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      heroH1: resolveField(web?.heroH1, null, { originType: 'UNKNOWN', confidence: 0.0 }),
      mainCTAs: resolveField(web?.mainCTAs, ['Get Started', 'Contact Us'], { originType: 'EXTRACTED', confidence: 0.9 }),
      keyPages: resolveField(web?.keyPages, ['/pricing', '/about'], { originType: 'EXTRACTED', confidence: 0.9 }),
      valuePropsExtracted: resolveField(web?.valuePropsExtracted, ['Brand Consistency'], { originType: 'EXTRACTED', confidence: 0.85 }),
      colors: resolveField(web?.colors, ['#6366f1', '#a855f7'], { originType: 'EXTRACTED', confidence: 0.9 }),
      fonts: resolveField(web?.fonts, ['Inter', 'Outfit'], { originType: 'EXTRACTED', confidence: 0.9 }),
    },
  };
}
