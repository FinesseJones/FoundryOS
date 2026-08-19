export type WebsiteConnectionState =
  | 'PENDING'
  | 'CRAWLING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

export interface WebsiteConnectionRecord {
  id: string;
  organizationId: string;
  businessId: string;
  url: string;
  state: WebsiteConnectionState;
  pagesDiscovered: number;
  lastCrawlTime?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export class WebsiteConnectionService {
  private connections: Map<string, WebsiteConnectionRecord> = new Map();

  /**
   * Register a new website connection for an organization.
   */
  createConnection(params: {
    organizationId: string;
    businessId: string;
    url: string;
  }): WebsiteConnectionRecord {
    // Validate URL syntax
    try {
      new URL(params.url);
    } catch {
      throw new Error(`Invalid website URL provided: '${params.url}'`);
    }

    const id = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: WebsiteConnectionRecord = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      url: params.url,
      state: 'PENDING',
      pagesDiscovered: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.connections.set(id, record);
    return record;
  }

  /**
   * Retrieve website connection record verifying tenant ownership.
   */
  getConnection(query: { organizationId: string; connectionId: string }): WebsiteConnectionRecord | null {
    const record = this.connections.get(query.connectionId);
    if (!record) return null;

    // Strict multi-tenant security verification
    if (record.organizationId !== query.organizationId) {
      return null;
    }
    return record;
  }

  /**
   * Update connection lifecycle state and metadata.
   */
  updateState(
    organizationId: string,
    connectionId: string,
    updates: Partial<Omit<WebsiteConnectionRecord, 'id' | 'organizationId'>>
  ): WebsiteConnectionRecord {
    const record = this.getConnection({ organizationId, connectionId });
    if (!record) {
      throw new Error(`Website connection '${connectionId}' not found or access denied.`);
    }

    const updated: WebsiteConnectionRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.connections.set(connectionId, updated);
    return updated;
  }
}
