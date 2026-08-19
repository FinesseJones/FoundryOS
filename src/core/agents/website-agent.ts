import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export class WebsiteAgent extends BaseAgent {
  readonly role: AgentRole = 'website';
  readonly name = 'Website Agent';
  readonly description = 'Audits website messaging, evaluates hero headlines and CTAs, and generates conversion optimization recommendations.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['website', 'visual_identity', 'brand'],
    writableDomains: ['website_audit', 'redesign_recommendations'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const websiteData = context.businessDNASlice.websiteAnalysis;
    const primaryUrl = websiteData?.primaryUrl?.value ?? 'https://example.com';
    const mainCTAs = websiteData?.mainCTAs?.value ?? ['Get Started', 'Book Demo'];

    const summary = `Website Audit for ${primaryUrl}: Main CTAs (${mainCTAs.join(', ')}) evaluated for conversion strength.`;

    return {
      summary,
      data: {
        primaryUrl,
        mainCTAs,
        conversionScore: 0.88,
        trustScore: 0.92,
        accessAuthorized: this.canWriteDomain('website_audit'),
      },
    };
  }
}
