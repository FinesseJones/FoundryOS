import { TokenAllocation } from './context.types';

/**
 * Production Token Budget Optimizer.
 * Estimates token counts (heuristic ~4 chars per token) and enforces dynamic segment budget limits.
 */
export class TokenBudgetOptimizer {
  /**
   * Estimate token count for a text string.
   */
  static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 3.8);
  }

  /**
   * Calculate budget allocation for a given max budget limit.
   */
  static calculateAllocation(totalBudget: number = 4000): TokenAllocation['allocated'] {
    // Reserves ~15% for user prompt & system directive overhead
    const usableBudget = Math.max(500, totalBudget - 600);

    return {
      systemDirective: 250,
      businessDNA: Math.floor(usableBudget * 0.35),
      campaign: Math.floor(usableBudget * 0.25),
      memory: Math.floor(usableBudget * 0.20),
      recentActivity: Math.floor(usableBudget * 0.10),
      conversation: Math.floor(usableBudget * 0.10),
      userPrompt: 350,
    };
  }

  /**
   * Truncate text content to stay strictly within specified token budget without cutting off abruptly.
   */
  static truncateToTokenBudget(text: string, maxTokens: number): string {
    const currentTokens = this.estimateTokens(text);
    if (currentTokens <= maxTokens) return text;

    const maxChars = Math.floor(maxTokens * 3.8);
    const sliced = text.slice(0, maxChars);
    const lastNewline = sliced.lastIndexOf('\n');
    if (lastNewline > maxChars * 0.7) {
      return sliced.slice(0, lastNewline) + '\n... [Context truncated to fit token budget]';
    }
    return sliced + '... [Context truncated to fit token budget]';
  }
}
