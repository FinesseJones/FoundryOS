import { z } from 'zod';
import { createKnowledgeFieldSchema } from '../shared/metadata';
import { TimestampsSchema } from '../shared/timestamps';
import { CompanyStageEnum, IndustryCategoryEnum, VoiceToneEnum, MarketPositionEnum } from './enums';

export const COMPANY_IDENTITY_SCHEMA = z.object({
  companyName: createKnowledgeFieldSchema(z.string().min(1, 'Company name is required')),
  legalName: createKnowledgeFieldSchema(z.string().nullable().optional()),
  industry: createKnowledgeFieldSchema(z.union([IndustryCategoryEnum, z.string()])),
  stage: createKnowledgeFieldSchema(CompanyStageEnum),
  mission: createKnowledgeFieldSchema(z.string().min(1, 'Mission statement is required')),
  vision: createKnowledgeFieldSchema(z.string().nullable().optional()),
  coreValues: createKnowledgeFieldSchema(z.array(z.string())),
  brandStory: createKnowledgeFieldSchema(z.string().nullable().optional()),
  uniqueValueProposition: createKnowledgeFieldSchema(z.string().min(1, 'UVP is required')),
});

export const BRAND_VOICE_SCHEMA = z.object({
  primaryTone: createKnowledgeFieldSchema(z.union([VoiceToneEnum, z.string()])),
  secondaryTones: createKnowledgeFieldSchema(z.array(z.string())),
  toneDescriptors: createKnowledgeFieldSchema(z.array(z.string())),
  wordsToUse: createKnowledgeFieldSchema(z.array(z.string())),
  wordsToAvoid: createKnowledgeFieldSchema(z.array(z.string())),
  sampleCopy: createKnowledgeFieldSchema(z.array(z.string()).nullable().optional()),
  styleGuidelines: createKnowledgeFieldSchema(z.string().nullable().optional()),
});

export const BUYER_PERSONA_SCHEMA = z.object({
  name: z.string().min(1, 'Persona name is required'),
  role: z.string().min(1, 'Persona role is required'),
  goals: z.array(z.string()),
  challenges: z.array(z.string()),
});

export const IDEAL_CUSTOMER_PROFILE_SCHEMA = z.object({
  targetAudience: createKnowledgeFieldSchema(z.string().min(1, 'Target audience description is required')),
  primaryPainPoints: createKnowledgeFieldSchema(z.array(z.string())),
  keyBenefits: createKnowledgeFieldSchema(z.array(z.string())),
  demographics: createKnowledgeFieldSchema(z.record(z.unknown())),
  psychographics: createKnowledgeFieldSchema(z.record(z.unknown()).nullable().optional()),
  buyerPersonas: createKnowledgeFieldSchema(z.array(BUYER_PERSONA_SCHEMA)),
});

export const COMPETITIVE_POSITIONING_SCHEMA = z.object({
  marketPosition: createKnowledgeFieldSchema(z.union([MarketPositionEnum, z.string()])),
  primaryCompetitors: createKnowledgeFieldSchema(z.array(z.string())),
  keyDifferentiators: createKnowledgeFieldSchema(z.array(z.string())),
  pricingStrategy: createKnowledgeFieldSchema(z.string().nullable().optional()),
  marketMoat: createKnowledgeFieldSchema(z.string().nullable().optional()),
});

export const WEBSITE_ANALYSIS_SCHEMA = z.object({
  primaryUrl: createKnowledgeFieldSchema(z.string().url()),
  headerTagline: createKnowledgeFieldSchema(z.string().nullable().optional()),
  heroH1: createKnowledgeFieldSchema(z.string().nullable().optional()),
  mainCTAs: createKnowledgeFieldSchema(z.array(z.string())),
  keyPages: createKnowledgeFieldSchema(z.array(z.string())),
  valuePropsExtracted: createKnowledgeFieldSchema(z.array(z.string())),
});

export const BUSINESS_DNA_SCHEMA = z.object({
  id: z.string().min(1, 'ID is required'),
  businessId: z.string().min(1, 'Business ID is required'),
  schemaVersion: z.string().default('1.0'),
  confidenceScore: z.number().min(0).max(1).default(0),
  timestamps: TimestampsSchema,

  companyIdentity: COMPANY_IDENTITY_SCHEMA,
  brandVoice: BRAND_VOICE_SCHEMA,
  customerProfile: IDEAL_CUSTOMER_PROFILE_SCHEMA,
  competitivePositioning: COMPETITIVE_POSITIONING_SCHEMA,
  websiteAnalysis: WEBSITE_ANALYSIS_SCHEMA.nullable().optional(),
});
