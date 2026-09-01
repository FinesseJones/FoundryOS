import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export const PublishingPlanSchema = z.object({
  targetChannel: z.string().min(1),
  scheduledTimeIso: z.string().min(1),
  channelOptimizedContent: z.string().min(1),
  complianceStatus: z.enum(['COMPLIANT', 'NEEDS_REVISION', 'NON_COMPLIANT']),
  hashtags: z.array(z.string()).default([]),
  characterCount: z.number().min(0),
  requiresHumanApproval: z.boolean(),
  distributionStrategy: z.string().min(1),
  riskFactor: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export type PublishingPlanResult = z.infer<typeof PublishingPlanSchema>;

export class PublishingAgent extends BaseAgent {
  readonly role: AgentRole = 'publishing';
  readonly name = 'Publishing Agent';
  readonly description = 'Schedules content, validates channel formatting, enforces human approval gating, and logs publishing history.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['channels', 'campaign_calendar', 'approvals'],
    writableDomains: ['publishing_history', 'schedule', 'delivery_status'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const dna = context.businessDNASlice;
    const companyName = dna.companyIdentity?.companyName?.value || 'Enterprise Brand';
    const industry = dna.companyIdentity?.industry?.value || 'commercial_services';
    const primaryTone = dna.brandVoice?.primaryTone?.value || 'authoritative';
    const channel = request.targetChannel || 'linkedin';
    const draftPrompt = request.prompt || 'Optimize and schedule draft announcement for multi-channel distribution.';

    const systemRole = `Specialized Role: Lead Multi-Channel Publishing Director & Distribution Compliance Officer.`;
    const prompt =
      `Conduct a comprehensive channel-formatting validation, scheduling, and distribution analysis for ${companyName}.\n` +
      `Target Channel: ${channel}\n` +
      `Industry: ${industry}\n` +
      `Brand Voice Tone: ${primaryTone}\n` +
      `Content Directive / Candidate Draft: "${draftPrompt}"\n\n` +
      `You MUST respond with valid, raw JSON (no markdown fences, no explanatory preambles) strictly following this JSON schema:\n` +
      `{\n` +
      `  "targetChannel": "${channel}",\n` +
      `  "scheduledTimeIso": "<ISO 8601 future timestamp, e.g. 2026-09-02T14:00:00.000Z>",\n` +
      `  "channelOptimizedContent": "<fully formatted and polished channel post with linebreaks>",\n` +
      `  "complianceStatus": "COMPLIANT" | "NEEDS_REVISION" | "NON_COMPLIANT",\n` +
      `  "hashtags": ["#<Tag1>", "#<Tag2>", ...],\n` +
      `  "characterCount": <integer count of characters in channelOptimizedContent>,\n` +
      `  "requiresHumanApproval": true | false,\n` +
      `  "distributionStrategy": "<specific peak-engagement timing and distribution rationale>",\n` +
      `  "riskFactor": "LOW" | "MEDIUM" | "HIGH"\n` +
      `}`;

    // Execute via centralized LLM Gateway (routes through NVIDIA NIM / Ollama with Quota gating)
    const rawOutput = await this.callLLM(prompt, context, systemRole);

    // Strict JSON parsing with zero mock fallback
    let parsed: unknown;
    try {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON object structure found in response');
      }
      const rawJson = jsonMatch[0];
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        // Clean unescaped newlines and template backticks within JSON string literals
        const sanitized = rawJson
          .replace(/:\s*`([\s\S]*?)`\s*(,|})/g, (_, content, suffix) => `: ${JSON.stringify(content)}${suffix}`)
          .replace(/:\s*"([\s\S]*?)"\s*(,|})/g, (_, content, suffix) => {
            const escaped = content.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t');
            return `: "${escaped}"${suffix}`;
          });
        parsed = JSON.parse(sanitized);
      }
    } catch (parseErr: any) {
      throw new Error(`[PublishingAgent] Failed to parse LLM response as JSON: ${parseErr.message}\nRaw LLM Output:\n${rawOutput}`);
    }

    const validation = PublishingPlanSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`[PublishingAgent] LLM output failed schema validation: ${validation.error.message}\nParsed object:\n${JSON.stringify(parsed, null, 2)}`);
    }

    const planData = validation.data;
    const summary = `Content staged for publishing on channel [${planData.targetChannel}] at ${planData.scheduledTimeIso}. Status: ${planData.complianceStatus} (${planData.riskFactor} Risk, Approval Required: ${planData.requiresHumanApproval}).`;

    return {
      summary,
      data: {
        ...planData,
        scheduledChannel: planData.targetChannel,
        scheduledTime: planData.scheduledTimeIso,
        publishingStatus: 'staged',
        accessAuthorized: this.canWriteDomain('publishing_history'),
        auditedBy: 'LLM-Gateway',
      },
    };
  }
}
