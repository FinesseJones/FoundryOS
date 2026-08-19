import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  AutomationEngine,
  EventBus,
  TriggerEngine,
  ApprovalManager,
  NotificationDispatcher,
  WorkflowDefinition,
  AutomationEvent,
} from '../index';
import { createDefaultBusinessDNA } from '../../knowledge';

test('EventBus publishes events to subscribers', async () => {
  const bus = new EventBus();
  let receivedTopic = '';

  bus.subscribe('content_generated', (evt) => {
    receivedTopic = evt.topic;
  });

  await bus.emit({
    topic: 'content_generated',
    businessId: 'biz_auto_1',
    source: 'content_agent',
    payload: { draftId: 'draft_100' },
  });

  assert.equal(receivedTopic, 'content_generated');
});

test('TriggerEngine matches rules based on event topic and filter condition', () => {
  const engine = new TriggerEngine();
  engine.registerRule({
    id: 'rule_1',
    name: 'Content Generation Trigger',
    triggerType: 'event',
    topic: 'content_generated',
    targetWorkflowId: 'wf_review_1',
    active: true,
  });

  const event: AutomationEvent = {
    id: 'evt_1',
    topic: 'content_generated',
    businessId: 'biz_auto_2',
    source: 'content_agent',
    payload: {},
    timestamp: new Date().toISOString(),
  };

  const matched = engine.evaluateEvent(event);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].targetWorkflowId, 'wf_review_1');
});

test('ApprovalManager tracks pending requests and logs human resolutions', () => {
  const manager = new ApprovalManager();

  const req = manager.createRequest({
    workflowRunId: 'wfrun_1',
    businessId: 'biz_auto_3',
    actionTitle: 'Publish LinkedIn Post',
    description: 'Post requires brand manager signoff',
    proposedByAgent: 'content',
  });

  assert.equal(req.status, 'pending');
  assert.equal(manager.listPendingRequests('biz_auto_3').length, 1);

  const resolved = manager.resolveRequest(req.id, 'approved', 'user/john@example.com', 'Looks great!');
  assert.equal(resolved.status, 'approved');
  assert.equal(resolved.reviewedBy, 'user/john@example.com');
  assert.equal(manager.listPendingRequests('biz_auto_3').length, 0);
});

test('NotificationDispatcher sends alerts across channels and manages unread state', () => {
  const dispatcher = new NotificationDispatcher();

  const notif = dispatcher.dispatch({
    businessId: 'biz_auto_4',
    title: 'High Risk Alert',
    body: 'Brand voice drift detected in campaign post',
    severity: 'warning',
    channels: ['in_app', 'email'],
  });

  assert.equal(notif.read, false);
  assert.equal(dispatcher.listUnread('biz_auto_4').length, 1);

  dispatcher.markAsRead(notif.id);
  assert.equal(dispatcher.listUnread('biz_auto_4').length, 0);
});

test('AutomationEngine orchestrates full end-to-end event-to-workflow pipeline', async () => {
  const autoEngine = new AutomationEngine();
  const dna = createDefaultBusinessDNA('biz_auto_full', {
    companyIdentity: { companyName: { value: 'AutoBrand Inc' } },
  });
  autoEngine.contextBuilder.registerBusinessDNA(dna);

  // Register workflow definition
  const wfDef: WorkflowDefinition = {
    id: 'wf_brand_launch',
    name: 'Brand Launch Sequence',
    description: 'Execute brand audit and content generation',
    autoApproveLowRisk: false,
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: 'step_1',
        name: 'Brand Audit Step',
        agentRole: 'brand',
        promptTemplate: 'Audit brand identity',
      },
      {
        id: 'step_2',
        name: 'Generate Launch Draft',
        agentRole: 'content',
        promptTemplate: 'Write launch post',
        requiresApproval: true,
      },
    ],
  };

  autoEngine.workflowEngine.registerWorkflow(wfDef);

  // Register trigger rule
  autoEngine.triggerEngine.registerRule({
    id: 'trig_launch',
    name: 'On DNA Updated Trigger',
    triggerType: 'event',
    topic: 'business_dna_updated',
    targetWorkflowId: 'wf_brand_launch',
    active: true,
  });

  // Emit event
  const result = await autoEngine.handleEvent({
    id: 'evt_dna_upd',
    topic: 'business_dna_updated',
    businessId: 'biz_auto_full',
    source: 'user',
    payload: { updatedField: 'companyIdentity' },
    timestamp: new Date().toISOString(),
  });

  assert.equal(result.triggeredRulesCount, 1);
  assert.equal(result.executedWorkflowsCount, 1);
  assert.ok(result.pendingApprovalsCount > 0);
  assert.ok(result.dispatchedNotificationsCount > 0);
});
