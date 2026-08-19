import { RecentActivityItem } from './context.types';

export interface RecentActivityQueryOptions {
  businessId: string;
  limit?: number; // default 5
  channel?: string;
}

/**
 * Recent Activity Retriever.
 * Tracks recent actions, posts, and topics to provide temporal context and prevent repetitive content.
 */
export class RecentActivityRetriever {
  private activities: RecentActivityItem[] = [];

  constructor(initialActivities: RecentActivityItem[] = []) {
    this.activities = [...initialActivities];
  }

  /**
   * Register a new activity record.
   */
  addActivity(activity: RecentActivityItem): void {
    this.activities.push(activity);
  }

  /**
   * Query recent activities for a business.
   */
  retrieve(options: RecentActivityQueryOptions): RecentActivityItem[] {
    const limit = options.limit ?? 5;
    return this.activities
      .filter((a) => a.businessId === options.businessId && (!options.channel || a.channel === options.channel))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Format recent activity items for LLM prompt context.
   */
  static formatForPrompt(activities: RecentActivityItem[]): string {
    if (activities.length === 0) return '';
    const lines = ['### Recent Business Activity'];
    for (const act of activities) {
      const channelLabel = act.channel ? ` [${act.channel}]` : '';
      lines.push(`- ${act.timestamp.split('T')[0]}${channelLabel}: ${act.action} — ${act.description}`);
    }
    return lines.join('\n');
  }
}
