import { AgentRole } from '../agents/agent.types';
import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';

// ─── Workflow Schema Types ──────────────────────────────────────────────────

export type WorkflowTriggerType = 'SCHEDULED' | 'EVENT_BASED' | 'METRIC_THRESHOLD' | 'MANUAL';

export interface WorkflowTriggerDefinition {
  type: WorkflowTriggerType;
  scheduleCron?: string;
  eventType?: string;
  metricName?: string;
  thresholdValue?: number;
}

export type ConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN_LIST';

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export type ActionType = 'DELEGATE_AGENT' | 'SEND_NOTIFICATION' | 'REQUIRE_APPROVAL' | 'RECORD_MEMORY';

export interface ActionNode {
  nodeId: string;
  name: string;
  type: ActionType;
  targetAgent?: AgentRole;
  params: Record<string, unknown>;
  nextNodes?: string[];
}

export interface CustomWorkflowDefinition {
  workflowId: string;
  organizationId: string;
  businessId: string;
  name: string;
  description: string;
  domain: 'marketing' | 'sales' | 'operations' | 'security';
  triggers: WorkflowTriggerDefinition[];
  conditions: ConditionRule[];
  actions: ActionNode[];
  entryNodeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Automation Builder Service ─────────────────────────────────────────────

export class AutomationBuilderService {
  private workflowsStore: Map<string, CustomWorkflowDefinition> = new Map();

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
   * Validate a custom workflow definition for graph connectivity, valid node IDs, cycle detection, and action parameters.
   */
  validateWorkflowDefinition(def: CustomWorkflowDefinition): WorkflowValidationResult {
    const errors: string[] = [];

    if (!def.workflowId) errors.push('Workflow ID is required.');
    if (!def.name) errors.push('Workflow name is required.');
    if (!def.triggers || def.triggers.length === 0) errors.push('At least one trigger definition is required.');

    if (!def.actions || def.actions.length === 0) {
      errors.push('At least one action node is required.');
      return { valid: false, errors };
    }

    const nodeIds = new Set(def.actions.map((a) => a.nodeId));

    if (!def.entryNodeId || !nodeIds.has(def.entryNodeId)) {
      errors.push(`Entry node ID '${def.entryNodeId}' must match a valid action node ID.`);
    }

    for (const node of def.actions) {
      if (node.type === 'DELEGATE_AGENT' && !node.targetAgent) {
        errors.push(`Action node '${node.nodeId}' of type DELEGATE_AGENT requires targetAgent.`);
      }

      if (node.nextNodes) {
        for (const nextId of node.nextNodes) {
          if (!nodeIds.has(nextId)) {
            errors.push(`Action node '${node.nodeId}' references non-existent next node '${nextId}'.`);
          }
        }
      }
    }

    // Cycle Detection (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const actionMap = new Map(def.actions.map((a) => [a.nodeId, a]));

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const node = actionMap.get(nodeId);
      if (node?.nextNodes) {
        for (const neighbor of node.nextNodes) {
          if (!visited.has(neighbor)) {
            if (hasCycle(neighbor)) return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    if (def.entryNodeId && nodeIds.has(def.entryNodeId)) {
      if (hasCycle(def.entryNodeId)) {
        errors.push('Workflow definition contains an invalid infinite execution cycle.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Evaluate condition rules against a runtime context object.
   */
  evaluateConditions(conditions: ConditionRule[], context: Record<string, unknown>): boolean {
    for (const rule of conditions) {
      const actualValue = context[rule.field];

      switch (rule.operator) {
        case 'EQUALS':
          if (actualValue !== rule.value) return false;
          break;
        case 'NOT_EQUALS':
          if (actualValue === rule.value) return false;
          break;
        case 'GREATER_THAN':
          if (typeof actualValue !== 'number' || actualValue <= (rule.value as number)) return false;
          break;
        case 'LESS_THAN':
          if (typeof actualValue !== 'number' || actualValue >= (rule.value as number)) return false;
          break;
        case 'CONTAINS':
          if (typeof actualValue !== 'string' || !actualValue.includes(rule.value as string)) return false;
          break;
        case 'IN_LIST':
          if (!Array.isArray(rule.value) || !rule.value.includes(actualValue)) return false;
          break;
      }
    }

    return true;
  }

  /**
   * Save a new workflow definition.
   */
  async createWorkflowDefinition(params: {
    definition: CustomWorkflowDefinition;
    actor: string;
  }): Promise<CustomWorkflowDefinition> {
    await this.assertTenant(params.definition.organizationId, params.definition.businessId);

    const validation = this.validateWorkflowDefinition(params.definition);
    if (!validation.valid) {
      throw new Error(`AutomationBuilder: Invalid workflow definition. Errors: [${validation.errors.join('; ')}]`);
    }

    this.workflowsStore.set(params.definition.workflowId, params.definition);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        organizationId: params.definition.organizationId,
        businessId: params.definition.businessId,
        action: 'create',
        changedBy: params.actor,
        details: {
          eventType: 'WORKFLOW_DEFINITION_CREATED',
          workflowId: params.definition.workflowId,
          domain: params.definition.domain,
          actionCount: params.definition.actions.length,
        },
      });
    }

    return params.definition;
  }

  /**
   * Retrieve a workflow definition.
   */
  async getWorkflowDefinition(
    organizationId: string,
    businessId: string,
    workflowId: string
  ): Promise<CustomWorkflowDefinition> {
    await this.assertTenant(organizationId, businessId);

    const def = this.workflowsStore.get(workflowId);
    if (!def || def.organizationId !== organizationId) {
      throw new Error(`AutomationBuilder: Workflow definition '${workflowId}' not found.`);
    }

    return def;
  }

  /**
   * List workflow definitions for an organization & business.
   */
  async listWorkflowDefinitions(
    organizationId: string,
    businessId: string
  ): Promise<CustomWorkflowDefinition[]> {
    await this.assertTenant(organizationId, businessId);

    return Array.from(this.workflowsStore.values()).filter(
      (w) => w.organizationId === organizationId && w.businessId === businessId
    );
  }
}
