import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export class ContentAgent extends BaseAgent {
  readonly role: AgentRole = 'content';
  readonly name = 'Content Strategy Agent';
  readonly description = 'Formulates content plans, generates multi-channel posts, and designs campaign assets aligned with brand voice.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['brand', 'offerings', 'audience', 'content_strategy', 'analytics'],
    writableDomains: ['campaign_calendar', 'content_plans', 'recommendations'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const channel = request.targetChannel ?? 'LinkedIn';
    const dna = context.businessDNASlice;
    const tone = dna.brandVoice?.primaryTone?.value ?? 'authoritative';
    const brandName = dna.companyIdentity?.companyName?.value ?? 'Our Brand';

    const draftText = `🚀 Exciting updates from ${brandName}! We are pushing the boundaries in our industry with a ${tone} approach to innovation. Connect with us to scale faster!`;

    return {
      summary: `Generated production draft for ${channel} in ${tone} tone.`,
      data: {
        targetChannel: channel,
        draftText,
        wordsCount: draftText.split(/\s+/).length,
        accessAuthorized: this.canWriteDomain('content_plans'),
      },
    };
  }
}
