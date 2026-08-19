import { BusinessDNA } from '../knowledge';
import { ContextTaskType } from './context.types';

export interface BusinessDNARetrievalOptions {
  taskType: ContextTaskType;
  minConfidenceThreshold?: number; // default 0.4
}

/**
 * Task-tailored Business DNA Retriever.
 * Extracts only relevant domain slices based on task type and filters out low confidence fields.
 */
export class BusinessDNARetriever {
  /**
   * Filter and slice BusinessDNA for prompt context inclusion.
   */
  static retrieveSlice(
    dna: BusinessDNA,
    options: BusinessDNARetrievalOptions
  ): Partial<BusinessDNA> {
    const minConfidence = options.minConfidenceThreshold ?? 0.4;

    // Filter fields by confidence
    const companyIdentity = {
      companyName: dna.companyIdentity.companyName.confidence >= minConfidence ? dna.companyIdentity.companyName : undefined,
      legalName: dna.companyIdentity.legalName?.confidence && dna.companyIdentity.legalName.confidence >= minConfidence ? dna.companyIdentity.legalName : undefined,
      industry: dna.companyIdentity.industry.confidence >= minConfidence ? dna.companyIdentity.industry : undefined,
      stage: dna.companyIdentity.stage.confidence >= minConfidence ? dna.companyIdentity.stage : undefined,
      mission: dna.companyIdentity.mission.confidence >= minConfidence ? dna.companyIdentity.mission : undefined,
      vision: dna.companyIdentity.vision?.confidence && dna.companyIdentity.vision.confidence >= minConfidence ? dna.companyIdentity.vision : undefined,
      coreValues: dna.companyIdentity.coreValues.confidence >= minConfidence ? dna.companyIdentity.coreValues : undefined,
      brandStory: dna.companyIdentity.brandStory?.confidence && dna.companyIdentity.brandStory.confidence >= minConfidence ? dna.companyIdentity.brandStory : undefined,
      uniqueValueProposition: dna.companyIdentity.uniqueValueProposition.confidence >= minConfidence ? dna.companyIdentity.uniqueValueProposition : undefined,
    };

    const brandVoice = {
      primaryTone: dna.brandVoice.primaryTone.confidence >= minConfidence ? dna.brandVoice.primaryTone : undefined,
      secondaryTones: dna.brandVoice.secondaryTones.confidence >= minConfidence ? dna.brandVoice.secondaryTones : undefined,
      toneDescriptors: dna.brandVoice.toneDescriptors.confidence >= minConfidence ? dna.brandVoice.toneDescriptors : undefined,
      wordsToUse: dna.brandVoice.wordsToUse.confidence >= minConfidence ? dna.brandVoice.wordsToUse : undefined,
      wordsToAvoid: dna.brandVoice.wordsToAvoid.confidence >= minConfidence ? dna.brandVoice.wordsToAvoid : undefined,
      sampleCopy: dna.brandVoice.sampleCopy?.confidence && dna.brandVoice.sampleCopy.confidence >= minConfidence ? dna.brandVoice.sampleCopy : undefined,
      styleGuidelines: dna.brandVoice.styleGuidelines?.confidence && dna.brandVoice.styleGuidelines.confidence >= minConfidence ? dna.brandVoice.styleGuidelines : undefined,
    };

    const customerProfile = dna.customerProfile;
    const competitivePositioning = dna.competitivePositioning;
    const websiteAnalysis = dna.websiteAnalysis;

    // Select domain focus based on taskType
    switch (options.taskType) {
      case 'content_generation':
      case 'voice_audit':
        return {
          id: dna.id,
          businessId: dna.businessId,
          companyIdentity: companyIdentity as any,
          brandVoice: brandVoice as any,
          customerProfile,
        };

      case 'competitive_strategy':
      case 'brand_analysis':
        return {
          id: dna.id,
          businessId: dna.businessId,
          companyIdentity: companyIdentity as any,
          competitivePositioning,
          websiteAnalysis,
        };

      case 'campaign_planning':
      case 'customer_response':
      default:
        return {
          id: dna.id,
          businessId: dna.businessId,
          companyIdentity: companyIdentity as any,
          brandVoice: brandVoice as any,
          customerProfile,
          competitivePositioning,
        };
    }
  }

  /**
   * Format Business DNA slice into a clean markdown string for LLM system context.
   */
  static formatForPrompt(dnaSlice: Partial<BusinessDNA>): string {
    const lines: string[] = ['### Business DNA Context'];

    if (dnaSlice.companyIdentity) {
      const ci = dnaSlice.companyIdentity;
      if (ci.companyName?.value) lines.push(`- **Brand Name**: ${ci.companyName.value}`);
      if (ci.industry?.value) lines.push(`- **Industry**: ${ci.industry.value}`);
      if (ci.stage?.value) lines.push(`- **Company Stage**: ${ci.stage.value}`);
      if (ci.mission?.value) lines.push(`- **Mission**: ${ci.mission.value}`);
      if (ci.uniqueValueProposition?.value) lines.push(`- **Value Proposition**: ${ci.uniqueValueProposition.value}`);
      if (ci.coreValues?.value?.length) lines.push(`- **Core Values**: ${ci.coreValues.value.join(', ')}`);
    }

    if (dnaSlice.brandVoice) {
      const bv = dnaSlice.brandVoice;
      if (bv.primaryTone?.value) lines.push(`- **Primary Tone**: ${bv.primaryTone.value}`);
      if (bv.secondaryTones?.value?.length) lines.push(`- **Secondary Tones**: ${bv.secondaryTones.value.join(', ')}`);
      if (bv.wordsToUse?.value?.length) lines.push(`- **Keywords to Emphasize**: ${bv.wordsToUse.value.join(', ')}`);
      if (bv.wordsToAvoid?.value?.length) lines.push(`- **Words to Avoid**: ${bv.wordsToAvoid.value.join(', ')}`);
    }

    if (dnaSlice.customerProfile) {
      const cp = dnaSlice.customerProfile;
      if (cp.targetAudience?.value) lines.push(`- **Target Audience**: ${cp.targetAudience.value}`);
      if (cp.primaryPainPoints?.value?.length) lines.push(`- **Customer Pain Points**: ${cp.primaryPainPoints.value.join('; ')}`);
      if (cp.keyBenefits?.value?.length) lines.push(`- **Key Benefits Offered**: ${cp.keyBenefits.value.join('; ')}`);
    }

    if (dnaSlice.competitivePositioning) {
      const cmp = dnaSlice.competitivePositioning;
      if (cmp.marketPosition?.value) lines.push(`- **Market Position**: ${cmp.marketPosition.value}`);
      if (cmp.keyDifferentiators?.value?.length) lines.push(`- **Key Differentiators**: ${cmp.keyDifferentiators.value.join('; ')}`);
    }

    return lines.join('\n');
  }
}
