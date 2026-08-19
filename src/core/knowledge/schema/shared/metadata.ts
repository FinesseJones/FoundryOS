import { z } from 'zod';
import { ConfidenceScore } from './confidence';

/**
 * Universal Approval Status across all knowledge domains.
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected']);

/**
 * Strict Field Lineage & Origin Classification.
 * - VERIFIED: Factually verified by third-party database or audit.
 * - OWNER_PROVIDED: Directly input by client workspace owner in onboarding wizard.
 * - EXTRACTED: Directly scraped/parsed from DOM section (H1, Meta, Footer).
 * - INFERRED: Derived by analytical classifier with rationale.
 * - GENERATED: AI recommendation or structured default.
 * - UNKNOWN: Explicitly missing or unverified gap.
 */
export type OriginType =
  | 'VERIFIED'
  | 'OWNER_PROVIDED'
  | 'EXTRACTED'
  | 'INFERRED'
  | 'GENERATED'
  | 'UNKNOWN';

export const OriginTypeSchema = z.enum([
  'VERIFIED',
  'OWNER_PROVIDED',
  'EXTRACTED',
  'INFERRED',
  'GENERATED',
  'UNKNOWN',
]);

/**
 * Metadata for tracking field provenance, lineage, and AI model attribution.
 */
export interface KnowledgeMetadata {
  source: string;
  modelUsed?: string | null;
  timestamp: string;
  approvalStatus: ApprovalStatus;
  approvalBy?: string | null;
  reasoningSummary?: string | null;
  versionNumber?: number;
  originType?: OriginType;
  evidenceText?: string | null;
}

export const KnowledgeMetadataSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  modelUsed: z.string().nullable().optional(),
  timestamp: z.string().datetime({ message: 'Invalid ISO timestamp' }),
  approvalStatus: ApprovalStatusSchema.default('pending'),
  approvalBy: z.string().nullable().optional(),
  reasoningSummary: z.string().nullable().optional(),
  versionNumber: z.number().int().positive().optional(),
  originType: OriginTypeSchema.default('EXTRACTED'),
  evidenceText: z.string().nullable().optional(),
});

/**
 * Universal Knowledge Field Container.
 *
 * Wraps ANY type T with complete provenance:
 * - value: T
 * - confidence: number (0.0 to 1.0)
 * - originType: OriginType
 * - source: string
 * - evidenceText?: string | null
 * - modelUsed: string | null
 * - timestamp: ISO string
 * - approvalStatus: 'pending' | 'approved' | 'rejected'
 * - reasoningSummary?: string | null
 */
export interface KnowledgeField<T> {
  value: T;
  confidence: number;
  originType: OriginType;
  source: string;
  evidenceText?: string | null;
  modelUsed?: string | null;
  timestamp: string;
  approvalStatus: ApprovalStatus;
  reasoningSummary?: string | null;
}

/**
 * Zod schema factory for creating a strongly-typed KnowledgeField schema for type T.
 */
export function createKnowledgeFieldSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema,
    confidence: z.number().min(0, 'Confidence cannot be less than 0').max(1, 'Confidence cannot exceed 1'),
    originType: OriginTypeSchema.default('EXTRACTED'),
    source: z.string().min(1, 'Source is required'),
    evidenceText: z.string().nullable().optional(),
    modelUsed: z.string().nullable().optional(),
    timestamp: z.string(),
    approvalStatus: ApprovalStatusSchema.default('pending'),
    reasoningSummary: z.string().nullable().optional(),
  });
}

/**
 * Helper to construct a KnowledgeField with sensible default metadata.
 */
export function createKnowledgeField<T>(
  value: T,
  options?: Partial<Omit<KnowledgeField<T>, 'value'>>
): KnowledgeField<T> {
  return {
    value,
    confidence: options?.confidence ?? 0.5,
    originType: options?.originType ?? 'EXTRACTED',
    source: options?.source ?? 'default',
    evidenceText: options?.evidenceText ?? null,
    modelUsed: options?.modelUsed ?? null,
    timestamp: options?.timestamp ?? new Date().toISOString(),
    approvalStatus: options?.approvalStatus ?? 'pending',
    reasoningSummary: options?.reasoningSummary ?? null,
  };
}
