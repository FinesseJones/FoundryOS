import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ContextBuilder } from '../../context';
import { ContentAgent } from '../../agents/content-agent';
import { BrandAgent } from '../../agents/brand-agent';
import { LeadAgent } from '../../agents/lead-agent';
import { WebsiteAgent } from '../../agents/website-agent';
import { LLMProviderGateway } from '../../providers/llm-provider-factory';

describe('Autonomous Agent & Centralized LLM Gateway Connectivity Suite', () => {
  it('1. ContentAgent executes via LLMProviderGateway without hardcoded sentences', async () => {
    const contextBuilder = new ContextBuilder();
    const contentAgent = new ContentAgent(contextBuilder, LLMProviderGateway);

    const taskResult = await contentAgent.executeTask({
      taskId: 'task_content_test_1',
      businessId: 'biz_test_saas',
      role: 'content',
      taskType: 'content_generation',
      prompt: 'Formulate an executive value proposition post for LinkedIn targeting enterprise leaders.',
      targetChannel: 'LinkedIn',
    });

    assert.strictEqual(taskResult.success, true);
    assert.strictEqual(taskResult.agentRole, 'content');
    assert.ok(taskResult.outputSummary.includes('LinkedIn'));
    assert.ok(typeof taskResult.outputData.draftText === 'string');
    assert.ok((taskResult.outputData.draftText as string).length > 20);

    // Verify it was generated through the gateway
    assert.strictEqual(taskResult.outputData.generatedBy, 'NVIDIA-NIM-LLM-Gateway');
  });

  it('2. BrandAgent performs strategic positioning audit through LLM Gateway', async () => {
    const contextBuilder = new ContextBuilder();
    const brandAgent = new BrandAgent(contextBuilder, LLMProviderGateway);

    const taskResult = await brandAgent.executeTask({
      taskId: 'task_brand_test_1',
      businessId: 'biz_test_saas',
      role: 'brand',
      taskType: 'brand_analysis',
      prompt: 'Evaluate our brand voice consistency against enterprise SaaS standards.',
    });

    assert.strictEqual(taskResult.success, true);
    assert.strictEqual(taskResult.agentRole, 'brand');
    assert.ok(typeof taskResult.outputData.analysis === 'string');
    assert.strictEqual(taskResult.outputData.auditedBy, 'NVIDIA-NIM-LLM-Gateway');
  });

  it('3. LeadAgent synthesizes custom domain Opportunity Pillars dynamically', async () => {
    const contextBuilder = new ContextBuilder();
    const leadAgent = new LeadAgent(contextBuilder, LLMProviderGateway);

    const leads = await leadAgent.discoverLeads({
      industry: 'healthcare',
      customTargetDomain: 'https://mayo-partner-clinic.org',
    });

    assert.strictEqual(leads.length, 1);
    const lead = leads[0];
    assert.strictEqual(lead.website, 'https://mayo-partner-clinic.org');
    assert.ok(lead.pillarFinancialPain.length > 5);
    assert.ok(lead.pillarProcessGap.length > 5);
    assert.ok(lead.pillarStakeholderAlignment.length > 5);
    assert.strictEqual(lead.isAiSourced, true);
  });

  it('4. WebsiteAgent performs conversion optimization analysis via LLM Gateway', async () => {
    const contextBuilder = new ContextBuilder();
    const websiteAgent = new WebsiteAgent(contextBuilder, LLMProviderGateway);

    const taskResult = await websiteAgent.executeTask({
      taskId: 'task_website_test_1',
      businessId: 'biz_test_saas',
      role: 'website',
      taskType: 'brand_analysis',
      prompt: 'Audit main CTA conversion strength and propose headline variants.',
    });

    assert.strictEqual(taskResult.success, true);
    assert.ok(typeof taskResult.outputData.croAnalysis === 'string');
    assert.strictEqual(taskResult.outputData.auditedBy, 'NVIDIA-NIM-LLM-Gateway');
  });
});
