import { BusinessDNA } from '../knowledge';
import {
  ContextRequest,
  EngineContext,
  CandidateKnowledgeItem,
  MemoryRecord,
  RecentActivityItem,
  CampaignContextData,
  ConversationMessage,
} from './context.types';
import { BusinessDNARetriever } from './dna-retrieval';
import { MemoryRetriever } from './memory-retrieval';
import { RecentActivityRetriever } from './recent-activity';
import { CampaignContextRetriever } from './campaign-context';
import { ConversationContextRetriever } from './conversation-context';
import { KnowledgeRanker } from './knowledge-ranking';
import { TokenBudgetOptimizer } from './token-budget';

export interface ContextBuilderDependencies {
  dnaStore?: Map<string, BusinessDNA>;
  memoryRetriever?: MemoryRetriever;
  activityRetriever?: RecentActivityRetriever;
  campaignRetriever?: CampaignContextRetriever;
  conversationRetriever?: ConversationContextRetriever;
}

/**
 * Production Context Builder Orchestrator.
 * Coordinates real-time context retrieval, knowledge ranking, token budget optimization,
 * and prompt assembly for AI agents.
 */
export class ContextBuilder {
  private dnaStore: Map<string, BusinessDNA>;
  private memoryRetriever: MemoryRetriever;
  private activityRetriever: RecentActivityRetriever;
  private campaignRetriever: CampaignContextRetriever;
  private conversationRetriever: ConversationContextRetriever;

  constructor(deps: ContextBuilderDependencies = {}) {
    this.dnaStore = deps.dnaStore ?? new Map();
    this.memoryRetriever = deps.memoryRetriever ?? new MemoryRetriever();
    this.activityRetriever = deps.activityRetriever ?? new RecentActivityRetriever();
    this.campaignRetriever = deps.campaignRetriever ?? new CampaignContextRetriever();
    this.conversationRetriever = deps.conversationRetriever ?? new ConversationContextRetriever();
  }

  /**
   * Register or update a BusinessDNA record in the context builder store.
   */
  registerBusinessDNA(dna: BusinessDNA): void {
    this.dnaStore.set(dna.businessId, dna);
  }

  /**
   * Main entry point: Assemble EngineContext for an incoming ContextRequest.
   */
  async buildContext(request: ContextRequest): Promise<EngineContext> {
    const maxBudget = request.maxTokenBudget ?? 4000;
    const allocatedBudget = TokenBudgetOptimizer.calculateAllocation(maxBudget);

    // 1. Business DNA Retrieval & Formatting
    const rawDNA = this.dnaStore.get(request.businessId);
    const dnaSlice = rawDNA
      ? BusinessDNARetriever.retrieveSlice(rawDNA, {
          taskType: request.taskType,
          minConfidenceThreshold: request.minConfidenceThreshold,
        })
      : {};
    let dnaPromptText = BusinessDNARetriever.formatForPrompt(dnaSlice);
    dnaPromptText = TokenBudgetOptimizer.truncateToTokenBudget(
      dnaPromptText,
      allocatedBudget.businessDNA
    );

    // 2. Memory Retrieval & Formatting
    const memories: MemoryRecord[] = this.memoryRetriever.retrieve({
      businessId: request.businessId,
      query: request.userPrompt,
      limit: 5,
    });
    let memoryPromptText = MemoryRetriever.formatForPrompt(memories);
    memoryPromptText = TokenBudgetOptimizer.truncateToTokenBudget(
      memoryPromptText,
      allocatedBudget.memory
    );

    // 3. Recent Activity Retrieval & Formatting
    const recentActivities: RecentActivityItem[] = this.activityRetriever.retrieve({
      businessId: request.businessId,
      channel: request.targetChannel,
      limit: 5,
    });
    let activityPromptText = RecentActivityRetriever.formatForPrompt(recentActivities);
    activityPromptText = TokenBudgetOptimizer.truncateToTokenBudget(
      activityPromptText,
      allocatedBudget.recentActivity
    );

    // 4. Campaign Context Retrieval & Formatting
    const campaignContext: CampaignContextData | null = this.campaignRetriever.retrieveActiveCampaign(
      request.activeCampaignId
    );
    let campaignPromptText = CampaignContextRetriever.formatForPrompt(campaignContext);
    campaignPromptText = TokenBudgetOptimizer.truncateToTokenBudget(
      campaignPromptText,
      allocatedBudget.campaign
    );

    // 5. Conversation Context Retrieval & Formatting
    const conversationHistory: ConversationMessage[] = this.conversationRetriever.retrieveHistory(
      request.conversationId
    );
    let conversationPromptText = ConversationContextRetriever.formatForPrompt(conversationHistory);
    conversationPromptText = TokenBudgetOptimizer.truncateToTokenBudget(
      conversationPromptText,
      allocatedBudget.conversation
    );

    // 6. Knowledge Candidate Aggregation & Multi-Factor Ranking
    const candidates: CandidateKnowledgeItem[] = [];
    if (dnaPromptText) {
      candidates.push({
        id: 'cand_dna',
        sourceType: 'business_dna',
        content: dnaPromptText,
        relevanceScore: 0.95,
        confidenceScore: rawDNA?.confidenceScore ?? 0.8,
        recencyScore: 1.0,
        importanceScore: 0.9,
      });
    }
    for (const mem of memories) {
      candidates.push({
        id: `cand_mem_${mem.id}`,
        sourceType: 'memory',
        content: JSON.stringify(mem.content),
        relevanceScore: 0.85,
        confidenceScore: 0.85,
        recencyScore: 0.7,
        importanceScore: mem.importance,
      });
    }
    if (campaignPromptText) {
      candidates.push({
        id: 'cand_campaign',
        sourceType: 'campaign',
        content: campaignPromptText,
        relevanceScore: 0.9,
        confidenceScore: 0.9,
        recencyScore: 0.95,
        importanceScore: 0.85,
      });
    }

    const rankedKnowledge = KnowledgeRanker.rankItems(candidates);

    // 7. System Directive Assembly
    const systemDirective = this.assembleSystemDirective(request, rawDNA?.companyIdentity?.companyName?.value);

    // 8. Formatted Context Assembly
    const contextSections = [
      systemDirective,
      dnaPromptText,
      campaignPromptText,
      memoryPromptText,
      activityPromptText,
      conversationPromptText,
    ].filter(Boolean);

    const formattedPromptContext = contextSections.join('\n\n');

    // 9. Token Tracking Calculation
    const usedBudget = {
      systemDirective: TokenBudgetOptimizer.estimateTokens(systemDirective),
      businessDNA: TokenBudgetOptimizer.estimateTokens(dnaPromptText),
      campaign: TokenBudgetOptimizer.estimateTokens(campaignPromptText),
      memory: TokenBudgetOptimizer.estimateTokens(memoryPromptText),
      recentActivity: TokenBudgetOptimizer.estimateTokens(activityPromptText),
      conversation: TokenBudgetOptimizer.estimateTokens(conversationPromptText),
      userPrompt: TokenBudgetOptimizer.estimateTokens(request.userPrompt),
    };

    const totalUsed =
      usedBudget.systemDirective +
      usedBudget.businessDNA +
      usedBudget.campaign +
      usedBudget.memory +
      usedBudget.recentActivity +
      usedBudget.conversation +
      usedBudget.userPrompt;

    return {
      request,
      systemDirective,
      formattedPromptContext,
      businessDNASlice: dnaSlice,
      memories,
      recentActivities,
      campaignContext,
      conversationHistory,
      rankedKnowledge,
      tokenAllocation: {
        totalBudget: maxBudget,
        allocated: allocatedBudget,
        used: usedBudget,
        totalUsed,
      },
      assembledAt: new Date().toISOString(),
    };
  }

  private assembleSystemDirective(request: ContextRequest, brandName?: string): string {
    const brandLabel = brandName ?? 'the brand';
    switch (request.taskType) {
      case 'content_generation':
        return `You are a world-class brand strategist and copywriter for ${brandLabel}. Generate engaging, high-converting content strictly adhering to the brand voice, core values, and campaign guidelines below.`;
      case 'brand_analysis':
        return `You are an expert brand intelligence analyst auditing ${brandLabel}. Evaluate market positioning, voice consistency, and messaging strength based on the Business DNA provided.`;
      case 'campaign_planning':
        return `You are a senior campaign strategist for ${brandLabel}. Formulate actionable multi-channel marketing campaigns aligned with business goals and ideal customer personas.`;
      case 'customer_response':
        return `You are a customer experience leader representing ${brandLabel}. Craft empathetic, helpful, and brand-consistent responses to customer inquiries.`;
      case 'voice_audit':
        return `You are a brand voice auditor for ${brandLabel}. Analyze copy for tone compliance, forbidden vocabulary, and style guidelines.`;
      case 'competitive_strategy':
        return `You are a competitive intelligence strategist for ${brandLabel}. Analyze market differentiators, competitor moves, and value propositions.`;
      default:
        return `You are an AI assistant representing ${brandLabel}. Assist the user using the brand context provided below.`;
    }
  }
}
