import { EngineContext } from '../context';
import { CritiqueResult, CritiqueIssue } from './cognitive.types';

export class ReflectionEngine {
  /**
   * Conduct self-critique on candidate text content or process outputs.
   */
  static critiqueOutput(candidateText: string, context: EngineContext): CritiqueResult {
    const issues: CritiqueIssue[] = [];
    const dna = context.businessDNASlice;

    // 1. Check for forbidden words
    const wordsToAvoid = dna.brandVoice?.wordsToAvoid?.value ?? [];
    const lowerText = candidateText.toLowerCase();

    for (const forbidden of wordsToAvoid) {
      if (lowerText.includes(forbidden.toLowerCase())) {
        issues.push({
          ruleCategory: 'forbidden_words',
          severity: 'error',
          message: `Contains restricted word "${forbidden}".`,
          suggestedFix: `Remove or replace "${forbidden}".`,
        });
      }
    }

    // 2. Check for Unique Value Proposition inclusion (warning if missing in marketing copy)
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value;
    if (uvp && context.request.taskType === 'content_generation') {
      const uvpKeywords = uvp.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matches = uvpKeywords.filter((kw) => lowerText.includes(kw));
      if (matches.length === 0) {
        issues.push({
          ruleCategory: 'missing_uvp',
          severity: 'warning',
          message: 'Content does not clearly reference the unique value proposition.',
          suggestedFix: `Weave in reference to "${uvp}".`,
        });
      }
    }

    // 3. Check output length
    if (candidateText.trim().length === 0) {
      issues.push({
        ruleCategory: 'formatting',
        severity: 'error',
        message: 'Candidate text output is empty.',
      });
    }

    const hasErrors = issues.some((i) => i.severity === 'error');
    const qualityScore = Math.max(0, 1 - issues.length * 0.15);

    return {
      id: `crit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      passed: !hasErrors,
      qualityScore: Math.round(qualityScore * 100) / 100,
      issues,
      revisionInstructions: issues.length
        ? `Resolve ${issues.length} critique issues: ${issues.map((i) => i.message).join(' ')}`
        : undefined,
      critiquedAt: new Date().toISOString(),
    };
  }
}
