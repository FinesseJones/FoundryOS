import { z } from 'zod';

export const CompanyStageEnum = z.enum([
  'idea',
  'mvp',
  'early_traction',
  'growth',
  'scale',
  'enterprise',
]);
export type CompanyStage = z.infer<typeof CompanyStageEnum>;

export const IndustryCategoryEnum = z.enum([
  'saas',
  'e_commerce',
  'fintech',
  'healthtech',
  'agency',
  'edtech',
  'cybersecurity',
  'consumer_tech',
  'other',
]);
export type IndustryCategory = z.infer<typeof IndustryCategoryEnum>;

export const VoiceToneEnum = z.enum([
  'authoritative',
  'friendly',
  'playful',
  'professional',
  'bold',
  'empathetic',
  'technical',
  'inspirational',
]);
export type VoiceTone = z.infer<typeof VoiceToneEnum>;

export const MarketPositionEnum = z.enum([
  'leader',
  'challenger',
  'niche',
  'disruptor',
  'cost_leader',
]);
export type MarketPosition = z.infer<typeof MarketPositionEnum>;

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const DEFAULT_CONFIDENCE = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.4,
  DEFAULT: 0.5,
} as const;
