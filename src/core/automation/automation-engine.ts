import { EventBus } from './events';
import { TriggerEngine } from './trigger-engine';
import { WorkflowEngine } from './workflows';
import { ApprovalManager } from './approvals';
import { NotificationDispatcher } from './notifications';
import { AgentRegistry } from '../agents';
import { ContextBuilder } from '../context';
import { AutomationEvent, AutomationEngineResult } from './automation.types';

export interface AutomationEngineDependencies {
  contextBuilder?: ContextBuilder;
  agentRegistry?: AgentRegistry;
  eventBus?: EventBus;
  triggerEngine?: TriggerEngine;
  approvalManager?: ApprovalManager;
  notificationDispatcher?: NotificationDispatcher;
}

/**
 * Production Automation Engine Orchestrator.
 * Combines EventBus, TriggerEngine, WorkflowEngine, ApprovalManager, and NotificationDispatcher.
 */
export class AutomationEngine {
  readonly contextBuilder: ContextBuilder;
  readonly agentRegistry: AgentRegistry;
  readonly eventBus: EventBus;
  readonly triggerEngine: TriggerEngine;
  readonly approvalManager: ApprovalManager;
  readonly notificationDispatcher: NotificationDispatcher;
  readonly workflowEngine: WorkflowEngine;

  constructor(deps: AutomationEngineDependencies = {}) {
    this.contextBuilder = deps.contextBuilder ?? new ContextBuilder();
    this.agentRegistry = deps.agentRegistry ?? new AgentRegistry(this.contextBuilder);
    this.eventBus = deps.eventBus ?? new EventBus();
    this.triggerEngine = deps.triggerEngine ?? new TriggerEngine();
    this.approvalManager = deps.approvalManager ?? new ApprovalManager();
    this.notificationDispatcher = deps.notificationDispatcher ?? new NotificationDispatcher();
    this.workflowEngine = new WorkflowEngine(this.agentRegistry, this.approvalManager);

    // Auto-listen to event bus
    this.eventBus.subscribe('*', async (event) => {
      await this.handleEvent(event);
    });
  }

  /**
   * Handle an event: evaluate triggers, execute workflows, notify if approvals/alerts are created.
   */
  async handleEvent(event: AutomationEvent): Promise<AutomationEngineResult> {
    const matchedRules = this.triggerEngine.evaluateEvent(event);
    let executedWorkflowsCount = 0;

    for (const rule of matchedRules) {
      try {
        await this.workflowEngine.executeWorkflow(rule.targetWorkflowId, event.businessId);
        executedWorkflowsCount++;
      } catch (err) {
        console.error(`Failed to execute target workflow ${rule.targetWorkflowId}:`, err);
      }
    }

    const pendingApprovals = this.approvalManager.listPendingRequests(event.businessId);
    if (pendingApprovals.length > 0) {
      this.notificationDispatcher.dispatch({
        businessId: event.businessId,
        title: 'Action Required: Human Approval Needed',
        body: `${pendingApprovals.length} action(s) require human review before publishing.`,
        severity: 'action_required',
      });
    }

    return {
      eventId: event.id,
      triggeredRulesCount: matchedRules.length,
      executedWorkflowsCount,
      pendingApprovalsCount: pendingApprovals.length,
      dispatchedNotificationsCount: this.notificationDispatcher.listUnread(event.businessId).length,
      processedAt: new Date().toISOString(),
    };
  }
}
