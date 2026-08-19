import { AgentRole, AgentTaskResult } from '../agents';
import { ApprovalStatus } from '../knowledge';

/**
 * Event topic categories in the Automation Engine.
 */
export type EventTopic =
  | 'business_dna_updated'
  | 'content_generated'
  | 'post_scheduled'
  | 'approval_requested'
  | 'approval_decision'
  | 'security_alert'
  | 'performance_threshold_met';

/**
 * Event payload structure published to EventBus.
 */
export interface AutomationEvent {
  id: string;
  topic: EventTopic;
  businessId: string;
  source: string;
  payload: Record<string, unknown>;
  timestamp: string; // ISO 8601 string
}

/**
 * Trigger rule type.
 */
export type TriggerType = 'event' | 'schedule' | 'threshold';

/**
 * Registered Trigger Rule definition.
 */
export interface TriggerRule {
  id: string;
  name: string;
  triggerType: TriggerType;
  topic?: EventTopic;
  cronSchedule?: string; // e.g. "0 9 * * *"
  filterCondition?: (event: AutomationEvent) => boolean;
  targetWorkflowId: string;
  active: boolean;
}

/**
 * Single step within a WorkflowDefinition.
 */
export interface WorkflowStep {
  id: string;
  name: string;
  agentRole: AgentRole;
  promptTemplate: string;
  targetChannel?: string;
  requiresApproval?: boolean;
}

/**
 * Multi-step Workflow Definition.
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  autoApproveLowRisk: boolean;
  createdAt?: string;
}

/**
 * Live execution instance of a Workflow.
 */
export interface WorkflowRun {
  id: string;
  workflowId: string;
  businessId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval' | 'paused_for_approval';
  currentStepIndex: number;
  results: AgentTaskResult[];
  startedAt: string;
  completedAt?: string;
}

/**
 * Human Approval Request.
 */
export interface ApprovalRequest {
  id: string;
  workflowRunId: string;
  businessId: string;
  actionTitle: string;
  description: string;
  proposedByAgent: AgentRole;
  status: ApprovalStatus; // 'pending' | 'approved' | 'rejected'
  reviewedBy?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  resolvedAt?: string;
}

/**
 * Notification Channel & Severity.
 */
export type NotificationChannel = 'in_app' | 'email' | 'slack' | 'webhook';
export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'action_required';

/**
 * Multi-channel Notification Message.
 */
export interface NotificationMessage {
  id: string;
  businessId: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  read: boolean;
  timestamp: string;
}

/**
 * Unified summary output of AutomationEngine processing.
 */
export interface AutomationEngineResult {
  eventId: string;
  triggeredRulesCount: number;
  executedWorkflowsCount: number;
  pendingApprovalsCount: number;
  dispatchedNotificationsCount: number;
  processedAt: string;
}
