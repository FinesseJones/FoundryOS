import { AutomationEvent, EventTopic } from './automation.types';

export type EventSubscriber = (event: AutomationEvent) => Promise<void> | void;

/**
 * Real-time Production EventBus.
 * Strongly-typed pub/sub event stream for system events, agent updates, and triggers.
 */
export class EventBus {
  private subscribers: Map<EventTopic | '*', Set<EventSubscriber>> = new Map();

  /**
   * Subscribe to a specific topic or '*' for all topics.
   */
  subscribe(topic: EventTopic | '*', callback: EventSubscriber): () => void {
    const subs = this.subscribers.get(topic) ?? new Set();
    subs.add(callback);
    this.subscribers.set(topic, subs);

    // Return unsubscribe function
    return () => {
      subs.delete(callback);
    };
  }

  /**
   * Publish an event to all relevant topic subscribers and global subscribers.
   */
  async publish(event: AutomationEvent): Promise<void> {
    const topicSubs = this.subscribers.get(event.topic) ?? new Set();
    const globalSubs = this.subscribers.get('*') ?? new Set();

    const allCallbacks = Array.from(new Set([...topicSubs, ...globalSubs]));

    for (const callback of allCallbacks) {
      try {
        await callback(event);
      } catch (err) {
        console.error(`Error in EventBus subscriber for topic ${event.topic}:`, err);
      }
    }
  }

  /**
   * Helper to create and publish a new event.
   */
  async emit(params: {
    topic: EventTopic;
    businessId: string;
    source: string;
    payload?: Record<string, unknown>;
  }): Promise<AutomationEvent> {
    const event: AutomationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      topic: params.topic,
      businessId: params.businessId,
      source: params.source,
      payload: params.payload ?? {},
      timestamp: new Date().toISOString(),
    };

    await this.publish(event);
    return event;
  }
}
