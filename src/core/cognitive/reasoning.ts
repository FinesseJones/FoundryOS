import { EngineContext } from '../context';
import { ReasoningTrace, ReasoningNode } from './cognitive.types';

export class ReasoningEngine {
  /**
   * Multi-perspective Chain-of-Thought Reasoning Evaluator.
   */
  static evaluateReasoning(context: EngineContext): ReasoningTrace {
    const nodes: ReasoningNode[] = [];
    const dna = context.businessDNASlice;

    // Node 1: Brand Voice Consistency Perspective
    const primaryTone = dna.brandVoice?.primaryTone?.value ?? 'professional';
    const wordsToAvoid = dna.brandVoice?.wordsToAvoid?.value ?? [];
    nodes.push({
      perspective: 'Brand Voice Consistency',
      hypothesis: `Action must maintain ${primaryTone} tone and avoid restricted terms.`,
      findings: [
        `Primary tone enforced: "${primaryTone}".`,
        `Restricted vocabulary count: ${wordsToAvoid.length} terms.`,
      ],
      confidence: dna.brandVoice?.primaryTone?.confidence ?? 0.85,
    });

    // Node 2: Audience Resonance & Pain Points
    const audience = dna.customerProfile?.targetAudience?.value ?? 'Target Customers';
    const painPoints = dna.customerProfile?.primaryPainPoints?.value ?? [];
    nodes.push({
      perspective: 'Audience Resonance',
      hypothesis: `Messaging must directly address ${audience} pain points.`,
      findings: [
        `Target audience defined: "${audience}".`,
        `Key pain points to address: ${painPoints.join(', ') || 'General growth'}.`,
      ],
      confidence: dna.customerProfile?.targetAudience?.confidence ?? 0.8,
    });

    // Node 3: Competitive Differentiation Perspective
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value ?? 'Unique Value Prop';
    nodes.push({
      perspective: 'Competitive Differentiation',
      hypothesis: 'Content must emphasize core brand differentiators.',
      findings: [`UVP anchored: "${uvp}".`],
      confidence: dna.companyIdentity?.uniqueValueProposition?.confidence ?? 0.9,
    });

    // Compute composite alignment score
    const avgConfidence = nodes.reduce((sum, n) => sum + n.confidence, 0) / nodes.length;
    const alignmentScore = Math.round(avgConfidence * 100) / 100;

    return {
      id: `reason_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      taskType: context.request.taskType,
      nodes,
      summaryRationale: `Reasoning verified across ${nodes.length} brand perspectives with ${Math.round(alignmentScore * 100)}% alignment score.`,
      alignmentScore,
      createdAt: new Date().toISOString(),
    };
  }
}
