/**
 * Brand First — Core Knowledge Layer Barrel Exports
 *
 * Every component, engine, service, or API route in the application
 * imports knowledge contracts from this entry point.
 */

// ─── Shared Primitives & Metadata ─────────────────────────────────────────────
export type {
  ConfidenceScore,
  ConfidentValue,
} from './schema/shared/confidence';
export {
  CONFIDENCE_THRESHOLDS,
  assertValidConfidence,
  confidenceTier,
} from './schema/shared/confidence';

export type {
  ApprovalStatus,
  OriginType,
  KnowledgeMetadata,
  KnowledgeField,
} from './schema/shared/metadata';
export {
  ApprovalStatusSchema,
  OriginTypeSchema,
  KnowledgeMetadataSchema,
  createKnowledgeFieldSchema,
  createKnowledgeField,
} from './schema/shared/metadata';

export type {
  AuditAction,
  AuditEvent,
} from './schema/shared/audit';
export {
  AuditActionSchema,
  AuditEventSchema,
  createAuditEvent,
} from './schema/shared/audit';

export type {
  Timestamps,
} from './schema/shared/timestamps';
export {
  TimestampsSchema,
  nowISO,
  createTimestamps,
  touchTimestamps,
} from './schema/shared/timestamps';

// ─── Business DNA Domain ──────────────────────────────────────────────────────
export type {
  CompanyStage,
  IndustryCategory,
  VoiceTone,
  MarketPosition,
} from './schema/business-dna/enums';
export {
  CompanyStageEnum,
  IndustryCategoryEnum,
  VoiceToneEnum,
  MarketPositionEnum,
  APPROVAL_STATUSES,
  DEFAULT_CONFIDENCE,
} from './schema/business-dna/enums';

export type { CustomerKnowledgeGraph } from './schema/knowledge-graph';
export { createDefaultCustomerKnowledgeGraph } from './schema/knowledge-graph';

export type {
  CompanyIdentity,
  BrandVoiceProfile,
  IdealCustomerProfile,
  BuyerPersona,
  CompetitivePositioning,
  WebsiteAnalysis,
  BusinessDNA,
} from './schema/business-dna/business-dna.types';

export {
  COMPANY_IDENTITY_SCHEMA,
  BRAND_VOICE_SCHEMA,
  BUYER_PERSONA_SCHEMA,
  IDEAL_CUSTOMER_PROFILE_SCHEMA,
  COMPETITIVE_POSITIONING_SCHEMA,
  WEBSITE_ANALYSIS_SCHEMA,
  BUSINESS_DNA_SCHEMA,
} from './schema/business-dna/business-dna.schema';

export type {
  ValidationIssue,
  ValidationResult,
} from './schema/business-dna/validators';
export {
  validateBusinessDNA,
} from './schema/business-dna/validators';

export {
  createDefaultBusinessDNA,
} from './schema/business-dna/defaults';
