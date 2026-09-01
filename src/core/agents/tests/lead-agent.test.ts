import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { LeadAgent } from '../lead-agent';
import { ContextBuilder } from '../../context';
import { AgentTaskRequest } from '../agent.types';
import { createDefaultBusinessDNA } from '../../knowledge';
import { LLMProviderGateway } from '../../providers/llm-provider-factory';

const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);

beforeEach(() => {
  LLMProviderGateway.executeWithFallback = async (request) => {
    const prompt = request.prompt || '';
    const isCustom = prompt.includes('globallogistics.com');
    const company = isCustom ? 'GlobalLogistics Enterprise' : 'Apex Cloud Solutions';
    const domain = isCustom ? 'https://globallogistics.com' : 'https://apexcloud.io';

    const text = JSON.stringify({
      industry: 'SAAS',
      targetRegion: 'National',
      discoveredLeads: [
        {
          id: 101,
          companyName: company,
          website: domain,
          primaryContact: 'Sarah Jenkins (VP Growth)',
          currentStage: 'Discovery',
          status: 'High Priority',
          pillarFinancialPain: '$1.2M in annual operational drag and pipeline leaks',
          pillarProcessGap: 'Legacy monolithic architecture with slow onboarding',
          pillarStakeholderAlignment: 'CMO & VP Product (Identified Sponsor)',
          industry: 'SAAS',
          estimatedRevenueLoss: '$1.2M/yr',
          opportunityScore: 94,
          isAiSourced: true,
          discoveredAt: new Date().toISOString(),
        }
      ],
      executiveProspectingSummary: 'Discovered high-priority enterprise opportunity.',
    });

    return {
      text,
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150, estimatedCostUsd: 0.0001, latencyMs: 5 },
    };
  };
});

afterEach(() => {
  LLMProviderGateway.executeWithFallback = originalExecute;
});

test('LeadAgent initializes with proper role and access rights', () => {
  const contextBuilder = new ContextBuilder();
  const leadAgent = new LeadAgent(contextBuilder);

  assert.equal(leadAgent.role, 'lead');
  assert.equal(leadAgent.name, 'Lead Prospecting Agent');
  assert.ok(leadAgent.canWriteDomain('leads'));
  assert.ok(leadAgent.canWriteDomain('pipeline_opportunities'));
  assert.equal(leadAgent.canWriteDomain('publishing_history'), false);
});

test('LeadAgent discovers leads across industries with 3 Opportunity Pillars', async () => {
  const contextBuilder = new ContextBuilder();
  const leadAgent = new LeadAgent(contextBuilder);

  const saasLeads = await leadAgent.discoverLeads({ industry: 'saas', batchSize: 2 });
  assert.ok(saasLeads.length > 0);
  assert.ok(saasLeads[0].companyName.length > 0);
  assert.ok(saasLeads[0].pillarFinancialPain.includes('$') || saasLeads[0].pillarFinancialPain.length > 10);
  assert.ok(saasLeads[0].pillarProcessGap.length > 5);
  assert.ok(saasLeads[0].pillarStakeholderAlignment.length > 3);
  assert.equal(saasLeads[0].isAiSourced, true);

  const legalLeads = await leadAgent.discoverLeads({ industry: 'legal', batchSize: 1 });
  assert.ok(legalLeads.length > 0);
  assert.ok(legalLeads[0].companyName.length > 0);
  assert.ok(legalLeads[0].pillarFinancialPain.length > 0);
});

test('LeadAgent audits a custom target domain and synthesizes customized pillars', async () => {
  const contextBuilder = new ContextBuilder();
  const leadAgent = new LeadAgent(contextBuilder);

  const customLeads = await leadAgent.discoverLeads({
    customTargetDomain: 'https://globallogistics.com/services'
  });

  assert.equal(customLeads.length, 1);
  assert.ok(customLeads[0].companyName.length > 0);
  assert.ok(customLeads[0].website.includes('globallogistics.com'));
  assert.ok(customLeads[0].pillarFinancialPain.includes('$') || customLeads[0].pillarFinancialPain.length > 10);
  assert.equal(customLeads[0].currentStage, 'Discovery');
  assert.equal(customLeads[0].status, 'High Priority');
});

test('LeadAgent executes standard AgentTaskRequest with Cognitive Engine', async () => {
  const dna = createDefaultBusinessDNA('biz_lead_1', {
    companyIdentity: { companyName: { value: 'Growth Advisors' } },
  });
  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  const leadAgent = new LeadAgent(contextBuilder);
  const request: AgentTaskRequest = {
    taskId: 'task_lead_1',
    businessId: 'biz_lead_1',
    role: 'lead',
    taskType: 'brand_analysis',
    prompt: 'Prospect 2 enterprise SaaS leads needing digital transformation',
    payload: {
      industry: 'saas',
      batchSize: 2
    }
  };

  const result = await leadAgent.executeTask(request);
  assert.equal(result.agentRole, 'lead');
  assert.equal(result.success, true);
  assert.ok(result.outputSummary.includes('Lead Prospecting Agent identified'));
  assert.ok(Array.isArray(result.outputData.discoveredLeads));
});
