import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GovernedActionDispatcher } from '../../connectors/governed-connectors';
import { OutcomeLearningEngine } from '../../learning/outcome-learning-engine';
import { MemoryRetriever } from '../../context/memory-retrieval';

describe('TACF v1.2-v1.4 — Governed Execution & Closed-Loop Learning Loop Suite', () => {
  it('1. Governed Action Dispatcher enforces 4-tier risk security boundaries and human approval gates', async () => {
    const dispatcher = new GovernedActionDispatcher();

    // 1. LOW Risk Action (Internal Draft / Staging) -> Auto-Approved
    const lowRiskAction = dispatcher.proposeAction({
      organizationId: 'org_acme',
      businessId: 'biz_acme',
      proposedByAgent: 'content',
      connectorType: 'internal_staging',
      title: 'Stage Draft Hero Copy',
      description: 'Draft internal tagline variants.',
      payload: { copy: 'Autonomous Business AI' },
      expectedOutcome: 'Staged for team review',
    });

    assert.strictEqual(lowRiskAction.riskLevel, 'LOW');
    assert.strictEqual(lowRiskAction.requiresHumanApproval, false);
    assert.strictEqual(lowRiskAction.approvalStatus, 'AUTO_APPROVED');

    const lowRiskExecution = await dispatcher.executeAction(lowRiskAction.id);
    assert.strictEqual(lowRiskExecution.success, true);
    assert.ok(lowRiskExecution.externalDeliveryId);

    // 2. HIGH Risk Action (Outbound Email) -> Requires Human Approval
    const highRiskAction = dispatcher.proposeAction({
      organizationId: 'org_acme',
      businessId: 'biz_acme',
      proposedByAgent: 'content',
      connectorType: 'email_outbound',
      title: 'Broadcast Summer Promotion',
      description: 'Send promotion to 4,500 subscribers.',
      payload: { recipients: 4500, template: 'promo_v1' },
      expectedOutcome: '15% open rate, 4% click-through',
    });

    assert.strictEqual(highRiskAction.riskLevel, 'HIGH');
    assert.strictEqual(highRiskAction.requiresHumanApproval, true);
    assert.strictEqual(highRiskAction.approvalStatus, 'PENDING');

    // Attempting unapproved execution must be blocked with Security Violation
    await assert.rejects(
      async () => {
        await dispatcher.executeAction(highRiskAction.id);
      },
      /Security Violation/
    );

    // 3. Human Approval Gate
    dispatcher.approveAction(highRiskAction.id, 'vp_marketing@acme.com');
    assert.strictEqual(highRiskAction.approvalStatus, 'APPROVED');

    // Now execution succeeds through the governed connector
    const highRiskExecution = await dispatcher.executeAction(highRiskAction.id);
    assert.strictEqual(highRiskExecution.success, true);
    assert.ok(highRiskExecution.auditEventId);
  });

  it('2. Closed-Loop Learning: Outcome telemetry synthesizes lessons and persists them to Institutional Memory', async () => {
    const memoryRetriever = new MemoryRetriever();
    const learningEngine = new OutcomeLearningEngine(memoryRetriever);
    const dispatcher = new GovernedActionDispatcher();

    // 1. Propose and approve campaign action
    const action = dispatcher.proposeAction({
      organizationId: 'org_tacf',
      businessId: 'biz_tacf',
      proposedByAgent: 'content',
      connectorType: 'social_linkedin',
      title: 'Enterprise Governance vs AI Point Tools Campaign',
      description: 'LinkedIn thought leadership campaign emphasizing multi-domain zero-trust governance.',
      payload: { channel: 'LinkedIn', targetAudience: 'Enterprise CISOs and COOs' },
      expectedOutcome: 'Generate 20 qualified demo inquiries from enterprise accounts.',
    });
    dispatcher.approveAction(action.id, 'finesse@tacfos.tech');

    // 2. Record actual outcome from telemetry
    const outcome = await learningEngine.recordOutcomeAndLearn({
      action,
      actualOutcome: 'Generated 38 qualified demo inquiries (+90% above expectation). Enterprise COOs cited zero-trust compliance as primary driver.',
      impactScore: 0.94,
      authorityLevel: 'EXECUTIVE_DECISION',
    });

    assert.ok(outcome.id);
    assert.strictEqual(outcome.persistedToMemory, true);
    assert.ok(outcome.varianceSummary.length > 5);
    assert.ok(outcome.lessonLearned.length > 5);

    // 3. Verify that Institutional Memory now contains this active Decision Record
    const retrievedDecisions = memoryRetriever.retrieveDecisions('enterprise governance linkedin', 'biz_tacf');
    assert.ok(retrievedDecisions.length >= 1);
    assert.strictEqual(retrievedDecisions[0].authorityLevel, 'EXECUTIVE_DECISION');
    assert.strictEqual(retrievedDecisions[0].status, 'ACTIVE');
    assert.ok(retrievedDecisions[0].decision.length > 5);
  });
});
