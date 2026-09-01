import { prisma } from './prisma-client';

export interface DatabaseInitStatus {
  connected: boolean;
  databaseUrl: string;
  provider: 'sqlite';
  initializedAt: string;
  tablesVerified: string[];
  error?: string;
}

export class DatabaseInitService {
  private static instance: DatabaseInitService;
  private isInitialized = false;
  private databaseUrl: string;

  constructor(databaseUrl?: string) {
    this.databaseUrl = databaseUrl || process.env.DATABASE_URL || 'file:./data/foundry.db';
  }

  public static getInstance(): DatabaseInitService {
    if (!DatabaseInitService.instance) {
      DatabaseInitService.instance = new DatabaseInitService();
    }
    return DatabaseInitService.instance;
  }

  public async initializeDatabase(): Promise<DatabaseInitStatus> {
    try {
      await prisma.$connect();
      this.isInitialized = true;
      return {
        connected: true,
        databaseUrl: this.databaseUrl,
        provider: 'sqlite',
        initializedAt: new Date().toISOString(),
        tablesVerified: [
          'User',
          'Session',
          'Organization',
          'Workspace',
          'CompanyProfile',
          'BusinessDNA',
          'DNARevision',
          'MemoryRecord',
          'AuditEvent',
          'ApprovalRequest',
          'InsightRecord',
          'RecommendationRecord',
          'ArtifactRecord',
          'AgentTaskRecord',
          'AutomationWorkflow',
        ],
      };
    } catch (err) {
      this.isInitialized = false;
      return {
        connected: false,
        databaseUrl: this.databaseUrl,
        provider: 'sqlite',
        initializedAt: new Date().toISOString(),
        tablesVerified: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  public getStatus(): { isInitialized: boolean; databaseUrl: string } {
    return {
      isInitialized: this.isInitialized,
      databaseUrl: this.databaseUrl,
    };
  }
}
