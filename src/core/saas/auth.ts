export type UserRole = 'ADMIN' | 'EXECUTIVE' | 'MARKETER' | 'MEMBER';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  ownerUserId: string;
  industry: string;
  planTier: string;
  createdAt: string;
}

export interface WorkspaceRecord {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CompanyInfoRecord {
  organizationId: string;
  workspaceId: string;
  businessId: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  mission: string;
  uvp: string;
  processGap: string;
  financialPain: string;
  targetAudience: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  workspaceId?: string;
  workspaceName?: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for environments without subtle crypto
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const chr = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}`;
}

const STORAGE_KEY_AUTH = 'tacf_auth_store_v1';
const ACTIVE_SESSION_KEY = 'tacf_active_session_token_v1';

export class AccountManager {
  private static instance: AccountManager;
  private users: Map<string, UserAccount> = new Map(); // email -> account
  private organizations: Map<string, OrganizationRecord> = new Map(); // orgId -> org
  private workspaces: Map<string, WorkspaceRecord[]> = new Map(); // orgId -> workspaces[]
  private companyProfiles: Map<string, CompanyInfoRecord> = new Map(); // orgId -> companyInfo
  private sessions: Map<string, UserSession> = new Map(); // token -> session

  constructor() {
    this.loadState();
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager();
    }
    return AccountManager.instance;
  }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private loadState(): void {
    if (!this.isLocalStorageAvailable()) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.users) this.users = new Map(Object.entries(data.users));
        if (data.organizations) this.organizations = new Map(Object.entries(data.organizations));
        if (data.workspaces) this.workspaces = new Map(Object.entries(data.workspaces));
        if (data.companyProfiles) this.companyProfiles = new Map(Object.entries(data.companyProfiles));
        if (data.sessions) this.sessions = new Map(Object.entries(data.sessions));
      }
    } catch (e) {
      console.warn('TACF AccountManager: Failed to restore state from localStorage', e);
    }
  }

  private saveState(): void {
    if (!this.isLocalStorageAvailable()) return;
    try {
      const data = {
        users: Object.fromEntries(this.users),
        organizations: Object.fromEntries(this.organizations),
        workspaces: Object.fromEntries(this.workspaces),
        companyProfiles: Object.fromEntries(this.companyProfiles),
        sessions: Object.fromEntries(this.sessions),
      };
      window.localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data));
    } catch (e) {
      console.warn('TACF AccountManager: Failed to save state to localStorage', e);
    }
  }

  // ─── 1. Account Registration ──────────────────────────────────────────────

  async registerAccount(params: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<{ user: Omit<UserAccount, 'passwordHash'>; session: UserSession }> {
    const normalizedEmail = params.email.trim().toLowerCase();
    if (!normalizedEmail || !params.password) {
      throw new Error('Registration Error: Email and password are required.');
    }
    if (this.users.has(normalizedEmail)) {
      throw new Error(`Registration Error: Account with email '${normalizedEmail}' already exists.`);
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await hashPassword(params.password);
    const now = new Date().toISOString();

    const user: UserAccount = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      name: params.name.trim() || normalizedEmail.split('@')[0],
      role: params.role || 'ADMIN',
      createdAt: now,
    };

    this.users.set(normalizedEmail, user);

    // Automatically create session upon successful registration
    const session = this.createSessionInternal(user);
    this.saveState();

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, session };
  }

  // ─── 2. Authentication / Login ───────────────────────────────────────────

  async login(params: {
    email: string;
    password: string;
  }): Promise<{
    user: Omit<UserAccount, 'passwordHash'>;
    session: UserSession;
    organization?: OrganizationRecord;
    workspace?: WorkspaceRecord;
    companyProfile?: CompanyInfoRecord;
  }> {
    const normalizedEmail = params.email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);
    if (!user) {
      throw new Error('Authentication Error: Invalid email or password.');
    }

    const passwordHash = await hashPassword(params.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Authentication Error: Invalid email or password.');
    }

    // Identify user's organizations
    const userOrgs = Array.from(this.organizations.values()).filter(o => o.ownerUserId === user.id);
    const primaryOrg = userOrgs[0];
    let primaryWs: WorkspaceRecord | undefined;
    let companyProfile: CompanyInfoRecord | undefined;

    if (primaryOrg) {
      const wsList = this.workspaces.get(primaryOrg.id) || [];
      primaryWs = wsList[0];
      companyProfile = this.companyProfiles.get(primaryOrg.id);
    }

    const session = this.createSessionInternal(user, primaryOrg, primaryWs);
    this.saveState();

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      session,
      organization: primaryOrg,
      workspace: primaryWs,
      companyProfile,
    };
  }

  // ─── 3. Create Organization ──────────────────────────────────────────────

  async createOrganization(params: {
    sessionToken: string;
    name: string;
    industry?: string;
    planTier?: string;
  }): Promise<OrganizationRecord> {
    const session = this.assertSession(params.sessionToken);
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const org: OrganizationRecord = {
      id: orgId,
      name: params.name.trim(),
      ownerUserId: session.userId,
      industry: params.industry || 'technology_saas',
      planTier: params.planTier || 'growth',
      createdAt: now,
    };

    this.organizations.set(orgId, org);

    // Update active session with this organization
    session.organizationId = org.id;
    session.organizationName = org.name;
    this.sessions.set(session.token, session);

    this.saveState();
    return org;
  }

  // ─── 4. Create Workspace ──────────────────────────────────────────────────

  async createWorkspace(params: {
    sessionToken: string;
    organizationId: string;
    name: string;
    slug?: string;
  }): Promise<WorkspaceRecord> {
    const session = this.assertSession(params.sessionToken);
    this.assertOrganizationOwnership(session, params.organizationId);

    const wsId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const slug = params.slug || params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const ws: WorkspaceRecord = {
      id: wsId,
      organizationId: params.organizationId,
      name: params.name.trim(),
      slug,
      createdAt: now,
    };

    const existing = this.workspaces.get(params.organizationId) || [];
    this.workspaces.set(params.organizationId, [...existing, ws]);

    // Update session
    session.workspaceId = ws.id;
    session.workspaceName = ws.name;
    this.sessions.set(session.token, session);

    this.saveState();
    return ws;
  }

  // ─── 5. Enter & Save Company Profile (Business DNA Attachment) ─────────────

  async saveCompanyProfile(params: {
    sessionToken: string;
    organizationId: string;
    workspaceId: string;
    companyName: string;
    websiteUrl: string;
    industry?: string;
    mission?: string;
    uvp?: string;
    processGap?: string;
    financialPain?: string;
    targetAudience?: string;
  }): Promise<CompanyInfoRecord> {
    const session = this.assertSession(params.sessionToken);
    this.assertOrganizationOwnership(session, params.organizationId);

    const businessId = `biz_${params.organizationId.replace(/^org_/, '')}`;
    const record: CompanyInfoRecord = {
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      businessId,
      companyName: params.companyName.trim(),
      websiteUrl: params.websiteUrl.trim(),
      industry: params.industry || 'technology_saas',
      mission: params.mission || `To lead and transform the ${params.industry || 'industry'} space through automated intelligence.`,
      uvp: params.uvp || `Autonomous brand intelligence and automated execution for ${params.companyName.trim()}.`,
      processGap: params.processGap || 'Manual departmental workflows and lead time bottlenecks.',
      financialPain: params.financialPain || 'Lost revenue to operational friction.',
      targetAudience: params.targetAudience || 'Modern enterprise leaders and growing commercial organizations.',
      updatedAt: new Date().toISOString(),
    };

    this.companyProfiles.set(params.organizationId, record);
    this.saveState();
    return record;
  }

  // ─── 6. Tenant-Isolated Queries ──────────────────────────────────────────

  getOrganizations(sessionToken: string): OrganizationRecord[] {
    const session = this.assertSession(sessionToken);
    return Array.from(this.organizations.values()).filter(
      org => org.ownerUserId === session.userId
    );
  }

  getWorkspaces(sessionToken: string, organizationId: string): WorkspaceRecord[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.workspaces.get(organizationId) || [];
  }

  getCompanyProfile(sessionToken: string, organizationId: string): CompanyInfoRecord | null {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.companyProfiles.get(organizationId) || null;
  }

  // ─── 7. Session Validation & Lifecycle ────────────────────────────────────

  private createSessionInternal(
    user: UserAccount,
    org?: OrganizationRecord,
    ws?: WorkspaceRecord
  ): UserSession {
    const token = generateSecureToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const session: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: org?.id || '',
      organizationName: org?.name || '',
      workspaceId: ws?.id,
      workspaceName: ws?.name,
      token,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.sessions.set(token, session);
    if (this.isLocalStorageAvailable()) {
      window.localStorage.setItem(ACTIVE_SESSION_KEY, token);
    }
    return session;
  }

  validateSession(token: string): UserSession | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
      this.saveState();
      return null;
    }

    return session;
  }

  getCurrentSession(): UserSession | null {
    if (!this.isLocalStorageAvailable()) return null;
    const token = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!token) return null;
    return this.validateSession(token);
  }

  logout(token: string): void {
    this.sessions.delete(token);
    if (this.isLocalStorageAvailable()) {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
    this.saveState();
  }

  // ─── 8. Security Guard Assertions ─────────────────────────────────────────

  private assertSession(token: string): UserSession {
    const session = this.validateSession(token);
    if (!session) {
      throw new Error('Security Violation: Invalid or expired session. Authentication required.');
    }
    return session;
  }

  private assertOrganizationOwnership(session: UserSession, organizationId: string): OrganizationRecord {
    const org = this.organizations.get(organizationId);
    if (!org) {
      throw new Error(`Security Violation: Organization '${organizationId}' not found.`);
    }
    if (org.ownerUserId !== session.userId) {
      throw new Error(`Security Violation: User '${session.userId}' is not authorized to access organization '${organizationId}'.`);
    }
    return org;
  }

  // Helper for testing resets
  clearAll(): void {
    this.users.clear();
    this.organizations.clear();
    this.workspaces.clear();
    this.companyProfiles.clear();
    this.sessions.clear();
    if (this.isLocalStorageAvailable()) {
      window.localStorage.removeItem(STORAGE_KEY_AUTH);
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }
}

// Backwards compatibility layer for existing services
export class SaaSAuthManager {
  private sessions: Map<string, UserSession> = new Map();

  createSession(params: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    organizationId: string;
    organizationName: string;
  }): UserSession {
    const token = generateSecureToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const session: UserSession = {
      ...params,
      token,
      createdAt: now.toISOString(),
      expiresAt,
    };
    this.sessions.set(token, session);
    return session;
  }

  validateSession(token: string): UserSession | null {
    const session = this.sessions.get(token);
    if (session) {
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.sessions.delete(token);
        return null;
      }
      return session;
    }
    return AccountManager.getInstance().validateSession(token);
  }

  hasPermission(session: UserSession, action: 'execute_agent' | 'approve_task' | 'manage_billing' | 'manage_team'): boolean {
    switch (action) {
      case 'manage_billing':
      case 'manage_team':
        return session.role === 'ADMIN' || session.role === 'EXECUTIVE';
      case 'approve_task':
        return session.role === 'ADMIN' || session.role === 'EXECUTIVE' || session.role === 'MARKETER';
      case 'execute_agent':
        return true;
      default:
        return false;
    }
  }
}
