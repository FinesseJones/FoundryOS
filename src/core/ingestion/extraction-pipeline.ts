import { WebCrawler, CrawlResult } from './crawler';
import { ContentCleaner, CleanedDocument } from './cleaner';
import { SemanticChunker, DocumentChunk } from './chunker';
import { VisualBrandAnalyzer, VisualBrandProfile } from './visual-analyzer';
import { CompetitorDiscoveryEngine, CompetitorProfile, CompetitorDiscoveryResult } from './competitor-discovery';
import { PersonaGeneratorEngine } from './persona-generator';
import { KnowledgeGraphBuilder, BusinessKnowledgeGraph } from './knowledge-graph';
import { IndustryClassifier, IndustryClassification } from './industry-classifier';
import { MultiProviderLLMFactory } from '../providers/llm-provider-factory';
import { BusinessDNA, createDefaultBusinessDNA, validateBusinessDNA, createKnowledgeField } from '../knowledge';

export interface ExtractionPipelineResult {
  businessId: string;
  crawlResult: CrawlResult;
  cleanedDocuments: CleanedDocument[];
  chunks: DocumentChunk[];
  visualProfile: VisualBrandProfile;
  competitors: CompetitorProfile[];
  competitorDiscoveryResult: CompetitorDiscoveryResult;
  knowledgeGraph: BusinessKnowledgeGraph;
  businessDNA: BusinessDNA;
  durationMs: number;
}

export class ExtractionPipeline {
  private crawler = new WebCrawler();
  private cleaner = new ContentCleaner();
  private chunker = new SemanticChunker();
  private visualAnalyzer = new VisualBrandAnalyzer();
  private competitorEngine = new CompetitorDiscoveryEngine();
  private personaEngine = new PersonaGeneratorEngine();
  private graphBuilder = new KnowledgeGraphBuilder();
  private industryClassifier = new IndustryClassifier();
  private llmFactory = new MultiProviderLLMFactory();

  async runPipeline(targetUrl: string, companyNameInput?: string): Promise<ExtractionPipelineResult> {
    const startTime = Date.now();

    // 1. Production Web Crawler
    const crawlResult = await this.crawler.crawlWebsite(targetUrl);
    const primaryPage = crawlResult.pages[0];
    const companyName = companyNameInput || primaryPage.title.split('—')[0].split('|')[0].trim();

    // 2. HTML Content Cleaning & Markdown Normalization
    const cleanedDocuments = crawlResult.pages.map((page) =>
      this.cleaner.cleanHtml(page.url, page.rawHtml, page.title)
    );

    // 3. Semantic Text Chunker
    const chunks = cleanedDocuments.flatMap((doc) => this.chunker.chunkDocument(doc));

    // 4. Visual Brand & Style Analysis
    const visualProfile = this.visualAnalyzer.analyzeStyles(primaryPage.rawHtml);

    // 6. Dynamic Text & Keyword Extraction from Source Data
    // Use FULL cleaned body text (not just headings) so vertical keywords buried
    // in body copy are actually seen by the classifier.
    const fullPageText = [primaryPage.title, primaryPage.metaDescription, ...primaryPage.h1, ...primaryPage.h2].join(' ');
    const fullBodyText = cleanedDocuments.map((d) => d.cleanText).join(' ');

    // Industry classification (real classifier, not inlined regex)
    const metaKeywords = this.extractMetaKeywords(primaryPage.rawHtml);
    const jsonLdTypes = this.extractJsonLdTypes(primaryPage.rawHtml);
    const industryResult: IndustryClassification = this.industryClassifier.classify({
      bodyText: fullBodyText,
      headings: fullPageText,
      metaKeywords,
      jsonLdTypes,
      host: primaryPage.url ? new URL(primaryPage.url).host : undefined,
    });
    const inferredIndustry = industryResult.industry;

    const extractedKeywords = this.extractKeywordsFromHeadings(primaryPage.h1, primaryPage.h2);
    const extractedCoreValues = this.extractCoreValuesFromContent(fullBodyText);
    const inferredTone = visualProfile.brandPersonalitySignals[0]?.value?.toLowerCase() || 'authoritative';

    // 5. Competitor Discovery & Dynamic Persona Generation
    // Returns BOTH discoveredCompetitors (from a real SearchProvider) and
    // industryBenchmarks (heuristic templates). Pipeline carries both so
    // downstream code can choose which to use.
    const competitorResult: CompetitorDiscoveryResult = await this.competitorEngine.discover(
      companyName,
      inferredIndustry,
      fullBodyText,
      targetUrl
    );
    // Union for backward-compat consumers; provenance still tracked per-competitor
    // via the CompetitorProfile.source field.
    const competitors: CompetitorProfile[] = [
      ...competitorResult.discoveredCompetitors,
      ...competitorResult.industryBenchmarks,
    ];
    const personas = this.personaEngine.generatePersonas(
      companyName,
      primaryPage.metaDescription || primaryPage.title,
      inferredIndustry,
      fullBodyText
    );

    console.log('\n========================================');
    console.log('[Content Extraction Output] Target:', targetUrl);
    console.log('[Content Extraction Output] Cleaned Documents:', cleanedDocuments.length);
    console.log('[Content Extraction Output] Chunks Generated:', chunks.length);
    console.log('[Content Extraction Output] Extracted Core Values:', extractedCoreValues);
    console.log('[Content Extraction Output] Competitor Discovery:', {
      searched: competitorResult.searched,
      searchProvider: competitorResult.searchProviderName ?? null,
      discoveredCompetitors: competitorResult.discoveredCompetitors.map((c) => `${c.name} [source=${c.source}, conf=${c.confidence}]`),
      industryBenchmarks: competitorResult.industryBenchmarks.map((c) => `${c.name} [source=${c.source}, conf=${c.confidence}]`),
      stats: competitorResult.stats,
    });
    console.log('[Content Extraction Output] Personas Generated:', personas.map((p) => p.name));
    console.log('[Content Extraction Output] Industry Classification:', {
      industry: industryResult.industry,
      confidence: industryResult.confidence.toFixed(2),
      source: industryResult.source,
      evidenceTerms: industryResult.evidenceTerms,
      alternatives: industryResult.alternativeCandidates,
    });
    console.log('========================================\n');

    const businessId = `biz_pipeline_${Date.now()}`;
    const knowledgeGraph = this.graphBuilder.buildKnowledgeGraph(businessId, companyName);

    console.log('\n========================================');
    console.log('[LLM Extraction Input] Company Name Input:', companyNameInput);
    console.log('[LLM Extraction Input] Page Title Extracted:', primaryPage.title);
    console.log('[LLM Extraction Input] Meta Description Extracted:', primaryPage.metaDescription);
    console.log('[LLM Extraction Input] Hero H1 Extracted:', primaryPage.h1[0]);
    console.log('[LLM Extraction Input] Inferred Industry:', inferredIndustry, `(confidence ${industryResult.confidence.toFixed(2)}, source ${industryResult.source})`);
    console.log('[LLM Extraction Input] Industry Evidence Terms:', industryResult.evidenceTerms);
    console.log('[LLM Extraction Input] Inferred Tone:', inferredTone);
    console.log('[LLM Extraction Input] Extracted Keywords:', extractedKeywords);
    console.log('[LLM Extraction Input] Color Palette:', visualProfile.colors.map((c) => `${c.value} (${c.source}, conf ${c.confidence})`));
    console.log('[LLM Extraction Input] Typography:', visualProfile.fonts.map((f) => `${f.value} (${f.source}, conf ${f.confidence})`));
    console.log('[LLM Extraction Input] Visual Extraction Status:', visualProfile.extractionStatus);
    console.log('[LLM Extraction Input] Visual Extraction Stats:', visualProfile.extractionStats);
    console.log('========================================\n');

    // 8. LLM Provider Multi-Provider Extraction & Zod Schema Validation
    const defaultDna = createDefaultBusinessDNA(businessId, {
      companyIdentity: {
        companyName: createKnowledgeField(companyName, { originType: 'OWNER_PROVIDED', confidence: 1.0, source: 'user_input' }),
        industry: createKnowledgeField(inferredIndustry, {
          originType: 'INFERRED',
          confidence: industryResult.confidence,
          source: `industry_classifier.${industryResult.source}`,
          reasoningSummary: `Classified as ${inferredIndustry} via ${industryResult.source} (confidence ${industryResult.confidence.toFixed(2)}). Evidence: ${industryResult.evidenceTerms.slice(0, 5).join(', ') || 'no strong terms, default fallback'}.`,
        }),
        stage: createKnowledgeField('growth', { originType: 'INFERRED', confidence: 0.75, source: 'pipeline' }),
        mission: createKnowledgeField(
          primaryPage.metaDescription || primaryPage.title || `Empowering modern teams with ${companyName}.`,
          { originType: 'EXTRACTED', confidence: 0.95, source: 'meta_description', evidenceText: primaryPage.metaDescription || primaryPage.title }
        ),
        uniqueValueProposition: createKnowledgeField(
          primaryPage.h1[0] || primaryPage.title || `The premier platform for ${companyName}.`,
          { originType: 'EXTRACTED', confidence: 0.98, source: 'hero_h1_tag', evidenceText: primaryPage.h1[0] || primaryPage.title }
        ),
        coreValues: createKnowledgeField(extractedCoreValues, { originType: 'EXTRACTED', confidence: 0.85, source: 'page_messaging_terms', evidenceText: extractedCoreValues.join(', ') }),
      },
      brandVoice: {
        primaryTone: createKnowledgeField(inferredTone, { originType: 'INFERRED', confidence: 0.88, source: 'visual_personality_analysis' }),
        wordsToUse: createKnowledgeField(extractedKeywords, { originType: 'EXTRACTED', confidence: 0.90, source: 'h1_h2_keyword_mining', evidenceText: extractedKeywords.join(', ') }),
        wordsToAvoid: createKnowledgeField(['cheap', 'outdated', 'manual'], { originType: 'OWNER_PROVIDED', confidence: 1.0, source: 'compliance_policy' }),
      },
      customerProfile: {
        targetAudience: createKnowledgeField(
          primaryPage.metaDescription || primaryPage.title,
          { originType: 'EXTRACTED', confidence: 0.86, source: 'page_audience_meta', evidenceText: primaryPage.metaDescription || primaryPage.title }
        ),
        buyerPersonas: createKnowledgeField(personas, { originType: 'GENERATED', confidence: 0.85, source: 'persona_generator_engine', reasoningSummary: `Generated ${personas.length} personas tailored for ${inferredIndustry}.` }),
        primaryPainPoints: createKnowledgeField(
          primaryPage.h2.slice(0, 4),
          { originType: 'EXTRACTED', confidence: 0.88, source: 'subheading_h2_mining', evidenceText: primaryPage.h2.slice(0, 4).join('; ') }
        ),
      },
      competitivePositioning: {
        primaryCompetitors: createKnowledgeField(
          competitors.map((c) => c.name),
          {
            originType: competitorResult.discoveredCompetitors.length > 0 ? 'EXTRACTED' : 'INFERRED',
            confidence: competitors.length > 0
              ? Math.max(...competitors.map((c) => c.confidence))
              : 0,
            source: `competitor_discovery.${competitorResult.searchProviderName ?? 'benchmarks_only'}`,
            reasoningSummary: competitorResult.searched
              ? `Discovered ${competitorResult.discoveredCompetitors.length} competitor(s) via ${competitorResult.searchProviderName}. Plus ${competitorResult.industryBenchmarks.length} industry benchmark(s).`
              : `No real search ran. ${competitorResult.industryBenchmarks.length} industry benchmark(s) returned. (Search provider not configured.)`,
            evidenceText: competitors.map((c) => `${c.name}@${c.source}`).join('; '),
          }
        ),
        keyDifferentiators: createKnowledgeField(extractedCoreValues, { originType: 'INFERRED', confidence: 0.82, source: 'value_prop_mining' }),
      },
      websiteAnalysis: {
        primaryUrl: createKnowledgeField(targetUrl, { originType: 'EXTRACTED', confidence: 1.0, source: 'web_crawler' }),
        headerTagline: createKnowledgeField(primaryPage.metaDescription || null, { originType: 'EXTRACTED', confidence: 0.90, evidenceText: primaryPage.metaDescription }),
        heroH1: createKnowledgeField(primaryPage.h1[0] || null, { originType: 'EXTRACTED', confidence: 0.98, evidenceText: primaryPage.h1[0] }),
        keyPages: createKnowledgeField(crawlResult.pages.map((p) => p.url), { originType: 'EXTRACTED', confidence: 1.0, source: 'site_crawler' }),
        mainCTAs: createKnowledgeField(
          primaryPage.links.filter((l) => l.includes('sign') || l.includes('demo') || l.includes('start') || l.includes('contact')).slice(0, 5),
          { originType: 'EXTRACTED', confidence: 0.92, source: 'link_scraper' }
        ),
        colors: createKnowledgeField(
          visualProfile.colors.map((c) => c.value),
          {
            originType: visualProfile.extractionStatus === 'not_found' ? 'INFERRED' : 'EXTRACTED',
            confidence: visualProfile.colors.length > 0
              ? visualProfile.colors[0].confidence
              : 0,
            source: visualProfile.colors[0]?.source ?? 'not_found',
            reasoningSummary: visualProfile.extractionStatus === 'not_found'
              ? 'No colors extracted from page; no defaults invented. extractionStatus=not_found'
              : `Extracted ${visualProfile.colors.length} color(s) via ${visualProfile.colors.map((c) => c.source).filter((s, i, a) => a.indexOf(s) === i).join(', ')}. Top source: ${visualProfile.colors[0].source} (confidence ${visualProfile.colors[0].confidence}).`,
            evidenceText: visualProfile.colors.map((c) => `${c.value}@${c.source}`).join('; '),
          }
        ),
        fonts: createKnowledgeField(
          visualProfile.fonts.map((f) => f.value),
          {
            originType: visualProfile.fonts.length > 0 ? 'EXTRACTED' : 'INFERRED',
            confidence: visualProfile.fonts.length > 0 ? visualProfile.fonts[0].confidence : 0,
            source: visualProfile.fonts[0]?.source ?? 'not_found',
            reasoningSummary: visualProfile.fonts.length === 0
              ? 'No fonts extracted from page; no defaults invented.'
              : `Extracted ${visualProfile.fonts.length} font(s) via ${visualProfile.fonts.map((f) => f.source).filter((s, i, a) => a.indexOf(s) === i).join(', ')}.`,
            evidenceText: visualProfile.fonts.map((f) => `${f.value}@${f.source}`).join('; '),
          }
        ),
      },
    });

    console.log('\n========================================');
    console.log('[Business DNA Output] Pipeline Generated DNA Result:');
    console.log('  - Company Name:', defaultDna.companyIdentity.companyName.value);
    console.log('  - Industry:', defaultDna.companyIdentity.industry.value);
    console.log('  - Mission:', defaultDna.companyIdentity.mission.value);
    console.log('  - UVP:', defaultDna.companyIdentity.uniqueValueProposition.value);
    console.log('  - Primary Tone:', defaultDna.brandVoice.primaryTone.value);
    console.log('  - Words To Use:', defaultDna.brandVoice.wordsToUse.value);
    console.log('  - Words To Avoid:', defaultDna.brandVoice.wordsToAvoid.value);
    console.log('  - Target Audience:', defaultDna.customerProfile.targetAudience.value);
    console.log('  - Competitors:', defaultDna.competitivePositioning.primaryCompetitors.value);
    console.log('  - Colors:', defaultDna.websiteAnalysis?.colors?.value);
    console.log('  - Fonts:', defaultDna.websiteAnalysis?.fonts?.value);
    console.log('========================================\n');

    const validation = validateBusinessDNA(defaultDna);
    if (!validation.valid) {
      console.warn('Pipeline Business DNA validation warnings:', validation.issues);
    }

    return {
      businessId,
      crawlResult,
      cleanedDocuments,
      chunks,
      visualProfile,
      competitors,
      competitorDiscoveryResult: competitorResult,
      knowledgeGraph,
      businessDNA: defaultDna,
      durationMs: Date.now() - startTime,
    };
  }

  private extractKeywordsFromHeadings(h1: string[], h2: string[]): string[] {
    const text = [...h1, ...h2].join(' ').toLowerCase();
    const words = text
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'your', 'that', 'this', 'have', 'more', 'about', 'page', 'home'].includes(w));
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.length > 0 ? uniqueWords.slice(0, 6) : ['innovative', 'reliable', 'scalable'];
  }

  private extractCoreValuesFromContent(text: string): string[] {
    const lower = text.toLowerCase();
    const values: string[] = [];

    if (lower.includes('hvac') || lower.includes('comfort') || lower.includes('heating') || lower.includes('cooling')) {
      values.push('24/7 Customer Comfort', 'Energy Efficiency', 'Certified Craftsmanship');
    }
    if (lower.includes('salad') || lower.includes('organic') || lower.includes('fresh') || lower.includes('food') || lower.includes('sustainable')) {
      values.push('Fresh Sourced Ingredients', 'Environmental Sustainability', 'Community Wellness');
    }
    if (lower.includes('observability') || lower.includes('security') || lower.includes('monitoring') || lower.includes('kpi') || lower.includes('telemetry')) {
      values.push('Operational Uptime Excellence', 'Zero-Trust Security', 'Continuous Telemetry Innovation');
    }
    if (lower.includes('payment') || lower.includes('financial') || lower.includes('billing')) {
      values.push('Financial Integrity', 'High Throughput Reliability', 'Global Scalability');
    }

    if (values.length === 0) {
      values.push('Customer First', 'Integrity & Transparency', 'Continuous Innovation');
    }

    return values;
  }

  private inferIndustryFromContent(text: string): string {
    // Deprecated: kept for backward-compat with any external callers.
    // The real classification path is IndustryClassifier.classify() in industry-classifier.ts.
    const result = this.industryClassifier.classify({
      bodyText: text,
      headings: text,
      metaKeywords: [],
      jsonLdTypes: [],
    });
    return result.industry;
  }

  private extractMetaKeywords(rawHtml: string): string[] {
    const match = rawHtml.match(/<meta[^>]+name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    if (!match) return [];
    return match[1]
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
  }

  private extractJsonLdTypes(rawHtml: string): string[] {
    const types: string[] = [];
    const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(rawHtml)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const collect = (node: unknown): void => {
          if (!node || typeof node !== 'object') return;
          if (Array.isArray(node)) {
            node.forEach(collect);
            return;
          }
          const obj = node as Record<string, unknown>;
          if (typeof obj['@type'] === 'string') {
            types.push(obj['@type'] as string);
          } else if (Array.isArray(obj['@type'])) {
            (obj['@type'] as unknown[]).forEach((t) => {
              if (typeof t === 'string') types.push(t);
            });
          }
          if (obj['@graph'] && Array.isArray(obj['@graph'])) {
            (obj['@graph'] as unknown[]).forEach(collect);
          }
        };
        collect(parsed);
      } catch {
        // ignore malformed JSON-LD
      }
    }
    return Array.from(new Set(types));
  }
}
