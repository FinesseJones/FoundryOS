/**
 * Industry Classifier
 *
 * Real-world website → industry classification layer.
 *
 * Replaces the inlined keyword-only classifier in extraction-pipeline.ts.
 * Uses BOTH cleaned body text (not just title/h1/h2) AND structured signals
 * (meta keywords, JSON-LD @type) to score each candidate industry. Returns
 * the highest-scoring industry along with a confidence score and the
 * evidence terms that drove the classification.
 *
 * Why a separate module:
 * - The original logic only looked at title + meta + h1 + h2. Most vertical
 *   keywords (HVAC, restaurant, healthcare, etc.) live in body copy and were
 *   systematically missed — every site was being labeled software_technology.
 * - Vertical coverage was 5 industries. The classifier now handles 14+
 *   verticals with weighted term lists and structured-data hints.
 * - Returns a confidence score so downstream consumers (Business DNA,
 *   competitor discovery) can fall back to LLM-based classification for
 *   low-confidence cases.
 */

export type Industry =
  | 'hvac_building_services'
  | 'restaurant_food_services'
  | 'devops_cloud_observability'
  | 'financial_services'
  | 'ecommerce'
  | 'healthcare_medical'
  | 'legal_services'
  | 'real_estate'
  | 'education'
  | 'professional_services'
  | 'manufacturing'
  | 'marketing_creative'
  | 'media_entertainment'
  | 'nonprofit'
  | 'software_technology';

export interface IndustryClassification {
  industry: Industry;
  confidence: number; // 0.0 - 1.0
  evidenceTerms: string[]; // terms that pushed the score
  source: 'json_ld' | 'meta_keyword' | 'body_text' | 'fallback';
  alternativeCandidates: { industry: Industry; score: number }[]; // top 3
}

export interface ClassificationInput {
  /** Cleaned body text from the primary page (full document text, not just headings) */
  bodyText: string;
  /** Title, meta description, h1, h2 — used as a high-signal first pass */
  headings: string;
  /** Meta keywords tag if present */
  metaKeywords: string[];
  /** JSON-LD @type values (e.g. "Restaurant", "LocalBusiness") */
  jsonLdTypes: string[];
  /** Optional URL host for domain-based hints (e.g. .gov, .edu) */
  host?: string;
}

interface VerticalRule {
  industry: Industry;
  /** High-signal terms (worth 2 points each) */
  primary: string[];
  /** Supporting terms (worth 1 point each) */
  secondary: string[];
  /** JSON-LD @type values that pin this industry directly (worth 5 points) */
  jsonLdTypes?: string[];
}

const VERTICAL_RULES: VerticalRule[] = [
  {
    industry: 'hvac_building_services',
    primary: ['hvac', 'heating', 'air conditioning', 'cooling', 'furnace', 'heat pump', 'climate control', 'ac repair', 'heating and cooling'],
    secondary: ['ventilation', 'plumbing', 'ductwork', 'thermostat', 'air quality', 'indoor comfort', 'energy efficiency', 'hvac contractor', 'hvac service'],
    jsonLdTypes: ['HVACBusiness'],
  },
  {
    industry: 'restaurant_food_services',
    primary: ['restaurant', 'menu', 'dining', 'catering', 'kitchen', 'chef', 'fast casual', 'farm to table', 'food truck'],
    secondary: ['salad', 'organic', 'fresh ingredients', 'takeout', 'delivery', 'reservations', 'beverages', 'wine list', 'breakfast', 'lunch', 'dinner'],
    jsonLdTypes: ['Restaurant', 'FoodService', 'CafeOrCoffeeShop', 'Bakery', 'BarOrPub'],
  },
  {
    industry: 'devops_cloud_observability',
    primary: ['observability', 'monitoring', 'apm', 'telemetry', 'sre', 'devops', 'logs and metrics', 'distributed tracing', 'infrastructure monitoring'],
    secondary: ['kubernetes', 'docker', 'cloud native', 'incident response', 'alerting', 'uptime', 'log management', 'kpis', 'service mesh'],
    jsonLdTypes: ['SoftwareApplication', 'SaaSApplication'],
  },
  {
    industry: 'financial_services',
    primary: ['fintech', 'banking', 'payment processing', 'merchant account', 'chargeback', 'lending', 'wealth management', 'investment platform'],
    secondary: ['payment gateway', 'billing', 'invoicing', 'credit', 'debit', 'compliance', 'kyc', 'pci', 'financial planning', 'insurance'],
    jsonLdTypes: ['FinancialService', 'BankOrSavings', 'InsuranceAgency', 'FinancialProduct'],
  },
  {
    industry: 'ecommerce',
    primary: ['online store', 'shopping cart', 'add to cart', 'checkout', 'product catalog', 'free shipping', 'order tracking'],
    secondary: ['merchandise', 'retail', 'apparel', 'shop now', 'best sellers', 'wishlist', 'product reviews', 'sku'],
    jsonLdTypes: ['Product', 'Offer', 'ItemPage'],
  },
  {
    industry: 'healthcare_medical',
    primary: ['patient care', 'medical practice', 'clinic', 'hospital', 'physician', 'primary care', 'specialist', 'telehealth'],
    secondary: ['appointment', 'diagnosis', 'treatment', 'symptoms', 'prescription', 'medical records', 'ehr', 'health insurance', 'wellness', 'pediatric'],
    jsonLdTypes: ['MedicalClinic', 'Hospital', 'Physician', 'MedicalOrganization', 'Pharmacy'],
  },
  {
    industry: 'legal_services',
    primary: ['law firm', 'attorney', 'lawyer', 'legal counsel', 'litigation', 'legal advice', 'law practice'],
    secondary: ['divorce', 'personal injury', 'estate planning', 'corporate law', 'immigration', 'criminal defense', 'free consultation', 'case evaluation'],
    jsonLdTypes: ['LegalService', 'Attorney', 'LawFirm'],
  },
  {
    industry: 'real_estate',
    primary: ['real estate', 'realtor', 'real estate agent', 'mls', 'listings', 'homes for sale', 'property management'],
    secondary: ['bedrooms', 'bathrooms', 'square feet', 'open house', 'mortgage', 'rental', 'condo', 'townhouse', 'luxury homes'],
    jsonLdTypes: ['RealEstateAgent', 'LodgingBusiness', 'Residence', 'Apartment', 'SingleFamilyResidence'],
  },
  {
    industry: 'education',
    primary: ['university', 'college', 'school', 'academy', 'k-12', 'higher education', 'degree program', 'enrollment'],
    secondary: ['courses', 'curriculum', 'tuition', 'scholarships', 'campus', 'students', 'faculty', 'online learning', 'mooc'],
    jsonLdTypes: ['EducationalOrganization', 'CollegeOrUniversity', 'School', 'Course'],
  },
  {
    industry: 'professional_services',
    primary: ['consulting firm', 'consulting services', 'advisory', 'professional services', 'management consulting'],
    secondary: ['strategy', 'transformation', 'operations consulting', 'cfo services', 'fractional', 'engagement', 'retainer'],
    jsonLdTypes: ['ProfessionalService'],
  },
  {
    industry: 'manufacturing',
    primary: ['manufacturer', 'manufacturing', 'factory', 'industrial', 'oem', 'production line', 'fabrication'],
    secondary: ['cnc', 'machining', 'assembly', 'quality control', 'iso certified', 'supply chain', 'wholesale', 'b2b'],
    jsonLdTypes: ['Manufacturer'],
  },
  {
    industry: 'marketing_creative',
    primary: ['marketing agency', 'creative agency', 'digital marketing', 'branding agency', 'advertising agency'],
    secondary: ['social media marketing', 'seo', 'ppc', 'content marketing', 'brand strategy', 'campaign', 'portfolio', 'case studies'],
    jsonLdTypes: ['AdvertisingAgency'],
  },
  {
    industry: 'media_entertainment',
    primary: ['streaming', 'production company', 'film studio', 'media company', 'entertainment', 'music label', 'podcast network'],
    secondary: ['episodes', 'subscribe', 'original series', 'talent', 'premiere', 'box office', 'merch'],
    jsonLdTypes: ['Movie', 'TVSeries', 'MusicGroup', 'RadioStation', 'PodcastSeries'],
  },
  {
    industry: 'nonprofit',
    primary: ['nonprofit', 'non-profit', 'charity', 'foundation', 'donate', 'mission-driven', '501c3'],
    secondary: ['community impact', 'volunteer', 'grants', 'advocacy', 'awareness campaign', 'endowment'],
    jsonLdTypes: ['NGO', 'NonprofitOrganization'],
  },
];

const STOP_TERMS = new Set([
  'with', 'from', 'your', 'that', 'this', 'have', 'more', 'about', 'page', 'home',
  'business', 'company', 'service', 'services', 'team', 'contact', 'work', 'help',
  'best', 'top', 'leading', 'trusted', 'quality', 'professional', 'experts',
]);

export class IndustryClassifier {
  private rules = VERTICAL_RULES;

  classify(input: ClassificationInput): IndustryClassification {
    // 1. JSON-LD @type pinning (highest confidence)
    const jsonLdHits = this.scoreByJsonLd(input.jsonLdTypes);
    if (jsonLdHits.length > 0 && jsonLdHits[0].score >= 5) {
      const winner = jsonLdHits[0];
      return {
        industry: winner.industry,
        confidence: Math.min(0.97, 0.75 + winner.score * 0.03),
        evidenceTerms: [`JSON-LD @type includes "${input.jsonLdTypes.find((t) => winner.jsonLdTypes?.includes(t))}"`],
        source: 'json_ld',
        alternativeCandidates: jsonLdHits.slice(0, 3).map((h) => ({ industry: h.industry, score: h.score })),
      };
    }

    // 2. Headings pass (high-signal, narrow text)
    const headingScores = this.scoreText(input.headings.toLowerCase(), 2, 1);

    // 3. Body text pass (broad, primary signal)
    const bodyScores = this.scoreText(input.bodyText.toLowerCase(), 2, 1);

    // 4. Meta keywords pass (if present)
    const metaScores = this.scoreText(input.metaKeywords.join(' ').toLowerCase(), 1.5, 0.5);

    // 5. Domain hints (very low signal, used as a tiebreaker)
    const hostBoost = this.hostBoost(input.host);

    // Aggregate
    const aggregate = new Map<Industry, number>();
    const evidence = new Map<Industry, string[]>();

    const addScores = (scores: { industry: Industry; score: number; terms: string[] }[], weight: number) => {
      for (const s of scores) {
        aggregate.set(s.industry, (aggregate.get(s.industry) || 0) + s.score * weight);
        if (s.terms.length > 0) {
          const list = evidence.get(s.industry) || [];
          list.push(...s.terms);
          evidence.set(s.industry, list);
        }
      }
    };

    addScores(headingScores, 1.5); // headings weighted higher than body
    addScores(bodyScores, 1.0);
    addScores(metaScores, 1.2);
    if (hostBoost) {
      aggregate.set(hostBoost.industry, (aggregate.get(hostBoost.industry) || 0) + hostBoost.score);
    }

    // Rank
    const ranked = Array.from(aggregate.entries())
      .map(([industry, score]) => ({ industry, score }))
      .sort((a, b) => b.score - a.score);

    if (ranked.length === 0 || ranked[0].score < 1.5) {
      return {
        industry: 'software_technology',
        confidence: 0.5,
        evidenceTerms: [],
        source: 'fallback',
        alternativeCandidates: ranked.slice(0, 3),
      };
    }

    const winner = ranked[0];
    const runnerUp = ranked[1]?.score || 0;
    // Confidence: based on absolute winner score + margin over runner-up
    const margin = winner.score - runnerUp;
    const confidence = Math.min(0.98, 0.45 + winner.score * 0.08 + margin * 0.05);

    return {
      industry: winner.industry,
      confidence,
      evidenceTerms: Array.from(new Set(evidence.get(winner.industry) || [])).slice(0, 8),
      source: this.determineSource(headingScores, bodyScores, metaScores, winner.industry),
      alternativeCandidates: ranked.slice(0, 3).map((r) => ({ industry: r.industry, score: r.score })),
    };
  }

  private scoreByJsonLd(types: string[]): { industry: Industry; score: number; jsonLdTypes?: string[] }[] {
    const hits = new Map<Industry, { score: number; types: string[] }>();
    const lower = types.map((t) => t.toLowerCase());
    for (const rule of this.rules) {
      for (const t of rule.jsonLdTypes || []) {
        if (lower.includes(t.toLowerCase())) {
          const existing = hits.get(rule.industry) || { score: 0, types: [] };
          existing.score += 5;
          existing.types.push(t);
          hits.set(rule.industry, existing);
        }
      }
    }
    return Array.from(hits.entries())
      .map(([industry, v]) => ({ industry, score: v.score, jsonLdTypes: v.types }))
      .sort((a, b) => b.score - a.score);
  }

  private scoreText(
    text: string,
    primaryWeight: number,
    secondaryWeight: number
  ): { industry: Industry; score: number; terms: string[] }[] {
    if (!text || text.length === 0) return [];
    const scores = new Map<Industry, { score: number; terms: string[] }>();
    for (const rule of this.rules) {
      let score = 0;
      const terms: string[] = [];
      for (const term of rule.primary) {
        const matches = this.countOccurrences(text, term);
        if (matches > 0) {
          score += matches * primaryWeight;
          terms.push(term);
        }
      }
      for (const term of rule.secondary) {
        const matches = this.countOccurrences(text, term);
        if (matches > 0) {
          score += matches * secondaryWeight;
          if (!terms.includes(term)) terms.push(term);
        }
      }
      if (score > 0) {
        scores.set(rule.industry, { score, terms });
      }
    }
    return Array.from(scores.entries())
      .map(([industry, v]) => ({ industry, score: v.score, terms: v.terms }))
      .sort((a, b) => b.score - a.score);
  }

  private countOccurrences(text: string, term: string): number {
    // Use word boundary matching for short terms, substring for multi-word phrases
    if (term.includes(' ')) {
      let count = 0;
      let idx = 0;
      while ((idx = text.indexOf(term, idx)) !== -1) {
        count++;
        idx += term.length;
      }
      return count;
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'g');
    return (text.match(re) || []).length;
  }

  private hostBoost(host: string | undefined): { industry: Industry; score: number } | null {
    if (!host) return null;
    const lower = host.toLowerCase();
    if (lower.endsWith('.gov')) return { industry: 'nonprofit', score: 1.0 };
    if (lower.endsWith('.edu')) return { industry: 'education', score: 2.0 };
    if (lower.endsWith('.org')) return { industry: 'nonprofit', score: 1.5 };
    return null;
  }

  private determineSource(
    headingScores: { industry: Industry; score: number }[],
    bodyScores: { industry: Industry; score: number }[],
    metaScores: { industry: Industry; score: number }[],
    winner: Industry
  ): 'json_ld' | 'meta_keyword' | 'body_text' | 'fallback' {
    if (metaScores[0]?.industry === winner) return 'meta_keyword';
    if (headingScores[0]?.industry === winner) return 'body_text';
    return 'body_text';
  }
}
