import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LearningRepository,
  ConversationContextRepository,
  CampaignHistoryRepository,
} from '../repositories';

test('Prompt 4C Memory Persistence: LearningRepository, ConversationContextRepository, CampaignHistoryRepository', async () => {
  const learningRepo = new LearningRepository();
  const convRepo = new ConversationContextRepository();
  const campaignRepo = new CampaignHistoryRepository();

  // 1. LearningRepository
  const learn = await learningRepo.recordLearning({
    organizationId: 'org_apex',
    businessId: 'biz_4c_001',
    learnedFrom: 'Google Reviews Feed',
    knowledgeAcquired: 'Customers increasingly ask about 0% APR financing for AC replacements.',
    confidenceScore: 0.94,
    actionsExecuted: ['Updated sales script', 'Updated FAQ'],
  });
  assert.ok(learn.id);

  const learnings = await learningRepo.listLearnings({ organizationId: 'org_apex', businessId: 'biz_4c_001' });
  assert.equal(learnings.length, 1);
  assert.equal(learnings[0].confidenceScore, 0.94);

  // Cross-tenant security check
  const crossLearnings = await learningRepo.listLearnings({ organizationId: 'org_intruder', businessId: 'biz_4c_001' });
  assert.equal(crossLearnings.length, 0);

  // 2. ConversationContextRepository
  const conv = await convRepo.saveContext({
    organizationId: 'org_apex',
    businessId: 'biz_4c_001',
    sessionTitle: 'Executive Marketing Strategy Session',
    messages: [
      { sender: 'user', text: 'Can we launch a summer campaign in zip 77058?', timestamp: new Date().toISOString() },
      { sender: 'marketing_agent', text: 'Yes, created Facebook offer targeting zip 77058.', timestamp: new Date().toISOString() },
    ],
  });
  assert.ok(conv.id);

  const convs = await convRepo.getContext({ organizationId: 'org_apex', businessId: 'biz_4c_001' });
  assert.equal(convs.length, 1);
  assert.equal(convs[0].messages.length, 2);

  // 3. CampaignHistoryRepository
  const campaign = await campaignRepo.recordCampaign({
    organizationId: 'org_apex',
    businessId: 'biz_4c_001',
    campaignName: 'Local AC Repair Summer Special',
    channel: 'facebook',
    status: 'active',
    roi: 4.8,
    metrics: { impressions: 14200, clicks: 880, conversions: 42 },
  });
  assert.ok(campaign.id);

  const campaigns = await campaignRepo.listCampaigns({ organizationId: 'org_apex', businessId: 'biz_4c_001' });
  assert.equal(campaigns.length, 1);
  assert.equal(campaigns[0].roi, 4.8);
});
