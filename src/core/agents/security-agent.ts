import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export const SecurityAuditSchema = z.object({
  reputationRiskScore: z.number().min(0).max(1),
  threatLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  impersonationAttemptsDetected: z.number().int().min(0),
  activeAlerts: z.array(z.string()).default([]),
  brandVoiceViolations: z.array(z.string()).default([]),
  recommendedMitigations: z.array(z.string()).min(1),
  reputationSummary: z.string().min(1),
});

export type SecurityAuditResult = z.infer<typeof SecurityAuditSchema>;

export class SecurityAgent extends BaseAgent {
  readonly role: AgentRole = 'security';
  readonly name = 'Security & Brand Protection Agent';
  readonly description = 'Monitors brand mentions, detects impersonation attempts, screens harmful comments, and assesses reputation risk.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['comments', 'reviews', 'messages', 'brand', 'security_audit'],
    writableDomains: ['security', 'alerts', 'risk_score'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const dna = context.businessDNASlice;
    const companyName = dna.companyIdentity?.companyName?.value || 'Enterprise Brand';
    const industry = dna.companyIdentity?.industry?.value || 'technology_saas';
    const mission = dna.companyIdentity?.mission?.value || '';
    const wordsToAvoid = dna.brandVoice?.wordsToAvoid?.value || [];
    const auditPrompt = request.prompt || 'Conduct security screening for brand impersonation, content safety, and reputation risk.';

    const systemRole = `Specialized Role: Chief Information Security Officer & Brand Reputation Protection Commander.`;
    const prompt =
      `Conduct a comprehensive brand security audit, impersonation scan, and reputation risk assessment for ${companyName}.\n` +
      `Industry: ${industry}\n` +
      `Business Mission: "${mission}"\n` +
      `Disallowed / Guardrail Words: ${wordsToAvoid.join(', ') || 'None specified'}\n` +
      `Task Directive: "${auditPrompt}"\n\n` +
      `You MUST respond with valid, raw JSON (no markdown fences, no explanatory preambles) strictly following this JSON schema:\n` +
      `{\n` +
      `  "reputationRiskScore": <numeric score between 0.0 (safe) and 1.0 (extreme hazard), e.g. 0.04>,\n` +
      `  "threatLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n` +
      `  "impersonationAttemptsDetected": <integer count of identified or potential impersonation vectors, e.g. 0>,\n` +
      `  "activeAlerts": ["<specific security or reputation alert>", ...],\n` +
      `  "brandVoiceViolations": ["<detected brand guardrail violation>", ...],\n` +
      `  "recommendedMitigations": ["<concrete mitigation step 1>", "<concrete mitigation step 2>", ...],\n` +
      `  "reputationSummary": "<concise analytical assessment of brand integrity and exposure>"\n` +
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
      throw new Error(`[SecurityAgent] Failed to parse LLM response as JSON: ${parseErr.message}\nRaw LLM Output:\n${rawOutput}`);
    }

    const validation = SecurityAuditSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`[SecurityAgent] LLM output failed schema validation: ${validation.error.message}\nParsed object:\n${JSON.stringify(parsed, null, 2)}`);
    }

    const auditData = validation.data;
    const summary = `Security audit completed: ${auditData.impersonationAttemptsDetected} active impersonation vectors, threat level ${auditData.threatLevel} (Reputation Risk Score: ${auditData.reputationRiskScore.toFixed(2)}).`;

    return {
      summary,
      data: {
        ...auditData,
        accessAuthorized: this.canWriteDomain('security'),
        auditedBy: 'NVIDIA-NIM-Gateway',
      },
    };
  }
}
