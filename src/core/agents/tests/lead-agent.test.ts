import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LeadAgent } from '../lead-agent';
import { ContextBuilder } from '../../context';
import { AgentTaskRequest } from '../agent.types';
import { createDefaultBusinessDNA } from '../../knowledge';

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
  assert.equal(saasLeads.length, 2);
  assert.ok(saasLeads[0].companyName.length > 0);
  assert.ok(saasLeads[0].pillarFinancialPain.includes('$'));
  assert.ok(saasLeads[0].pillarProcessGap.length > 10);
  assert.ok(saasLeads[0].pillarStakeholderAlignment.length > 5);
  assert.equal(saasLeads[0].isAiSourced, true);

  const legalLeads = await leadAgent.discoverLeads({ industry: 'legal', batchSize: 1 });
  assert.equal(legalLeads.length, 1);
  assert.ok(legalLeads[0].companyName.includes('Law') || legalLeads[0].companyName.includes('Partners') || legalLeads[0].companyName.includes('Compliance'));
});

test('LeadAgent audits a custom target domain and synthesizes customized pillars', async () => {
  const contextBuilder = new ContextBuilder();
  const leadAgent = new LeadAgent(contextBuilder);

  const customLeads = await leadAgent.discoverLeads({
    customTargetDomain: 'https://globallogistics.com/services'
  });

  assert.equal(customLeads.length, 1);
  assert.ok(customLeads[0].companyName.includes('Globallogistics') || customLeads[0].companyName.includes('GlobalLogistics'));
  assert.equal(customLeads[0].website, 'https://globallogistics.com');
  assert.ok(customLeads[0].pillarFinancialPain.includes('$1.2M'));
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
