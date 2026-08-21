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

    const userPrompt = request.prompt || `Formulate a high-converting ${channel} post communicating ${brandName}'s core value proposition and addressing our target audience's primary financial pain.`;

    // ─── Direct LLM Gateway Execution (NVIDIA NIM Primary) ──────────────
    const generatedCopy = await this.callLLM(
      `Generate a production-ready ${channel} post for ${brandName}.\nPrompt: "${userPrompt}"\n\nRequirements:\n- Length: 150-300 words\n- Include 1 engaging hook, 3 key value bullet points, and 1 clear Call-To-Action.`,
      context,
      `Specialized Role: Enterprise Copywriter & Social Media Strategist for ${channel}.`
    );

    const summary = `Generated production ${channel} campaign asset in ${tone} tone for ${brandName}.`;

    return {
      summary,
      data: {
        targetChannel: channel,
        draftText: generatedCopy,
        wordsCount: generatedCopy.split(/\s+/).length,
        accessAuthorized: this.canWriteDomain('content_plans'),
        generatedBy: 'NVIDIA-NIM-LLM-Gateway',
      },
    };
  }
}
