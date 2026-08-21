import { BusinessDNA, ApprovalStatus } from '../knowledge';

/**
 * Task target types supported by the Context Engine.
 */
export type ContextTaskType =
  | 'content_generation'
  | 'brand_analysis'
  | 'campaign_planning'
  | 'customer_response'
  | 'voice_audit'
  | 'competitive_strategy'
  | 'general_chat';

/**
 * Context request input parameters passed to ContextBuilder.
 */
export interface ContextRequest {
  businessId: string;
  taskType: ContextTaskType;
  userPrompt: string;
  maxTokenBudget?: number; // default: 4000
  targetChannel?: string; // e.g. "linkedin", "instagram", "email"
  activeCampaignId?: string;
  conversationId?: string;
  minConfidenceThreshold?: number; // default: 0.4
}

/**
 * Memory Record primitive & Authority Hierarchy.
 */
export type MemoryType = 'long_term' | 'short_term' | 'episodic' | 'semantic' | 'decision_record';

export type MemoryAuthority =
  | 'SYSTEM'
  | 'LEGAL_COMPLIANCE'
  | 'ORGANIZATION_POLICY'
  | 'BRAND_DNA'
  | 'EXECUTIVE_DECISION'
  | 'CAMPAIGN_DECISION'
  | 'AGENT_INFERENCE';

export const MEMORY_AUTHORITY_WEIGHTS: Record<MemoryAuthority, number> = {
  SYSTEM: 1.0,
  LEGAL_COMPLIANCE: 0.95,
  ORGANIZATION_POLICY: 0.9,
  BRAND_DNA: 0.85,
  EXECUTIVE_DECISION: 0.8,
  CAMPAIGN_DECISION: 0.65,
  AGENT_INFERENCE: 0.5,
};

export interface DecisionRecord {
  id: string;
  organizationId: string;
  businessId: string;
  decision: string;
  rationale: string;
  authorizedBy: string;
  authorityLevel: MemoryAuthority;
  decidedAt: string;
  expectedOutcome?: string;
  actualOutcome?: string;
  variance?: string;
  lessonLearned?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'EVALUATED';
  tags: string[];
}

export interface MemoryRecord {
  id: string;
  businessId: string;
  organizationId?: string;
  memoryType: MemoryType;
  authority?: MemoryAuthority;
  content: Record<string, unknown>;
  importance: number; // [0.0 - 1.0]
  tags: string[];
  createdAt: string; // ISO string
}

/**
 * Recent Activity item payload.
 */
export interface RecentActivityItem {
  id: string;
  businessId: string;
  action: string; // e.g. "published_post", "analyzed_website", "updated_voice"
  description: string;
  channel?: string | null;
  topics: string[];
  timestamp: string; // ISO string
}

/**
 * Campaign Context active data.
 */
export interface CampaignContextData {
  campaignId: string;
  campaignName: string;
  goal: string;
  targetChannels: string[];
  keySlogans: string[];
  contentPillars: string[];
  startDate: string;
  endDate?: string | null;
  status: 'draft' | 'active' | 'completed' | 'paused';
}

/**
 * Conversation Message turn.
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * Candidate knowledge item for multi-factor ranking.
 */
export interface CandidateKnowledgeItem {
  id: string;
  sourceType: 'business_dna' | 'memory' | 'recent_activity' | 'campaign' | 'conversation';
  content: string;
  relevanceScore: number; // [0.0 - 1.0]
  confidenceScore: number; // [0.0 - 1.0]
  recencyScore: number; // [0.0 - 1.0]
  importanceScore: number; // [0.0 - 1.0]
  metadata?: Record<string, unknown>;
}

/**
 * Ranked and scored knowledge item.
 */
export interface RankedKnowledgeItem extends CandidateKnowledgeItem {
  finalScore: number; // Weighted composite score
}

/**
 * Token allocation breakdown per context segment.
 */
export interface TokenAllocation {
  totalBudget: number;
  allocated: {
    systemDirective: number;
    businessDNA: number;
    campaign: number;
    memory: number;
    recentActivity: number;
    conversation: number;
    userPrompt: number;
  };
  used: {
    systemDirective: number;
    businessDNA: number;
    campaign: number;
    memory: number;
    recentActivity: number;
    conversation: number;
    userPrompt: number;
  };
  totalUsed: number;
}

/**
 * Final Context Engine payload delivered to downstream AI agents.
 */
export interface EngineContext {
  request: ContextRequest;
  systemDirective: string;
  formattedPromptContext: string;
  businessDNASlice: Partial<BusinessDNA>;
  memories: MemoryRecord[];
  recentActivities: RecentActivityItem[];
  campaignContext: CampaignContextData | null;
  conversationHistory: ConversationMessage[];
  rankedKnowledge: RankedKnowledgeItem[];
  tokenAllocation: TokenAllocation;
  assembledAt: string; // ISO string
}
