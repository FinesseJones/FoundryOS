import { BusinessDNARepository, AuditRepository, DNARevisionRecord } from '../persistence/repositories';
import { BusinessDNA, createKnowledgeField } from '../knowledge';

export type DNAApprovalState = 'PENDING_REVIEW' | 'APPROVED' | 'NEEDS_REVISION';

export interface DNAReviewStatus {
  businessId: string;
  approvalState: DNAApprovalState;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  versionNumber: number;
}

export class DNAReviewService {
  private statusMap: Map<string, DNAReviewStatus> = new Map();

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository
  ) {}

  getReviewStatus(businessId: string): DNAReviewStatus {
    return (
      this.statusMap.get(businessId) || {
        businessId,
        approvalState: 'PENDING_REVIEW',
        versionNumber: 1,
      }
    );
  }

  async approveDNA(params: {
    organizationId: string;
    businessId: string;
    approvedBy: string;
    notes?: string;
  }): Promise<DNAReviewStatus> {
    const dna = await this.dnaRepo.getDNA({
      organizationId: params.organizationId,
      businessId: params.businessId,
    });

    if (!dna) {
      throw new Error(`Business DNA not found for businessId '${params.businessId}'`);
    }

    const currentStatus = this.getReviewStatus(params.businessId);
    const updatedStatus: DNAReviewStatus = {
      businessId: params.businessId,
      approvalState: 'APPROVED',
      reviewedBy: params.approvedBy,
      reviewedAt: new Date().toISOString(),
      notes: params.notes ?? 'Approved by customer executive',
      versionNumber: currentStatus.versionNumber,
    };

    this.statusMap.set(params.businessId, updatedStatus);

    // Log Audit Event in AuditRepository
    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'approve',
      changedBy: params.approvedBy,
      details: { notes: updatedStatus.notes, target: 'BusinessDNA' },
    });

    return updatedStatus;
  }

  async applyCustomerCorrection(params: {
    organizationId: string;
    businessId: string;
    correctedBy: string;
    updates: Partial<{
      companyName: string;
      mission: string;
      primaryTone: string;
    }>;
  }): Promise<{ updatedDNA: BusinessDNA; revision: DNARevisionRecord }> {
    const dna = await this.dnaRepo.getDNA({
      organizationId: params.organizationId,
      businessId: params.businessId,
    });

    if (!dna) {
      throw new Error(`Business DNA not found for businessId '${params.businessId}'`);
    }

    // Apply customer corrections using createKnowledgeField
    if (params.updates.companyName && dna.companyIdentity) {
      dna.companyIdentity.companyName = createKnowledgeField(params.updates.companyName);
    }
    if (params.updates.mission && dna.companyIdentity) {
      dna.companyIdentity.mission = createKnowledgeField(params.updates.mission);
    }
    if (params.updates.primaryTone && dna.brandVoice) {
      dna.brandVoice.primaryTone = createKnowledgeField(params.updates.primaryTone as any);
    }

    // Save DNA creating a new revision
    const savedDNA = await this.dnaRepo.saveDNA(dna, params.organizationId, params.correctedBy);
    const revisions = await this.dnaRepo.listRevisions({
      organizationId: params.organizationId,
      businessId: params.businessId,
    });
    const latestRevision = revisions[revisions.length - 1];

    // Update status to NEEDS_REVISION
    const currentStatus = this.getReviewStatus(params.businessId);
    this.statusMap.set(params.businessId, {
      ...currentStatus,
      approvalState: 'NEEDS_REVISION',
      versionNumber: latestRevision ? latestRevision.versionNumber : currentStatus.versionNumber + 1,
    });

    // Log Audit Event
    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.correctedBy,
      details: { updates: params.updates, revisionId: latestRevision?.id },
    });

    return { updatedDNA: savedDNA, revision: latestRevision };
  }
}
