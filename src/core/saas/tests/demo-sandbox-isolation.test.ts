import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountManager, SaaSAuthManager } from '../auth';

describe('Demo Sandbox & Tenant Security Hardening Suite', () => {
  let manager: AccountManager;
  let saasAuth: SaaSAuthManager;

  beforeEach(() => {
    manager = AccountManager.getInstance();
    manager.clearAll();
    saasAuth = new SaaSAuthManager();
  });

  it('1. Demo Session is strictly isolated with DEMO_VIEWER role and simulated sandbox org', async () => {
    const demo = await manager.launchDemoSession();

    assert.strictEqual(demo.session.role, 'DEMO_VIEWER');
    assert.strictEqual(demo.session.organizationId, 'org_demo_sandbox');
    assert.strictEqual(demo.session.organizationName, 'Acme Corp (Demo Sandbox)');
    assert.strictEqual(demo.organization.id, 'org_demo_sandbox');
    assert.strictEqual(demo.workspace.id, 'ws_demo_sandbox');
    assert.strictEqual(demo.businessDNA.companyIdentity.companyName, 'Acme Corp (Demo Sandbox)');
  });

  it('2. DEMO_VIEWER has zero administrative permissions in permission evaluator', async () => {
    const demo = await manager.launchDemoSession();

    assert.strictEqual(saasAuth.hasPermission(demo.session, 'manage_billing'), false);
    assert.strictEqual(saasAuth.hasPermission(demo.session, 'manage_team'), false);
    assert.strictEqual(saasAuth.hasPermission(demo.session, 'approve_task'), false);
  });

  it('3. Demo viewer cannot create organizations or mutate live tenant Business DNA', async () => {
    const demo = await manager.launchDemoSession();

    // 1. Cannot create new organizations
    await assert.rejects(async () => {
      await manager.createOrganization({
        sessionToken: demo.session.token,
        name: 'Malicious Org Attempt',
      });
    }, /Demo viewers cannot create organizations/);

    // 2. Cannot create new workspaces
    await assert.rejects(async () => {
      await manager.createWorkspace({
        sessionToken: demo.session.token,
        organizationId: 'org_demo_sandbox',
        name: 'Hacked WS',
      });
    }, /Demo viewers cannot create workspaces/);

    // 3. Cannot modify Business DNA
    assert.throws(() => {
      manager.updateBusinessDNA(demo.session.token, 'org_demo_sandbox', {
        companyIdentity: {
          companyName: 'Hacked Sandbox',
          industry: 'technology_saas',
          stage: 'growth',
          mission: 'Hacked',
          uniqueValueProposition: 'Hacked',
          coreValues: [],
        },
      });
    }, /Demo viewers cannot modify Business DNA/);
  });

  it('4. Real founder registration has ADMIN role and is completely isolated from demo sandbox', async () => {
    // 1. Founder registration
    const founder = await manager.registerAccount({
      email: 'founder@tacfos.tech',
      password: 'RealFounderPassword123!',
      name: 'Founder Master',
    });

    assert.strictEqual(founder.user.role, 'ADMIN');
    assert.strictEqual(founder.session.role, 'ADMIN');
    assert.strictEqual(saasAuth.hasPermission(founder.session, 'manage_billing'), true);
    assert.strictEqual(saasAuth.hasPermission(founder.session, 'manage_team'), true);

    const founderOrg = await manager.createOrganization({
      sessionToken: founder.session.token,
      name: 'TACF Autonomous Enterprise',
    });

    // 2. Demo session launched by external visitor
    const demo = await manager.launchDemoSession();

    // 3. Demo visitor attempting to read founder's org or DNA is blocked by security guard
    assert.throws(() => {
      manager.getBusinessDNA(demo.session.token, founderOrg.id);
    }, /Security Violation: Demo viewers cannot access live tenant/);
  });
});
