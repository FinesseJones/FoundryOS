import { BUSINESS_DNA_SCHEMA } from './business-dna.schema';
import { BusinessDNA } from './business-dna.types';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  completenessScore?: number;
  brandHealthScore?: number;
  data?: BusinessDNA;
}

/**
 * Computes the DNA Completeness Score (0.0 to 1.0)
 * Evaluates the proportion of non-null, non-empty fields in the Business DNA structure.
 */
export function calculateDNACompletenessScore(dna: BusinessDNA): number {
  let totalFields = 0;
  let populatedFields = 0;

  const checkField = (field: any) => {
    totalFields++;
    if (field && field.value !== null && field.value !== undefined) {
      if (Array.isArray(field.value) && field.value.length > 0) populatedFields++;
      else if (typeof field.value === 'string' && field.value.trim().length > 0) populatedFields++;
      else if (typeof field.value === 'object' && Object.keys(field.value).length > 0) populatedFields++;
    }
  };

  checkField(dna.companyIdentity.companyName);
  checkField(dna.companyIdentity.industry);
  checkField(dna.companyIdentity.mission);
  checkField(dna.companyIdentity.uniqueValueProposition);
  checkField(dna.companyIdentity.coreValues);
  checkField(dna.brandVoice.primaryTone);
  checkField(dna.brandVoice.wordsToUse);
  checkField(dna.customerProfile.targetAudience);
  checkField(dna.customerProfile.primaryPainPoints);
  checkField(dna.customerProfile.buyerPersonas);
  checkField(dna.competitivePositioning.marketPosition);
  checkField(dna.competitivePositioning.primaryCompetitors);

  return Number((populatedFields / Math.max(1, totalFields)).toFixed(2));
}

/**
 * Computes the Brand Health Score (0.0 to 1.0)
 * Evaluates actual brand signal quality, clarity, and consistency rather than simple field count.
 */
export function calculateBrandHealthScore(dna: BusinessDNA): number {
  let score = 0;

  // 1. Mission presence & depth (+0.20)
  const missionText = dna.companyIdentity.mission?.value || '';
  if (missionText.length > 15 && !missionText.includes('Acme Corp')) {
    score += 0.20;
  } else if (missionText.length > 0) {
    score += 0.10;
  }

  // 2. Unique Value Proposition clarity (+0.20)
  const uvpText = dna.companyIdentity.uniqueValueProposition?.value || '';
  if (uvpText.length > 10 && !uvpText.includes('canonical Business DNA')) {
    score += 0.20;
  } else if (uvpText.length > 0) {
    score += 0.10;
  }

  // 3. Extracted Brand Color & Visual Identity cohesion (+0.15)
  const colors = dna.websiteAnalysis?.colors?.value || [];
  if (colors.length >= 2 && colors[0] !== '#6366f1') {
    score += 0.15;
  } else if (colors.length > 0) {
    score += 0.08;
  }

  // 4. Core Values depth (+0.15)
  const coreValues = dna.companyIdentity.coreValues?.value || [];
  if (coreValues.length >= 2 && !coreValues.includes('Modern Glassmorphic')) {
    score += 0.15;
  } else if (coreValues.length > 0) {
    score += 0.08;
  }

  // 5. Buyer Personas specificity (+0.15)
  const personas = dna.customerProfile.buyerPersonas?.value || [];
  if (personas.length >= 2 && !personas[0]?.name?.includes('Marketing Mary')) {
    score += 0.15;
  } else if (personas.length > 0) {
    score += 0.08;
  }

  // 6. Competitive Differentiation (+0.15)
  const competitors = dna.competitivePositioning.primaryCompetitors?.value || [];
  if (competitors.length >= 2 && !competitors.includes('Jasper')) {
    score += 0.15;
  } else if (competitors.length > 0) {
    score += 0.08;
  }

  return Number(Math.min(1.0, score).toFixed(2));
}

/**
 * Perform schema parsing and domain cross-field validation on BusinessDNA input.
 */
export function validateBusinessDNA(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Zod structural validation
  const parseResult = BUSINESS_DNA_SCHEMA.safeParse(input);
  if (!parseResult.success) {
    for (const error of parseResult.error.issues) {
      issues.push({
        field: error.path.join('.'),
        message: error.message,
        severity: 'error',
      });
    }
    return { valid: false, issues };
  }

  const dna = parseResult.data as BusinessDNA;

  // 2. Cross-field validation: Brand Voice consistency
  const primaryTone = dna.brandVoice.primaryTone.value.toLowerCase();
  const wordsToAvoid = dna.brandVoice.wordsToAvoid.value.map((w: string) => w.toLowerCase());
  if (wordsToAvoid.includes(primaryTone)) {
    issues.push({
      field: 'brandVoice.primaryTone',
      message: `Primary tone "${dna.brandVoice.primaryTone.value}" is listed in wordsToAvoid`,
      severity: 'error',
    });
  }

  // 3. Cross-field validation: Core Values count
  if (dna.companyIdentity.coreValues.value.length === 0) {
    issues.push({
      field: 'companyIdentity.coreValues',
      message: 'At least one core value should be specified for brand consistency',
      severity: 'warning',
    });
  }

  // 4. Cross-field validation: Buyer Personas completeness
  if (dna.customerProfile.buyerPersonas.value.length === 0) {
    issues.push({
      field: 'customerProfile.buyerPersonas',
      message: 'No buyer personas defined in Ideal Customer Profile',
      severity: 'warning',
    });
  }

  // 5. Cross-field validation: Overall confidence calculation sanity check
  if (dna.confidenceScore < 0 || dna.confidenceScore > 1) {
    issues.push({
      field: 'confidenceScore',
      message: 'Aggregate confidence score must be between 0.0 and 1.0',
      severity: 'error',
    });
  }

  const hasErrors = issues.some((i: ValidationIssue) => i.severity === 'error');
  return {
    valid: !hasErrors,
    issues,
    completenessScore: calculateDNACompletenessScore(dna),
    brandHealthScore: calculateBrandHealthScore(dna),
    data: dna,
  };
}
