/**
 * Context Engine — Barrel Exports (Stage 2)
 *
 * Exposes all types, Zod schemas, retrievers, rankers, budget tools, and context builders.
 */

// ─── Types & Schemas ─────────────────────────────────────────────────────────
export type {
  ContextTaskType,
  ContextRequest,
  MemoryType,
  MemoryRecord,
  RecentActivityItem,
  CampaignContextData,
  ConversationMessage,
  CandidateKnowledgeItem,
  RankedKnowledgeItem,
  TokenAllocation,
  EngineContext,
} from './context.types';

export {
  ContextTaskTypeSchema,
  ContextRequestSchema,
  MemoryTypeSchema,
  MemoryRecordSchema,
  RecentActivityItemSchema,
  CampaignContextDataSchema,
  ConversationMessageSchema,
} from './context.schema';

// ─── Retrievers & Sub-modules ────────────────────────────────────────────────
export { BusinessDNARetriever } from './dna-retrieval';
export type { BusinessDNARetrievalOptions } from './dna-retrieval';

export { MemoryRetriever } from './memory-retrieval';
export type { MemoryQueryOptions } from './memory-retrieval';

export { RecentActivityRetriever } from './recent-activity';
export type { RecentActivityQueryOptions } from './recent-activity';

export { CampaignContextRetriever } from './campaign-context';

export { ConversationContextRetriever } from './conversation-context';
export type { ConversationOptions } from './conversation-context';

export { KnowledgeRanker, DEFAULT_RANKING_WEIGHTS } from './knowledge-ranking';
export type { RankingWeights } from './knowledge-ranking';

export { TokenBudgetOptimizer } from './token-budget';

export { ContextBuilder } from './context-builder';
export type { ContextBuilderDependencies } from './context-builder';
