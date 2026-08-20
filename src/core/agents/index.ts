/**
 * Agent Framework — Barrel Exports (Stage 4)
 *
 * Exposes all types, Zod schemas, base agent abstractions, 7 specialized agents,
 * and the central AgentRegistry dispatcher.
 */

// ─── Types & Schemas ─────────────────────────────────────────────────────────
export type {
  AgentRole,
  AgentAccessRights,
  AgentTaskRequest,
  AgentTaskResult,
  AgentDescriptor,
} from './agent.types';

export {
  AgentRoleSchema,
  AgentAccessRightsSchema,
  AgentTaskRequestSchema,
} from './agent.schema';

// ─── Agents & Framework ──────────────────────────────────────────────────────
export { BaseAgent, AccessControlError } from './base-agent';
export { BrandAgent } from './brand-agent';
export { ContentAgent } from './content-agent';
export { PublishingAgent } from './publishing-agent';
export { WebsiteAgent } from './website-agent';
export { SecurityAgent } from './security-agent';
export { AnalyticsAgent } from './analytics-agent';
export { LearningAgent } from './learning-agent';
export { LeadAgent, type DiscoveredLead, type LeadDiscoveryParams } from './lead-agent';
export { AgentRegistry } from './agent-registry';
