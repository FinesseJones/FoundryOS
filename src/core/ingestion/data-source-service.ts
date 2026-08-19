import { AuditRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';

export type DataSourceType = 'WEBSITE' | 'DOCUMENT' | 'CSV' | 'SPREADSHEET' | 'API' | 'OTHER';

export type ConnectionState = 'CONNECTED' | 'PENDING' | 'SYNCING' | 'FAILED' | 'DISCONNECTED';

export interface DataSourceRecord {
  id: string;
  organizationId: string;
  businessId: string;
  sourceType: DataSourceType;
  sourceName: string;
  sourceStatus: string;
  connectionStatus: ConnectionState;
  lastSyncAt?: string;
  syncCount: number;
  createdAt: string;
  updatedAt: string;
}

export class DataSourceService {
  private sources: Map<string, DataSourceRecord> = new Map();

  constructor(
    private auditRepo?: AuditRepository,
    private notificationService?: CustomerNotificationService
  ) {}

  /**
   * Register a new data source for an organization.
   */
  async createSource(params: {
    organizationId: string;
    businessId: string;
    sourceType: DataSourceType;
    sourceName: string;
    actor: string;
  }): Promise<DataSourceRecord> {
    const id = `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: DataSourceRecord = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      sourceType: params.sourceType,
      sourceName: params.sourceName,
      sourceStatus: 'ACTIVE',
      connectionStatus: 'CONNECTED',
      syncCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.sources.set(id, record);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'create',
        changedBy: params.actor,
        details: {
          eventType: 'DATA_SOURCE_CREATED',
          sourceId: id,
          sourceType: params.sourceType,
          sourceName: params.sourceName,
        },
      });
    }

    return record;
  }

  /**
   * Retrieve all data sources registered for an organization.
   */
  getSourcesByOrganization(organizationId: string, businessId?: string): DataSourceRecord[] {
    return Array.from(this.sources.values()).filter(
      (s) => s.organizationId === organizationId && (!businessId || s.businessId === businessId)
    );
  }

  /**
   * Update data source status with tenant verification.
   */
  async updateSourceStatus(
    organizationId: string,
    sourceId: string,
    updates: Partial<Omit<DataSourceRecord, 'id' | 'organizationId'>>,
    actor: string = 'system'
  ): Promise<DataSourceRecord> {
    const record = this.sources.get(sourceId);
    if (!record || record.organizationId !== organizationId) {
      throw new Error(`Data source '${sourceId}' not found or tenant access denied.`);
    }

    const updated: DataSourceRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.sources.set(sourceId, updated);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId,
        businessId: record.businessId,
        action: 'update',
        changedBy: actor,
        details: {
          eventType: 'DATA_SOURCE_UPDATED',
          sourceId,
          updates,
        },
      });
    }

    return updated;
  }

  /**
   * Record a synchronization event for a source.
   */
  async recordSync(
    organizationId: string,
    sourceId: string,
    status: ConnectionState = 'CONNECTED',
    actor: string = 'system'
  ): Promise<DataSourceRecord> {
    const record = this.sources.get(sourceId);
    if (!record || record.organizationId !== organizationId) {
      throw new Error(`Data source '${sourceId}' not found or tenant access denied.`);
    }

    const updated: DataSourceRecord = {
      ...record,
      connectionStatus: status,
      lastSyncAt: new Date().toISOString(),
      syncCount: record.syncCount + 1,
      updatedAt: new Date().toISOString(),
    };

    this.sources.set(sourceId, updated);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId,
        businessId: record.businessId,
        action: 'update',
        changedBy: actor,
        details: {
          eventType: 'DATA_SOURCE_SYNCED',
          sourceId,
          syncCount: updated.syncCount,
          connectionStatus: status,
        },
      });
    }

    if (this.notificationService) {
      this.notificationService.sendCustomerAlert({
        organizationId,
        businessId: record.businessId,
        type: 'dna_updated',
        title: 'Data Source Synchronized',
        message: `Data source '${record.sourceName}' (${record.sourceType}) synchronized successfully.`,
      });
    }

    return updated;
  }

  /**
   * Disconnect a data source.
   */
  async disconnectSource(
    organizationId: string,
    sourceId: string,
    actor: string
  ): Promise<DataSourceRecord> {
    const record = this.sources.get(sourceId);
    if (!record || record.organizationId !== organizationId) {
      throw new Error(`Data source '${sourceId}' not found or tenant access denied.`);
    }

    const updated: DataSourceRecord = {
      ...record,
      connectionStatus: 'DISCONNECTED',
      sourceStatus: 'INACTIVE',
      updatedAt: new Date().toISOString(),
    };

    this.sources.set(sourceId, updated);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId,
        businessId: record.businessId,
        action: 'update',
        changedBy: actor,
        details: {
          eventType: 'DATA_SOURCE_DISCONNECTED',
          sourceId,
          sourceName: record.sourceName,
        },
      });
    }

    return updated;
  }
}
