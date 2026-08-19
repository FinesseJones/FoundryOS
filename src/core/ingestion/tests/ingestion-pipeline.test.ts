import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ExtractionPipeline } from '../extraction-pipeline';
import { WebCrawler } from '../crawler';
import { ContentCleaner } from '../cleaner';
import { SemanticChunker } from '../chunker';
import { VisualBrandAnalyzer } from '../visual-analyzer';
import { CompetitorDiscoveryEngine } from '../competitor-discovery';
import { KnowledgeGraphBuilder } from '../knowledge-graph';

test('WebCrawler: Crawls website, metadata, and page links', async () => {
  const crawler = new WebCrawler();
  const result = await crawler.crawlWebsite('https://hyperdrive-ai.com');

  assert.equal(result.targetUrl, 'https://hyperdrive-ai.com');
  assert.ok(result.pages.length > 0);
  assert.ok(result.pages[0].h1.length > 0);
  assert.equal(result.robotsTxtFound, true);
  assert.equal(result.sitemapFound, true);
});

test('ContentCleaner: Strips HTML boilerplate and extracts clean markdown', () => {
  const cleaner = new ContentCleaner();
  const rawHtml = '<html><body><h1>Header Title</h1><script>alert(1)</script><p>Content paragraph text</p></body></html>';
  const cleanDoc = cleaner.cleanHtml('https://example.com', rawHtml, 'Header Title');

  assert.equal(cleanDoc.extractedHeadings[0].text, 'Header Title');
  assert.ok(!cleanDoc.cleanText.includes('alert'));
  assert.ok(cleanDoc.wordCount > 0);
});

test('SemanticChunker: Splits document into token-aware chunks', () => {
  const cleaner = new ContentCleaner();
  const doc = cleaner.cleanHtml(
    'https://example.com',
    '<h1>Main Title</h1><p>Lorem ipsum dolor sit amet consectetur adipiscing elit.</p><h1>Section 2</h1><p>More detailed text content.</p>'
  );

  const chunker = new SemanticChunker();
  const chunks = chunker.chunkDocument(doc, 50, 10);

  assert.ok(chunks.length > 0);
  assert.ok(chunks[0].tokenEstimate > 0);
});

test('VisualBrandAnalyzer: Extracts color palette and typography with provenance', () => {
  const analyzer = new VisualBrandAnalyzer();
  const sampleHtml = `<style>:root { --brand-primary: #6366f1; --brand-secondary: #a855f7; font-family: "Outfit", sans-serif; }</style>`;
  const profile = analyzer.analyzeStyles(sampleHtml);

  // Old API: profile.colorPalette.primary was a bare string.
  // New API: profile.colors is an array of {value, source, confidence} objects.
  assert.ok(profile.colors.length > 0, 'Should extract at least one color from --brand-* variables');
  assert.ok(profile.colors[0].value.startsWith('#'));
  assert.equal(profile.colors[0].source, 'css_variable', 'Brand var should be tagged as css_variable');
  assert.ok(profile.colors[0].confidence > 0.5, 'CSS variable confidence should be > 0.5');
  assert.equal(profile.colors[0].selector, '--brand-primary');

  // Fonts
  assert.ok(profile.fonts.length > 0);
  assert.equal(profile.fonts[0].source, 'css_font_family');
  assert.ok(profile.fonts[0].confidence > 0.5);

  // Provenance integrity: nothing in inferredDefaults because we DID extract
  assert.equal(profile.inferredDefaults.colors.length, 0, 'No inferred defaults when extractions exist');
  assert.equal(profile.inferredDefaults.fonts.length, 0);
  assert.equal(profile.extractionStatus, 'found');
});

test('KnowledgeGraphBuilder: Connects company, product, customer, competitor nodes & edges', () => {
  const builder = new KnowledgeGraphBuilder();
  const graph = builder.buildKnowledgeGraph('biz_kg_test', 'HyperDrive AI');

  assert.equal(graph.businessId, 'biz_kg_test');
  assert.ok(graph.nodes.length >= 8);
  assert.ok(graph.edges.length >= 8);

  const companyNode = graph.nodes.find((n) => n.type === 'company');
  assert.ok(companyNode);
  assert.equal(companyNode.label, 'HyperDrive AI');
});

test('ExtractionPipeline: Full End-to-End Ingestion Execution', async () => {
  const pipeline = new ExtractionPipeline();
  const result = await pipeline.runPipeline('https://hyperdrive-ai.com', 'HyperDrive AI Systems');

  assert.ok(result.businessId.startsWith('biz_pipeline_'));
  assert.ok(result.crawlResult.pages.length > 0);
  assert.ok(result.cleanedDocuments.length > 0);
  assert.ok(result.chunks.length > 0);
  assert.ok(result.knowledgeGraph.nodes.length > 0);
  assert.equal(result.businessDNA.companyIdentity.companyName.value, 'HyperDrive AI Systems');
});
