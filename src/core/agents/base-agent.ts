import { z } from 'zod';
import { ContextBuilder, EngineContext } from '../context';
import { CognitiveEngine, CognitiveProcessResult } from '../cognitive';
import { AgentRole, AgentAccessRights, AgentTaskRequest, AgentTaskResult, AgentDescriptor } from './agent.types';
import { createAuditEvent, AuditEvent } from '../knowledge';
import { MultiProviderLLMFactory, LLMProviderGateway } from '../providers/llm-provider-factory';

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

  constructor(
    protected contextBuilder: ContextBuilder,
    protected llmGateway: MultiProviderLLMFactory = LLMProviderGateway
  ) {}

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
   * Constructs an authoritative System Prompt from Business DNA & Agent Identity.
   */
  protected buildAgentSystemPrompt(context: EngineContext, customRoleInstruction?: string): string {
    const dna = context.businessDNASlice;
    const brandName = dna.companyIdentity?.companyName?.value || 'Authoritative Enterprise';
    const industry = dna.companyIdentity?.industry?.value || 'technology_saas';
    const tone = dna.brandVoice?.primaryTone?.value || 'authoritative';
    const mission = dna.companyIdentity?.mission?.value || '';
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value || '';
    const wordsToUse = dna.brandVoice?.wordsToUse?.value || [];
    const wordsToAvoid = dna.brandVoice?.wordsToAvoid?.value || [];
    const financialPain = (dna as any)?.opportunityPillars?.financialPain?.value || (dna as any)?.opportunityPillars?.financialPain || '';
    const processGap = (dna as any)?.opportunityPillars?.processGap?.value || (dna as any)?.opportunityPillars?.processGap || '';
    const stakeholder = (dna as any)?.opportunityPillars?.stakeholderAlignment?.value || (dna as any)?.opportunityPillars?.stakeholderAlignment || '';

    return `You are the ${this.name} (${this.role} agent) for ${brandName}.
Domain Description: ${this.description}
${customRoleInstruction ? customRoleInstruction + '\n' : ''}
AUTHORITATIVE BUSINESS DNA CONTEXT:
- Organization / Brand: ${brandName}
- Industry: ${industry}
- Primary Tone: ${tone}
- Mission: ${mission}
- Unique Value Proposition (UVP): ${uvp}

OPPORTUNITY PILLARS:
- Financial Pain: ${financialPain}
- Process Gap: ${processGap}
- Stakeholder Alignment: ${stakeholder}

BRAND GUARDRAILS:
${wordsToUse.length > 0 ? `- Approved Vocabulary: ${wordsToUse.join(', ')}` : ''}
${wordsToAvoid.length > 0 ? `- Guardrail Words to Avoid: ${wordsToAvoid.join(', ')}` : ''}

CRITICAL RULES:
1. Adhere strictly to the ${tone} brand voice and avoid all disallowed words.
2. Produce specific, high-converting, actionable intelligence. Never use generic corporate placeholders.`;
  }

  /**
   * Centralized AI Generation Gateway Call: Routes through NVIDIA NIM (primary) / Ollama.
   */
  protected async callLLM(
    prompt: string,
    context: EngineContext,
    customRoleInstruction?: string
  ): Promise<string> {
    const systemPrompt = this.buildAgentSystemPrompt(context, customRoleInstruction);
    const response = await this.llmGateway.executeWithFallback({
      prompt,
      systemPrompt,
      temperature: 0.6,
      maxTokens: 1200,
    });
    return response.text.trim();
  }

  /**
   * Centralized Structured AI Generation Gateway Call (Type-safe Zod).
   */
  protected async callLLMStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    context: EngineContext,
    customRoleInstruction?: string
  ): Promise<T> {
    const systemPrompt = this.buildAgentSystemPrompt(context, customRoleInstruction);
    const { data } = await this.llmGateway.generateStructured(
      {
        prompt,
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1200,
      },
      schema
    );
    return data;
  }

  /**
   * Standard task execution flow:
   * 1. Access control validation
   * 2. Context Engine context building
   * 3. Specialized agent logic execution (via LLM Gateway)
   * 4. Cognitive Engine workflow processing (brand voice & guardrail check)
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

    // 2. Specialized Execution (implemented by subclass via LLM Gateway)
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
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }>;
}
