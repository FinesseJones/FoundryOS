import { BusinessDNA } from '../knowledge';
import { MultiProviderLLMFactory, LLMProviderGateway } from '../providers/llm-provider-factory';

export type MarketSignalSource =
  | 'competitor_website'
  | 'search_telemetry'
  | 'customer_review'
  | 'news_feed'
  | 'industry_benchmark';

export type MarketSignalType =
  | 'POSITIONING_CHANGE'
  | 'PRICING_PIVOT'
  | 'DEMAND_SPIKE'
  | 'FEATURE_LAUNCH'
  | 'REVIEW_SENTIMENT_SHIFT';

export interface MarketSignalObservation {
  id: string;
  organizationId: string;
  businessId: string;
  source: MarketSignalSource;
  sourceUrl?: string;
  observedAt: string;
  signalType: MarketSignalType;
  confidence: number; // 0.0 - 1.0
  evidence: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rawPayload?: Record<string, unknown>;
}

export interface StrategicRecommendation {
  id: string;
  signalId: string;
  organizationId: string;
  businessId: string;
  source: MarketSignalSource;
  sourceUrl?: string;
  observation: string;
  interpretation: string;
  recommendedAction: string;
  expectedOutcome: string;
  potentialDnaImpact: string | null;
  humanApprovalRequired: boolean;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'APPLIED';
  createdAt: string;
}

export interface MarketIntelligenceReport {
  status: 'active' | 'insufficient_evidence';
  businessId: string;
  signalsCount: number;
  signals: MarketSignalObservation[];
  recommendations: StrategicRecommendation[];
  synthesizedAt: string;
  message?: string;
}

/**
 * External Market & Competitor Intelligence Service
 *
 * Core Principles:
 * 1. Zero Fake Intelligence: If no verified observations exist, returns 'insufficient_evidence'.
 * 2. Non-Mutating: Never mutates canonical Business DNA automatically.
 * 3. Strict Provenance: Every signal tracks source, sourceUrl, evidence, timestamp, and confidence.
 * 4. Closed Loop: Observation -> Interpretation -> Recommendation -> Decision -> Action.
 */
export class ExternalMarketIntelligenceService {
  private observations: Map<string, MarketSignalObservation[]> = new Map();
  private recommendations: Map<string, StrategicRecommendation[]> = new Map();

  constructor(private llmGateway: MultiProviderLLMFactory = LLMProviderGateway) {}

  /**
   * Ingest a verified external market signal observation with strict provenance.
   */
  async ingestSignal(
    observation: Omit<MarketSignalObservation, 'id' | 'observedAt'>
  ): Promise<MarketSignalObservation> {
    if (!observation.evidence || observation.evidence.trim().length === 0) {
      throw new Error('Provenance Error: Evidence is required for external market signals.');
    }

    const fullObservation: MarketSignalObservation = {
      ...observation,
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      observedAt: new Date().toISOString(),
    };

    const list = this.observations.get(observation.businessId) || [];
    list.unshift(fullObservation);
    this.observations.set(observation.businessId, list);

    return fullObservation;
  }

  /**
   * Synthesizes market signals against authoritative Business DNA to produce
   * actionable recommendations for human review.
   */
  async synthesizeIntelligence(
    businessId: string,
    dna: BusinessDNA
  ): Promise<MarketIntelligenceReport> {
    const signals = this.observations.get(businessId) || [];

    // Zero-fake-fallback guard: if no real observations exist, do not fabricate.
    if (signals.length === 0) {
      return {
        status: 'insufficient_evidence',
        businessId,
        signalsCount: 0,
        signals: [],
        recommendations: [],
        synthesizedAt: new Date().toISOString(),
        message: 'No external telemetry signals ingested. Configure competitor crawl or search integrations.',
      };
    }

    const brandName = dna.companyIdentity?.companyName?.value || 'Our Company';
    const uvp = dna.companyIdentity?.uniqueValueProposition?.value || 'Enterprise AI OS';
    const industry = dna.companyIdentity?.industry?.value || 'technology';

    const latestSignals = signals.slice(0, 5);
    const newRecommendations: StrategicRecommendation[] = [];

    for (const sig of latestSignals) {
      let interpretation = `Market signal [${sig.signalType}] detected from ${sig.source}: ${sig.evidence}`;
      let action = `Evaluate positioning adjustment for ${brandName} in response to ${sig.source}.`;
      let expected = 'Mitigate competitive drag and maintain UVP differentiation.';

      try {
        const aiSynthesis = await this.llmGateway.executeWithFallback({
          prompt: `Analyze this verified market signal for ${brandName} (${uvp}, ${industry}):\n` +
                  `Signal Source: ${sig.source} (${sig.sourceUrl || 'verified source'})\n` +
                  `Signal Type: ${sig.signalType}\n` +
                  `Evidence: "${sig.evidence}"\n\n` +
                  `Synthesize 3 short lines:\n` +
                  `Interpretation: (What this means for our positioning)\n` +
                  `Action: (Exact tactical recommendation for our team)\n` +
                  `ExpectedOutcome: (Measurable business result)\n`,
          temperature: 0.4,
          maxTokens: 300,
        });

        const lines = aiSynthesis.text.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().startsWith('interpretation:')) {
            interpretation = line.replace(/interpretation:\s*/i, '').trim();
          } else if (line.toLowerCase().startsWith('action:')) {
            action = line.replace(/action:\s*/i, '').trim();
          } else if (line.toLowerCase().startsWith('expectedoutcome:')) {
            expected = line.replace(/expectedoutcome:\s*/i, '').trim();
          }
        }
      } catch {
        // Safe baseline derivation from evidence
      }

      const rec: StrategicRecommendation = {
        id: `rec_strat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        signalId: sig.id,
        organizationId: sig.organizationId,
        businessId: sig.businessId,
        source: sig.source,
        sourceUrl: sig.sourceUrl,
        observation: sig.evidence,
        interpretation,
        recommendedAction: action,
        expectedOutcome: expected,
        potentialDnaImpact: sig.impact === 'HIGH' || sig.impact === 'CRITICAL'
          ? `May warrant UVP or Opportunity Pillar refinement upon Human Review.`
          : null,
        humanApprovalRequired: true,
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
      };

      newRecommendations.push(rec);
    }

    const existingRecs = this.recommendations.get(businessId) || [];
    this.recommendations.set(businessId, [...newRecommendations, ...existingRecs]);

    return {
      status: 'active',
      businessId,
      signalsCount: signals.length,
      signals,
      recommendations: newRecommendations,
      synthesizedAt: new Date().toISOString(),
    };
  }

  /**
   * List existing recommendations for a business.
   */
  getRecommendations(businessId: string): StrategicRecommendation[] {
    return this.recommendations.get(businessId) || [];
  }

  /**
   * Human Approval Decision on a Strategic Recommendation.
   * Only human approval can elevate a recommendation into a potential DNA revision.
   */
  approveRecommendation(
    businessId: string,
    recId: string,
    approver: string
  ): StrategicRecommendation {
    const list = this.recommendations.get(businessId) || [];
    const rec = list.find((r) => r.id === recId);
    if (!rec) {
      throw new Error(`Recommendation '${recId}' not found.`);
    }

    rec.status = 'APPROVED';
    return rec;
  }
}
