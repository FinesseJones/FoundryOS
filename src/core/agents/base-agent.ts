import { ContextBuilder } from '../context';
import { CognitiveEngine, CognitiveProcessResult } from '../cognitive';
import { AgentRole, AgentAccessRights, AgentTaskRequest, AgentTaskResult, AgentDescriptor } from './agent.types';
import { createAuditEvent, AuditEvent } from '../knowledge';

export class AccessControlError extends Error {
  constructor(public agentRole: string, public targetDomain: string) {
    super(`AccessControlError: Agent '${agentRole}' is unauthorized to write to domain '${targetDomain}'`);
    this.name = 'AccessControlError';
  }
}

export abstract class BaseAgent {
  abstract readonly role: AgentRole;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly accessRights: AgentAccessRights;

  constructor(protected contextBuilder: ContextBuilder) {}

  /**
   * Returns descriptor metadata for this agent.
   */
  getDescriptor(): AgentDescriptor {
    return {
      role: this.role,
      name: this.name,
      description: this.description,
      accessRights: this.accessRights,
    };
  }

  /**
   * Verify whether the agent has write permissions for a target domain.
   */
  canWriteDomain(domain: string): boolean {
    return (
      this.accessRights.writableDomains.includes('*') ||
      this.accessRights.writableDomains.includes(domain)
    );
  }

  /**
   * Assert write access permission for a target domain.
   */
  assertCanModifyDomain(domain: string): void {
    if (!this.canWriteDomain(domain)) {
      throw new AccessControlError(this.role, domain);
    }
  }

  /**
   * Standard task execution flow:
   * 1. Access control validation
   * 2. Context Engine context building
   * 3. Specialized agent logic execution
   * 4. Cognitive Engine workflow processing
   * 5. Audit log generation
   */
  async executeTask(request: AgentTaskRequest): Promise<AgentTaskResult> {
    if (request.role !== this.role) {
      throw new Error(`Agent ${this.name} (${this.role}) cannot handle task for role ${request.role}`);
    }

    // 1. Build Context
    const engineContext = await this.contextBuilder.buildContext({
      businessId: request.businessId,
      taskType: request.taskType,
      userPrompt: request.prompt,
      targetChannel: request.targetChannel,
      activeCampaignId: request.activeCampaignId,
      conversationId: request.conversationId,
      maxTokenBudget: request.maxTokenBudget,
    });

    // 2. Specialized Execution (implemented by subclass)
    const agentExecutionOutput = await this.processAgentTask(request, engineContext);

    // 3. Cognitive Engine Processing
    const cognitiveResult: CognitiveProcessResult = CognitiveEngine.process(engineContext, {
      candidateText: agentExecutionOutput.summary,
    });

    // 4. Create Audit Log
    const audit: AuditEvent = createAuditEvent({
      businessId: request.businessId,
      action: 'update',
      changedBy: `agent/${this.role}`,
      details: {
        taskId: request.taskId,
        taskType: request.taskType,
        qualityScore: cognitiveResult.critique.qualityScore,
        approvalStatus: cognitiveResult.decision.approvalStatus,
      },
    });

    return {
      taskId: request.taskId,
      businessId: request.businessId,
      agentRole: this.role,
      success: cognitiveResult.critique.passed,
      outputSummary: agentExecutionOutput.summary,
      outputData: {
        ...agentExecutionOutput.data,
        auditId: audit.id,
      },
      context: engineContext,
      cognitiveResult,
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Specialized task processing method implemented by each subclass.
   */
  protected abstract processAgentTask(
    request: AgentTaskRequest,
    context: any
  ): Promise<{ summary: string; data: Record<string, unknown> }>;
}
