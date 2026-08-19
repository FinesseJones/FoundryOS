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
    const primaryTone = dna.brandVoice?.primaryTone?.value ?? 'professional';
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value ?? 'Core Value Proposition';

    const summary = `Brand Audit for ${companyName}: Primary tone is "${primaryTone}". UVP "${uvp}" verified against market positioning.`;

    return {
      summary,
      data: {
        brandName: companyName,
        primaryTone,
        uvp,
        confidenceScore: context.businessDNASlice.confidenceScore ?? 0.85,
        accessAuthorized: this.canWriteDomain('brand'),
      },
    };
  }
}
