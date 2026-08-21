import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AccountManager } from '../auth';

describe('Phase 1: Client Identity & Entry Verification Suite', () => {
  let manager: AccountManager;

  beforeEach(() => {
    manager = AccountManager.getInstance();
    manager.clearAll();
  });

  it('1. You can create a real account with hashed credentials', async () => {
    const { user, session } = await manager.registerAccount({
      email: 'finesse@tacfos.tech',
      password: 'SecurePassword123!',
      name: 'Finesse Jones',
      role: 'ADMIN',
    });

    assert.ok(user.id.startsWith('usr_'), 'User ID must start with usr_');
    assert.strictEqual(user.email, 'finesse@tacfos.tech');
    assert.strictEqual(user.name, 'Finesse Jones');
    assert.strictEqual(user.role, 'ADMIN');
    assert.strictEqual((user as any).passwordHash, undefined, 'passwordHash must never be exposed');

    assert.ok(session.token.length >= 32, 'Session token must be secure');
    assert.strictEqual(session.userId, user.id);
    assert.strictEqual(session.email, user.email);

    // Verify session validity
    const validated = manager.validateSession(session.token);
    assert.ok(validated, 'Session must validate immediately');
    assert.strictEqual(validated?.userId, user.id);
  });

  it('2. You can create an organization, workspace, and enter company information', async () => {
    const { session } = await manager.registerAccount({
      email: 'founder@tacfos.tech',
      password: 'AlphaPassword456!',
      name: 'Founder Lead',
    });

    // Step A: Create Organization
    const org = await manager.createOrganization({
      sessionToken: session.token,
      name: 'TACF Autonomous Systems',
      industry: 'technology_saas',
      planTier: 'growth',
    });

    assert.ok(org.id.startsWith('org_'));
    assert.strictEqual(org.name, 'TACF Autonomous Systems');
    assert.strictEqual(org.ownerUserId, session.userId);

    // Step B: Create First Workspace
    const ws = await manager.createWorkspace({
      sessionToken: session.token,
      organizationId: org.id,
      name: 'Production Core',
      slug: 'prod-core',
    });

    assert.ok(ws.id.startsWith('ws_'));
    assert.strictEqual(ws.organizationId, org.id);
    assert.strictEqual(ws.name, 'Production Core');

    // Step C: Enter Company Information (Business DNA Profile)
    const company = await manager.saveCompanyProfile({
      sessionToken: session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'TACF Autonomous Systems',
      websiteUrl: 'https://tacfos.tech',
      industry: 'technology_saas',
      mission: 'Autonomous enterprise brand intelligence.',
      uvp: 'Closed-loop business operating system.',
      processGap: 'Manual departmental silos.',
      financialPain: '$1.5M operational drag.',
    });

    assert.strictEqual(company.companyProfile.companyName, 'TACF Autonomous Systems');
    assert.strictEqual(company.companyProfile.websiteUrl, 'https://tacfos.tech');
    assert.strictEqual(company.companyProfile.businessId, `biz_${org.id.replace(/^org_/, '')}`);
    assert.ok(company.businessDNA);

    // Verify query
    const queriedProfile = manager.getCompanyProfile(session.token, org.id);
    assert.ok(queriedProfile);
    assert.strictEqual(queriedProfile?.companyName, 'TACF Autonomous Systems');
  });

  it('3. You can log out and session is immediately invalidated', async () => {
    const { session } = await manager.registerAccount({
      email: 'client@example.com',
      password: 'SamplePassword789!',
      name: 'Client Tester',
    });

    assert.ok(manager.validateSession(session.token), 'Session must be valid before logout');

    // Log out
    manager.logout(session.token);

    assert.strictEqual(
      manager.validateSession(session.token),
      null,
      'Session must be null after logout'
    );
  });

  it('4. You can log back in: Account and Organization still exist', async () => {
    // 1. Register & setup org
    const reg = await manager.registerAccount({
      email: 'returning@tacfos.tech',
      password: 'ReturnPassword321!',
      name: 'Returning Client',
    });

    const org = await manager.createOrganization({
      sessionToken: reg.session.token,
      name: 'Apex Industries',
      industry: 'manufacturing',
    });

    const ws = await manager.createWorkspace({
      sessionToken: reg.session.token,
      organizationId: org.id,
      name: 'Apex Main',
    });

    await manager.saveCompanyProfile({
      sessionToken: reg.session.token,
      organizationId: org.id,
      workspaceId: ws.id,
      companyName: 'Apex Industries',
      websiteUrl: 'https://apex.com',
    });

    // 2. Log out
    manager.logout(reg.session.token);

    // 3. Log back in with valid credentials
    const loginResult = await manager.login({
      email: 'returning@tacfos.tech',
      password: 'ReturnPassword321!',
    });

    assert.ok(loginResult.session, 'Login must yield a new valid session');
    assert.strictEqual(loginResult.user.email, 'returning@tacfos.tech');
    assert.ok(loginResult.organization, 'Organization must still exist on login');
    assert.strictEqual(loginResult.organization?.name, 'Apex Industries');
    assert.ok(loginResult.workspace, 'Workspace must still exist on login');
    assert.strictEqual(loginResult.workspace?.name, 'Apex Main');
    assert.strictEqual(loginResult.companyProfile?.websiteUrl, 'https://apex.com');
  });

  it('5. Failed login: Wrong password rejected', async () => {
    await manager.registerAccount({
      email: 'secure@tacfos.tech',
      password: 'RightPassword123!',
      name: 'Secure User',
    });

    await assert.rejects(
      async () => {
        await manager.login({
          email: 'secure@tacfos.tech',
          password: 'WrongPassword!',
        });
      },
      /Authentication Error: Invalid email or password/
    );
  });

  it('6. Tenant Isolation: Account B CANNOT access Account A organization or workspaces', async () => {
    // Setup Account A
    const accA = await manager.registerAccount({
      email: 'alice@alpha-corp.com',
      password: 'AlicePassword123!',
      name: 'Alice Alpha',
    });

    const orgA = await manager.createOrganization({
      sessionToken: accA.session.token,
      name: 'Alpha Corp Organization',
    });

    await manager.createWorkspace({
      sessionToken: accA.session.token,
      organizationId: orgA.id,
      name: 'Alpha Confidential Workspace',
    });

    // Setup Account B
    const accB = await manager.registerAccount({
      email: 'bob@beta-corp.com',
      password: 'BobPassword456!',
      name: 'Bob Beta',
    });

    const orgB = await manager.createOrganization({
      sessionToken: accB.session.token,
      name: 'Beta Corp Organization',
    });

    // 1. Account B querying organizations only sees Org B
    const bOrgs = manager.getOrganizations(accB.session.token);
    assert.strictEqual(bOrgs.length, 1);
    assert.strictEqual(bOrgs[0].id, orgB.id);
    assert.strictEqual(bOrgs.find(o => o.id === orgA.id), undefined);

    // 2. Account B trying to query Account A workspaces directly throws Security Violation
    assert.throws(() => {
      manager.getWorkspaces(accB.session.token, orgA.id);
    }, /Security Violation: User '.*' is not authorized to access organization/);

    // 3. Account B trying to query Account A company profile throws Security Violation
    assert.throws(() => {
      manager.getCompanyProfile(accB.session.token, orgA.id);
    }, /Security Violation: User '.*' is not authorized to access organization/);

    // 4. Account B trying to create a workspace inside Account A organization throws Security Violation
    await assert.rejects(async () => {
      await manager.createWorkspace({
        sessionToken: accB.session.token,
        organizationId: orgA.id,
        name: 'Infiltrator Workspace',
      });
    }, /Security Violation: User '.*' is not authorized to access organization/);
  });
});
