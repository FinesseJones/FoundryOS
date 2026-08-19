import { z } from 'zod';
import { AgentRoleSchema } from '../agents';
import { ApprovalStatusSchema } from '../knowledge';

export const EventTopicSchema = z.enum([
  'business_dna_updated',
  'content_generated',
  'post_scheduled',
  'approval_requested',
  'approval_decision',
  'security_alert',
  'performance_threshold_met',
]);

export const AutomationEventSchema = z.object({
  id: z.string().min(1),
  topic: EventTopicSchema,
  businessId: z.string().min(1),
  source: z.string().min(1),
  payload: z.record(z.unknown()),
  timestamp: z.string().datetime(),
});

export const TriggerTypeSchema = z.enum(['event', 'schedule', 'threshold']);

export const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  agentRole: AgentRoleSchema,
  promptTemplate: z.string().min(1),
  targetChannel: z.string().optional(),
  requiresApproval: z.boolean().optional(),
});

export const WorkflowDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(WorkflowStepSchema),
  autoApproveLowRisk: z.boolean(),
  createdAt: z.string().datetime(),
});

export const ApprovalRequestSchema = z.object({
  id: z.string().min(1),
  workflowRunId: z.string().min(1),
  businessId: z.string().min(1),
  actionTitle: z.string().min(1),
  description: z.string(),
  proposedByAgent: AgentRoleSchema,
  status: ApprovalStatusSchema,
  reviewedBy: z.string().nullable().optional(),
  reviewNote: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});

export const NotificationChannelSchema = z.enum(['in_app', 'email', 'slack', 'webhook']);
export const NotificationSeveritySchema = z.enum(['info', 'warning', 'critical', 'action_required']);

export const NotificationMessageSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  title: z.string().min(1),
  body: z.string(),
  severity: NotificationSeveritySchema,
  channels: z.array(NotificationChannelSchema),
  read: z.boolean(),
  timestamp: z.string().datetime(),
});
