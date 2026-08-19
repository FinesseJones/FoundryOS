import { AgentRegistry } from '../agents';
import { MultiAgentCollaborationOrchestrator, MultiAgentCollaborationResult } from '../agents/collaboration-orchestrator';
import { WorkflowEngine } from '../automation/workflows';
import { ApprovalManager } from '../automation/approvals';
import { WorkflowRun, ApprovalRequest } from '../automation/automation.types';
import { AuditRepository } from '../persistence/repositories';
import { AuditEvent } from '../knowledge';
import { CustomerNotificationService } from './customer-notifications';
import { CustomerStateManager } from './customer-state';
import { OnboardingProgressTracker, OnboardingProgressSummary } from './onboarding-progress';
import { DNAReviewService } from './dna-review-service';

export interface CreateCampaignParams {
  organizationId: string;
  businessId: string;
  campaignName: string;
  prompt: string;
  targetChannel: string;
  createdBy: string;
}

export interface WorkspaceExecutionResult {
  collaboration: MultiAgentCollaborationResult;
  auditEvent: AuditEvent;
}

export class CustomerWorkspaceService {
  private orchestrator: MultiAgentCollaborationOrchestrator;
  private progressTracker: OnboardingProgressTracker;

  constructor(
    private agentRegistry: AgentRegistry,
    private workflowEngine: WorkflowEngine,
    private approvalManager: ApprovalManager,
    private auditRepo: AuditRepository,
    private notificationService: CustomerNotificationService,
    private stateManager: CustomerStateManager,
    private dnaReviewService: DNAReviewService
  ) {
    this.orchestrator = new MultiAgentCollaborationOrchestrator(agentRegistry);
    this.progressTracker = new OnboardingProgressTracker();
  }

  /**
   * Launch a brand campaign and execute multi-agent collaboration loop.
   */
  async launchCampaign(params: CreateCampaignParams): Promise<WorkspaceExecutionResult> {
    // 1. Run multi-agent collaboration loop (ContentAgent -> BrandAgent -> WebsiteAgent -> AnalyticsAgent)
    const collaboration = await this.orchestrator.runCollaborationLoop({
      businessId: params.businessId,
      initialPrompt: params.prompt,
      targetChannel: params.targetChannel,
    });

    // 2. Audit Event logging
    const auditEvent = await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.createdBy,
      details: {
        eventType: 'EXECUTE_AGENT_TASK',
        campaignName: params.campaignName,
        collaborationId: collaboration.collaborationId,
        qualityScore: collaboration.overallQualityScore,
      },
    });

    // 3. Dispatch workflow completed notification
    this.notificationService.sendCustomerAlert({
      organizationId: params.organizationId,
      businessId: params.businessId,
      type: 'workflow_completed',
      title: `Campaign '${params.campaignName}' Executed`,
      message: `Multi-agent consultation completed with quality score of ${collaboration.overallQualityScore * 100}%.`,
    });

    return { collaboration, auditEvent };
  }

  /**
   * Execute a registered Workflow engine DAG.
   */
  async executeWorkflow(
    organizationId: string,
    businessId: string,
    workflowId: string,
    executedBy: string
  ): Promise<WorkflowRun> {
    const run = await this.workflowEngine.executeWorkflow(workflowId, businessId);

    // Audit logging
    await this.auditRepo.logEvent({
      organizationId,
      businessId,
      action: 'update',
      changedBy: executedBy,
      details: { eventType: 'RUN_WORKFLOW', workflowId, runId: run.id, status: run.status },
    });

    if (run.status === 'waiting_approval') {
      this.notificationService.sendCustomerAlert({
        organizationId,
        businessId,
        type: 'approval_required',
        title: 'Workflow Paused for Human Approval',
        message: `Workflow '${workflowId}' requires human operator review before step deployment.`,
        severity: 'warning',
      });
    }

    return run;
  }

  /**
   * Resolve an approval request and resume workflow execution.
   */
  async resolveApprovalRequest(params: {
    organizationId: string;
    businessId: string;
    requestId: string;
    decision: 'approved' | 'rejected';
    resolvedBy: string;
  }): Promise<{ request: ApprovalRequest; resumedRun?: WorkflowRun }> {
    const resolvedRequest = this.approvalManager.resolveRequest(
      params.requestId,
      params.decision,
      params.resolvedBy
    );

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: params.decision === 'approved' ? 'approve' : 'reject',
      changedBy: params.resolvedBy,
      details: { eventType: 'RESOLVE_APPROVAL', requestId: params.requestId, decision: params.decision },
    });

    let resumedRun: WorkflowRun | undefined;
    if (params.decision === 'approved' && resolvedRequest.workflowRunId) {
      resumedRun = await this.workflowEngine.resumeWorkflow(resolvedRequest.workflowRunId);
    }

    return { request: resolvedRequest, resumedRun };
  }

  /**
   * Get unified customer activity timeline (audit events, agent runs, approvals).
   */
  async getActivityTimeline(query: { organizationId: string; businessId?: string }): Promise<AuditEvent[]> {
    return this.auditRepo.listEvents(query);
  }

  /**
   * Get onboarding progress checklist summary.
   */
  getOnboardingProgress(organizationId: string, businessId: string): OnboardingProgressSummary {
    const stateRecord = this.stateManager.getState(organizationId);
    const dnaReview = this.dnaReviewService.getReviewStatus(businessId);
    const dnaApproved = dnaReview.approvalState === 'APPROVED';

    return this.progressTracker.getProgressSummary(
      organizationId,
      stateRecord.state,
      dnaApproved,
      1 // active campaign count
    );
  }
}
