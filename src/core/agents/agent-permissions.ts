import { AgentRole } from './agent.types';
import { AgentIdentityRegistry } from './agent-identity';
import { AuditRepository } from '../persistence/repositories';

// ─── Permission & Classification Types ─────────────────────────────────────

export type AgentPermissionAction =
  | 'read:dna'
  | 'write:dna'
  | 'read:content'
  | 'write:content'
  | 'read:analytics'
  | 'write:analytics'
  | 'read:security'
  | 'write:security'
  | 'rotate:keys'
  | 'read:memory'
  | 'write:memory'
  | 'read:audit'
  | 'write:audit'
  | 'execute:workflow'
  | 'publish:external'
  | 'manage:automations';

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface AgentPolicyRule {
  allowedActions: AgentPermissionAction[];
  maxClassification: DataClassification;
  requiresApprovalForActions: AgentPermissionAction[];
}

// Data classification hierarchy rank
const CLASSIFICATION_RANK: Record<DataClassification, number> = {
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
  RESTRICTED: 4,
};

// ─── Default Permission Matrix per Role ─────────────────────────────────────

export const ROLE_PERMISSIONS_MATRIX: Record<AgentRole, AgentPolicyRule> = {
  brand: {
    allowedActions: ['read:dna', 'write:dna', 'read:content', 'read:memory', 'write:memory'],
    maxClassification: 'CONFIDENTIAL',
    requiresApprovalForActions: ['write:dna'],
  },
  content: {
    allowedActions: ['read:dna', 'read:content', 'write:content', 'read:memory', 'write:memory', 'execute:workflow'],
    maxClassification: 'INTERNAL',
    requiresApprovalForActions: ['publish:external'],
  },
  publishing: {
    allowedActions: ['read:content', 'publish:external', 'execute:workflow'],
    maxClassification: 'PUBLIC',
    requiresApprovalForActions: ['publish:external'],
  },
  website: {
    allowedActions: ['read:dna', 'write:dna'],
    maxClassification: 'INTERNAL',
    requiresApprovalForActions: [],
  },
  security: {
    allowedActions: ['read:dna', 'read:security', 'write:security', 'rotate:keys', 'read:audit', 'write:audit', 'read:memory'],
    maxClassification: 'RESTRICTED',
    requiresApprovalForActions: ['rotate:keys'],
  },
  analytics: {
    allowedActions: ['read:dna', 'read:content', 'read:analytics', 'write:analytics', 'read:memory', 'read:audit'],
    maxClassification: 'CONFIDENTIAL',
    requiresApprovalForActions: [],
  },
  learning: {
    allowedActions: ['read:memory', 'write:memory', 'read:analytics', 'write:analytics'],
    maxClassification: 'CONFIDENTIAL',
    requiresApprovalForActions: [],
  },
  lead: {
    allowedActions: ['read:dna', 'read:content', 'read:analytics', 'write:analytics', 'read:memory', 'execute:workflow'],
    maxClassification: 'CONFIDENTIAL',
    requiresApprovalForActions: [],
  },
};

// ─── Agent Authorization Service ────────────────────────────────────────────

export class AgentAuthorizationService {
  constructor(
    private identityRegistry: AgentIdentityRegistry,
    private auditRepo?: AuditRepository
  ) {}

  /**
   * Authorize an agent action against RBAC permissions, tenant boundaries, and data classification policies.
   */
  async authorizeAction(params: {
    agentIdOrRole: string;
    organizationId: string;
    targetOrganizationId: string;
    businessId: string;
    action: AgentPermissionAction;
    dataClassification?: DataClassification;
    actor?: string;
  }): Promise<{ authorized: boolean; requiresApproval: boolean; reason?: string }> {
    // 1. Tenant Isolation Verification
    if (params.organizationId !== params.targetOrganizationId) {
      const reason = `AgentAuthorization: access denied. Agent from org '${params.organizationId}' attempted cross-tenant access to org '${params.targetOrganizationId}'.`;
      await this.logAudit(params, false, reason);
      return { authorized: false, requiresApproval: false, reason };
    }

    // 2. Identity & Lifecycle State Check
    let identity;
    try {
      identity = this.identityRegistry.getAgentIdentity(params.agentIdOrRole);
    } catch {
      const reason = `AgentAuthorization: agent identity '${params.agentIdOrRole}' not registered.`;
      await this.logAudit(params, false, reason);
      return { authorized: false, requiresApproval: false, reason };
    }

    if (identity.state !== 'ACTIVE') {
      const reason = `AgentAuthorization: agent '${identity.name}' (${identity.agentId}) is in '${identity.state}' state.`;
      await this.logAudit(params, false, reason);
      return { authorized: false, requiresApproval: false, reason };
    }

    // 3. RBAC Policy Rule Lookup
    const policy = ROLE_PERMISSIONS_MATRIX[identity.role];
    if (!policy) {
      const reason = `AgentAuthorization: no RBAC policy matrix defined for role '${identity.role}'.`;
      await this.logAudit(params, false, reason);
      return { authorized: false, requiresApproval: false, reason };
    }

    // 4. Action Permission Check
    if (!policy.allowedActions.includes(params.action)) {
      const reason = `AgentAuthorization: action '${params.action}' is not permitted for role '${identity.role}'. Allowed actions: [${policy.allowedActions.join(', ')}].`;
      await this.logAudit(params, false, reason);
      return { authorized: false, requiresApproval: false, reason };
    }

    // 5. Data Access Policy & Classification Check
    const targetClassification = params.dataClassification ?? 'INTERNAL';
    const agentMaxRank = CLASSIFICATION_RANK[policy.maxClassification];
    const targetRank = CLASSIFICATION_RANK[targetClassification];

    if (targetRank > agentMaxRank) {
      const reason = `AgentAuthorization: data classification '${targetClassification}' exceeds agent role max classification '${policy.maxClassification}'.`;
      await this.logAudit(params, false, reason);
      return { authorized: false, requiresApproval: false, reason };
    }

    // 6. Approval Requirement Check
    const requiresApproval = policy.requiresApprovalForActions.includes(params.action);

    await this.logAudit(params, true, 'Action authorized successfully');
    return { authorized: true, requiresApproval };
  }

  private async logAudit(
    params: {
      organizationId: string;
      businessId: string;
      agentIdOrRole: string;
      action: AgentPermissionAction;
      actor?: string;
    },
    authorized: boolean,
    reason: string
  ): Promise<void> {
    if (!this.auditRepo) return;
    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: authorized ? 'approve' : 'reject',
      changedBy: params.actor ?? params.agentIdOrRole,
      details: {
        eventType: authorized ? 'AGENT_ACTION_AUTHORIZED' : 'AGENT_ACTION_DENIED',
        agentIdOrRole: params.agentIdOrRole,
        action: params.action,
        reason,
      },
    });
  }
}
