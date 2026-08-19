// Shared confidence types and utilities
export type ConfidenceScore = {
  value: number;
  reasoningSummary?: string;
};

export type ConfidentValue<T> = {
  value: T;
  confidence: ConfidenceScore;
};

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.4,
} as const;

/**
 * Validates a numeric confidence score is within the valid range [0, 1].
 */
export function assertValidConfidence(score: number): void {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    throw new Error('Confidence score must be a finite number.');
  }
  if (score < 0 || score > 1) {
    throw new Error(`Confidence score must be between 0 and 1. Received: ${score}`);
  }
}

/**
 * Returns the confidence tier label for a given score.
 */
export function confidenceTier(score: number): 'high' | 'medium' | 'low' {
  assertValidConfidence(score);
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}
