import { AgentRegistry } from './agent-registry';
import { AccessControlError } from './base-agent';

export interface MultiAgentConsultationRequest {
  businessId: string;
  initialPrompt: string;
  targetChannel: string;
  sessionRole?: 'ADMIN' | 'EXECUTIVE' | 'MARKETER' | 'MEMBER';
}

export interface ConsultationStep {
  agentRole: string;
  findingSummary: string;
  recommendation: string;
  passed: boolean;
}

export interface MultiAgentCollaborationResult {
  collaborationId: string;
  businessId: string;
  finalContent: string;
  consultationSteps: ConsultationStep[];
  overallQualityScore: number;
  completedAt: string;
}

export class MultiAgentCollaborationOrchestrator {
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  /**
   * Validate that the requested domain modification strictly aligns with target agent's write matrix.
   * Eliminates un-orchestrated "friend privileges" between agents.
   */
  validateAgentDelegation(targetAgentRole: string, targetDomain: string): void {
    const targetAgent = this.registry.getAgent(targetAgentRole as any);

    try {
      targetAgent.assertCanModifyDomain(targetDomain as any);
    } catch {
      throw new AccessControlError(targetAgentRole, targetDomain);
    }
  }

  async runCollaborationLoop(request: MultiAgentConsultationRequest): Promise<MultiAgentCollaborationResult> {
    const consultationSteps: ConsultationStep[] = [];

    // Step 1: ContentAgent generates initial draft (Validated against 'content_plans' write domain)
    this.validateAgentDelegation('content', 'content_plans');
    const contentResult = await this.registry.dispatchTask({
      taskId: `collab_cont_${Date.now()}`,
      businessId: request.businessId,
      role: 'content',
      taskType: 'content_generation',
      prompt: request.initialPrompt,
      targetChannel: request.targetChannel,
    });

    let draftText = String(contentResult.outputData.draftText || contentResult.outputSummary);
    consultationSteps.push({
      agentRole: 'content',
      findingSummary: 'Generated initial multi-channel draft',
      recommendation: 'Pass draft to BrandAgent for voice audit',
      passed: true,
    });

    // Step 2: ContentAgent asks BrandAgent for Voice Audit (Validated against 'brand' write domain)
    this.validateAgentDelegation('brand', 'brand');
    const brandResult = await this.registry.dispatchTask({
      taskId: `collab_brand_${Date.now()}`,
      businessId: request.businessId,
      role: 'brand',
      taskType: 'brand_analysis',
      prompt: `Audit voice compliance for text: ${draftText}`,
    });

    consultationSteps.push({
      agentRole: 'brand',
      findingSummary: brandResult.outputSummary,
      recommendation: 'Enforce prohibited word filters and UVP alignment',
      passed: brandResult.cognitiveResult.critique.passed,
    });

    // Step 3: ContentAgent asks WebsiteAgent for conversion hook alignment (Validated against 'website_audit' domain)
    this.validateAgentDelegation('website', 'website_audit');
    const websiteResult = await this.registry.dispatchTask({
      taskId: `collab_web_${Date.now()}`,
      businessId: request.businessId,
      role: 'website',
      taskType: 'content_generation',
      prompt: `Audit landing page CTA alignment for text: ${draftText}`,
    });

    consultationSteps.push({
      agentRole: 'website',
      findingSummary: websiteResult.outputSummary,
      recommendation: 'Align CTA hook with primary website value proposition',
      passed: true,
    });

    // Step 4: ContentAgent asks AnalyticsAgent for ROI score (Validated against 'analytics' domain)
    this.validateAgentDelegation('analytics', 'analytics');
    const analyticsResult = await this.registry.dispatchTask({
      taskId: `collab_ana_${Date.now()}`,
      businessId: request.businessId,
      role: 'analytics',
      taskType: 'brand_analysis',
      prompt: 'Predict content ROI score',
    });

    consultationSteps.push({
      agentRole: 'analytics',
      findingSummary: `Predicted ROI Multiplier: ${analyticsResult.outputData.contentRoi}x`,
      recommendation: 'Deploy high-velocity headline structure',
      passed: (analyticsResult.outputData.contentRoi as number) > 1.0,
    });

    // Calculate composite quality score across all audited agent consultations
    const passedCount = consultationSteps.filter((s) => s.passed).length;
    const overallQualityScore = Math.round((passedCount / consultationSteps.length) * 100) / 100;

    return {
      collaborationId: `collab_${request.businessId}_${Date.now()}`,
      businessId: request.businessId,
      finalContent: draftText,
      consultationSteps,
      overallQualityScore,
      completedAt: new Date().toISOString(),
    };
  }
}
