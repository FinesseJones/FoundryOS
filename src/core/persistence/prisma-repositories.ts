import { BusinessDNA, AuditEvent, createAuditEvent, AuditAction } from '../knowledge';
import { DNARevisionRecord, MemoryRecord, BusinessDNARepository, MemoryRepository, AuditRepository } from './repositories';

export class PrismaBusinessDNARepository extends BusinessDNARepository {
  override async saveDNA(dna: BusinessDNA, organizationId: string, actor: string = 'system'): Promise<BusinessDNA> {
    return super.saveDNA(dna, organizationId, actor);
  }

  override async getDNA(query: { organizationId: string; businessId: string }): Promise<BusinessDNA | null> {
    return super.getDNA(query);
  }

  override async listRevisions(query: { organizationId: string; businessId: string }): Promise<DNARevisionRecord[]> {
    return super.listRevisions(query);
  }
}

export class PrismaMemoryRepository extends MemoryRepository {
  override async addMemory(memory: Omit<MemoryRecord, 'id' | 'createdAt'>): Promise<MemoryRecord> {
    return super.addMemory(memory);
  }

  override async queryMemories(query: {
    organizationId: string;
    businessId: string;
    category?: string;
    minImportance?: number;
  }): Promise<MemoryRecord[]> {
    return super.queryMemories(query);
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
    return super.logEvent(params);
  }

  override async listEvents(query: { organizationId: string; businessId?: string }): Promise<AuditEvent[]> {
    return super.listEvents(query);
  }
}

export type PersistenceDriverType = 'in_memory' | 'sqlite_prisma';

export class PersistenceFactory {
  private static activeDriver: PersistenceDriverType = 'in_memory';

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
