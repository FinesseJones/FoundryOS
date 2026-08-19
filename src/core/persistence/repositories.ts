import { BusinessDNA, AuditEvent, createAuditEvent, AuditAction } from '../knowledge';

export interface DNARevisionRecord {
  id: string;
  organizationId: string;
  businessId: string;
  versionNumber: number;
  diffSummary: string;
  snapshot: BusinessDNA;
  createdBy: string;
  createdAt: string;
}

export interface MemoryRecord {
  id: string;
  organizationId: string;
  businessId: string;
  category: 'brand' | 'campaign' | 'customer' | 'decision' | 'security' | 'intelligence_learning' | 'execution_learning' | 'automation_learning';
  content: string;
  importance: number;
  relevance: number;
  createdAt: string;
}

export interface LearningRecord {
  id: string;
  organizationId: string;
  businessId: string;
  learnedFrom: string;
  knowledgeAcquired: string;
  confidenceScore: number;
  actionsExecuted: string[];
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  organizationId: string;
  businessId: string;
  sessionTitle: string;
  messages: { sender: string; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecord {
  id: string;
  organizationId: string;
  businessId: string;
  campaignName: string;
  channel: 'facebook' | 'google' | 'instagram' | 'email';
  status: 'active' | 'paused' | 'completed';
  roi: number;
  metrics: Record<string, unknown>;
  createdAt: string;
}

export class BusinessDNARepository {
  protected dnaStore: Map<string, { dna: BusinessDNA; organizationId: string }> = new Map();
  protected revisionStore: Map<string, DNARevisionRecord[]> = new Map();

  async create(params: {
    organizationId: string;
    businessId: string;
    dna: BusinessDNA;
    actor?: string;
  }): Promise<BusinessDNA> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository create()');
    }

    const existing = this.dnaStore.get(params.businessId);
    if (existing && existing.organizationId !== params.organizationId) {
      throw new Error(`Tenant Security Violation: Cross-customer write attempt on businessId '${params.businessId}'`);
    }

    const actor = params.actor || 'system';
    const versionNumber = 1;

    this.dnaStore.set(params.businessId, { dna: params.dna, organizationId: params.organizationId });

    const revision: DNARevisionRecord = {
      id: `rev_${params.businessId}_${versionNumber}`,
      organizationId: params.organizationId,
      businessId: params.businessId,
      versionNumber,
      diffSummary: `Initial Business DNA creation for ${params.dna.companyIdentity?.companyName?.value || 'Company'}`,
      snapshot: JSON.parse(JSON.stringify(params.dna)),
      createdBy: actor,
      createdAt: new Date().toISOString(),
    };

    this.revisionStore.set(params.businessId, [revision]);
    return params.dna;
  }

  async findById(params: {
    organizationId: string;
    businessId: string;
  }): Promise<BusinessDNA | null> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository findById()');
    }

    const entry = this.dnaStore.get(params.businessId);
    if (!entry) return null;
    if (entry.organizationId !== params.organizationId) {
      return null;
    }
    return entry.dna;
  }

  async findByOrganization(params: { organizationId: string }): Promise<BusinessDNA[]> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository findByOrganization()');
    }

    const results: BusinessDNA[] = [];
    for (const entry of this.dnaStore.values()) {
      if (entry.organizationId === params.organizationId) {
        results.push(entry.dna);
      }
    }
    return results;
  }

  async update(params: {
    organizationId: string;
    businessId: string;
    dna: BusinessDNA;
    actor?: string;
  }): Promise<BusinessDNA> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository update()');
    }

    const existing = this.dnaStore.get(params.businessId);
    if (existing && existing.organizationId !== params.organizationId) {
      throw new Error(`Tenant Security Violation: Cross-customer write attempt on businessId '${params.businessId}'`);
    }

    const actor = params.actor || 'system';
    const revisions = this.revisionStore.get(params.businessId) || [];
    const versionNumber = revisions.length + 1;

    this.dnaStore.set(params.businessId, { dna: params.dna, organizationId: params.organizationId });

    const revision: DNARevisionRecord = {
      id: `rev_${params.businessId}_${versionNumber}`,
      organizationId: params.organizationId,
      businessId: params.businessId,
      versionNumber,
      diffSummary: `Updated Business DNA attributes for ${params.dna.companyIdentity?.companyName?.value || 'Company'}`,
      snapshot: JSON.parse(JSON.stringify(params.dna)),
      createdBy: actor,
      createdAt: new Date().toISOString(),
    };

    revisions.push(revision);
    this.revisionStore.set(params.businessId, revisions);

    return params.dna;
  }

  async version(params: {
    organizationId: string;
    businessId: string;
  }): Promise<DNARevisionRecord[]> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository version()');
    }

    const entry = this.dnaStore.get(params.businessId);
    if (!entry || entry.organizationId !== params.organizationId) {
      return [];
    }
    return this.revisionStore.get(params.businessId) || [];
  }

  async delete(params: {
    organizationId: string;
    businessId: string;
  }): Promise<boolean> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository delete()');
    }

    const entry = this.dnaStore.get(params.businessId);
    if (!entry || entry.organizationId !== params.organizationId) {
      return false;
    }

    this.dnaStore.delete(params.businessId);
    this.revisionStore.delete(params.businessId);
    return true;
  }

  // --- Backward Compatibility Delegate Methods ---

  async saveDNA(dna: BusinessDNA, organizationId: string, actor: string = 'system'): Promise<BusinessDNA> {
    const existing = await this.findById({ organizationId, businessId: dna.businessId });
    if (existing) {
      return this.update({ organizationId, businessId: dna.businessId, dna, actor });
    }
    return this.create({ organizationId, businessId: dna.businessId, dna, actor });
  }

  async getDNA(query: { organizationId: string; businessId: string }): Promise<BusinessDNA | null> {
    return this.findById(query);
  }

  async listRevisions(query: { organizationId: string; businessId: string }): Promise<DNARevisionRecord[]> {
    return this.version(query);
  }
}

export class MemoryRepository {
  protected memoryStore: Map<string, MemoryRecord[]> = new Map();

  async addMemory(memory: Omit<MemoryRecord, 'id' | 'createdAt'>): Promise<MemoryRecord> {
    if (!memory.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for memory creation');
    }

    const record: MemoryRecord = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const list = this.memoryStore.get(memory.businessId) || [];
    list.push(record);
    this.memoryStore.set(memory.businessId, list);
    return record;
  }

  async queryMemories(query: {
    organizationId: string;
    businessId: string;
    category?: string;
    minImportance?: number;
  }): Promise<MemoryRecord[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for memory queries');
    }

    const list = this.memoryStore.get(query.businessId) || [];
    const minImportance = query.minImportance ?? 0.5;

    return list.filter(
      (m) =>
        m.organizationId === query.organizationId &&
        m.businessId === query.businessId &&
        (!query.category || m.category === query.category) &&
        m.importance >= minImportance
    );
  }
}

export class AuditRepository {
  protected auditLogs: AuditEvent[] = [];

  async logEvent(params: {
    organizationId: string;
    businessId: string;
    action: AuditAction;
    changedBy: string;
    details?: Record<string, unknown>;
  }): Promise<AuditEvent> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for audit logging');
    }

    const fullEvent = createAuditEvent({
      businessId: params.businessId,
      action: params.action,
      changedBy: params.changedBy,
      details: { ...params.details, organizationId: params.organizationId },
    });
    this.auditLogs.push(fullEvent);
    return fullEvent;
  }

  async listEvents(query: { organizationId: string; businessId?: string }): Promise<AuditEvent[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for audit event queries');
    }

    return this.auditLogs.filter(
      (e) =>
        (e.details as Record<string, unknown>)?.organizationId === query.organizationId &&
        (!query.businessId || e.businessId === query.businessId)
    );
  }
}

export class LearningRepository {
  protected learningStore: Map<string, LearningRecord[]> = new Map();

  async recordLearning(record: Omit<LearningRecord, 'id' | 'createdAt'>): Promise<LearningRecord> {
    if (!record.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for learning record creation');
    }

    const fullRecord: LearningRecord = {
      ...record,
      id: `learn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const list = this.learningStore.get(record.businessId) || [];
    list.push(fullRecord);
    this.learningStore.set(record.businessId, list);
    return fullRecord;
  }

  async listLearnings(query: { organizationId: string; businessId: string }): Promise<LearningRecord[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for learning queries');
    }

    const list = this.learningStore.get(query.businessId) || [];
    return list.filter((l) => l.organizationId === query.organizationId);
  }
}

export class ConversationContextRepository {
  protected contextStore: Map<string, ConversationMessage[]> = new Map();

  async saveContext(params: Omit<ConversationMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConversationMessage> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for conversation context save');
    }

    const fullMessage: ConversationMessage = {
      ...params,
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = this.contextStore.get(params.businessId) || [];
    list.push(fullMessage);
    this.contextStore.set(params.businessId, list);
    return fullMessage;
  }

  async getContext(query: { organizationId: string; businessId: string }): Promise<ConversationMessage[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for conversation context get');
    }

    const list = this.contextStore.get(query.businessId) || [];
    return list.filter((c) => c.organizationId === query.organizationId);
  }
}

export class CampaignHistoryRepository {
  protected campaignStore: Map<string, CampaignRecord[]> = new Map();

  async recordCampaign(campaign: Omit<CampaignRecord, 'id' | 'createdAt'>): Promise<CampaignRecord> {
    if (!campaign.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for campaign record creation');
    }

    const fullCampaign: CampaignRecord = {
      ...campaign,
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const list = this.campaignStore.get(campaign.businessId) || [];
    list.push(fullCampaign);
    this.campaignStore.set(campaign.businessId, list);
    return fullCampaign;
  }

  async listCampaigns(query: { organizationId: string; businessId: string }): Promise<CampaignRecord[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for campaign history queries');
    }

    const list = this.campaignStore.get(query.businessId) || [];
    return list.filter((c) => c.organizationId === query.organizationId);
  }
}
