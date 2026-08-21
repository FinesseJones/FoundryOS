import {
  MemoryRecord,
  MemoryAuthority,
  MEMORY_AUTHORITY_WEIGHTS,
  DecisionRecord,
} from './context.types';

export interface MemoryQueryOptions {
  businessId: string;
  query: string;
  limit?: number; // default 5
  minImportance?: number; // default 0.3
  minAuthority?: MemoryAuthority;
}

/**
 * Real-time Production Memory Retriever.
 * Queries memory records & institutional Decision Records with Authority-Weighted Ranking.
 *
 * Rank Score Formula:
 * RankScore = (AuthorityWeight * 0.40) + (Relevance * 0.35) + (Importance * 0.15) + (RecencyDecay * 0.10)
 */
export class MemoryRetriever {
  private records: MemoryRecord[] = [];
  private decisionRecords: DecisionRecord[] = [];

  constructor(
    initialRecords: MemoryRecord[] = [],
    initialDecisions: DecisionRecord[] = []
  ) {
    this.records = [...initialRecords];
    this.decisionRecords = [...initialDecisions];
  }

  /**
   * Add a general memory record to the engine store.
   */
  addRecord(record: MemoryRecord): void {
    this.records.push(record);
  }

  /**
   * Add an authoritative Decision Record to institutional memory.
   */
  addDecisionRecord(decision: DecisionRecord): void {
    // If a newer decision supersedes an older one with same tags/scope, mark older as SUPERSEDED
    if (decision.status === 'ACTIVE') {
      const decisionTags = new Set(decision.tags);
      for (const existing of this.decisionRecords) {
        if (
          existing.businessId === decision.businessId &&
          existing.id !== decision.id &&
          existing.status === 'ACTIVE'
        ) {
          const overlap = existing.tags.some((t) => decisionTags.has(t));
          const existingWeight = MEMORY_AUTHORITY_WEIGHTS[existing.authorityLevel] || 0.5;
          const newWeight = MEMORY_AUTHORITY_WEIGHTS[decision.authorityLevel] || 0.5;

          // Higher or equal authority supersedes older overlapping decision
          if (overlap && newWeight >= existingWeight) {
            existing.status = 'SUPERSEDED';
          }
        }
      }
    }

    this.decisionRecords.push(decision);
  }

  /**
   * Retrieve relevant memory records scored by Authority, Semantic Relevance, and Recency Decay.
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
      const contentStr =
        JSON.stringify(record.content).toLowerCase() + ' ' + record.tags.join(' ').toLowerCase();
      let matchCount = 0;
      for (const token of queryTokens) {
        if (contentStr.includes(token)) {
          matchCount++;
        }
      }
      const relevance = queryTokens.length > 0 ? matchCount / queryTokens.length : 0.5;

      // 2. Authority weight
      const authorityWeight = record.authority
        ? MEMORY_AUTHORITY_WEIGHTS[record.authority] || 0.5
        : 0.5;

      // 3. Time decay factor (half life 45 days)
      const ageMs = Date.now() - new Date(record.createdAt).getTime();
      const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
      const timeDecay = Math.exp(-ageDays / 45);

      // Composite memory score with authority weighting
      const finalScore =
        authorityWeight * 0.4 + relevance * 0.35 + record.importance * 0.15 + timeDecay * 0.1;

      return { record, finalScore };
    });

    // Sort descending by finalScore and return top N
    return scored
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit)
      .map((item) => item.record);
  }

  /**
   * Retrieve active Decision Records ranked by Authority and relevance.
   */
  retrieveDecisions(query: string, businessId: string, limit = 4): DecisionRecord[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const activeDecisions = this.decisionRecords.filter(
      (d) => d.businessId === businessId && d.status === 'ACTIVE'
    );

    const scored = activeDecisions.map((decision) => {
      const text = `${decision.decision} ${decision.rationale} ${decision.tags.join(' ')}`.toLowerCase();
      let matchCount = 0;
      for (const token of queryTokens) {
        if (text.includes(token)) matchCount++;
      }
      const relevance = queryTokens.length > 0 ? matchCount / queryTokens.length : 0.5;
      const authorityWeight = MEMORY_AUTHORITY_WEIGHTS[decision.authorityLevel] || 0.5;

      const score = authorityWeight * 0.6 + relevance * 0.4;
      return { decision, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.decision);
  }

  /**
   * Format memory records for LLM context prompt.
   */
  static formatForPrompt(memories: MemoryRecord[]): string {
    if (memories.length === 0) return '';
    const lines = ['### Relevant Business Memory'];
    for (const mem of memories) {
      const summary =
        typeof mem.content === 'object' && mem.content.summary
          ? String(mem.content.summary)
          : JSON.stringify(mem.content);
      const authorityTag = mem.authority ? ` [Auth: ${mem.authority}]` : '';
      lines.push(`- [${mem.memoryType.toUpperCase()}]${authorityTag} (${mem.tags.join(', ')}): ${summary}`);
    }
    return lines.join('\n');
  }

  /**
   * Format institutional Decision Records for LLM context prompt.
   */
  static formatDecisionContext(decisions: DecisionRecord[]): string {
    if (decisions.length === 0) return '';
    const lines = ['### Institutional Decision History & Human Preferences'];
    for (const d of decisions) {
      lines.push(
        `- [${d.authorityLevel}] Decision: "${d.decision}" | Why: "${d.rationale}" (Authorized by: ${d.authorizedBy})`
      );
    }
    return lines.join('\n');
  }
}
