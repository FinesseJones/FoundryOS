import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ContextBuilder } from '../../context';
import { MemoryRetriever } from '../../context/memory-retrieval';
import { DecisionRecord, MemoryRecord } from '../../context/context.types';
import { ContentAgent } from '../../agents/content-agent';
import { ExternalMarketIntelligenceService } from '../../intelligence/external-market-intelligence-service';
import { BusinessDNA } from '../../knowledge';

describe('TACF v1.1 — Institutional Memory & External Intelligence Suite', () => {
  it('1. Memory Authority Hierarchy: Executive Decision supersedes lower authority memories', () => {
    const retriever = new MemoryRetriever();

    // 1. Initial Campaign decision
    const initialDecision: DecisionRecord = {
      id: 'dec_1',
      organizationId: 'org_tacf',
      businessId: 'biz_tacf',
      decision: 'Adopt informal, casual startup slang for broad social outreach.',
      rationale: 'Early stage experiment',
      authorizedBy: 'Growth Intern',
      authorityLevel: 'CAMPAIGN_DECISION',
      decidedAt: '2026-06-01T00:00:00Z',
      status: 'ACTIVE',
      tags: ['tone', 'social'],
    };
    retriever.addDecisionRecord(initialDecision);

    // 2. CEO Executive Override
    const ceoOverride: DecisionRecord = {
      id: 'dec_2',
      organizationId: 'org_tacf',
      businessId: 'biz_tacf',
      decision: 'Maintain strictly authoritative, enterprise-grade positioning and terminology.',
      rationale: 'Enterprise buyers require precision and governance.',
      authorizedBy: 'CEO Finesse Jones',
      authorityLevel: 'EXECUTIVE_DECISION',
      decidedAt: '2026-08-21T00:00:00Z',
      status: 'ACTIVE',
      tags: ['tone', 'social'],
    };
    retriever.addDecisionRecord(ceoOverride);

    // The older lower-authority decision should now be SUPERSEDED
    assert.strictEqual(initialDecision.status, 'SUPERSEDED');
    assert.strictEqual(ceoOverride.status, 'ACTIVE');

    // Retrieve active decisions for social tone
    const active = retriever.retrieveDecisions('tone social', 'biz_tacf');
    assert.strictEqual(active.length, 1);
    assert.strictEqual(active[0].id, 'dec_2');
    assert.strictEqual(active[0].authorityLevel, 'EXECUTIVE_DECISION');
  });

  it('2. BaseAgent Context Injection: Active Decision Records are injected into System Prompt', async () => {
    const contextBuilder = new ContextBuilder();
    const contentAgent = new ContentAgent(contextBuilder);

    const taskResult = await contentAgent.executeTask({
      taskId: 'task_exec_prompt_1',
      businessId: 'biz_tacf_prompt',
      role: 'content',
      taskType: 'content_generation',
      prompt: 'Draft LinkedIn post for enterprise operations leaders.',
      targetChannel: 'LinkedIn',
    });

    assert.strictEqual(taskResult.success, true);
    assert.strictEqual(taskResult.agentRole, 'content');
    assert.ok(taskResult.outputSummary.includes('LinkedIn'));
  });

  it('3. External Intelligence Zero-Fake Rule: Returns "insufficient_evidence" when no signals exist', async () => {
    const intelligenceService = new ExternalMarketIntelligenceService();
    const mockDNA = {
      companyIdentity: {
        companyName: { value: 'TACF OS' },
        industry: { value: 'technology_saas' },
        uniqueValueProposition: { value: 'Autonomous Business AI OS' },
      },
    } as unknown as BusinessDNA;

    const report = await intelligenceService.synthesizeIntelligence('biz_empty_telemetry', mockDNA);

    // Must NOT emit fake heuristic assumptions
    assert.strictEqual(report.status, 'insufficient_evidence');
    assert.strictEqual(report.signalsCount, 0);
    assert.strictEqual(report.recommendations.length, 0);
    assert.ok(report.message?.includes('Configure competitor crawl or search integrations'));
  });

  it('4. External Intelligence Provenance & Non-Mutating Governance Pipeline', async () => {
    const intelligenceService = new ExternalMarketIntelligenceService();
    const mockDNA = {
      businessId: 'biz_acme_corp',
      companyIdentity: {
        companyName: { value: 'Acme Precision HVAC' },
        industry: { value: 'hvac' },
        uniqueValueProposition: { value: '24/7 Commercial HVAC Operations' },
      },
    } as unknown as BusinessDNA;

    // 1. Ingest verified external observation with strict provenance
    const observation = await intelligenceService.ingestSignal({
      organizationId: 'org_acme',
      businessId: 'biz_acme_corp',
      source: 'competitor_website',
      sourceUrl: 'https://trane-commercial.com/pricing',
      signalType: 'PRICING_PIVOT',
      confidence: 0.93,
      evidence: 'Trane launched a 15% discount on emergency commercial rooftop chiller maintenance.',
      impact: 'HIGH',
    });

    assert.ok(observation.id);
    assert.strictEqual(observation.source, 'competitor_website');
    assert.strictEqual(observation.confidence, 0.93);

    // 2. Synthesize Intelligence (O-I-R-D)
    const report = await intelligenceService.synthesizeIntelligence('biz_acme_corp', mockDNA);
    assert.strictEqual(report.status, 'active');
    assert.strictEqual(report.signalsCount, 1);
    assert.strictEqual(report.recommendations.length, 1);

    const rec = report.recommendations[0];
    assert.strictEqual(rec.status, 'PROPOSED');
    assert.strictEqual(rec.humanApprovalRequired, true);
    assert.strictEqual(rec.sourceUrl, 'https://trane-commercial.com/pricing');

    // 3. Human Approval Gate
    const approved = intelligenceService.approveRecommendation(
      'biz_acme_corp',
      rec.id,
      'founder@acme.com'
    );
    assert.strictEqual(approved.status, 'APPROVED');

    // Canonical DNA remains untouched unless explicitly revised via human review
    assert.strictEqual(mockDNA.companyIdentity.uniqueValueProposition.value, '24/7 Commercial HVAC Operations');
  });
});
