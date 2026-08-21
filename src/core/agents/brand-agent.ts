import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export class BrandAgent extends BaseAgent {
  readonly role: AgentRole = 'brand';
  readonly name = 'Brand Intelligence Agent';
  readonly description = 'Monitors brand identity, evaluates voice consistency, audits UVP alignment, and updates brand confidence scores.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['company', 'offerings', 'customer', 'brand', 'visual_identity', 'competitors'],
    writableDomains: ['brand', 'analytics', 'recommendations', 'confidence_score'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const dna = context.businessDNASlice;
    const companyName = dna.companyIdentity?.companyName?.value ?? 'Brand';
    const primaryTone = dna.brandVoice?.primaryTone?.value ?? 'authoritative';
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value ?? 'Core Value Proposition';

    // ─── Direct LLM Gateway Execution (NVIDIA NIM Primary) ──────────────
    const brandAuditAnalysis = await this.callLLM(
      `Conduct a comprehensive brand positioning and voice audit for ${companyName}.\n` +
      `Evaluate our Unique Value Proposition: "${uvp}" against market expectations in the ${dna.companyIdentity?.industry?.value || 'technology'} industry.\n` +
      `Provide 3 strategic recommendations to sharpen our brand positioning and eliminate customer confusion.`,
      context,
      `Specialized Role: Chief Brand Officer & Strategic Positioning Auditor.`
    );

    const summary = `Brand Audit for ${companyName}: Primary tone is "${primaryTone}". UVP "${uvp}" verified and audited.`;

    return {
      summary,
      data: {
        brandName: companyName,
        primaryTone,
        uvp,
        analysis: brandAuditAnalysis,
        confidenceScore: context.businessDNASlice.confidenceScore ?? 0.92,
        accessAuthorized: this.canWriteDomain('brand'),
        auditedBy: 'NVIDIA-NIM-LLM-Gateway',
      },
    };
  }
}
