/**
 * Automation Engine — Barrel Exports (Stage 5)
 *
 * Exposes all types, Zod schemas, EventBus, TriggerEngine, WorkflowEngine,
 * ApprovalManager, NotificationDispatcher, and the central AutomationEngine.
 */

// ─── Types & Schemas ─────────────────────────────────────────────────────────
export type {
  EventTopic,
  AutomationEvent,
  TriggerType,
  TriggerRule,
  WorkflowStep,
  WorkflowDefinition,
  WorkflowRun,
  ApprovalRequest,
  NotificationChannel,
  NotificationSeverity,
  NotificationMessage,
  AutomationEngineResult,
} from './automation.types';

export {
  EventTopicSchema,
  AutomationEventSchema,
  TriggerTypeSchema,
  WorkflowStepSchema,
  WorkflowDefinitionSchema,
  ApprovalRequestSchema,
  NotificationChannelSchema,
  NotificationSeveritySchema,
  NotificationMessageSchema,
} from './automation.schema';

// ─── Subsystems & Orchestrator ────────────────────────────────────────────────
export { EventBus } from './events';
export type { EventSubscriber } from './events';

export { TriggerEngine } from './trigger-engine';

export { WorkflowEngine } from './workflows';

export { ApprovalManager } from './approvals';

export { NotificationDispatcher } from './notifications';

export { AutomationEngine } from './automation-engine';
export type { AutomationEngineDependencies } from './automation-engine';
