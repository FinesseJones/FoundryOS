import { z } from 'zod';
import { ContextTaskTypeSchema } from '../context';

export const AgentRoleSchema = z.enum([
  'brand',
  'content',
  'publishing',
  'website',
  'security',
  'analytics',
  'learning',
]);

export const AgentAccessRightsSchema = z.object({
  readableDomains: z.array(z.string()),
  writableDomains: z.array(z.string()),
});

export const AgentTaskRequestSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  businessId: z.string().min(1, 'Business ID is required'),
  role: AgentRoleSchema,
  taskType: ContextTaskTypeSchema,
  prompt: z.string().min(1, 'Prompt is required'),
  targetChannel: z.string().optional(),
  activeCampaignId: z.string().optional(),
  conversationId: z.string().optional(),
  maxTokenBudget: z.number().int().positive().optional(),
  payload: z.record(z.unknown()).optional(),
});
