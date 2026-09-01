import { z } from 'zod';
import {
  LLMProviderType,
  LLMModelConfig,
  PromptRequest,
  LLMResponse,
  ILLMProvider,
  QuotaExceededError,
} from './provider.types';
import { SaaSBillingManager } from '../saas/billing';

export abstract class BaseLLMProvider implements ILLMProvider {
  abstract type: LLMProviderType;
  protected config: LLMModelConfig;

  constructor(config: LLMModelConfig) {
    this.config = config;
  }

  abstract generateText(request: PromptRequest): Promise<LLMResponse>;

  async generateStructured<T>(
    request: PromptRequest,
    schema: z.ZodSchema<T>
  ): Promise<{ data: T; response: LLMResponse }> {
    const formattedPrompt = `${request.prompt}\n\nCRITICAL: Respond strictly with a valid JSON object matching the required schema. Do not include markdown codeblocks or preamble.`;
    const response = await this.generateText({ ...request, prompt: formattedPrompt });

    try {
      const parsed = JSON.parse(response.text);
      const data = schema.parse(parsed);
      return { data, response };
    } catch (e) {
      // Regex extraction fallback for unescaped JSON strings
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const data = schema.parse(parsed);
        return { data, response };
      }
      throw new Error(`Structured JSON parsing failed for ${this.type}: ${(e as Error).message}`);
    }
  }
}

export class NvidiaNimProvider extends BaseLLMProvider {
  type: LLMProviderType = 'nvidia';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = this.config.apiKey || process.env.NVIDIA_API_KEY;
    const directUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    const proxyUrl = typeof window !== 'undefined' ? '/api/chat' : 'http://localhost:8787/api/chat';
    const endpoint = this.config.baseUrl || (apiKey ? directUrl : proxyUrl);
    const model = this.config.modelName || process.env.NVIDIA_MODEL || 'meta/llama-3.2-90b-vision-instruct';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey && endpoint.includes('nvidia.com')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          temperature: request.temperature ?? 0.6,
          max_tokens: request.maxTokens ?? 1500,
        }),
      });

      if (!res.ok) {
        throw new Error(`NVIDIA NIM HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as any;
      const text = data.choices?.[0]?.message?.content || data.response || '';
      if (!text) {
        throw new Error('NVIDIA NIM returned empty response text.');
      }

      return {
        text,
        providerUsed: 'nvidia',
        modelUsed: model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || Math.ceil(request.prompt.length / 4),
          completionTokens: data.usage?.completion_tokens || Math.ceil(text.length / 4),
          totalTokens: data.usage?.total_tokens || Math.ceil((request.prompt.length + text.length) / 4),
          estimatedCostUsd: 0.0005,
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      throw new Error(`NVIDIA NIM generation failed: ${err.message}`);
    }
  }
}

export class OllamaProvider extends BaseLLMProvider {
  type: LLMProviderType = 'ollama';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = this.config.modelName || process.env.OLLAMA_MODEL || 'llama3.1:latest';
    const baseUrl = this.config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    try {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${request.systemPrompt ? request.systemPrompt + '\n' : ''}${request.prompt}`,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama HTTP Error: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as { response: string };
      if (!data.response) {
        throw new Error('Ollama returned empty response.');
      }
      return {
        text: data.response,
        providerUsed: 'ollama',
        modelUsed: model,
        usage: {
          promptTokens: Math.ceil(request.prompt.length / 4),
          completionTokens: Math.ceil(data.response.length / 4),
          totalTokens: Math.ceil((request.prompt.length + data.response.length) / 4),
          estimatedCostUsd: 0,
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      throw new Error(`Ollama generation failed (${model} on ${baseUrl}): ${err.message}`);
    }
  }
}

export class OpenAIProvider extends BaseLLMProvider {
  type: LLMProviderType = 'openai';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('[OpenAIProvider] API key is not configured.');
    }

    const startTime = Date.now();
    const model = this.config.modelName || 'gpt-4o';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.prompt },
        ],
        temperature: request.temperature ?? 0.6,
        max_tokens: request.maxTokens ?? 1500,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    return {
      text,
      providerUsed: 'openai',
      modelUsed: model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || Math.ceil(request.prompt.length / 4),
        completionTokens: data.usage?.completion_tokens || Math.ceil(text.length / 4),
        totalTokens: data.usage?.total_tokens || Math.ceil((request.prompt.length + text.length) / 4),
        estimatedCostUsd: 0.0015,
        latencyMs: Date.now() - startTime,
      },
    };
  }
}

export class ClaudeProvider extends BaseLLMProvider {
  type: LLMProviderType = 'claude';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('[ClaudeProvider] API key is not configured.');
    }

    const startTime = Date.now();
    const model = this.config.modelName || 'claude-3-5-sonnet-20241022';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens ?? 1500,
        temperature: request.temperature ?? 0.6,
      }),
    });

    if (!res.ok) {
      throw new Error(`Claude HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const text = data.content?.[0]?.text || '';
    return {
      text,
      providerUsed: 'claude',
      modelUsed: model,
      usage: {
        promptTokens: data.usage?.input_tokens || Math.ceil(request.prompt.length / 4),
        completionTokens: data.usage?.output_tokens || Math.ceil(text.length / 4),
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        estimatedCostUsd: 0.0017,
        latencyMs: Date.now() - startTime,
      },
    };
  }
}

export class GeminiProvider extends BaseLLMProvider {
  type: LLMProviderType = 'gemini';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('[GeminiProvider] API key is not configured.');
    }

    const startTime = Date.now();
    const model = this.config.modelName || 'gemini-1.5-pro';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${request.systemPrompt ? request.systemPrompt + '\n' : ''}${request.prompt}` }] }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      text,
      providerUsed: 'gemini',
      modelUsed: model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || Math.ceil(request.prompt.length / 4),
        completionTokens: data.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4),
        totalTokens: data.usageMetadata?.totalTokenCount || Math.ceil((request.prompt.length + text.length) / 4),
        estimatedCostUsd: 0.0012,
        latencyMs: Date.now() - startTime,
      },
    };
  }
}

export class OpenRouterProvider extends BaseLLMProvider {
  type: LLMProviderType = 'openrouter';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('[OpenRouterProvider] API key is not configured.');
    }

    const startTime = Date.now();
    const model = this.config.modelName || 'meta-llama/llama-3-70b-instruct';
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.prompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    return {
      text,
      providerUsed: 'openrouter',
      modelUsed: model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 100,
        completionTokens: data.usage?.completion_tokens || 200,
        totalTokens: data.usage?.total_tokens || 300,
        estimatedCostUsd: 0.001,
        latencyMs: Date.now() - startTime,
      },
    };
  }
}

export class LMStudioProvider extends BaseLLMProvider {
  type: LLMProviderType = 'lmstudio';

  async generateText(request: PromptRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const baseUrl = this.config.baseUrl || 'http://127.0.0.1:1234/v1';
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.modelName || 'local-model',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`LM Studio HTTP Error ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as any;
      const text = data.choices?.[0]?.message?.content || '';
      return {
        text,
        providerUsed: 'lmstudio',
        modelUsed: this.config.modelName || 'local-model',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 50,
          completionTokens: data.usage?.completion_tokens || 100,
          totalTokens: data.usage?.total_tokens || 150,
          estimatedCostUsd: 0,
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      throw new Error(`LM Studio generation failed (${baseUrl}): ${err.message}`);
    }
  }
}

export class MultiProviderLLMFactory {
  private providers: Map<LLMProviderType, ILLMProvider> = new Map();
  private billingManager?: SaaSBillingManager;

  constructor(billingManager?: SaaSBillingManager) {
    this.billingManager = billingManager;
    this.registerDefaultProviders();
  }

  setBillingManager(billingManager: SaaSBillingManager) {
    this.billingManager = billingManager;
  }

  registerProvider(type: LLMProviderType, provider: ILLMProvider) {
    this.providers.set(type, provider);
  }

  private registerDefaultProviders() {
    // Production Sole Active Provider: NVIDIA NIM
    this.providers.set('nvidia', new NvidiaNimProvider({
      provider: 'nvidia',
      modelName: process.env.NVIDIA_MODEL || 'meta/llama-3.2-90b-vision-instruct',
    }));

    // Auxiliary / Fallback providers only register if ENABLE_FALLBACK_PROVIDERS=true AND their key/endpoint is present
    if (process.env.ENABLE_FALLBACK_PROVIDERS === 'true') {
      if (process.env.OLLAMA_MODEL || process.env.OLLAMA_BASE_URL) {
        this.providers.set('ollama', new OllamaProvider({ provider: 'ollama', modelName: process.env.OLLAMA_MODEL || 'llama3.1:latest' }));
      }
      if (process.env.OPENAI_API_KEY) {
        this.providers.set('openai', new OpenAIProvider({ provider: 'openai', modelName: 'gpt-4o' }));
      }
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.set('claude', new ClaudeProvider({ provider: 'claude', modelName: 'claude-3-5-sonnet-20241022' }));
      }
      if (process.env.GEMINI_API_KEY) {
        this.providers.set('gemini', new GeminiProvider({ provider: 'gemini', modelName: 'gemini-1.5-pro' }));
      }
      if (process.env.OPENROUTER_API_KEY) {
        this.providers.set('openrouter', new OpenRouterProvider({ provider: 'openrouter', modelName: 'openrouter/auto' }));
      }
      if (process.env.LMSTUDIO_BASE_URL) {
        this.providers.set('lmstudio', new LMStudioProvider({ provider: 'lmstudio', modelName: 'local-model' }));
      }
    }
  }

  private enforceQuotaGate(request: PromptRequest) {
    if (!this.billingManager || !request.organizationId) return;

    const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.maxTokens || 500);
    const sub = this.billingManager.getSubscription(request.organizationId);

    const { allowed } = this.billingManager.recordTokenUsage(request.organizationId, estimatedTokens);
    if (!allowed) {
      throw new QuotaExceededError({
        organizationId: request.organizationId,
        planTier: sub.planTier,
        tokensUsed: sub.tokensUsed,
        tokenLimit: sub.tokenLimit,
      });
    }
  }

  async executeWithFallback(
    request: PromptRequest,
    providerOrder?: LLMProviderType[]
  ): Promise<LLMResponse> {
    // Mandated LLM Gateway Gatekeeper: Check token quota BEFORE calling any external provider!
    this.enforceQuotaGate(request);

    // Production Default: NVIDIA is the sole authoritative provider.
    // Secondary fallbacks are only allowed if explicitly enabled via ENABLE_FALLBACK_PROVIDERS=true.
    const allowFallbacks = process.env.ENABLE_FALLBACK_PROVIDERS === 'true';
    const chain: LLMProviderType[] = providerOrder && allowFallbacks
      ? providerOrder
      : allowFallbacks
        ? ['nvidia', 'ollama', 'openai', 'gemini']
        : ['nvidia'];

    let lastError: Error | null = null;
    for (const type of chain) {
      const provider = this.providers.get(type);
      if (provider) {
        try {
          return await provider.generateText(request);
        } catch (err) {
          lastError = err as Error;
          // In production default mode (no fallbacks), fail closed immediately
          if (!allowFallbacks) {
            throw new Error(`[LLM Gateway] Production provider (${type}) failed: ${(err as Error).message}`);
          }
        }
      } else if (!allowFallbacks) {
        throw new Error(`[LLM Gateway] Production provider (${type}) is not registered or unavailable.`);
      }
    }
    throw new Error(`[LLM Gateway] All configured LLM providers failed: ${lastError?.message}`);
  }

  async generateStructured<T>(
    request: PromptRequest,
    schema: z.ZodSchema<T>,
    providerType: LLMProviderType = 'nvidia'
  ): Promise<{ data: T; response: LLMResponse }> {
    // Mandated LLM Gateway Gatekeeper: Check token quota BEFORE calling provider!
    this.enforceQuotaGate(request);

    const provider = this.providers.get(providerType) || this.providers.get('nvidia');
    if (!provider) {
      throw new Error(`[LLM Gateway] Requested provider "${providerType}" is not configured or unavailable.`);
    }
    return provider.generateStructured(request, schema);
  }
}

/**
 * Shared Centralized LLM Provider Gateway Instance for Autonomous Agents
 */
export const LLMProviderGateway = new MultiProviderLLMFactory();
