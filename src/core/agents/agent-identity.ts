import { AgentRole } from './agent.types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AgentLifecycleState =
  | 'PROVISIONED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'DEPRECATED';

export interface AgentCapabilityModel {
  allowedReadDomains: string[];
  allowedWriteDomains: string[];
  maxTokenBudgetPerTask: number;
  maxDelegationDepth: number;
  requiresHumanApprovalFor: string[];
  rateLimitPerMinute: number;
}

export interface AgentMetadataSchema {
  agentId: string;
  role: AgentRole;
  name: string;
  description: string;
  version: string;
  state: AgentLifecycleState;
  capabilities: AgentCapabilityModel;
  ownerOrganizationId: string; // 'system' or tenant org ID
  reputationScore: number; // 0 - 100
  tasksCompleted: number;
  tasksFailed: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Default Capabilities per Role ──────────────────────────────────────────

export const DEFAULT_ROLE_CAPABILITIES: Record<AgentRole, AgentCapabilityModel> = {
  brand: {
    allowedReadDomains: ['dna', 'brand', 'content', 'memory'],
    allowedWriteDomains: ['brand', 'dna'],
    maxTokenBudgetPerTask: 8000,
    maxDelegationDepth: 2,
    requiresHumanApprovalFor: ['dna_modification'],
    rateLimitPerMinute: 60,
  },
  content: {
    allowedReadDomains: ['dna', 'brand', 'content', 'marketing', 'memory'],
    allowedWriteDomains: ['content', 'campaigns'],
    maxTokenBudgetPerTask: 12000,
    maxDelegationDepth: 2,
    requiresHumanApprovalFor: ['external_publish'],
    rateLimitPerMinute: 100,
  },
  publishing: {
    allowedReadDomains: ['content', 'campaigns'],
    allowedWriteDomains: ['publishing'],
    maxTokenBudgetPerTask: 4000,
    maxDelegationDepth: 1,
    requiresHumanApprovalFor: ['social_publish', 'email_blast'],
    rateLimitPerMinute: 30,
  },
  website: {
    allowedReadDomains: ['dna', 'website', 'ingestion'],
    allowedWriteDomains: ['dna', 'ingestion'],
    maxTokenBudgetPerTask: 10000,
    maxDelegationDepth: 2,
    requiresHumanApprovalFor: [],
    rateLimitPerMinute: 40,
  },
  security: {
    allowedReadDomains: ['audit', 'security', 'dna', 'agent_runtime'],
    allowedWriteDomains: ['security', 'audit'],
    maxTokenBudgetPerTask: 6000,
    maxDelegationDepth: 1,
    requiresHumanApprovalFor: ['key_rotation', 'role_suspension'],
    rateLimitPerMinute: 50,
  },
  analytics: {
    allowedReadDomains: ['dna', 'marketing', 'sales', 'operations', 'security', 'memory', 'audit'],
    allowedWriteDomains: ['analytics', 'metrics'],
    maxTokenBudgetPerTask: 10000,
    maxDelegationDepth: 2,
    requiresHumanApprovalFor: [],
    rateLimitPerMinute: 80,
  },
  learning: {
    allowedReadDomains: ['memory', 'analytics', 'outcomes'],
    allowedWriteDomains: ['memory', 'patterns'],
    maxTokenBudgetPerTask: 10000,
    maxDelegationDepth: 2,
    requiresHumanApprovalFor: [],
    rateLimitPerMinute: 80,
  },
};

// ─── Agent Identity Foundation Registry ─────────────────────────────────────

export class AgentIdentityRegistry {
  private identities: Map<string, AgentMetadataSchema> = new Map();

  constructor() {
    this.bootstrapSystemAgents();
  }

  /**
   * Bootstrap core system agents into the identity registry.
   */
  private bootstrapSystemAgents(): void {
    const roles: { role: AgentRole; name: string; description: string }[] = [
      { role: 'brand', name: 'Brand Voice Guardian', description: 'Enforces brand guidelines, tone, and visual identity alignment.' },
      { role: 'content', name: 'Strategic Content Creator', description: 'Generates multi-channel marketing campaigns, articles, and copy.' },
      { role: 'publishing', name: 'Channel Publishing Agent', description: 'Handles distribution and external channel publishing.' },
      { role: 'website', name: 'Website Intelligence Agent', description: 'Crawls and extracts structured signals from company websites.' },
      { role: 'security', name: 'Security & Governance Auditor', description: 'Audits access controls, agent delegation, and data isolation.' },
      { role: 'analytics', name: 'Performance Analytics Engine', description: 'Evaluates performance metrics across marketing, sales, and ops.' },
      { role: 'learning', name: 'Pattern Learning Agent', description: 'Extracts winning patterns and updates long-term business memory.' },
    ];

    for (const sys of roles) {
      this.registerAgentIdentity({
        agentId: `system_${sys.role}_agent_v1`,
        role: sys.role,
        name: sys.name,
        description: sys.description,
        version: '1.0.0',
        ownerOrganizationId: 'system',
        capabilities: DEFAULT_ROLE_CAPABILITIES[sys.role],
      });
    }
  }

  /**
   * Register a new agent identity with metadata schema & capability model.
   */
  registerAgentIdentity(params: {
    agentId?: string;
    role: AgentRole;
    name: string;
    description: string;
    version?: string;
    ownerOrganizationId?: string;
    capabilities?: Partial<AgentCapabilityModel>;
  }): AgentMetadataSchema {
    const agentId = params.agentId ?? `agent_${params.role}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const defaultCap = DEFAULT_ROLE_CAPABILITIES[params.role];
    const capabilities: AgentCapabilityModel = {
      allowedReadDomains: params.capabilities?.allowedReadDomains ?? defaultCap.allowedReadDomains,
      allowedWriteDomains: params.capabilities?.allowedWriteDomains ?? defaultCap.allowedWriteDomains,
      maxTokenBudgetPerTask: params.capabilities?.maxTokenBudgetPerTask ?? defaultCap.maxTokenBudgetPerTask,
      maxDelegationDepth: params.capabilities?.maxDelegationDepth ?? defaultCap.maxDelegationDepth,
      requiresHumanApprovalFor: params.capabilities?.requiresHumanApprovalFor ?? defaultCap.requiresHumanApprovalFor,
      rateLimitPerMinute: params.capabilities?.rateLimitPerMinute ?? defaultCap.rateLimitPerMinute,
    };

    const now = new Date().toISOString();

    const identity: AgentMetadataSchema = {
      agentId,
      role: params.role,
      name: params.name,
      description: params.description,
      version: params.version ?? '1.0.0',
      state: 'ACTIVE',
      capabilities,
      ownerOrganizationId: params.ownerOrganizationId ?? 'system',
      reputationScore: 100,
      tasksCompleted: 0,
      tasksFailed: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.identities.set(agentId, identity);
    // Map role fallback if not exists
    if (!this.identities.has(params.role)) {
      this.identities.set(params.role, identity);
    }

    return identity;
  }

  /**
   * Transition an agent identity through lifecycle states:
   * PROVISIONED -> ACTIVE -> PAUSED -> SUSPENDED -> DEPRECATED
   */
  updateAgentState(agentIdOrRole: string, newState: AgentLifecycleState, reason?: string): AgentMetadataSchema {
    const identity = this.getAgentIdentity(agentIdOrRole);

    identity.state = newState;
    identity.updatedAt = new Date().toISOString();

    return identity;
  }

  /**
   * Retrieve agent metadata schema by agentId or role.
   */
  getAgentIdentity(agentIdOrRole: string): AgentMetadataSchema {
    const identity = this.identities.get(agentIdOrRole);
    if (!identity) {
      throw new Error(`AgentIdentity: No registered agent identity found for '${agentIdOrRole}'.`);
    }
    return identity;
  }

  /**
   * Validate if an agent has permission to execute read/write on a target domain.
   */
  validateAgentCapability(
    agentIdOrRole: string,
    action: 'read' | 'write',
    targetDomain: string
  ): { allowed: boolean; reason?: string } {
    const identity = this.getAgentIdentity(agentIdOrRole);

    if (identity.state !== 'ACTIVE') {
      return {
        allowed: false,
        reason: `Agent '${identity.name}' (${identity.agentId}) is currently in '${identity.state}' state and cannot perform operations.`,
      };
    }

    const domains = action === 'read' ? identity.capabilities.allowedReadDomains : identity.capabilities.allowedWriteDomains;

    if (!domains.includes('*') && !domains.includes(targetDomain)) {
      return {
        allowed: false,
        reason: `Agent '${identity.name}' (${identity.role}) is denied ${action} access to domain '${targetDomain}'. Allowed domains: [${domains.join(', ')}].`,
      };
    }

    return { allowed: true };
  }

  /**
   * Record task outcome for agent reputation tracking.
   */
  recordTaskOutcome(agentIdOrRole: string, success: boolean): void {
    try {
      const identity = this.getAgentIdentity(agentIdOrRole);
      if (success) {
        identity.tasksCompleted += 1;
        identity.reputationScore = Math.min(100, identity.reputationScore + 0.5);
      } else {
        identity.tasksFailed += 1;
        identity.reputationScore = Math.max(0, identity.reputationScore - 5);
      }
      identity.updatedAt = new Date().toISOString();
    } catch {
      // Ignore if identity not found
    }
  }

  /**
   * List all agent identities.
   */
  listAgentIdentities(organizationId?: string): AgentMetadataSchema[] {
    const all = Array.from(new Set(this.identities.values()));
    if (!organizationId) return all;
    return all.filter(
      (i) => i.ownerOrganizationId === 'system' || i.ownerOrganizationId === organizationId
    );
  }
}
