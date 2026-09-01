import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export const AnalyticsAuditSchema = z.object({
  contentRoi: z.number().min(0),
  conversionRate: z.number().min(0).max(1),
  topPerformingTopics: z.array(z.string()).min(1),
  underperformingTopics: z.array(z.string()).default([]),
  keyInsights: z.array(z.string()).min(1),
  recommendedAction: z.string().min(1),
});

export type AnalyticsAuditResult = z.infer<typeof AnalyticsAuditSchema>;

export class AnalyticsAgent extends BaseAgent {
  readonly role: AgentRole = 'analytics';
  readonly name = 'Analytics & ROI Agent';
  readonly description = 'Tracks content engagement, evaluates conversion rates, calculates content ROI, and classifies top/bottom performing assets.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['website_traffic', 'conversion_rate', 'lead_sources', 'content_roi', 'engagement_rate'],
    writableDomains: ['analytics', 'content_roi', 'performance_reports'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const dna = context.businessDNASlice;
    const companyName = dna.companyIdentity?.companyName?.value || 'Enterprise Brand';
    const industry = dna.companyIdentity?.industry?.value || 'technology_saas';
    const mission = dna.companyIdentity?.mission?.value || '';
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value || '';
    const userPrompt = request.prompt || 'Conduct an analytics audit evaluating content ROI, conversion metrics, and top performance drivers.';

    const systemRole = `Specialized Role: Chief Analytics Officer & Revenue Attribution Intelligence Specialist.`;
    const prompt =
      `Conduct a rigorous content marketing, conversion rate, and revenue ROI analytics audit for ${companyName}.\n` +
      `Industry: ${industry}\n` +
      `Mission: "${mission}"\n` +
      `UVP: "${uvp}"\n` +
      `Task Directive: "${userPrompt}"\n\n` +
      `You MUST respond with valid, raw JSON (no markdown formatting, no code fences, no introductory or concluding text) matching this schema:\n` +
      `{\n` +
      `  "contentRoi": <numeric estimated ROI multiple, e.g. 3.8>,\n` +
      `  "conversionRate": <numeric conversion rate between 0 and 1, e.g. 0.045>,\n` +
      `  "topPerformingTopics": ["<high-converting topic 1>", "<high-converting topic 2>", ...],\n` +
      `  "underperformingTopics": ["<low-converting topic 1>", ...],\n` +
      `  "keyInsights": ["<specific analytical insight 1>", "<specific analytical insight 2>", ...],\n` +
      `  "recommendedAction": "<concrete, high-leverage revenue optimization recommendation>"\n` +
      `}`;

    // Execute via centralized LLM Gateway (routes through NVIDIA NIM / Ollama with Quota gating)
    const rawOutput = await this.callLLM(prompt, context, systemRole);

    // Strict JSON parsing with zero mock fallback
    let parsed: unknown;
    try {
      const cleaned = rawOutput.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr: any) {
      throw new Error(`[AnalyticsAgent] Failed to parse LLM response as JSON: ${parseErr.message}\nRaw LLM Output:\n${rawOutput}`);
    }

    const validation = AnalyticsAuditSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`[AnalyticsAgent] LLM output failed schema validation: ${validation.error.message}\nParsed object:\n${JSON.stringify(parsed, null, 2)}`);
    }

    const auditData = validation.data;
    const summary = `Analytics audit completed for ${companyName}: Estimated Content ROI is ${auditData.contentRoi}x with a ${(auditData.conversionRate * 100).toFixed(1)}% conversion rate. Top driver: "${auditData.topPerformingTopics[0]}".`;

    return {
      summary,
      data: {
        ...auditData,
        accessAuthorized: this.canWriteDomain('analytics'),
        auditedBy: 'LLM-Gateway',
      },
    };
  }
}
