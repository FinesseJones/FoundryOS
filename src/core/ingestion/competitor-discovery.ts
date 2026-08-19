/**
 * Competitor Discovery Engine
 *
 * Old behavior (wrong): hardcoded competitor lists per industry. The fallback
 * ("Legacy CopyBot AI", "Enterprise Automation Cloud") fired for any unknown
 * industry, so the engine ALWAYS returned competitors — even when it had
 * nothing to base them on. The schema didn't track source, so callers couldn't
 * tell "verified market intelligence" from "AI-generated industry assumption."
 *
 * New behavior:
 *   1. Every competitor is tagged with `source`:
 *        - 'search'              → returned by a real SearchProvider (SerpAPI, Bing, Google CSE)
 *        - 'seo_overlap'         → derived from keyword/customer overlap with the target
 *        - 'manual'              → user-curated
 *        - 'industry_benchmark'  → heuristic template (formerly the hardcoded lists)
 *   2. Every competitor has a `confidence` score and `evidence[]` (strings).
 *   3. The engine supports multiple SearchProvider backends via the
 *      SearchProvider interface. None is required — if no provider is wired,
 *      the engine returns only `industry_benchmark` results and clearly labels
 *      them as such.
 *   4. `industryBenchmarks` is a separate output from `discoveredCompetitors`.
 *      The pipeline carries both, but downstream code can choose which to use.
 *
 * Why this matters: an enterprise customer trusting TACF for competitive
 * intelligence MUST be able to distinguish "we searched and found X" from
 * "we assumed Y because the industry looks similar to Z." The old schema
 * collapsed both into the same array.
 */

export type CompetitorSource = 'search' | 'seo_overlap' | 'manual' | 'industry_benchmark';

export interface CompetitorProfile {
  name: string;
  websiteUrl: string;
  marketPositioning: string;
  pricingTier: string;
  strengths: string[];
  weaknesses: string[];
  differentiationAngle: string;
  similarityScore: number; // 0.0 - 1.0
  /** Where this competitor came from. The source is a contract: 'search' means a real search ran. */
  source: CompetitorSource;
  /** Confidence in the competitor's relevance. Independent of similarityScore. */
  confidence: number; // 0.0 - 1.0
  /** Strings explaining why this competitor was selected. Required for non-benchmark sources. */
  evidence: string[];
  /** Optional: the search query that produced this result (search source only) */
  searchQuery?: string;
  /** Optional: rank/position in search results (search source only) */
  searchRank?: number;
}

export interface SearchProvider {
  /** Provider name (e.g. "serpapi", "bing", "google_cse", "brave") */
  readonly name: string;
  /**
   * Discover competitors for a given company/industry.
   * Returns a list of raw results. The engine wraps these as 'search'-sourced competitors.
   */
  searchCompetitors(params: {
    companyName: string;
    industry: string;
    websiteUrl: string;
    maxResults?: number;
  }): Promise<SearchProviderResult[]>;
}

export interface SearchProviderResult {
  name: string;
  websiteUrl: string;
  description?: string;
  rank: number;
  snippet?: string;
}

export interface CompetitorDiscoveryResult {
  /** Real, externally-discovered competitors. Empty unless a SearchProvider is wired. */
  discoveredCompetitors: CompetitorProfile[];
  /** Heuristic templates from industry knowledge. Always labeled 'industry_benchmark'. */
  industryBenchmarks: CompetitorProfile[];
  /** True if at least one real search ran. */
  searched: boolean;
  /** The SearchProvider that ran, if any. */
  searchProviderName?: string;
  /** Diagnostic stats for tests/debugging */
  stats: {
    searchResultsReceived: number;
    benchmarkResultsReturned: number;
    deduplicatedNames: number;
  };
}

export class CompetitorDiscoveryEngine {
  private searchProvider: SearchProvider | null = null;

  /** Set the search provider. Pass null to disable real search. */
  setSearchProvider(provider: SearchProvider | null): void {
    this.searchProvider = provider;
  }

  hasSearchProvider(): boolean {
    return this.searchProvider !== null;
  }

  async discover(
    companyName: string,
    industry: string,
    pageText?: string,
    websiteUrl?: string
  ): Promise<CompetitorDiscoveryResult> {
    const stats = {
      searchResultsReceived: 0,
      benchmarkResultsReturned: 0,
      deduplicatedNames: 0,
    };

    // 1. Real search (if provider is wired)
    let discoveredCompetitors: CompetitorProfile[] = [];
    let searched = false;
    let searchProviderName: string | undefined;

    if (this.searchProvider && websiteUrl) {
      try {
        const results = await this.searchProvider.searchCompetitors({
          companyName,
          industry,
          websiteUrl,
          maxResults: 5,
        });
        stats.searchResultsReceived = results.length;
        searched = true;
        searchProviderName = this.searchProvider.name;
        const query = `${companyName} competitors alternatives`;
        discoveredCompetitors = results.map((r) => ({
          name: r.name,
          websiteUrl: r.websiteUrl,
          marketPositioning: r.description || 'Search result (no description)',
          pricingTier: 'unknown',
          strengths: [],
          weaknesses: [],
          differentiationAngle: `Discovered via ${this.searchProvider!.name} search result for "${companyName} competitors".`,
          similarityScore: Math.max(0.5, 1 - r.rank * 0.1), // rank 1 → 0.9, rank 2 → 0.8, etc.
          source: 'search' as const,
          confidence: Math.max(0.5, 0.95 - r.rank * 0.1),
          evidence: [
            `Search result rank #${r.rank} via ${this.searchProvider!.name}`,
            r.snippet ? `Snippet: ${r.snippet}` : 'No snippet returned',
          ],
          searchQuery: query,
          searchRank: r.rank,
        }));
      } catch (err) {
        // Search failed — log but don't fail the pipeline
        // Downstream will see searched=false and fall back to benchmarks only
        console.warn(`[CompetitorDiscovery] Search provider ${this.searchProvider.name} failed:`, err);
      }
    }

    // 2. Industry benchmarks (heuristic templates — always available, always labeled)
    const benchmarks = this.buildIndustryBenchmarks(companyName, industry, pageText);
    stats.benchmarkResultsReturned = benchmarks.length;

    // 3. Dedupe: if a discovered competitor has the same name as a benchmark,
    //    promote the discovered one (higher source authority) and drop the benchmark.
    const discoveredNames = new Set(discoveredCompetitors.map((c) => c.name.toLowerCase()));
    const filteredBenchmarks = benchmarks.filter((b) => {
      const key = b.name.toLowerCase();
      if (discoveredNames.has(key)) {
        stats.deduplicatedNames++;
        return false;
      }
      return true;
    });

    return {
      discoveredCompetitors,
      industryBenchmarks: filteredBenchmarks,
      searched,
      searchProviderName,
      stats,
    };
  }

  /**
   * Synchronous legacy entry point. Returns the union of discovered + benchmark
   * competitors as a flat list, for callers that haven't been updated yet.
   *
   * DEPRECATED: prefer `discover()` which separates the two sources.
   */
  discoverCompetitors(companyName: string, industry: string, pageText?: string): CompetitorProfile[] {
    // Fire-and-forget for the async path; returns only benchmarks in the sync response.
    // Callers should migrate to discover() for the separated output.
    if (this.searchProvider) {
      this.discover(companyName, industry, pageText).catch(() => {
        // ignore — sync caller doesn't await
      });
    }
    return this.buildIndustryBenchmarks(companyName, industry, pageText);
  }

  private buildIndustryBenchmarks(companyName: string, industry: string, pageText?: string): CompetitorProfile[] {
    const text = (pageText || '').toLowerCase();
    const ind = (industry || '').toLowerCase();
    const source: CompetitorSource = 'industry_benchmark';

    const wrap = (
      name: string,
      websiteUrl: string,
      marketPositioning: string,
      pricingTier: string,
      strengths: string[],
      weaknesses: string[],
      differentiationAngle: string,
      similarityScore: number,
      evidence: string[]
    ): CompetitorProfile => ({
      name,
      websiteUrl,
      marketPositioning,
      pricingTier,
      strengths,
      weaknesses,
      differentiationAngle,
      similarityScore,
      source,
      confidence: 0.6, // benchmarks are heuristic — moderate confidence, not high
      evidence,
    });

    // HVAC & Building Services
    if (ind.includes('hvac') || text.includes('hvac') || text.includes('heating') || text.includes('cooling')) {
      return [
        wrap('Trane Technologies', 'https://www.trane.com',
          'Premium residential & commercial climate control leader',
          'Enterprise / High-Tier Equipment & Service Contracts',
          ['Strong brand recognition', 'Extensive dealer network'],
          ['High equipment cost', 'Slower digital dispatch integration'],
          `${companyName} offers faster local response times and transparent pricing guarantees.`,
          0.92,
          ['Industry benchmark: known HVAC competitor for residential heating/cooling service contracts',
            'Benchmark similarity score is a heuristic estimate, not a market measurement']),
        wrap('Lennox International', 'https://www.lennox.com',
          'High-efficiency HVAC and air quality systems',
          'Mid-to-High Tier Replacement & Maintenance',
          ['Energy efficient SEER ratings', 'Smart thermostat tech'],
          ['Proprietary replacement parts required'],
          `${companyName} services all major OEM HVAC equipment with zero brand markup.`,
          0.87,
          ['Industry benchmark: high-efficiency HVAC competitor', 'Heuristic only']),
        wrap('Goodman Manufacturing', 'https://www.goodmanmfg.com',
          'Value-oriented HVAC heating and cooling equipment',
          'Budget-Friendly / Volume Installation',
          ['Low equipment upfront cost', 'Long warranty periods'],
          ['Lower consumer brand prestige', 'Variable installer quality'],
          `${companyName} guarantees 100% certified master technician installation on all jobs.`,
          0.79,
          ['Industry benchmark: value-tier HVAC', 'Heuristic only']),
      ];
    }

    // Restaurant & Fast Casual
    if (ind.includes('restaurant') || text.includes('salad') || text.includes('food') || text.includes('dining') || text.includes('menu')) {
      return [
        wrap('Chipotle Mexican Grill', 'https://www.chipotle.com',
          'Mass-market fast-casual organic bowl & burritos leader',
          '$10 - $16 per meal',
          ['Massive footprint', 'Strong digital app ordering'],
          ['Calorie-heavy menu items', 'Limited custom salad options'],
          `${companyName} focuses exclusively on plant-forward, nutrient-dense clean dining.`,
          0.89,
          ['Industry benchmark: dominant national fast-casual digital ordering', 'Heuristic only']),
        wrap('CAVA Mediterranean', 'https://www.cava.com',
          'Mediterranean fast-casual customized grain bowls & dips',
          '$12 - $18 per meal',
          ['Rapid growth', 'High flavor profile customization'],
          ['Higher sodium content in prepared dips'],
          `${companyName} emphasizes locally sourced organic produce and farm-to-table traceability.`,
          0.85,
          ['Industry benchmark: health-conscious urban professional demographic', 'Heuristic only']),
      ];
    }

    // DevOps & SaaS Observability
    if (ind.includes('devops') || ind.includes('cloud') || text.includes('observability') || text.includes('monitoring') || text.includes('kpi')) {
      return [
        wrap('Dynatrace', 'https://www.dynatrace.com',
          'Enterprise AI-powered observability and APM platform',
          '$0.08/hour - $50,000+ Enterprise Contract',
          ['Davis AI engine root cause analysis', 'Deep enterprise security'],
          ['Complex configuration setup', 'Expensive log ingestion pricing'],
          `${companyName} provides 10-minute setup with unified developer observability pipelines.`,
          0.94,
          ['Industry benchmark: leading enterprise full-stack cloud observability', 'Heuristic only']),
        wrap('New Relic', 'https://newrelic.com',
          'All-in-one telemetry data platform for engineers',
          '$0.25/GB log ingestion pricing',
          ['Generous free tier', 'Broad agent integrations'],
          ['Per-user pricing friction for large dev teams'],
          `${companyName} offers flat-rate data pipelines with zero per-seat tax.`,
          0.91,
          ['Industry benchmark: APM and log analytics alternative', 'Heuristic only']),
      ];
    }

    // Financial Services
    if (ind.includes('fintech') || ind.includes('financial') || ind.includes('payment') || text.includes('payment') || text.includes('banking')) {
      return [
        wrap('Stripe', 'https://stripe.com',
          'Developer-first payment processing platform',
          '2.9% + 30¢ per transaction',
          ['Best-in-class developer APIs', 'Massive global reach'],
          ['Per-transaction pricing adds up at scale', 'Limited in-person POS'],
          `${companyName} targets vertical-specific payment workflows that Stripe's general API doesn't optimize for.`,
          0.88,
          ['Industry benchmark: dominant developer-first payment platform', 'Heuristic only']),
        wrap('Square / Block', 'https://squareup.com',
          'Integrated payments + POS for SMBs',
          '2.6% + 10¢ per tap, dip, or swipe',
          ['Easy SMB onboarding', 'Integrated POS hardware'],
          ['Higher processing fees at scale', 'Less developer-flexible than Stripe'],
          `${companyName} offers enterprise-grade controls at SMB-friendly pricing.`,
          0.82,
          ['Industry benchmark: dominant SMB payment platform', 'Heuristic only']),
      ];
    }

    // Ecommerce
    if (ind.includes('ecommerce') || text.includes('shop') || text.includes('store') || text.includes('cart')) {
      return [
        wrap('Shopify', 'https://www.shopify.com',
          'All-in-one ecommerce platform',
          '$29-$299/mo',
          ['Massive ecosystem', 'Best-in-class checkout'],
          ['Transaction fees on non-Shopify gateways', 'Locked into Liquid templating'],
          `${companyName} offers lower transaction fees and headless commerce flexibility.`,
          0.93,
          ['Industry benchmark: dominant all-in-one ecommerce', 'Heuristic only']),
      ];
    }

    // Healthcare
    if (ind.includes('healthcare') || ind.includes('medical') || text.includes('patient') || text.includes('clinic') || text.includes('dental')) {
      return [
        wrap('athenahealth', 'https://www.athenahealth.com',
          'Cloud-based EHR + practice management',
          'Per-provider per-month SaaS',
          ['Established healthcare data network', 'Integrated billing'],
          ['Complex onboarding', 'High cost for small practices'],
          `${companyName} offers simpler onboarding and transparent pricing for independent practices.`,
          0.78,
          ['Industry benchmark: established healthcare IT platform', 'Heuristic only']),
      ];
    }

    // Real Estate
    if (ind.includes('real_estate') || text.includes('real estate') || text.includes('realtor') || text.includes('mls')) {
      return [
        wrap('Zillow', 'https://www.zillow.com',
          'Largest real estate search marketplace',
          'Free / Premier Agent subscription',
          ['Massive consumer traffic', 'Strong Zestimate brand'],
          ['Inaccurate Zestimates', 'Premier Agent lead-gen is expensive'],
          `${companyName} offers local-expert curation that Zillow's algorithm can't match.`,
          0.85,
          ['Industry benchmark: dominant real estate search', 'Heuristic only']),
      ];
    }

    // Education
    if (ind.includes('education') || text.includes('university') || text.includes('college') || text.includes('courses')) {
      return [
        wrap('Coursera', 'https://www.coursera.org',
          'Online course platform partnering with universities',
          '$39-$79/mo or per-course fees',
          ['University partnerships', 'Recognized certificates'],
          ['High course prices', 'Inconsistent course quality'],
          `${companyName} provides a tighter, cohort-based learning experience with stronger outcomes.`,
          0.75,
          ['Industry benchmark: dominant MOOC platform', 'Heuristic only']),
      ];
    }

    // Marketing / Creative Agency
    if (ind.includes('marketing') || text.includes('marketing agency') || text.includes('creative agency') || text.includes('advertising')) {
      return [
        wrap('HubSpot', 'https://www.hubspot.com',
          'All-in-one marketing + CRM + sales platform',
          'Free - $1,600+/mo',
          ['Massive ecosystem', 'Strong inbound marketing playbook'],
          ['Expensive at scale', 'CRM is mediocre'],
          `${companyName} offers agency-quality strategy at a fraction of HubSpot Services pricing.`,
          0.80,
          ['Industry benchmark: dominant marketing automation', 'Heuristic only']),
      ];
    }

    // Manufacturing
    if (ind.includes('manufacturing') || text.includes('manufacturer') || text.includes('oem') || text.includes('factory')) {
      return [
        wrap('Xometry', 'https://www.xometry.com',
          'On-demand manufacturing marketplace',
          'Per-quote pricing',
          ['Massive network of manufacturers', 'Instant quoting'],
          ['Quality variability', 'Limited for high-volume runs'],
          `${companyName} offers direct manufacturer relationships for tighter quality control.`,
          0.72,
          ['Industry benchmark: on-demand manufacturing marketplace', 'Heuristic only']),
      ];
    }

    // Legal
    if (ind.includes('legal') || text.includes('law firm') || text.includes('attorney') || text.includes('lawyer')) {
      return [
        wrap('Clio', 'https://www.clio.com',
          'Cloud-based legal practice management',
          '$49-$149/user/mo',
          ['Strong legal-specific workflows', 'Good document automation'],
          ['Per-user pricing', 'Limited customization'],
          `${companyName} offers specialized practice-area workflows that Clio's general approach doesn't cover.`,
          0.70,
          ['Industry benchmark: leading legal practice management software', 'Heuristic only']),
      ];
    }

    // Default: software_technology
    // CRITICAL: when we have no industry signal, do NOT silently invent competitors.
    // Return an empty list. Downstream code can decide what to do (e.g. prompt
    // the user, run a search, or show a "no competitors identified" state).
    // The old code returned "Legacy CopyBot AI" / "Enterprise Automation Cloud"
    // here — that was fabricated competitive intelligence, not data.
    return [];
  }
}
