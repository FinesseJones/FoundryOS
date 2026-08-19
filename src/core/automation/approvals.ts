import { ApprovalRequest } from './automation.types';
import { AgentRole } from '../agents';
import { ApprovalStatus } from '../knowledge';

export class ApprovalManager {
  private requests: Map<string, ApprovalRequest> = new Map();

  /**
   * Create a new pending approval request.
   */
  createRequest(params: {
    workflowRunId: string;
    businessId: string;
    actionTitle: string;
    description: string;
    proposedByAgent: AgentRole;
  }): ApprovalRequest {
    const request: ApprovalRequest = {
      id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workflowRunId: params.workflowRunId,
      businessId: params.businessId,
      actionTitle: params.actionTitle,
      description: params.description,
      proposedByAgent: params.proposedByAgent,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.requests.set(request.id, request);
    return request;
  }

  /**
   * List all pending approval requests for a business ID.
   */
  listPendingRequests(businessId?: string): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(
      (r) => r.status === 'pending' && (!businessId || r.businessId === businessId)
    );
  }

  /**
   * Resolve an approval request with a human decision.
   */
  resolveRequest(
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewedBy: string,
    reviewNote?: string
  ): ApprovalRequest {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Approval request not found: ${requestId}`);

    request.status = decision;
    request.reviewedBy = reviewedBy;
    request.reviewNote = reviewNote ?? null;
    request.resolvedAt = new Date().toISOString();

    return request;
  }
}
