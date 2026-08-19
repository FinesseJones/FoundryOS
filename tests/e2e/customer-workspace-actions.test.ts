import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SaaSAuthManager } from '../../src/core/saas/auth';
import { SaaSBillingManager } from '../../src/core/saas/billing';
import { CustomerStateManager } from '../../src/core/saas/customer-state';
import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { CustomerOnboardingService } from '../../src/core/saas/onboarding-service';
import { DNAReviewService } from '../../src/core/saas/dna-review-service';
import { NotificationDispatcher } from '../../src/core/automation/notifications';
import { CustomerNotificationService } from '../../src/core/saas/customer-notifications';
import { AgentRegistry } from '../../src/core/agents';
import { ContextBuilder } from '../../src/core/context';
import { WorkflowEngine } from '../../src/core/automation/workflows';
import { ApprovalManager } from '../../src/core/automation/approvals';
import { CustomerWorkspaceService } from '../../src/core/saas/customer-workspace-service';

test('Phase 12B E2E: Customer Workspace Actions (Login -> Workspace Access -> DNA Approval -> Campaign -> Agent Exec -> Approval Workflow -> Audit Logging -> Notifications)', async () => {
  // 1. Initialize Platform Services
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const notificationDispatcher = new NotificationDispatcher();
  const notificationService = new CustomerNotificationService(notificationDispatcher);
  const dnaReviewService = new DNAReviewService(dnaRepo, auditRepo);

  const onboardingService = new CustomerOnboardingService(
    authManager,
    billingManager,
    stateManager,
    dnaRepo
  );

  // 2. Customer Onboarding Setup
  const onboarding = await onboardingService.executeCustomerOnboarding({
    userEmail: 'ceo@brandfirst-client.com',
    userName: 'Alex Founder',
    userRole: 'ADMIN',
    organizationName: 'BrandFirst Client Corp',
    planTier: 'growth',
    companyName: 'BrandFirst Client Corp',
    websiteUrl: 'https://brandfirst-client.com',
  });

  const { session, customerState } = onboarding;
  const { organizationId } = session;
  const businessId = customerState.businessId!;

  // 3. Customer Session Validation & Workspace Access
  const validatedSession = authManager.validateSession(session.token);
  assert.ok(validatedSession);
  assert.equal(validatedSession.organizationId, organizationId);

  // 4. Business DNA Review & Approval Workflow
  const reviewBefore = dnaReviewService.getReviewStatus(businessId);
  assert.equal(reviewBefore.approvalState, 'PENDING_REVIEW');

  // Customer corrects mission and approves DNA
  await dnaReviewService.applyCustomerCorrection({
    organizationId,
    businessId,
    correctedBy: session.email,
    updates: { mission: 'Empowering brands with deterministic AI.' },
  });

  const approvalStatus = await dnaReviewService.approveDNA({
    organizationId,
    businessId,
    approvedBy: session.email,
    notes: 'Approved after mission adjustment',
  });

  assert.equal(approvalStatus.approvalState, 'APPROVED');

  // Verify Audit Log entry for DNA approval
  const dnaAuditEvents = await auditRepo.listEvents({ organizationId, businessId });
  assert.ok(dnaAuditEvents.some((e) => e.action === 'approve'));

  // 5. Campaign Creation & Agent Execution via CustomerWorkspaceService
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(onboarding.businessDNA);

  const agentRegistry = new AgentRegistry(contextBuilder);
  const approvalManager = new ApprovalManager();
  const workflowEngine = new WorkflowEngine(agentRegistry, approvalManager);

  const workspaceService = new CustomerWorkspaceService(
    agentRegistry,
    workflowEngine,
    approvalManager,
    auditRepo,
    notificationService,
    stateManager,
    dnaReviewService
  );

  const campaignResult = await workspaceService.launchCampaign({
    organizationId,
    businessId,
    campaignName: 'Q4 Product Blitz',
    prompt: 'Create LinkedIn launch announcement',
    targetChannel: 'LinkedIn',
    createdBy: session.email,
  });

  assert.ok(campaignResult.collaboration);
  assert.equal(campaignResult.collaboration.consultationSteps.length, 4);
  assert.ok(campaignResult.collaboration.overallQualityScore > 0);

  // 6. Approval Workflow Execution & Hard-Halt Verification
  workflowEngine.registerWorkflow({
    id: 'wf_client_launch',
    name: 'Client Governed Launch',
    autoApproveLowRisk: true,
    steps: [
      {
        id: 'step_1',
        name: 'Draft Announcement',
        agentRole: 'content',
        promptTemplate: 'Draft social post',
        requiresApproval: true,
      },
      {
        id: 'step_2',
        name: 'Publish Announcement',
        agentRole: 'publishing',
        promptTemplate: 'Publish social post',
        requiresApproval: false,
      },
    ],
  });

  const workflowRun = await workspaceService.executeWorkflow(
    organizationId,
    businessId,
    'wf_client_launch',
    session.email
  );

  assert.equal(workflowRun.status, 'waiting_approval');

  // Verify pending approval notification delivered
  const unreadAlerts = notificationService.getUnreadAlerts(businessId);
  assert.ok(unreadAlerts.some((a) => a.title.includes('[APPROVAL_REQUIRED]')));

  // Resolve pending approval request
  const pendingRequests = approvalManager.listPendingRequests(businessId);
  assert.equal(pendingRequests.length, 1);

  const resolveResult = await workspaceService.resolveApprovalRequest({
    organizationId,
    businessId,
    requestId: pendingRequests[0].id,
    decision: 'approved',
    resolvedBy: session.email,
  });

  assert.equal(resolveResult.request.status, 'approved');
  assert.ok(resolveResult.resumedRun);
  assert.equal(resolveResult.resumedRun.status, 'completed');

  // 7. Verify Audit Activity Timeline & Notification Delivery
  const fullTimeline = await workspaceService.getActivityTimeline({ organizationId, businessId });
  assert.ok(fullTimeline.length >= 3);
  assert.ok(fullTimeline.some((e) => e.action === 'approve'));
  assert.ok(fullTimeline.some((e) => e.action === 'create'));
  assert.ok(fullTimeline.some((e) => e.action === 'update'));
});
