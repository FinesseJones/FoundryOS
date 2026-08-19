import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ContextBuilder,
  BusinessDNARetriever,
  MemoryRetriever,
  RecentActivityRetriever,
  CampaignContextRetriever,
  ConversationContextRetriever,
  KnowledgeRanker,
  TokenBudgetOptimizer,
  MemoryRecord,
  RecentActivityItem,
  CampaignContextData,
  CandidateKnowledgeItem,
} from '../index';
import { createDefaultBusinessDNA } from '../../knowledge';

test('BusinessDNARetriever extracts task-tailored slices', () => {
  const dna = createDefaultBusinessDNA('biz_001', {
    companyIdentity: {
      companyName: { value: 'Apex AI Solutions' },
    },
  });

  const contentGenSlice = BusinessDNARetriever.retrieveSlice(dna, {
    taskType: 'content_generation',
  });
  assert.ok(contentGenSlice.companyIdentity);
  assert.ok(contentGenSlice.brandVoice);

  const promptText = BusinessDNARetriever.formatForPrompt(contentGenSlice);
  assert.ok(promptText.includes('Apex AI Solutions'));
});

test('MemoryRetriever handles keyword matching, importance, and decay', () => {
  const memoryStore = new MemoryRetriever([
    {
      id: 'mem_1',
      businessId: 'biz_001',
      memoryType: 'semantic',
      content: { summary: 'Product launch pricing was set at $99/mo' },
      importance: 0.9,
      tags: ['pricing', 'launch'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mem_2',
      businessId: 'biz_001',
      memoryType: 'short_term',
      content: { summary: 'User requested dark mode support' },
      importance: 0.4,
      tags: ['ui', 'feature'],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ]);

  const results = memoryStore.retrieve({
    businessId: 'biz_001',
    query: 'pricing launch details',
  });

  assert.equal(results.length, 2);
  assert.equal(results[0].id, 'mem_1');

  const formatted = MemoryRetriever.formatForPrompt(results);
  assert.ok(formatted.includes('SEMANTIC'));
  assert.ok(formatted.includes('$99/mo'));
});

test('RecentActivityRetriever formats activity history correctly', () => {
  const activityStore = new RecentActivityRetriever([
    {
      id: 'act_1',
      businessId: 'biz_001',
      action: 'published_post',
      description: 'Announced Series A funding round',
      channel: 'linkedin',
      topics: ['funding', 'growth'],
      timestamp: new Date().toISOString(),
    },
  ]);

  const activities = activityStore.retrieve({ businessId: 'biz_001' });
  assert.equal(activities.length, 1);

  const formatted = RecentActivityRetriever.formatForPrompt(activities);
  assert.ok(formatted.includes('[linkedin]'));
  assert.ok(formatted.includes('Series A'));
});

test('CampaignContextRetriever resolves active campaign directives', () => {
  const campaignStore = new CampaignContextRetriever([
    {
      campaignId: 'camp_2026',
      campaignName: 'Summer Scale 2026',
      goal: 'Acquire 500 new SaaS customers',
      targetChannels: ['linkedin', 'x'],
      keySlogans: ['Scale Without Limits'],
      contentPillars: ['Efficiency', 'Automation'],
      startDate: '2026-06-01',
      status: 'active',
    },
  ]);

  const active = campaignStore.retrieveActiveCampaign();
  assert.ok(active);
  assert.equal(active.campaignName, 'Summer Scale 2026');

  const formatted = CampaignContextRetriever.formatForPrompt(active);
  assert.ok(formatted.includes('Summer Scale 2026'));
  assert.ok(formatted.includes('Scale Without Limits'));
});

test('ConversationContextRetriever manages sliding message window', () => {
  const convStore = new ConversationContextRetriever();
  convStore.addMessage('conv_1', { role: 'user', content: 'Help me draft an email.', timestamp: '2026-07-27T10:00:00Z' });
  convStore.addMessage('conv_1', { role: 'assistant', content: 'Sure, what topic?', timestamp: '2026-07-27T10:00:05Z' });

  const history = convStore.retrieveHistory('conv_1');
  assert.equal(history.length, 2);

  const formatted = ConversationContextRetriever.formatForPrompt(history);
  assert.ok(formatted.includes('Help me draft an email.'));
  assert.ok(formatted.includes('Sure, what topic?'));
});

test('KnowledgeRanker computes multi-factor composite scores', () => {
  const candidates: CandidateKnowledgeItem[] = [
    {
      id: 'item_high',
      sourceType: 'business_dna',
      content: 'High relevance brand mission',
      relevanceScore: 0.95,
      confidenceScore: 0.9,
      recencyScore: 1.0,
      importanceScore: 0.85,
    },
    {
      id: 'item_low',
      sourceType: 'memory',
      content: 'Old low importance note',
      relevanceScore: 0.3,
      confidenceScore: 0.4,
      recencyScore: 0.2,
      importanceScore: 0.2,
    },
  ];

  const ranked = KnowledgeRanker.rankItems(candidates);
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].id, 'item_high');
  assert.ok(ranked[0].finalScore > ranked[1].finalScore);
});

test('TokenBudgetOptimizer estimates tokens and truncates safely', () => {
  const text = 'Hello world! '.repeat(500); // ~6000 chars -> ~1578 tokens
  const estimated = TokenBudgetOptimizer.estimateTokens(text);
  assert.ok(estimated > 1000);

  const truncated = TokenBudgetOptimizer.truncateToTokenBudget(text, 200);
  const truncatedEst = TokenBudgetOptimizer.estimateTokens(truncated);
  assert.ok(truncatedEst <= 220);
  assert.ok(truncated.includes('Context truncated to fit token budget'));
});

test('ContextBuilder orchestrates full end-to-end context payload', async () => {
  const dna = createDefaultBusinessDNA('biz_full_001', {
    companyIdentity: {
      companyName: { value: 'HyperDrive AI' },
    },
  });

  const memoryStore = new MemoryRetriever([
    {
      id: 'mem_full_1',
      businessId: 'biz_full_001',
      memoryType: 'long_term',
      content: { summary: 'HyperDrive key moat is ultra-low latency' },
      importance: 0.9,
      tags: ['moat', 'tech'],
      createdAt: new Date().toISOString(),
    },
  ]);

  const activityStore = new RecentActivityRetriever([
    {
      id: 'act_full_1',
      businessId: 'biz_full_001',
      action: 'posted_content',
      description: 'Launched v2.0 benchmark report',
      channel: 'linkedin',
      topics: ['launch'],
      timestamp: new Date().toISOString(),
    },
  ]);

  const campaignStore = new CampaignContextRetriever([
    {
      campaignId: 'camp_hd_1',
      campaignName: 'HyperDrive Launch',
      goal: 'Drive signups for low-latency engine',
      targetChannels: ['linkedin'],
      keySlogans: ['Speed is Everything'],
      contentPillars: ['Performance'],
      startDate: '2026-07-01',
      status: 'active',
    },
  ]);

  const builder = new ContextBuilder({
    memoryRetriever: memoryStore,
    activityRetriever: activityStore,
    campaignRetriever: campaignStore,
  });

  builder.registerBusinessDNA(dna);

  const engineContext = await builder.buildContext({
    businessId: 'biz_full_001',
    taskType: 'content_generation',
    userPrompt: 'Write a LinkedIn post about our ultra-low latency engine launch',
    maxTokenBudget: 4000,
    targetChannel: 'linkedin',
    activeCampaignId: 'camp_hd_1',
  });

  assert.equal(engineContext.request.businessId, 'biz_full_001');
  assert.ok(engineContext.systemDirective.includes('HyperDrive AI'));
  assert.ok(engineContext.formattedPromptContext.includes('Business DNA Context'));
  assert.ok(engineContext.formattedPromptContext.includes('Active Campaign Context'));
  assert.ok(engineContext.formattedPromptContext.includes('Relevant Business Memory'));
  assert.ok(engineContext.tokenAllocation.totalUsed > 0);
  assert.ok(engineContext.tokenAllocation.totalUsed <= 4000);
});
