import { EngineContext } from '../context';
import { ReasoningTrace, CritiqueResult, Recommendation } from './cognitive.types';

export class RecommendationEngine {
  /**
   * Generates strategic recommendations based on context, reasoning traces, and critique findings.
   */
  static generateRecommendations(
    context: EngineContext,
    reasoning: ReasoningTrace,
    critique: CritiqueResult
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const dna = context.businessDNASlice;

    // 1. Voice tone refinement recommendation
    if (dna.brandVoice?.wordsToAvoid?.value?.length) {
      recommendations.push({
        id: `rec_voice_${Date.now()}`,
        category: 'brand_voice',
        title: 'Enforce Restrictive Vocabulary Rules',
        description: `Ensure all campaign generators strictly filter out ${dna.brandVoice.wordsToAvoid.value.length} words to avoid.`,
        expectedImpact: 'high',
        actionableSteps: [
          'Update AI prompt pre-filters with forbidden word lists.',
          'Run automated reflection checks prior to publishing.',
        ],
        confidence: 0.9,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Content Strategy recommendation if memories/activities are sparse
    if (context.recentActivities.length === 0) {
      recommendations.push({
        id: `rec_activity_${Date.now()}`,
        category: 'content_strategy',
        title: 'Establish Publishing Baseline',
        description: 'No recent publishing activity detected. Log generated assets into recent activity store to maintain temporal context.',
        expectedImpact: 'medium',
        actionableSteps: [
          'Publish at least 3 posts this week.',
          'Track engagement metrics per channel.',
        ],
        confidence: 0.85,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Critique-driven recommendation
    if (!critique.passed && critique.issues.length > 0) {
      recommendations.push({
        id: `rec_critique_${Date.now()}`,
        category: 'workflow',
        title: 'Resolve Automated Critique Issues',
        description: critique.revisionInstructions ?? 'Address identified critique violations before final output approval.',
        expectedImpact: 'high',
        actionableSteps: critique.issues.map((i) => i.suggestedFix ?? i.message),
        confidence: 0.95,
        createdAt: new Date().toISOString(),
      });
    }

    return recommendations;
  }
}
