import { z } from 'zod';

export const ContextTaskTypeSchema = z.enum([
  'content_generation',
  'brand_analysis',
  'campaign_planning',
  'customer_response',
  'voice_audit',
  'competitive_strategy',
  'general_chat',
]);

export const ContextRequestSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  taskType: ContextTaskTypeSchema,
  userPrompt: z.string().min(1, 'User prompt is required'),
  maxTokenBudget: z.number().int().positive().default(4000),
  targetChannel: z.string().optional(),
  activeCampaignId: z.string().optional(),
  conversationId: z.string().optional(),
  minConfidenceThreshold: z.number().min(0).max(1).default(0.4),
});

export const MemoryTypeSchema = z.enum(['long_term', 'short_term', 'episodic', 'semantic']);

export const MemoryRecordSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  memoryType: MemoryTypeSchema,
  content: z.record(z.unknown()),
  importance: z.number().min(0).max(1),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export const RecentActivityItemSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  action: z.string().min(1),
  description: z.string(),
  channel: z.string().nullable().optional(),
  topics: z.array(z.string()),
  timestamp: z.string().datetime(),
});

export const CampaignContextDataSchema = z.object({
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  goal: z.string(),
  targetChannels: z.array(z.string()),
  keySlogans: z.array(z.string()),
  contentPillars: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'completed', 'paused']),
});

export const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
});
