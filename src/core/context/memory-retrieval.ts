import { MemoryRecord } from './context.types';

export interface MemoryQueryOptions {
  businessId: string;
  query: string;
  limit?: number; // default 5
  minImportance?: number; // default 0.3
}

/**
 * Real-time Production Memory Retriever.
 * Queries memory records and applies keyword matching, importance weighting, and time decay scoring.
 */
export class MemoryRetriever {
  private records: MemoryRecord[] = [];

  constructor(initialRecords: MemoryRecord[] = []) {
    this.records = [...initialRecords];
  }

  /**
   * Add a memory record to the engine store.
   */
  addRecord(record: MemoryRecord): void {
    this.records.push(record);
  }

  /**
   * Retrieve relevant memory records scored by semantic relevance, importance, and recency decay.
   */
  retrieve(options: MemoryQueryOptions): MemoryRecord[] {
    const limit = options.limit ?? 5;
    const minImportance = options.minImportance ?? 0.3;
    const queryTokens = options.query.toLowerCase().split(/\s+/).filter(Boolean);

    const businessRecords = this.records.filter(
      (r) => r.businessId === options.businessId && r.importance >= minImportance
    );

    const scored = businessRecords.map((record) => {
      // 1. Keyword match relevance
      const contentStr = JSON.stringify(record.content).toLowerCase() + ' ' + record.tags.join(' ').toLowerCase();
      let matchCount = 0;
      for (const token of queryTokens) {
        if (contentStr.includes(token)) {
          matchCount++;
        }
      }
      const relevance = queryTokens.length > 0 ? matchCount / queryTokens.length : 0.5;

      // 2. Time decay factor (half life 30 days)
      const ageMs = Date.now() - new Date(record.createdAt).getTime();
      const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
      const timeDecay = Math.exp(-ageDays / 30);

      // Composite memory score
      const finalScore = relevance * 0.5 + record.importance * 0.3 + timeDecay * 0.2;

      return { record, finalScore };
    });

    // Sort descending by finalScore and return top N
    return scored
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit)
      .map((item) => item.record);
  }

  /**
   * Format memory records for LLM context prompt.
   */
  static formatForPrompt(memories: MemoryRecord[]): string {
    if (memories.length === 0) return '';
    const lines = ['### Relevant Business Memory'];
    for (const mem of memories) {
      const summary = typeof mem.content === 'object' && mem.content.summary
        ? String(mem.content.summary)
        : JSON.stringify(mem.content);
      lines.push(`- [${mem.memoryType.toUpperCase()}] (${mem.tags.join(', ')}): ${summary}`);
    }
    return lines.join('\n');
  }
}
