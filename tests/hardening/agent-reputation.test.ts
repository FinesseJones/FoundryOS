import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BusinessDNARepository, AuditRepository } from '../../src/core/persistence/repositories';
import { createDefaultBusinessDNA } from '../../src/core/knowledge';
import { AgentIdentityRegistry } from '../../src/core/agents/agent-identity';
import { AgentReputationService } from '../../src/core/agents/agent-reputation-service';

test('Prompt 6: Agent Metrics Collection & Summary Aggregation', async () => {
  const dnaRepo = new BusinessDNARepository();
  const auditRepo = new AuditRepository();
  const identityRegistry = new AgentIdentityRegistry();

  const orgId = 'org_rep_1';
  const bizId = 'biz_rep_1';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const repService = new AgentReputationService(dnaRepo, identityRegistry, auditRepo);

  // Record 3 successful metrics for @content agent
  await repService.recordExecutionMetric({
    organizationId: orgId, businessId: bizId, agentIdOrRole: 'content', executionTimeMs: 400, tokensUsed: 1200, success: true, feedbackScore: 5.0,
  });
  await repService.recordExecutionMetric({
    organizationId: orgId, businessId: bizId, agentIdOrRole: 'content', executionTimeMs: 500, tokensUsed: 1500, success: true, feedbackScore: 4.8,
  });
  await repService.recordExecutionMetric({
    organizationId: orgId, businessId: bizId, agentIdOrRole: 'content', executionTimeMs: 600, tokensUsed: 1300, success: true, feedbackScore: 5.0,
  });

  const summary = await repService.getAgentPerformanceSummary(orgId, bizId, 'content');

  assert.equal(summary.role, 'content');
  assert.equal(summary.totalExecutions, 3);
  assert.equal(summary.successRate, 1.0);
  assert.equal(summary.avgExecutionTimeMs, 500);
  assert.equal(summary.avgTokensPerTask, 1333);
  assert.ok(summary.reputationScore >= 95, 'Reputation score for 100% success rate should be >= 95');
  assert.equal(summary.reputationBadge, 'EXCELLENT');
});

test('Prompt 6: Reputation Scoring Algorithm & Badging (NEEDS_IMPROVEMENT / CRITICAL_RISK)', async () => {
  const dnaRepo = new BusinessDNARepository();
  const identityRegistry = new AgentIdentityRegistry();

  const orgId = 'org_rep_2';
  const bizId = 'biz_rep_2';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const repService = new AgentReputationService(dnaRepo, identityRegistry);

  // Record failing metrics for @publishing agent
  for (let i = 0; i < 5; i++) {
    await repService.recordExecutionMetric({
      organizationId: orgId,
      businessId: bizId,
      agentIdOrRole: 'publishing',
      executionTimeMs: 8000,
      tokensUsed: 9000,
      success: false,
      feedbackScore: 1.0,
    });
  }

  const summary = await repService.getAgentPerformanceSummary(orgId, bizId, 'publishing');

  assert.equal(summary.totalExecutions, 5);
  assert.equal(summary.successRate, 0.0);
  assert.ok(summary.reputationScore < 60, 'Failing agent reputation score must fall below 60');
  assert.equal(summary.reputationBadge, 'CRITICAL_RISK');
});

test('Prompt 6: Multi-Agent Analytics Dashboard', async () => {
  const dnaRepo = new BusinessDNARepository();
  const identityRegistry = new AgentIdentityRegistry();

  const orgId = 'org_rep_dash';
  const bizId = 'biz_rep_dash';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizId), orgId);

  const repService = new AgentReputationService(dnaRepo, identityRegistry);

  await repService.recordExecutionMetric({
    organizationId: orgId, businessId: bizId, agentIdOrRole: 'brand', executionTimeMs: 300, tokensUsed: 800, success: true,
  });
  await repService.recordExecutionMetric({
    organizationId: orgId, businessId: bizId, agentIdOrRole: 'analytics', executionTimeMs: 450, tokensUsed: 1100, success: true,
  });

  const dashboard = await repService.getAgentAnalyticsDashboard(orgId, bizId);

  assert.equal(dashboard.organizationId, orgId);
  assert.equal(dashboard.businessId, bizId);
  assert.equal(dashboard.totalAgentExecutions, 2);
  assert.equal(dashboard.activeAgentCount, 7);
  assert.ok(dashboard.overallSystemReputation >= 90);
  assert.ok(dashboard.summaries.length === 7);
  assert.ok(dashboard.recentMetrics.length === 2);
});

test('Prompt 6: Tenant Isolation Enforcement in Reputation Service', async () => {
  const dnaRepo = new BusinessDNARepository();
  const identityRegistry = new AgentIdentityRegistry();

  const orgA = 'org_tenant_a';
  const bizA = 'biz_tenant_a';
  await dnaRepo.saveDNA(createDefaultBusinessDNA(bizA), orgA);

  const repService = new AgentReputationService(dnaRepo, identityRegistry);

  await repService.recordExecutionMetric({
    organizationId: orgA, businessId: bizA, agentIdOrRole: 'security', executionTimeMs: 200, tokensUsed: 500, success: true,
  });

  // Hacker attempting cross-tenant dashboard access throws Tenant Security Violation
  await assert.rejects(
    async () => {
      await repService.getAgentAnalyticsDashboard('unauthorized_hacker_org', bizA);
    },
    /Tenant Security Violation/i,
    'Cross-tenant dashboard access must throw Tenant Security Violation'
  );
});
