import { z } from 'zod';

export type LLMProviderType = 'nvidia' | 'ollama' | 'openai' | 'claude' | 'gemini' | 'openrouter' | 'lmstudio';

export class QuotaExceededError extends Error {
  organizationId: string;
  planTier: string;
  tokensUsed: number;
  tokenLimit: number;

  constructor(params: { organizationId: string; planTier: string; tokensUsed: number; tokenLimit: number }) {
    super(
      `Token quota exceeded for organization '${params.organizationId}' on plan tier '${params.planTier.toUpperCase()}'. Limit: ${params.tokenLimit.toLocaleString()}, Used: ${params.tokensUsed.toLocaleString()}`
    );
    this.name = 'QuotaExceededError';
    this.organizationId = params.organizationId;
    this.planTier = params.planTier;
    this.tokensUsed = params.tokensUsed;
    this.tokenLimit = params.tokenLimit;
  }
}

export interface LLMModelConfig {
  provider: LLMProviderType;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface PromptRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  organizationId?: string;
}

export interface UsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
}

export interface LLMResponse {
  text: string;
  providerUsed: LLMProviderType;
  modelUsed: string;
  usage: UsageMetrics;
}

export interface ILLMProvider {
  type: LLMProviderType;
  generateText(request: PromptRequest): Promise<LLMResponse>;
  generateStructured<T>(request: PromptRequest, schema: z.ZodSchema<T>): Promise<{ data: T; response: LLMResponse }>;
}
