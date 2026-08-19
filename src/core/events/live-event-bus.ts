export type SystemEventType =
  | 'WEBSITE_CONTENT_UPDATED'
  | 'COMPETITOR_PRICING_CHANGED'
  | 'CUSTOMER_REVIEW_POSTED'
  | 'CRM_LEAD_COLD'
  | 'SEARCH_TREND_SPIKE';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  organizationId: string;
  workspaceId: string;
  timestamp: string;
  source: string;
  payload: Record<string, unknown>;
  evidenceText?: string;
  confidenceScore: number;
}

export type EventHandler = (event: SystemEvent) => void | Promise<void>;

export class LiveEventBus {
  private static instance: LiveEventBus;
  private subscribers: Map<SystemEventType, EventHandler[]> = new Map();
  private eventHistory: SystemEvent[] = [];

  constructor() {
    this.seedInitialEvents();
  }

  public static getInstance(): LiveEventBus {
    if (!LiveEventBus.instance) {
      LiveEventBus.instance = new LiveEventBus();
    }
    return LiveEventBus.instance;
  }

  public subscribe(type: SystemEventType, handler: EventHandler): void {
    const handlers = this.subscribers.get(type) || [];
    handlers.push(handler);
    this.subscribers.set(type, handlers);
  }

  public async publish(event: SystemEvent): Promise<void> {
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 100) {
      this.eventHistory.pop();
    }

    const handlers = this.subscribers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error executing event handler for ${event.type}:`, err);
      }
    }
  }

  public getRecentEvents(limit: number = 10): SystemEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  private seedInitialEvents(): void {
    this.eventHistory = [
      {
        id: 'evt_search_881',
        type: 'SEARCH_TREND_SPIKE',
        organizationId: 'org_apex_001',
        workspaceId: 'ws_hvac_001',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        source: 'Google Search Console API',
        payload: { keyword: 'emergency AC repair Houston', volumeIncreasePct: 28, targetZipCodes: ['77058', '77059', '77586'] },
        evidenceText: 'Local Google search query volume for "emergency AC repair" rose +28% in 72 hours.',
        confidenceScore: 0.94,
      },
      {
        id: 'evt_crm_402',
        type: 'CRM_LEAD_COLD',
        organizationId: 'org_apex_001',
        workspaceId: 'ws_hvac_001',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        source: 'HubSpot / Salesforce Sync',
        payload: { coldEstimatesCount: 2, totalValue: 4800, inactiveDurationHours: 72 },
        evidenceText: 'Two residential HVAC replacement estimates ($4,800 total) uncontacted for >72 hours.',
        confidenceScore: 0.98,
      },
      {
        id: 'evt_review_109',
        type: 'CUSTOMER_REVIEW_POSTED',
        organizationId: 'org_apex_001',
        workspaceId: 'ws_hvac_001',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        source: 'Google Business Profile Webhook',
        payload: { pendingReviewsCount: 7, avgRating: 4.9 },
        evidenceText: '7 new customer reviews received overnight requiring official responses.',
        confidenceScore: 1.0,
      },
    ];
  }
}
