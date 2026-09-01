import { BusinessDNA, AuditEvent, createAuditEvent, AuditAction } from '../knowledge';
import {
  DNARevisionRecord,
  MemoryRecord,
  LearningRecord,
  ConversationMessage,
  CampaignRecord,
  BusinessDNARepository,
  MemoryRepository,
  AuditRepository,
  LearningRepository,
  ConversationContextRepository,
  CampaignHistoryRepository,
} from './repositories';
import { prisma } from './prisma-client';

export class PrismaBusinessDNARepository extends BusinessDNARepository {
  override async create(params: {
    organizationId: string;
    businessId: string;
    dna: BusinessDNA;
    actor?: string;
  }): Promise<BusinessDNA> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository create()');
    }

    const existing = await prisma.businessDNA.findUnique({
      where: { businessId: params.businessId },
    });

    if (existing && existing.organizationId !== params.organizationId) {
      throw new Error(`Tenant Security Violation: Cross-customer write attempt on businessId '${params.businessId}'`);
    }

    const actor = params.actor || 'system';
    const dataJson = JSON.stringify(params.dna);

    await prisma.businessDNA.upsert({
      where: { businessId: params.businessId },
      create: {
        organizationId: params.organizationId,
        businessId: params.businessId,
        dataJson,
      },
      update: {
        dataJson,
      },
    });

    const revision: DNARevisionRecord = {
      id: `rev_${params.businessId}_1`,
      organizationId: params.organizationId,
      businessId: params.businessId,
      versionNumber: 1,
      diffSummary: `Initial Business DNA creation for ${params.dna.companyIdentity?.companyName?.value || 'Company'}`,
      snapshot: JSON.parse(JSON.stringify(params.dna)),
      createdBy: actor,
      createdAt: new Date().toISOString(),
    };

    await prisma.dNARevision.create({
      data: {
        id: revision.id,
        organizationId: revision.organizationId,
        businessId: revision.businessId,
        versionNumber: revision.versionNumber,
        diffSummary: revision.diffSummary,
        snapshotJson: JSON.stringify(revision.snapshot),
        createdBy: revision.createdBy,
        createdAt: new Date(revision.createdAt),
      },
    });

    return params.dna;
  }

  override async findById(params: {
    organizationId: string;
    businessId: string;
  }): Promise<BusinessDNA | null> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository findById()');
    }

    const record = await prisma.businessDNA.findUnique({
      where: { businessId: params.businessId },
    });

    if (!record || record.organizationId !== params.organizationId) {
      return null;
    }

    try {
      return JSON.parse(record.dataJson) as BusinessDNA;
    } catch {
      return null;
    }
  }

  override async findByOrganization(params: { organizationId: string }): Promise<BusinessDNA[]> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository findByOrganization()');
    }

    const records = await prisma.businessDNA.findMany({
      where: { organizationId: params.organizationId },
    });

    return records.map((r) => {
      try {
        return JSON.parse(r.dataJson) as BusinessDNA;
      } catch {
        return null;
      }
    }).filter((d): d is BusinessDNA => d !== null);
  }

  override async update(params: {
    organizationId: string;
    businessId: string;
    dna: BusinessDNA;
    actor?: string;
  }): Promise<BusinessDNA> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository update()');
    }

    const existing = await prisma.businessDNA.findUnique({
      where: { businessId: params.businessId },
    });

    if (existing && existing.organizationId !== params.organizationId) {
      throw new Error(`Tenant Security Violation: Cross-customer write attempt on businessId '${params.businessId}'`);
    }

    const actor = params.actor || 'system';
    const revisionsCount = await prisma.dNARevision.count({
      where: { businessId: params.businessId, organizationId: params.organizationId },
    });
    const versionNumber = revisionsCount + 1;

    const dataJson = JSON.stringify(params.dna);
    await prisma.businessDNA.upsert({
      where: { businessId: params.businessId },
      create: {
        organizationId: params.organizationId,
        businessId: params.businessId,
        dataJson,
      },
      update: {
        dataJson,
      },
    });

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

    await prisma.dNARevision.create({
      data: {
        id: revision.id,
        organizationId: revision.organizationId,
        businessId: revision.businessId,
        versionNumber: revision.versionNumber,
        diffSummary: revision.diffSummary,
        snapshotJson: JSON.stringify(revision.snapshot),
        createdBy: revision.createdBy,
        createdAt: new Date(revision.createdAt),
      },
    });

    return params.dna;
  }

  override async version(params: {
    organizationId: string;
    businessId: string;
  }): Promise<DNARevisionRecord[]> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository version()');
    }

    const revisions = await prisma.dNARevision.findMany({
      where: {
        organizationId: params.organizationId,
        businessId: params.businessId,
      },
      orderBy: { versionNumber: 'asc' },
    });

    return revisions.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      businessId: r.businessId,
      versionNumber: r.versionNumber,
      diffSummary: r.diffSummary,
      snapshot: JSON.parse(r.snapshotJson) as BusinessDNA,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  override async delete(params: {
    organizationId: string;
    businessId: string;
  }): Promise<boolean> {
    if (!params.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for repository delete()');
    }

    const existing = await prisma.businessDNA.findUnique({
      where: { businessId: params.businessId },
    });

    if (!existing || existing.organizationId !== params.organizationId) {
      return false;
    }

    await prisma.dNARevision.deleteMany({
      where: { businessId: params.businessId, organizationId: params.organizationId },
    });

    await prisma.businessDNA.delete({
      where: { businessId: params.businessId },
    });

    return true;
  }

  override async saveDNA(dna: BusinessDNA, organizationId: string, actor: string = 'system'): Promise<BusinessDNA> {
    const existing = await this.findById({ organizationId, businessId: dna.businessId });
    if (existing) {
      return this.update({ organizationId, businessId: dna.businessId, dna, actor });
    }
    return this.create({ organizationId, businessId: dna.businessId, dna, actor });
  }

  override async getDNA(query: { organizationId: string; businessId: string }): Promise<BusinessDNA | null> {
    return this.findById(query);
  }

  override async listRevisions(query: { organizationId: string; businessId: string }): Promise<DNARevisionRecord[]> {
    return this.version(query);
  }
}

export class PrismaMemoryRepository extends MemoryRepository {
  override async addMemory(memory: Omit<MemoryRecord, 'id' | 'createdAt'>): Promise<MemoryRecord> {
    if (!memory.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for memory creation');
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const created = await prisma.memoryRecord.create({
      data: {
        id,
        organizationId: memory.organizationId,
        businessId: memory.businessId,
        category: memory.category,
        content: memory.content,
        importance: memory.importance,
        relevance: memory.relevance,
      },
    });

    return {
      id: created.id,
      organizationId: created.organizationId,
      businessId: created.businessId,
      category: created.category as any,
      content: created.content,
      importance: created.importance,
      relevance: created.relevance,
      createdAt: created.createdAt.toISOString(),
    };
  }

  override async queryMemories(query: {
    organizationId: string;
    businessId: string;
    category?: string;
    minImportance?: number;
  }): Promise<MemoryRecord[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for memory queries');
    }

    const minImportance = query.minImportance ?? 0.5;
    const records = await prisma.memoryRecord.findMany({
      where: {
        organizationId: query.organizationId,
        businessId: query.businessId,
        ...(query.category ? { category: query.category } : {}),
        importance: { gte: minImportance },
      },
    });

    return records.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      businessId: r.businessId,
      category: r.category as any,
      content: r.content,
      importance: r.importance,
      relevance: r.relevance,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}

export class PrismaAuditRepository extends AuditRepository {
  override async logEvent(params: {
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

    await prisma.auditEvent.create({
      data: {
        id: fullEvent.id,
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: params.action,
        changedBy: params.changedBy,
        detailsJson: JSON.stringify(fullEvent.details || {}),
        timestamp: new Date(fullEvent.timestamp),
      },
    });

    return fullEvent;
  }

  override async listEvents(query: { organizationId: string; businessId?: string }): Promise<AuditEvent[]> {
    if (!query.organizationId) {
      throw new Error('Tenant Security Violation: organizationId is required for audit event queries');
    }

    const records = await prisma.auditEvent.findMany({
      where: {
        organizationId: query.organizationId,
        ...(query.businessId ? { businessId: query.businessId } : {}),
      },
      orderBy: { timestamp: 'desc' },
    });

    return records.map((r) => {
      let details: Record<string, unknown> = {};
      try {
        details = JSON.parse(r.detailsJson);
      } catch {}
      return {
        id: r.id,
        businessId: r.businessId || '',
        action: r.action as AuditAction,
        changedBy: r.changedBy,
        timestamp: r.timestamp.toISOString(),
        details,
      };
    });
  }
}

export type PersistenceDriverType = 'in_memory' | 'sqlite_prisma';

export class PersistenceFactory {
  private static activeDriver: PersistenceDriverType = 'sqlite_prisma';

  public static setDriver(driver: PersistenceDriverType): void {
    PersistenceFactory.activeDriver = driver;
  }

  public static getDriver(): PersistenceDriverType {
    return PersistenceFactory.activeDriver;
  }

  public static createBusinessDNARepository(): BusinessDNARepository {
    if (PersistenceFactory.activeDriver === 'sqlite_prisma') {
      return new PrismaBusinessDNARepository();
    }
    return new BusinessDNARepository();
  }

  public static createMemoryRepository(): MemoryRepository {
    if (PersistenceFactory.activeDriver === 'sqlite_prisma') {
      return new PrismaMemoryRepository();
    }
    return new MemoryRepository();
  }

  public static createAuditRepository(): AuditRepository {
    if (PersistenceFactory.activeDriver === 'sqlite_prisma') {
      return new PrismaAuditRepository();
    }
    return new AuditRepository();
  }
}
