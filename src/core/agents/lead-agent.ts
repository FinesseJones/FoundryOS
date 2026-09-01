import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export const DiscoveredLeadSchema = z.object({
  id: z.number().or(z.string()),
  companyName: z.string().min(1),
  website: z.string().min(1),
  targetRole: z.string().default('Executive Decision Maker (Target Role)'),
  primaryContact: z.string().min(1),
  currentStage: z.enum(['Discovery', 'Proposal', 'Evaluation', 'Lost']).default('Discovery'),
  status: z.enum(['High Priority', 'Medium Priority', 'Low Priority']).default('High Priority'),
  pillarFinancialPain: z.string().min(1),
  pillarProcessGap: z.string().min(1),
  pillarStakeholderAlignment: z.string().min(1),
  industry: z.string().min(1),
  estimatedRevenueLoss: z.string().default('$500k/yr'),
  opportunityScore: z.number().min(0).max(100),
  isAiSourced: z.boolean().default(true),
  isAiEstimated: z.boolean().default(true),
  dataSource: z.string().default('AI-Estimated Domain Signal Analysis (Verify Before Outreach)'),
  verificationStatus: z.enum([
    'AI_ESTIMATED_VERIFY_BEFORE_OUTREACH',
    'ROLE_PROFILE_UNVERIFIED',
    'DOMAIN_AUDITED',
  ]).default('AI_ESTIMATED_VERIFY_BEFORE_OUTREACH'),
  verificationWarning: z.string().default('AI-estimated opportunity model. Confirm executive contact details before initiating outreach.'),
  discoveredAt: z.string().default(() => new Date().toISOString()),
});

export const LeadProspectingResultSchema = z.object({
  industry: z.string().min(1),
  targetRegion: z.string().default('National'),
  discoveredLeads: z.array(DiscoveredLeadSchema).min(1),
  executiveProspectingSummary: z.string().min(1),
});

export type DiscoveredLead = z.infer<typeof DiscoveredLeadSchema>;
export type LeadProspectingResult = z.infer<typeof LeadProspectingResultSchema>;

export interface LeadDiscoveryParams {
  industry?: string;
  targetRegion?: string;
  strategy?: 'transformation' | 'financial_pain' | 'fast_close';
  batchSize?: number;
  customTargetDomain?: string;
}

export class LeadAgent extends BaseAgent {
  readonly role: AgentRole = 'lead' as AgentRole;
  readonly name = 'Lead Prospecting Agent';
  readonly description = 'Autonomously identifies high-value prospective clients, audits digital transformation gaps, and synthesizes actionable 3-pillar CRM leads.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['leads', 'market_intelligence', 'website', 'brand'],
    writableDomains: ['leads', 'pipeline_opportunities', 'lead_discovery'],
  };

  /**
   * Autonomous lead discovery method executing through the authoritative LLM Gateway.
   */
  async discoverLeads(params: LeadDiscoveryParams = {}): Promise<DiscoveredLead[]> {
    const businessId = 'biz_lead_discovery';
    const context = await this.contextBuilder.buildContext({
      businessId,
      taskType: 'brand_analysis',
      userPrompt: params.customTargetDomain
        ? `Audit custom target domain: ${params.customTargetDomain}`
        : `Discover high-value leads in ${params.industry || 'B2B'}`,
    });

    const result = await this.processAgentTask({
      taskId: `task_lead_disc_${Date.now()}`,
      businessId,
      role: this.role,
      taskType: 'brand_analysis',
      prompt: params.customTargetDomain
        ? `Audit custom target domain "${params.customTargetDomain}" in the ${params.industry || 'commercial'} industry. Quantify annual financial pain, identify specific technical/process gaps, and map the economic decision maker role. DO NOT hallucinate personal names.`
        : `Identify and qualify ${params.batchSize || 2} prospective enterprise leads in the ${params.industry || 'saas'} industry seeking digital transformation and agency-replacement solutions. Map target decision maker roles with explicit AI-estimated verification tags. DO NOT hallucinate personal names.`,
      payload: params,
    }, context);

    return result.data.discoveredLeads as DiscoveredLead[];
  }

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const dna = context.businessDNASlice;
    const companyName = dna.companyIdentity?.companyName?.value || 'Enterprise Brand';
    const mission = dna.companyIdentity?.mission?.value || '';
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value || '';
    const payload = (request.payload as LeadDiscoveryParams) || {};
    const industry = payload.industry || dna.companyIdentity?.industry?.value || 'saas';
    const batchSize = payload.customTargetDomain ? (payload.batchSize || 1) : (payload.batchSize || 2);
    const userPrompt = request.prompt || `Prospect ${batchSize} enterprise leads in the ${industry} industry.`;

    const systemRole = `Specialized Role: Enterprise Revenue Operations & B2B Lead Intelligence Commander.`;
    const prompt =
      `Conduct an autonomous high-value client discovery and 3-pillar opportunity audit for ${companyName}.\n` +
      `Our Value Proposition: "${uvp}"\n` +
      `Our Mission: "${mission}"\n` +
      `Target Prospect Industry: ${industry}\n` +
      `Prospect Count: ${batchSize}\n` +
      `Task Directive: "${userPrompt}"\n\n` +
      `IMPORTANT GROUNDING INSTRUCTIONS:\n` +
      `1. DO NOT invent, hallucinate, or fabricate specific personal individual names (e.g. do NOT return 'Sarah Jenkins' or 'Greg Lehmkuhl').\n` +
      `2. Instead, specify the exact TARGET EXECUTIVE ROLE / TITLE needed for this opportunity (e.g. 'VP Operations / Facility Director' or 'Chief Operating Officer & VP Procurement').\n` +
      `3. In 'primaryContact', format as 'Target Role: <Title> (Unverified - Verify Before Outreach)'.\n` +
      `4. In 'dataSource', specify 'AI-Estimated Domain Signal Analysis (Verify Before Outreach)'.\n` +
      `5. In 'verificationStatus', provide 'AI_ESTIMATED_VERIFY_BEFORE_OUTREACH'.\n\n` +
      `You MUST respond with valid, raw JSON (no markdown fences, no explanatory preambles) strictly following this JSON schema:\n` +
      `{\n` +
      `  "industry": "${industry}",\n` +
      `  "targetRegion": "${payload.targetRegion || 'National'}",\n` +
      `  "discoveredLeads": [\n` +
      `    {\n` +
      `      "id": ${Date.now()},\n` +
      `      "companyName": "<Target Prospect Company Name>",\n` +
      `      "website": "<https://prospectdomain.com>",\n` +
      `      "targetRole": "<Target Executive Role/Title only, e.g. VP Operations / Facility Director>",\n` +
      `      "primaryContact": "Target Role: <Target Executive Role/Title> (Unverified - Verify Before Outreach)",\n` +
      `      "currentStage": "Discovery",\n` +
      `      "status": "High Priority",\n` +
      `      "pillarFinancialPain": "<quantified annual revenue loss or cost drag with exact dollar figure, e.g. $1.2M annual revenue lost to manual dispatch delays>",\n` +
      `      "pillarProcessGap": "<concrete operational or technological bottleneck>",\n` +
      `      "pillarStakeholderAlignment": "<key economic buyer and department sponsor role>",\n` +
      `      "industry": "${industry.toUpperCase()}",\n` +
      `      "estimatedRevenueLoss": "<e.g. $1.2M/yr>",\n` +
      `      "opportunityScore": <integer score between 80 and 99>,\n` +
      `      "isAiSourced": true,\n` +
      `      "isAiEstimated": true,\n` +
      `      "dataSource": "AI-Estimated Domain Signal Analysis (Verify Before Outreach)",\n` +
      `      "verificationStatus": "AI_ESTIMATED_VERIFY_BEFORE_OUTREACH",\n` +
      `      "verificationWarning": "AI-estimated opportunity model. Confirm executive contact details before initiating outreach.",\n` +
      `      "discoveredAt": "${new Date().toISOString()}"\n` +
      `    }\n` +
      `  ],\n` +
      `  "executiveProspectingSummary": "<concise briefing on prospect pipeline opportunities>"\n` +
      `}`;

    // Execute via centralized LLM Gateway (routes through NVIDIA NIM with Quota gating)
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
        const sanitized = rawJson
          .replace(/:\s*`([\s\S]*?)`\s*(,|})/g, (_, content, suffix) => `: ${JSON.stringify(content)}${suffix}`)
          .replace(/:\s*"([\s\S]*?)"\s*(,|})/g, (_, content, suffix) => {
            const escaped = content.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t');
            return `: "${escaped}"${suffix}`;
          });
        parsed = JSON.parse(sanitized);
      }
    } catch (parseErr: any) {
      throw new Error(`[LeadAgent] Failed to parse LLM response as JSON: ${parseErr.message}\nRaw LLM Output:\n${rawOutput}`);
    }

    const validation = LeadProspectingResultSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`[LeadAgent] LLM output failed schema validation: ${validation.error.message}\nParsed object:\n${JSON.stringify(parsed, null, 2)}`);
    }

    const leadData = validation.data;
    const summary = `Lead Prospecting Agent identified ${leadData.discoveredLeads.length} high-value enterprise opportunities in ${leadData.industry}.`;

    return {
      summary,
      data: {
        discoveredLeads: leadData.discoveredLeads,
        leadCount: leadData.discoveredLeads.length,
        industry: leadData.industry,
        executiveProspectingSummary: leadData.executiveProspectingSummary,
        strategy: payload.strategy || 'transformation',
        accessAuthorized: this.canWriteDomain('leads'),
        auditedBy: 'NVIDIA-NIM-Gateway',
      },
    };
  }
}
