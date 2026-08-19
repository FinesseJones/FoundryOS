import { AutomationRecord } from './customer-automation-service';
import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';

// ─── Versioning & Migration Schemas ─────────────────────────────────────────

export type MigrationStatus = 'STABLE' | 'DEPRECATED' | 'ROLLED_BACK';

export interface AutomationVersionRecord {
  versionId: string;
  organizationId: string;
  businessId: string;
  automationId: string;
  versionNumber: number;
  snapshot: AutomationRecord;
  changeDescription: string;
  changedBy: string;
  createdAt: string;
  migrationStatus: MigrationStatus;
}

export interface MigrationSafetyResult {
  safe: boolean;
  warnings: string[];
  breakingChanges: string[];
}

// ─── Automation Versioning Service ──────────────────────────────────────────

export class AutomationVersioningService {
  private versionsStore: Map<string, AutomationVersionRecord[]> = new Map();

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo?: AuditRepository
  ) {}

  private async assertTenant(organizationId: string, businessId: string): Promise<void> {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) {
      throw new Error(`Tenant Security Violation: Access denied for org '${organizationId}' to business '${businessId}'`);
    }
  }

  /**
   * Create and record a new version snapshot for a customer automation.
   */
  async createVersionSnapshot(params: {
    organizationId: string;
    businessId: string;
    automation: AutomationRecord;
    changeDescription: string;
    actor: string;
  }): Promise<AutomationVersionRecord> {
    await this.assertTenant(params.organizationId, params.businessId);

    const key = `${params.organizationId}_${params.automation.id}`;
    const history = this.versionsStore.get(key) || [];

    const versionNumber = history.length + 1;
    const versionId = `ver_${params.automation.id}_v${versionNumber}`;

    const versionRecord: AutomationVersionRecord = {
      versionId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      automationId: params.automation.id,
      versionNumber,
      snapshot: JSON.parse(JSON.stringify(params.automation)),
      changeDescription: params.changeDescription,
      changedBy: params.actor,
      createdAt: new Date().toISOString(),
      migrationStatus: 'STABLE',
    };

    history.push(versionRecord);
    this.versionsStore.set(key, history);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'create',
        changedBy: params.actor,
        details: {
          eventType: 'AUTOMATION_VERSION_CREATED',
          automationId: params.automation.id,
          versionNumber,
          versionId,
          changeDescription: params.changeDescription,
        },
      });
    }

    return versionRecord;
  }

  /**
   * Retrieve all historical version snapshots for an automation.
   */
  async getAutomationVersions(
    organizationId: string,
    businessId: string,
    automationId: string
  ): Promise<AutomationVersionRecord[]> {
    await this.assertTenant(organizationId, businessId);

    const key = `${organizationId}_${automationId}`;
    return this.versionsStore.get(key) || [];
  }

  /**
   * Validate migration and rollback safety before restoring a target version.
   */
  async validateMigrationSafety(
    organizationId: string,
    businessId: string,
    automationId: string,
    targetVersionNumber: number,
    currentAutomation: AutomationRecord
  ): Promise<MigrationSafetyResult> {
    await this.assertTenant(organizationId, businessId);

    const versions = await this.getAutomationVersions(organizationId, businessId, automationId);
    const targetVersion = versions.find((v) => v.versionNumber === targetVersionNumber);

    const warnings: string[] = [];
    const breakingChanges: string[] = [];

    if (!targetVersion) {
      breakingChanges.push(`Target version v${targetVersionNumber} does not exist for automation '${automationId}'.`);
      return { safe: false, warnings, breakingChanges };
    }

    if (currentAutomation.status === 'ACTIVE') {
      warnings.push(`Automation '${currentAutomation.name}' is currently ACTIVE. Rollback will apply changes live.`);
    }

    if (targetVersion.snapshot.triggerType !== currentAutomation.triggerType) {
      warnings.push(
        `Trigger type will change from '${currentAutomation.triggerType}' to '${targetVersion.snapshot.triggerType}'.`
      );
    }

    if (targetVersion.migrationStatus === 'DEPRECATED') {
      breakingChanges.push(`Target version v${targetVersionNumber} is marked as DEPRECATED.`);
    }

    return {
      safe: breakingChanges.length === 0,
      warnings,
      breakingChanges,
    };
  }

  /**
   * Perform atomic rollback to a previous automation version snapshot.
   */
  async rollbackToVersion(params: {
    organizationId: string;
    businessId: string;
    currentAutomation: AutomationRecord;
    targetVersionNumber: number;
    actor: string;
  }): Promise<{ restoredAutomation: AutomationRecord; rollbackVersion: AutomationVersionRecord }> {
    await this.assertTenant(params.organizationId, params.businessId);

    const safety = await this.validateMigrationSafety(
      params.organizationId,
      params.businessId,
      params.currentAutomation.id,
      params.targetVersionNumber,
      params.currentAutomation
    );

    if (!safety.safe) {
      throw new Error(
        `AutomationVersioning: Migration safety check failed. Breaking changes: [${safety.breakingChanges.join('; ')}]`
      );
    }

    const versions = await this.getAutomationVersions(
      params.organizationId,
      params.businessId,
      params.currentAutomation.id
    );

    const targetVersion = versions.find((v) => v.versionNumber === params.targetVersionNumber)!;

    // Mark intermediate versions as ROLLED_BACK / DEPRECATED
    for (const v of versions) {
      if (v.versionNumber > params.targetVersionNumber) {
        v.migrationStatus = 'ROLLED_BACK';
      }
    }

    // Restore snapshot into current automation
    const restoredAutomation: AutomationRecord = {
      ...JSON.parse(JSON.stringify(targetVersion.snapshot)),
      lastExecutedAt: params.currentAutomation.lastExecutedAt,
      executionCount: params.currentAutomation.executionCount,
    };

    // Record the rollback as a new snapshot version
    const newVersion = await this.createVersionSnapshot({
      organizationId: params.organizationId,
      businessId: params.businessId,
      automation: restoredAutomation,
      changeDescription: `Rollback to version v${params.targetVersionNumber}`,
      actor: params.actor,
    });

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'rollback',
        changedBy: params.actor,
        details: {
          eventType: 'AUTOMATION_ROLLED_BACK',
          automationId: params.currentAutomation.id,
          targetVersionNumber: params.targetVersionNumber,
          restoredVersionId: targetVersion.versionId,
          newVersionNumber: newVersion.versionNumber,
        },
      });
    }

    return { restoredAutomation, rollbackVersion: newVersion };
  }
}
