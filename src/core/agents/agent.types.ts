import { EngineContext, ContextTaskType } from '../context';
import { CognitiveProcessResult } from '../cognitive';

/**
 * 7 Specialized Agent Roles in the Brand First ecosystem.
 */
export type AgentRole =
  | 'brand'
  | 'content'
  | 'publishing'
  | 'website'
  | 'security'
  | 'analytics'
  | 'learning';

/**
 * Access rights matrix permissions per agent.
 */
export interface AgentAccessRights {
  readableDomains: string[];
  writableDomains: string[];
}

/**
 * Incoming task request submitted to an agent.
 */
export interface AgentTaskRequest {
  taskId: string;
  businessId: string;
  role: AgentRole;
  taskType: ContextTaskType;
  prompt: string;
  targetChannel?: string;
  activeCampaignId?: string;
  conversationId?: string;
  maxTokenBudget?: number;
  payload?: Record<string, unknown>;
}

/**
 * Standard output returned by an agent after processing.
 */
export interface AgentTaskResult {
  taskId: string;
  businessId: string;
  agentRole: AgentRole;
  success: boolean;
  outputSummary: string;
  outputData: Record<string, unknown>;
  context: EngineContext;
  cognitiveResult: CognitiveProcessResult;
  executedAt: string;
}

/**
 * Agent Descriptor metadata.
 */
export interface AgentDescriptor {
  role: AgentRole;
  name: string;
  description: string;
  accessRights: AgentAccessRights;
}
