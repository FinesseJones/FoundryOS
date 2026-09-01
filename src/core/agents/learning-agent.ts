import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export const LearningAdaptationSchema = z.object({
  memoriesAnalyzed: z.number().int().min(0),
  winningPatterns: z.array(z.string()).default([]),
  underperformingTropes: z.array(z.string()).default([]),
  proposedVocabularyAdditions: z.array(z.string()).default([]),
  proposedVocabularyRetirements: z.array(z.string()).default([]),
  voiceEvolutionRecommendation: z.string().min(1),
  confidenceScore: z.number().min(0).max(1),
});

export type LearningAdaptationResult = z.infer<typeof LearningAdaptationSchema>;

export class LearningAgent extends BaseAgent {
  readonly role: AgentRole = 'learning';
  readonly name = 'Learning & Adaptation Agent';
  readonly description = 'Continuously analyzes all interactions across Business DNA and memory to extract winning patterns and propose voice evolutionary updates.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['*'], // Comprehensive access across all domains for continuous learning
    writableDomains: ['learning', 'analytics', 'recommendations', 'confidence_score'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const dna = context.businessDNASlice;
    const companyName = dna.companyIdentity?.companyName?.value || 'Enterprise Brand';
    const industry = dna.companyIdentity?.industry?.value || 'commercial_services';
    const primaryTone = dna.brandVoice?.primaryTone?.value || 'authoritative';
    const wordsToUse = dna.brandVoice?.wordsToUse?.value || [];
    const wordsToAvoid = dna.brandVoice?.wordsToAvoid?.value || [];
    const memoriesCount = context.memories?.length || 0;
    const userPrompt = request.prompt || 'Extract high-converting patterns and propose brand voice refinements from institutional memory.';

    const systemRole = `Specialized Role: Principal Machine Learning Strategist & Institutional Memory Optimization Lead.`;
    const prompt =
      `Perform an exhaustive pattern-extraction and adaptive learning synthesis for ${companyName}.\n` +
      `Industry: ${industry}\n` +
      `Current Brand Voice: ${primaryTone}\n` +
      `Approved Vocabulary: ${wordsToUse.join(', ') || 'None'}\n` +
      `Avoided Vocabulary: ${wordsToAvoid.join(', ') || 'None'}\n` +
      `Total Institutional Memory Records: ${memoriesCount}\n` +
      `Task Directive: "${userPrompt}"\n\n` +
      `You MUST respond with valid, raw JSON (no markdown fences, no explanatory preambles) strictly following this JSON schema:\n` +
      `{\n` +
      `  "memoriesAnalyzed": ${memoriesCount},\n` +
      `  "winningPatterns": ["<specific high-converting pattern 1>", "<specific high-converting pattern 2>", ...],\n` +
      `  "underperformingTropes": ["<low-converting trope or phrase to phase out>", ...],\n` +
      `  "proposedVocabularyAdditions": ["<strategic industry term to add to vocabulary>", ...],\n` +
      `  "proposedVocabularyRetirements": ["<fatigued or off-brand term to retire>", ...],\n` +
      `  "voiceEvolutionRecommendation": "<concrete strategic guideline on how to evolve brand voice>",\n` +
      `  "confidenceScore": <numeric confidence between 0.0 and 1.0, e.g. 0.93>\n` +
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
      throw new Error(`[LearningAgent] Failed to parse LLM response as JSON: ${parseErr.message}\nRaw LLM Output:\n${rawOutput}`);
    }

    const validation = LearningAdaptationSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`[LearningAgent] LLM output failed schema validation: ${validation.error.message}\nParsed object:\n${JSON.stringify(parsed, null, 2)}`);
    }

    const learningData = validation.data;
    const summary = `Learning audit complete: Analyzed ${learningData.memoriesAnalyzed} memory items. Identified ${learningData.winningPatterns.length} winning patterns (Confidence: ${(learningData.confidenceScore * 100).toFixed(0)}%).`;

    return {
      summary,
      data: {
        ...learningData,
        proposedUpdatesCount: learningData.winningPatterns.length,
        accessAuthorized: this.canWriteDomain('learning'),
        auditedBy: 'NVIDIA-NIM-Gateway',
      },
    };
  }
}
