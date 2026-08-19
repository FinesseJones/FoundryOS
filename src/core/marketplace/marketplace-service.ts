import { AgentRole } from '../agents/agent.types';
import { CustomWorkflowDefinition, AutomationBuilderService } from '../automation/automation-builder-service';
import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';

// ─── Marketplace Package Schemas ────────────────────────────────────────────

export type PackageStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'DEPRECATED' | 'REJECTED';

export interface MarketplacePackage {
  packageId: string;
  name: string;
  description: string;
  version: string;
  authorOrganizationId: string;
  authorName: string;
  domain: 'marketing' | 'sales' | 'operations' | 'security' | 'industry_pack';
  workflowDefinition: CustomWorkflowDefinition;
  requiredAgents: AgentRole[];
  priceMonthly: number; // 0 for free
  rating: number; // 0.0 - 5.0
  reviewsCount: number;
  downloads: number;
  status: PackageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InstalledPackageRecord {
  installationId: string;
  organizationId: string;
  businessId: string;
  packageId: string;
  packageVersion: string;
  installedAt: string;
  status: 'ACTIVE' | 'UNINSTALLED';
}

// ─── Marketplace Service ────────────────────────────────────────────────────

export class MarketplaceService {
  private packagesStore: Map<string, MarketplacePackage> = new Map();
  private installationsStore: Map<string, InstalledPackageRecord[]> = new Map();

  constructor(
    private dnaRepo: BusinessDNARepository,
    private builderService: AutomationBuilderService,
    private auditRepo?: AuditRepository
  ) {}

  private async assertTenant(organizationId: string, businessId: string): Promise<void> {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) {
      throw new Error(`Tenant Security Violation: Access denied for org '${organizationId}' to business '${businessId}'`);
    }
  }

  // ─── 1. Publishing Workflow ────────────────────────────────────────────────

  /**
   * Submit a custom agent automation package to the marketplace for review.
   */
  async submitPackageForReview(params: {
    packageId?: string;
    authorOrganizationId: string;
    authorName: string;
    name: string;
    description: string;
    version: string;
    domain: 'marketing' | 'sales' | 'operations' | 'security' | 'industry_pack';
    workflowDefinition: CustomWorkflowDefinition;
    requiredAgents: AgentRole[];
    priceMonthly?: number;
    actor: string;
  }): Promise<MarketplacePackage> {
    const packageId = params.packageId ?? `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Validate workflow definition graph integrity
    const validation = this.builderService.validateWorkflowDefinition(params.workflowDefinition);
    if (!validation.valid) {
      throw new Error(`MarketplaceService: Cannot submit invalid workflow package. Errors: [${validation.errors.join('; ')}]`);
    }

    const now = new Date().toISOString();

    const pkg: MarketplacePackage = {
      packageId,
      name: params.name,
      description: params.description,
      version: params.version,
      authorOrganizationId: params.authorOrganizationId,
      authorName: params.authorName,
      domain: params.domain,
      workflowDefinition: params.workflowDefinition,
      requiredAgents: params.requiredAgents,
      priceMonthly: params.priceMonthly ?? 0,
      rating: 5.0,
      reviewsCount: 0,
      downloads: 0,
      status: 'UNDER_REVIEW',
      createdAt: now,
      updatedAt: now,
    };

    this.packagesStore.set(packageId, pkg);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.authorOrganizationId,
        businessId: params.workflowDefinition.businessId,
        action: 'create',
        changedBy: params.actor,
        details: {
          eventType: 'MARKETPLACE_PACKAGE_SUBMITTED',
          packageId,
          name: params.name,
          version: params.version,
        },
      });
    }

    return pkg;
  }

  /**
   * Review and approve/reject a submitted package.
   */
  async reviewPackage(params: {
    packageId: string;
    approved: boolean;
    reviewerActor: string;
    rejectionReason?: string;
  }): Promise<MarketplacePackage> {
    const pkg = this.packagesStore.get(params.packageId);
    if (!pkg) throw new Error(`MarketplaceService: Package '${params.packageId}' not found.`);

    pkg.status = params.approved ? 'PUBLISHED' : 'REJECTED';
    pkg.updatedAt = new Date().toISOString();

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: pkg.authorOrganizationId,
        businessId: pkg.workflowDefinition.businessId,
        action: params.approved ? 'approve' : 'reject',
        changedBy: params.reviewerActor,
        details: {
          eventType: params.approved ? 'MARKETPLACE_PACKAGE_PUBLISHED' : 'MARKETPLACE_PACKAGE_REJECTED',
          packageId: params.packageId,
          reason: params.rejectionReason,
        },
      });
    }

    return pkg;
  }

  /**
   * Deprecate a marketplace package.
   */
  async deprecatePackage(packageId: string, actor: string): Promise<MarketplacePackage> {
    const pkg = this.packagesStore.get(packageId);
    if (!pkg) throw new Error(`MarketplaceService: Package '${packageId}' not found.`);

    pkg.status = 'DEPRECATED';
    pkg.updatedAt = new Date().toISOString();

    return pkg;
  }

  // ─── 2. Catalog Discovery ──────────────────────────────────────────────────

  /**
   * Retrieve catalog of published marketplace packages.
   */
  getCatalog(query?: {
    domain?: string;
    search?: string;
    minRating?: number;
    authorOrganizationId?: string;
  }): MarketplacePackage[] {
    return Array.from(this.packagesStore.values()).filter((pkg) => {
      if (pkg.status !== 'PUBLISHED') return false;
      if (query?.domain && pkg.domain !== query.domain) return false;
      if (query?.minRating && pkg.rating < query.minRating) return false;
      if (query?.authorOrganizationId && pkg.authorOrganizationId !== query.authorOrganizationId) return false;
      if (query?.search) {
        const term = query.search.toLowerCase();
        const matchName = pkg.name.toLowerCase().includes(term);
        const matchDesc = pkg.description.toLowerCase().includes(term);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }

  /**
   * Get details for a specific package.
   */
  getPackageDetails(packageId: string): MarketplacePackage {
    const pkg = this.packagesStore.get(packageId);
    if (!pkg) throw new Error(`MarketplaceService: Package '${packageId}' not found.`);
    return pkg;
  }

  // ─── 3. Install & Uninstall System ────────────────────────────────────────

  /**
   * Install a published marketplace package into a customer workspace.
   */
  async installPackage(params: {
    organizationId: string;
    businessId: string;
    packageId: string;
    actor: string;
  }): Promise<InstalledPackageRecord> {
    await this.assertTenant(params.organizationId, params.businessId);

    const pkg = this.packagesStore.get(params.packageId);
    if (!pkg) throw new Error(`MarketplaceService: Package '${params.packageId}' not found.`);

    if (pkg.status !== 'PUBLISHED') {
      throw new Error(`MarketplaceService: Package '${params.packageId}' cannot be installed (Status: ${pkg.status}).`);
    }

    const key = `${params.organizationId}_${params.businessId}`;
    const installed = this.installationsStore.get(key) || [];

    const existing = installed.find((i) => i.packageId === params.packageId && i.status === 'ACTIVE');
    if (existing) {
      throw new Error(`MarketplaceService: Package '${params.packageId}' is already installed.`);
    }

    const installationId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: InstalledPackageRecord = {
      installationId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      packageId: params.packageId,
      packageVersion: pkg.version,
      installedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    installed.push(record);
    this.installationsStore.set(key, installed);

    // Register workflow definition into customer's builder service
    const tenantWorkflow: CustomWorkflowDefinition = {
      ...JSON.parse(JSON.stringify(pkg.workflowDefinition)),
      workflowId: `wf_inst_${params.packageId}_${Date.now()}`,
      organizationId: params.organizationId,
      businessId: params.businessId,
    };

    await this.builderService.createWorkflowDefinition({
      definition: tenantWorkflow,
      actor: params.actor,
    });

    pkg.downloads += 1;

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'create',
        changedBy: params.actor,
        details: {
          eventType: 'MARKETPLACE_PACKAGE_INSTALLED',
          installationId,
          packageId: params.packageId,
          packageVersion: pkg.version,
        },
      });
    }

    return record;
  }

  /**
   * Uninstall a marketplace package from a customer workspace.
   */
  async uninstallPackage(params: {
    organizationId: string;
    businessId: string;
    packageId: string;
    actor: string;
  }): Promise<InstalledPackageRecord> {
    await this.assertTenant(params.organizationId, params.businessId);

    const key = `${params.organizationId}_${params.businessId}`;
    const installed = this.installationsStore.get(key) || [];

    const record = installed.find((i) => i.packageId === params.packageId && i.status === 'ACTIVE');
    if (!record) {
      throw new Error(`MarketplaceService: Active installation for package '${params.packageId}' not found.`);
    }

    record.status = 'UNINSTALLED';

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'update',
        changedBy: params.actor,
        details: {
          eventType: 'MARKETPLACE_PACKAGE_UNINSTALLED',
          installationId: record.installationId,
          packageId: params.packageId,
        },
      });
    }

    return record;
  }

  /**
   * List installed packages for a customer workspace.
   */
  async listInstalledPackages(organizationId: string, businessId: string): Promise<InstalledPackageRecord[]> {
    await this.assertTenant(organizationId, businessId);

    const key = `${organizationId}_${businessId}`;
    const installed = this.installationsStore.get(key) || [];
    return installed.filter((i) => i.status === 'ACTIVE');
  }
}
