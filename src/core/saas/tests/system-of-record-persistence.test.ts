import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountManager } from '../auth';

describe('Authoritative Organization System of Record Persistence Suite', () => {
  let manager: AccountManager;

  beforeEach(() => {
    manager = AccountManager.getInstance();
    manager.clearAll();
  });

  it('1. Organization Database persists full state tree (DNA, Insights, Artifacts, Approvals, Tasks)', async () => {
    const { session } = await manager.registerAccount({
      email: 'founder@tacfos.tech',
      password: 'StrongFounderPassword123!',
      name: 'Finesse Jones',
    });

    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'TACF Global',
      industry: 'technology_saas',
    });

    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Production Core',
    });

    // 1. Business DNA
    await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'TACF Global',
      websiteUrl: 'https://tacfos.tech',
      mission: 'Autonomous enterprise operating system.',
      uvp: 'Closed-loop Business DNA with verified intelligence.',
    });

    // 2. Save Insights
    const insight = await manager.saveInsight(session.token, org.id, {
      title: 'Conversion Choke-Point Detected',
      category: 'sales',
      description: 'Mobile demo request drop-off is 48% higher on older browsers.',
      priority: 'HIGH',
      confidence: 0.94,
    });
    assert.ok(insight.id);

    // 3. Save Strategy Recommendation
    const recommendation = await manager.saveRecommendation(session.token, org.id, {
      title: 'Deploy Headless Interactive Intake',
      category: 'cro',
      impact: 'Estimated +32% qualified lead conversion',
      status: 'PROPOSED',
    });
    assert.ok(recommendation.id);

    // 4. Save Generated Artifact
    const artifact = await manager.saveArtifact(session.token, org.id, {
      title: 'Q3 Enterprise Positioning Brief',
      type: 'copy_brief',
      content: 'Bold & Disruptive value narrative for enterprise executives.',
      channel: 'LinkedIn',
    });
    assert.ok(artifact.id);

    // 5. Save Human Approval Item
    const approval = await manager.saveApproval(session.token, org.id, {
      artifactId: artifact.id,
      agentRole: 'content',
      status: 'PENDING',
      confidenceScore: 0.92,
    });
    assert.strictEqual(approval.status, 'PENDING');

    // 6. Update Approval Item
    const updatedApproval = await manager.updateApproval(
      session.token,
      org.id,
      approval.id,
      'APPROVED',
      'Verified alignment with CEO mission.'
    );
    assert.strictEqual(updatedApproval.status, 'APPROVED');

    // 7. Full Organization State Bundle Query
    const state = await manager.loadOrganizationState(session.token, org.id);
    assert.strictEqual(state.organization.name, 'TACF Global');
    assert.strictEqual(state.businessDNA.companyIdentity.companyName, 'TACF Global');
    assert.strictEqual(state.insights.length, 1);
    assert.strictEqual(state.insights[0].title, 'Conversion Choke-Point Detected');
    assert.strictEqual(state.recommendations.length, 1);
    assert.strictEqual(state.artifacts.length, 1);
    assert.strictEqual(state.approvals.length, 1);
    assert.strictEqual(state.approvals[0].status, 'APPROVED');
  });

  it('2. Multi-Tenant Isolation: Account B cannot read or mutate Account A System of Record', async () => {
    const userA = await manager.registerAccount({
      email: 'tenant.a@tacfos.tech',
      password: 'PasswordA123!',
      name: 'Tenant A',
    });
    const orgA = await manager.createOrganization({
      sessionToken: userA.session.token,
      name: 'Org A',
    });

    const userB = await manager.registerAccount({
      email: 'tenant.b@tacfos.tech',
      password: 'PasswordB123!',
      name: 'Tenant B',
    });

    // Add secret artifact to Org A
    await manager.saveArtifact(userA.session.token, orgA.id, {
      title: 'Secret Trade Strategy',
      type: 'strategic_plan',
      content: 'Confidential proprietary formula.',
    });

    // Tenant B attempts to read Org A state
    await assert.rejects(
      async () => {
        await manager.loadOrganizationState(userB.session.token, orgA.id);
      },
      /Security Violation|not authorized/
    );

    // Tenant B attempts to inject an insight into Org A
    await assert.rejects(
      async () => {
        await manager.saveInsight(userB.session.token, orgA.id, {
          title: 'Malicious Injected Insight',
        });
      },
      /Security Violation|not authorized/
    );
  });
});
