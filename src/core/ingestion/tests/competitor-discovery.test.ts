import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CompetitorDiscoveryEngine, SearchProvider, SearchProviderResult } from '../competitor-discovery';

const engine = new CompetitorDiscoveryEngine();

test('CompetitorDiscoveryEngine: HVAC industry returns industry_benchmark competitors with provenance', async () => {
  const result = await engine.discover(
    'Cool Air Solutions',
    'hvac_building_services',
    'We provide HVAC, heating, and air conditioning services for residential customers.'
  );

  // No real search provider wired → searched=false
  assert.equal(result.searched, false);
  assert.equal(result.discoveredCompetitors.length, 0, 'No discovered competitors without a SearchProvider');

  // Industry benchmarks ARE returned, but clearly labeled
  assert.ok(result.industryBenchmarks.length > 0, 'HVAC industry should have benchmarks');
  for (const c of result.industryBenchmarks) {
    assert.equal(c.source, 'industry_benchmark', `Benchmark ${c.name} must be tagged as industry_benchmark`);
    assert.ok(c.confidence <= 0.7, `Benchmark confidence should be moderate, not high. Got ${c.confidence} for ${c.name}`);
    assert.ok(Array.isArray(c.evidence), 'Evidence must be an array');
    assert.ok(c.evidence.length > 0, 'Evidence must not be empty for benchmarks');
  }

  // Names should match what we'd expect
  const names = result.industryBenchmarks.map((c) => c.name);
  assert.ok(names.includes('Trane Technologies'), `Expected Trane in benchmarks, got: ${names.join(', ')}`);
});

test('CompetitorDiscoveryEngine: Restaurant industry returns benchmarks, not software_technology fallbacks', async () => {
  const result = await engine.discover(
    'Green Bowl',
    'restaurant_food_services',
    'Farm to table fast casual restaurant with chef-crafted salads.'
  );

  assert.equal(result.searched, false);
  assert.ok(result.industryBenchmarks.length > 0);
  const names = result.industryBenchmarks.map((c) => c.name);
  assert.ok(names.includes('Chipotle Mexican Grill'));
  assert.ok(names.includes('CAVA Mediterranean'));

  // CRITICAL: must NOT contain the old "Legacy CopyBot AI" / "Enterprise Automation Cloud" fallbacks
  for (const c of result.industryBenchmarks) {
    assert.notEqual(c.name, 'Legacy CopyBot AI', 'Must not return the fabricated software fallback');
    assert.notEqual(c.name, 'Enterprise Automation Cloud', 'Must not return the fabricated software fallback');
  }
});

test('CompetitorDiscoveryEngine: Unknown industry returns EMPTY benchmark list (not fabricated data)', async () => {
  // This is the critical bug fix. Old code returned "Legacy CopyBot AI" and
  // "Enterprise Automation Cloud" for any unknown industry. That was invented
  // competitive intelligence, not data. New code returns an empty list.
  const result = await engine.discover(
    'MysteryCo',
    'software_technology',  // no specific vertical match
    'A generic platform that does platform things with platform technology.'  // no specific vertical keywords
  );

  assert.equal(result.searched, false);
  assert.equal(result.industryBenchmarks.length, 0, 'Unknown industry must return empty benchmarks, not fabricated fallbacks');
  assert.equal(result.discoveredCompetitors.length, 0, 'No search provider = no discovered competitors');

  // Diagnostic stats
  assert.equal(result.stats.searchResultsReceived, 0);
  assert.equal(result.stats.benchmarkResultsReturned, 0);
  assert.equal(result.stats.deduplicatedNames, 0);
});

test('CompetitorDiscoveryEngine: SearchProvider returns real discovered competitors (source=search)', async () => {
  // Mock SearchProvider — simulates what SerpAPI/Bing would return
  const mockProvider: SearchProvider = {
    name: 'mock_search',
    async searchCompetitors(params): Promise<SearchProviderResult[]> {
      return [
        { name: 'Real Competitor A', websiteUrl: 'https://competitor-a.com', description: 'Direct competitor in observability', rank: 1, snippet: 'A is a leader in cloud observability...' },
        { name: 'Real Competitor B', websiteUrl: 'https://competitor-b.com', description: 'Open-source observability alternative', rank: 2, snippet: 'B offers an open-source approach to monitoring...' },
      ];
    },
  };

  engine.setSearchProvider(mockProvider);
  const result = await engine.discover(
    'HyperObserve',
    'devops_cloud_observability',
    'Cloud-native observability platform',
    'https://hyperobserve.example.com'
  );

  // Search ran
  assert.equal(result.searched, true, 'Search should have run with provider wired');
  assert.equal(result.searchProviderName, 'mock_search');

  // Discovered competitors are real, source=search
  assert.equal(result.discoveredCompetitors.length, 2);
  for (const c of result.discoveredCompetitors) {
    assert.equal(c.source, 'search', `Discovered competitor must be tagged as search. Got ${c.source} for ${c.name}`);
    assert.ok(c.confidence >= 0.7, `Search results should have high confidence. Got ${c.confidence} for ${c.name}`);
    assert.ok(c.searchQuery, 'Search-sourced competitor must record the query that found it');
    assert.ok(c.searchRank, 'Search-sourced competitor must record the rank');
    assert.ok(c.evidence.length >= 1);
  }

  // Industry benchmarks are also still present (heuristic templates)
  assert.ok(result.industryBenchmarks.length > 0, 'Benchmarks are returned alongside discovered');

  // Dedup: if a discovered name matches a benchmark name, benchmark is removed
  // (in this test, no overlap expected, so all benchmarks remain)
  const discoveredNames = new Set(result.discoveredCompetitors.map((c) => c.name.toLowerCase()));
  for (const b of result.industryBenchmarks) {
    assert.ok(!discoveredNames.has(b.name.toLowerCase()), 'Dedupe should remove benchmarks that match discovered');
  }

  // Stats
  assert.equal(result.stats.searchResultsReceived, 2);
  assert.ok(result.stats.benchmarkResultsReturned > 0);

  // Cleanup
  engine.setSearchProvider(null);
});

test('CompetitorDiscoveryEngine: Discovered competitors outrank benchmarks when names overlap', async () => {
  // If a real search returns a name that's also in the benchmark list, the
  // search result wins. The benchmark is dropped, the discovered one is kept.
  const mockProvider: SearchProvider = {
    name: 'mock_search',
    async searchCompetitors(): Promise<SearchProviderResult[]> {
      return [
        { name: 'Dynatrace', websiteUrl: 'https://www.dynatrace.com', description: 'Verified via search', rank: 1, snippet: '...' },
      ];
    },
  };

  engine.setSearchProvider(mockProvider);
  const result = await engine.discover(
    'TestObs',
    'devops_cloud_observability',
    'observability monitoring platform',
    'https://testobs.example.com'
  );

  // Dynatrace is in BOTH discovered and benchmark list — discovered wins
  const dynatraceInDiscovered = result.discoveredCompetitors.find((c) => c.name === 'Dynatrace');
  const dynatraceInBenchmark = result.industryBenchmarks.find((c) => c.name === 'Dynatrace');
  assert.ok(dynatraceInDiscovered, 'Dynatrace should be in discovered (search won)');
  assert.equal(dynatraceInDiscovered!.source, 'search');
  assert.equal(dynatraceInBenchmark, undefined, 'Dynatrace should be REMOVED from benchmarks (dedupe)');
  assert.equal(result.stats.deduplicatedNames, 1, 'Dedupe count should be 1');

  engine.setSearchProvider(null);
});

test('CompetitorDiscoveryEngine: SearchProvider failure falls back to benchmarks gracefully', async () => {
  const failingProvider: SearchProvider = {
    name: 'broken_provider',
    async searchCompetitors(): Promise<SearchProviderResult[]> {
      throw new Error('API rate limit exceeded');
    },
  };

  engine.setSearchProvider(failingProvider);
  const result = await engine.discover(
    'TestHVAC',
    'hvac_building_services',
    'hvac heating cooling',
    'https://test.example.com'
  );

  // Search failed — searched=false even though provider was wired
  assert.equal(result.searched, false, 'Failed search should report searched=false');
  assert.equal(result.discoveredCompetitors.length, 0, 'No discovered competitors on failure');

  // But benchmarks still work
  assert.ok(result.industryBenchmarks.length > 0, 'Benchmarks should still be returned even when search fails');
  for (const c of result.industryBenchmarks) {
    assert.equal(c.source, 'industry_benchmark');
  }

  engine.setSearchProvider(null);
});

test('CompetitorDiscoveryEngine: All returned competitors have source/confidence/evidence populated', async () => {
  const result = await engine.discover(
    'TestHVAC',
    'hvac_building_services',
    'hvac heating cooling services'
  );

  for (const c of result.industryBenchmarks) {
    assert.ok(c.source, `${c.name} missing source`);
    assert.ok(['search', 'seo_overlap', 'manual', 'industry_benchmark'].includes(c.source),
      `${c.name} has invalid source: ${c.source}`);
    assert.ok(typeof c.confidence === 'number' && c.confidence >= 0 && c.confidence <= 1,
      `${c.name} has invalid confidence: ${c.confidence}`);
    assert.ok(Array.isArray(c.evidence), `${c.name} evidence must be array`);
    assert.ok(c.evidence.length > 0, `${c.name} evidence must not be empty`);
  }
});
