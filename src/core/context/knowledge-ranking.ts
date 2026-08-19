import { CandidateKnowledgeItem, RankedKnowledgeItem } from './context.types';

export interface RankingWeights {
  relevance: number;  // default 0.40
  confidence: number; // default 0.25
  recency: number;    // default 0.20
  importance: number; // default 0.15
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  relevance: 0.40,
  confidence: 0.25,
  recency: 0.20,
  importance: 0.15,
};

/**
 * Knowledge Ranking Engine.
 * Evaluates and sorts candidate knowledge items across all context sources.
 */
export class KnowledgeRanker {
  /**
   * Rank a list of candidate items using multi-factor scoring.
   */
  static rankItems(
    candidates: CandidateKnowledgeItem[],
    weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
  ): RankedKnowledgeItem[] {
    const totalWeight = weights.relevance + weights.confidence + weights.recency + weights.importance;

    const ranked = candidates.map((item) => {
      const compositeScore =
        (item.relevanceScore * weights.relevance +
          item.confidenceScore * weights.confidence +
          item.recencyScore * weights.recency +
          item.importanceScore * weights.importance) /
        totalWeight;

      return {
        ...item,
        finalScore: Math.round(compositeScore * 1000) / 1000,
      };
    });

    return ranked.sort((a, b) => b.finalScore - a.finalScore);
  }
}
