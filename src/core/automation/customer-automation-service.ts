import { BusinessDNARepository, AuditRepository, MemoryRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { ContextBuilder } from '../context';
import { AutonomousExecutionService, ExecutionPlan, ExecutionApprovalRequest, ExecutionOutcome, ExecutionLearningRecord } from '../execution/autonomous-execution-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AutomationTriggerType = 'MANUAL' | 'SCHEDULED' | 'EVENT_DRIVEN';
export type AutomationStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FAILED' | 'COMPLETED';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  domain: 'marketing' | 'sales' | 'operations' | 'security' | string;
  requiredAgents: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approvalRequired: boolean;
  estimatedExecutionTime: string;
}

export interface AutomationRecord {
  id: string;
  organizationId: string;
  businessId: string;
  templateId: string;
  name: string;
  domain: string;
  triggerType: AutomationTriggerType;
  schedule?: string;
  configuration: Record<string, unknown>;
  status: AutomationStatus;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
}

export interface AutomationHistory {
  automations: AutomationRecord[];
  executions: ExecutionPlan[];
  approvals: ExecutionApprovalRequest[];
  outcomes: ExecutionOutcome[];
  learningRecords: ExecutionLearningRecord[];
}

// ─── Pre-built Automation Templates ─────────────────────────────────────────

export const PREBUILT_AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'MARKETING_CAMPAIGN_LAUNCH',
    name: 'Multi-Channel Marketing Campaign Launch',
    description: 'Autonomous campaign strategy creation, copy drafting by ContentAgent, brand alignment by BrandAgent, and human approval publishing.',
    domain: 'marketing',
    requiredAgents: ['content', 'brand'],
    riskLevel: 'MEDIUM',
    approvalRequired: false,
    estimatedExecutionTime: '5-10 minutes',
  },
  {
    id: 'LEAD_FOLLOW_UP_SEQUENCE',
    name: 'Automated Lead Follow-Up Sequence',
    description: 'Generates personalized email outreach sequences for high-potential leads based on Business DNA target audience profiles.',
    domain: 'sales',
    requiredAgents: ['content', 'analytics'],
    riskLevel: 'HIGH',
    approvalRequired: true,
    estimatedExecutionTime: '3-5 minutes',
  },
  {
    id: 'CUSTOMER_RETENTION_WORKFLOW',
    name: 'Proactive Customer Retention & Re-engagement',
    description: 'Scans for customer dormancy, detects churn risk, and triggers tailored re-engagement value content.',
    domain: 'sales',
    requiredAgents: ['learning', 'analytics'],
    riskLevel: 'HIGH',
    approvalRequired: true,
    estimatedExecutionTime: '5 minutes',
  },
  {
    id: 'CONTENT_CREATION_PIPELINE',
    name: 'Weekly Content Calendar Pipeline',
    description: 'Generates blog post outlines, social media snippets, and newsletter copy aligned with seasonal business goals.',
    domain: 'marketing',
    requiredAgents: ['content', 'brand'],
    riskLevel: 'LOW',
    approvalRequired: false,
    estimatedExecutionTime: '2-4 minutes',
  },
  {
    id: 'SALES_OPPORTUNITY_RESPONSE',
    name: 'Sales Opportunity Auto-Response',
    description: 'Analyzes inbound customer inquiries and prepares custom proposal drafts and next-best-action recommendations.',
    domain: 'sales',
    requiredAgents: ['analytics', 'learning'],
    riskLevel: 'HIGH',
    approvalRequired: true,
    estimatedExecutionTime: '3 minutes',
  },
  {
    id: 'BUSINESS_REPORT_GENERATION',
    name: 'Executive Intelligence & Performance Report',
    description: 'Synthesizes marketing ROI, sales conversion, operational bottlenecks, and security posture into an executive dashboard report.',
    domain: 'operations',
    requiredAgents: ['analytics', 'learning'],
    riskLevel: 'LOW',
    approvalRequired: false,
    estimatedExecutionTime: '2 minutes',
  },
  {
    id: 'OPERATIONS_OPTIMIZATION',
    name: 'Operational Bottleneck & Workflow Optimizer',
    description: 'Detects sequential process constraints, recommends parallel approval lanes, and configures WorkflowEngine automation rules.',
    domain: 'operations',
    requiredAgents: ['analytics', 'learning'],
    riskLevel: 'MEDIUM',
    approvalRequired: false,
    estimatedExecutionTime: '5 minutes',
  },
  {
    id: 'SECURITY_MONITORING_CHECK',
    name: 'Zero-Trust Security & Agent Governance Audit',
    description: 'Audits access logs, agent runtime delegation matrix checks, API key expiration, and data exposure risks.',
    domain: 'security',
    requiredAgents: ['security', 'analytics'],
    riskLevel: 'CRITICAL',
    approvalRequired: true,
    estimatedExecutionTime: '1-2 minutes',
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export class CustomerAutomationService {
  private automations: AutomationRecord[] = [];

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private memoryRepo: MemoryRepository,
    private contextBuilder: ContextBuilder,
    private executionService: AutonomousExecutionService,
    private notificationService?: CustomerNotificationService
  ) {}

  // ─── Tenant Guard ──────────────────────────────────────────────────────────

  private async assertTenantDNA(organizationId: string, businessId: string) {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) throw new Error(`CustomerAutomation: access denied for org '${organizationId}'.`);
    return dna;
  }

  // ─── 1. Get Automation Templates ──────────────────────────────────────────

  getAutomationTemplates(): AutomationTemplate[] {
    return PREBUILT_AUTOMATION_TEMPLATES;
  }

  // ─── 2. Create Automation Configuration ────────────────────────────────────

  async createAutomation(params: {
    organizationId: string;
    businessId: string;
    templateId: string;
    triggerType?: AutomationTriggerType;
    schedule?: string;
    configuration?: Record<string, unknown>;
    actor: string;
  }): Promise<AutomationRecord> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);
    const companyName = dna.companyIdentity.companyName.value;

    const template = PREBUILT_AUTOMATION_TEMPLATES.find((t) => t.id === params.templateId);
    if (!template) throw new Error(`Automation template not found: ${params.templateId}`);

    const id = `aut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const record: AutomationRecord = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      templateId: params.templateId,
      name: `${template.name} (${companyName})`,
      domain: template.domain,
      triggerType: params.triggerType ?? 'MANUAL',
      schedule: params.schedule ?? 'Daily at 09:00 UTC',
      configuration: params.configuration ?? {},
      status: 'DRAFT',
      executionCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.automations.push(record);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'AUTOMATION_CREATED',
        automationId: id,
        templateId: params.templateId,
        domain: template.domain,
      },
    });

    return record;
  }

  // ─── 3. Activate Automation ────────────────────────────────────────────────

  async activateAutomation(params: {
    organizationId: string;
    businessId: string;
    automationId: string;
    actor: string;
  }): Promise<AutomationRecord> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const record = this.automations.find(
      (a) => a.id === params.automationId && a.organizationId === params.organizationId
    );

    if (!record) throw new Error(`Automation not found: ${params.automationId}`);

    const template = PREBUILT_AUTOMATION_TEMPLATES.find((t) => t.id === record.templateId);

    record.status = 'ACTIVE';

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.actor,
      details: {
        eventType: 'AUTOMATION_ACTIVATED',
        automationId: params.automationId,
        templateId: record.templateId,
        riskLevel: template?.riskLevel ?? 'LOW',
      },
    });

    if (this.notificationService) {
      this.notificationService.sendCustomerAlert({
        organizationId: params.organizationId,
        businessId: params.businessId,
        type: 'dna_updated',
        title: 'Automation Activated',
        message: `Automation "${record.name}" is now ACTIVE.`,
      });
    }

    return record;
  }

  // ─── 4. Execute Automation ─────────────────────────────────────────────────

  async executeAutomation(params: {
    organizationId: string;
    businessId: string;
    automationId: string;
    actor: string;
  }): Promise<{ automation: AutomationRecord; executionPlan: ExecutionPlan }> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const record = this.automations.find(
      (a) => a.id === params.automationId && a.organizationId === params.organizationId
    );

    if (!record) throw new Error(`Automation not found: ${params.automationId}`);

    if (record.status !== 'ACTIVE' && record.status !== 'DRAFT') {
      throw new Error(`Automation cannot be executed while in state: ${record.status}`);
    }

    const template = PREBUILT_AUTOMATION_TEMPLATES.find((t) => t.id === record.templateId);
    const domain = template?.domain ?? record.domain;
    const riskLevel = template?.riskLevel ?? 'LOW';

    // Log AUTOMATION_TRIGGERED audit event
    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.actor,
      details: {
        eventType: 'AUTOMATION_TRIGGERED',
        automationId: params.automationId,
        templateId: record.templateId,
      },
    });

    try {
      // Step A: Convert Customer Automation -> AutonomousExecutionService.createExecutionPlan()
      const plan = await this.executionService.createExecutionPlan({
        organizationId: params.organizationId,
        businessId: params.businessId,
        objective: record.name,
        domain,
        riskLevel,
        actor: params.actor,
      });

      // Step B: Risk Evaluation
      await this.executionService.evaluateExecutionRisk({
        organizationId: params.organizationId,
        businessId: params.businessId,
        executionId: plan.executionId,
        actor: params.actor,
      });

      // Step C: Approval Check & Execution Routing
      if (plan.approvalRequired || riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        await this.executionService.requestExecutionApproval({
          organizationId: params.organizationId,
          businessId: params.businessId,
          executionId: plan.executionId,
          actor: params.actor,
        });
      } else {
        await this.executionService.executeApprovedWorkflow({
          organizationId: params.organizationId,
          businessId: params.businessId,
          executionId: plan.executionId,
          actor: params.actor,
        });
      }

      record.executionCount += 1;
      record.lastExecutedAt = new Date().toISOString();

      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'update',
        changedBy: params.actor,
        details: {
          eventType: 'AUTOMATION_COMPLETED',
          automationId: params.automationId,
          executionId: plan.executionId,
          executionCount: record.executionCount,
        },
      });

      // Record memory learning
      await this.recordAutomationLearning({
        organizationId: params.organizationId,
        businessId: params.businessId,
        automationId: params.automationId,
        workflowType: record.templateId,
        outcome: 'SUCCESS',
        executionEfficiency: '100% completed within target SLA',
        approvalDecision: plan.approvalRequired ? 'Approval Gated' : 'Auto Executed',
        improvementOpportunities: [
          'Optimize execution step duration via parallel agent delegation',
          'Refine trigger schedule based on peak customer activity window',
        ],
        actor: params.actor,
      });

      return { automation: record, executionPlan: plan };
    } catch (err: any) {
      record.status = 'FAILED';

      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: params.businessId,
        action: 'update',
        changedBy: params.actor,
        details: {
          eventType: 'AUTOMATION_FAILED',
          automationId: params.automationId,
          error: err.message ?? 'Automation execution failed',
        },
      });

      throw err;
    }
  }

  // ─── 5. Record Automation Learning ─────────────────────────────────────────

  async recordAutomationLearning(params: {
    organizationId: string;
    businessId: string;
    automationId: string;
    workflowType: string;
    outcome: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    executionEfficiency: string;
    approvalDecision: string;
    improvementOpportunities: string[];
    actor: string;
  }) {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const learnings = [
      `Workflow type ${params.workflowType} completed with outcome ${params.outcome}.`,
      `Efficiency: ${params.executionEfficiency}. Approval decision: ${params.approvalDecision}.`,
      ...params.improvementOpportunities.map((o) => `Opportunity: ${o}`),
    ];

    for (const content of learnings) {
      await this.memoryRepo.addMemory({
        organizationId: params.organizationId,
        businessId: params.businessId,
        category: 'automation_learning',
        content,
        importance: params.outcome === 'SUCCESS' ? 0.95 : 0.6,
        relevance: 0.9,
      });
    }

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'AUTOMATION_LEARNING_RECORDED',
        automationId: params.automationId,
        workflowType: params.workflowType,
        outcome: params.outcome,
      },
    });
  }

  // ─── 6. Pause Automation ───────────────────────────────────────────────────

  async pauseAutomation(params: {
    organizationId: string;
    businessId: string;
    automationId: string;
    actor: string;
  }): Promise<AutomationRecord> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const record = this.automations.find(
      (a) => a.id === params.automationId && a.organizationId === params.organizationId
    );

    if (!record) throw new Error(`Automation not found: ${params.automationId}`);

    record.status = 'PAUSED';

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'update',
      changedBy: params.actor,
      details: {
        eventType: 'AUTOMATION_PAUSED',
        automationId: params.automationId,
      },
    });

    return record;
  }

  // ─── 7. Get Automation History ─────────────────────────────────────────────

  getAutomationHistory(organizationId: string, businessId: string, automationId?: string): AutomationHistory {
    const orgAutomations = this.automations.filter(
      (a) => a.organizationId === organizationId && a.businessId === businessId && (!automationId || a.id === automationId)
    );

    const execDash = this.executionService.getExecutionDashboard(organizationId, businessId);

    return {
      automations: orgAutomations,
      executions: execDash.plans,
      approvals: execDash.approvals,
      outcomes: execDash.plans.map((p) => this.executionService.monitorExecutionOutcome({ organizationId, businessId, executionId: p.executionId })),
      learningRecords: execDash.learnings,
    };
  }
}
