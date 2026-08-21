export type UserRole = 'ADMIN' | 'EXECUTIVE' | 'MARKETER' | 'MEMBER' | 'DEMO_VIEWER';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
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

export interface StoredBusinessDNA {
  id: string;
  businessId: string;
  organizationId: string;
  schemaVersion: string;
  confidenceScore: number;
  companyIdentity: {
    companyName: string;
    industry: string;
    stage: string;
    mission: string;
    uniqueValueProposition: string;
    coreValues: string[];
  };
  opportunityPillars: {
    financialPain: string;
    processGap: string;
    stakeholderAlignment: string;
  };
  brandVoice: {
    primaryTone: string;
    wordsToUse: string[];
    wordsToAvoid: string[];
  };
  customerProfile: {
    targetAudience: string;
    primaryPainPoints: string[];
    buyerPersonas: Array<{ name: string; role: string; challenges: string[] }>;
  };
  competitivePositioning: {
    marketPosition: string;
    primaryCompetitors: string[];
    keyDifferentiators: string[];
  };
  websiteAnalysis: {
    primaryUrl: string;
    colors: string[];
    fonts: string[];
  };
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
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const chr = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}`;
}

const STORAGE_KEY_AUTH = 'tacf_auth_store_v2';
const ACTIVE_SESSION_KEY = 'tacf_active_session_token_v2';

export class AccountManager {
  private static instance: AccountManager;
  private users: Map<string, UserAccount> = new Map();
  private organizations: Map<string, OrganizationRecord> = new Map();
  private workspaces: Map<string, WorkspaceRecord[]> = new Map();
  private companyProfiles: Map<string, CompanyInfoRecord> = new Map();
  private dnaModels: Map<string, StoredBusinessDNA> = new Map();
  private sessions: Map<string, UserSession> = new Map();

  constructor() {
    this.loadState();
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager();
    }
    return AccountManager.instance;
  }

  private isBrowserRuntime(): boolean {
    return typeof window !== 'undefined' && typeof window.location !== 'undefined';
  }

  private async safeServerFetch(endpoint: string, options: RequestInit): Promise<Response | null> {
    if (!this.isBrowserRuntime()) return null;
    try {
      return await fetch(endpoint, options);
    } catch {
      return null;
    }
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
        if (data.dnaModels) this.dnaModels = new Map(Object.entries(data.dnaModels));
        if (data.sessions) this.sessions = new Map(Object.entries(data.sessions));
      }
    } catch (e) {
      console.warn('TACF AccountManager: Failed to restore state from storage', e);
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
        dnaModels: Object.fromEntries(this.dnaModels),
        sessions: Object.fromEntries(this.sessions),
      };
      window.localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data));
    } catch (e) {
      console.warn('TACF AccountManager: Failed to save state to storage', e);
    }
  }

  // ─── 1. Account Registration (Server-First with Local Mirror) ─────────────

  async registerAccount(params: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<{ user: UserAccount; session: UserSession }> {
    const normalizedEmail = params.email.trim().toLowerCase();
    if (!normalizedEmail || !params.password) {
      throw new Error('Registration Error: Email and password are required.');
    }

    // Try server endpoint first in browser
    const resp = await this.safeServerFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (resp) {
      if (resp.ok) {
        const data = await resp.json();
        this.cacheSession(data.session);
        return data;
      } else {
        const errData = await resp.json();
        if (errData.error) throw new Error(errData.error);
      }
    }

    // Local Sandbox Registration
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
    const session = this.createSessionInternal(user);
    this.saveState();

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, session };
  }

  // ─── 2. Authentication / Login (Server-First with Local Mirror) ───────────

  async login(params: {
    email: string;
    password: string;
  }): Promise<{
    user: UserAccount;
    session: UserSession;
    organization?: OrganizationRecord;
    workspace?: WorkspaceRecord;
    companyProfile?: CompanyInfoRecord;
    businessDNA?: StoredBusinessDNA;
  }> {
    const normalizedEmail = params.email.trim().toLowerCase();

    // Try server endpoint first in browser
    const resp = await this.safeServerFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (resp) {
      if (resp.ok) {
        const data = await resp.json();
        this.cacheSession(data.session);
        return data;
      } else {
        const errData = await resp.json();
        if (errData.error) throw new Error(errData.error);
      }
    }

    // Local Sandbox Verification
    const user = this.users.get(normalizedEmail);
    if (!user) {
      throw new Error('Authentication Error: Invalid email or password.');
    }

    const passwordHash = await hashPassword(params.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Authentication Error: Invalid email or password.');
    }

    const userOrgs = Array.from(this.organizations.values()).filter(o => o.ownerUserId === user.id);
    const primaryOrg = userOrgs[0];
    let primaryWs: WorkspaceRecord | undefined;
    let companyProfile: CompanyInfoRecord | undefined;
    let businessDNA: StoredBusinessDNA | undefined;

    if (primaryOrg) {
      const wsList = this.workspaces.get(primaryOrg.id) || [];
      primaryWs = wsList[0];
      companyProfile = this.companyProfiles.get(primaryOrg.id);
      businessDNA = this.dnaModels.get(primaryOrg.id);
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
      businessDNA,
    };
  }

  // ─── 3. Isolated Demo Workspace (Zero Admin Permissions) ──────────────────

  async launchDemoSession(): Promise<{
    session: UserSession;
    organization: OrganizationRecord;
    workspace: WorkspaceRecord;
    businessDNA: StoredBusinessDNA;
  }> {
    // Try server endpoint first in browser
    const resp = await this.safeServerFetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (resp && resp.ok) {
      const data = await resp.json();
      this.cacheSession(data.session);
      return data;
    }

    // Local Isolated Demo Sandbox
    const now = new Date().toISOString();
    const demoToken = `demo_${generateSecureToken(32)}`;

    const demoOrg: OrganizationRecord = {
      id: 'org_demo_sandbox',
      name: 'Acme Corp (Demo Sandbox)',
      ownerUserId: 'usr_demo_sandbox',
      industry: 'technology_saas',
      planTier: 'starter',
      createdAt: now,
    };

    const demoWs: WorkspaceRecord = {
      id: 'ws_demo_sandbox',
      organizationId: 'org_demo_sandbox',
      name: 'Evaluation Sandbox',
      slug: 'evaluation-sandbox',
      createdAt: now,
    };

    const demoDna: StoredBusinessDNA = {
      id: 'dna_demo_sandbox',
      businessId: 'biz_demo_sandbox',
      organizationId: 'org_demo_sandbox',
      schemaVersion: '1.0',
      confidenceScore: 0.92,
      companyIdentity: {
        companyName: 'Acme Corp (Demo Sandbox)',
        industry: 'technology_saas',
        stage: 'growth',
        mission: 'Demonstrating autonomous business operating system capabilities in a secure sandbox.',
        uniqueValueProposition: 'Sandboxed AI intelligence and automated website generation.',
        coreValues: ['Safe Evaluation', 'Zero Mutation', 'Simulated Telemetry'],
      },
      opportunityPillars: {
        financialPain: '$850k annual evaluation benchmark.',
        processGap: 'Sample manual workflow friction for testing.',
        stakeholderAlignment: 'Demo Evaluation Sponsor',
      },
      brandVoice: {
        primaryTone: 'authoritative',
        wordsToUse: ['autonomous', 'intelligent', 'verified', 'sample'],
        wordsToAvoid: ['production-leak', 'admin-mutation'],
      },
      customerProfile: {
        targetAudience: 'Evaluating guests and prospective enterprise clients.',
        primaryPainPoints: ['Testing functionality before signup'],
        buyerPersonas: [
          { name: 'Prospective Buyer', role: 'Evaluator', challenges: ['Feature validation'] }
        ],
      },
      competitivePositioning: {
        marketPosition: 'Demo Evaluation Sandbox',
        primaryCompetitors: ['Generic SaaS'],
        keyDifferentiators: ['Strict sandbox isolation'],
      },
      websiteAnalysis: {
        primaryUrl: 'https://acme-demo.example.com',
        colors: ['#6366f1', '#10b981', '#0f172a'],
        fonts: ['Inter', 'Space Grotesk'],
      },
      updatedAt: now,
    };

    const demoSession: UserSession = {
      token: demoToken,
      userId: 'usr_demo_sandbox',
      email: 'guest.demo@tacfos.tech',
      name: 'Demo Guest',
      role: 'DEMO_VIEWER',
      organizationId: 'org_demo_sandbox',
      organizationName: 'Acme Corp (Demo Sandbox)',
      workspaceId: 'ws_demo_sandbox',
      workspaceName: 'Evaluation Sandbox',
      createdAt: now,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };

    this.sessions.set(demoToken, demoSession);
    this.organizations.set('org_demo_sandbox', demoOrg);
    this.workspaces.set('org_demo_sandbox', [demoWs]);
    this.dnaModels.set('org_demo_sandbox', demoDna);
    this.cacheSession(demoSession);

    return {
      session: demoSession,
      organization: demoOrg,
      workspace: demoWs,
      businessDNA: demoDna,
    };
  }

  // ─── 4. Create Organization (Server-First with Local Mirror) ──────────────

  async createOrganization(params: {
    sessionToken: string;
    name: string;
    industry?: string;
    planTier?: string;
  }): Promise<OrganizationRecord> {
    const session = this.assertSession(params.sessionToken);

    if (session.role === 'DEMO_VIEWER') {
      throw new Error('Demo viewers cannot create organizations. Please register a real account.');
    }

    const resp = await this.safeServerFetch('/api/tenant/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.sessionToken}`,
      },
      body: JSON.stringify(params),
    });

    if (resp && resp.ok) {
      const org = await resp.json();
      session.organizationId = org.id;
      session.organizationName = org.name;
      this.cacheSession(session);
      return org;
    }

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
    session.organizationId = org.id;
    session.organizationName = org.name;
    this.sessions.set(session.token, session);
    this.saveState();
    return org;
  }

  // ─── 5. Create Workspace (Server-First with Local Mirror) ─────────────────

  async createWorkspace(params: {
    sessionToken: string;
    organizationId: string;
    name: string;
    slug?: string;
  }): Promise<WorkspaceRecord> {
    const session = this.assertSession(params.sessionToken);
    this.assertOrganizationOwnership(session, params.organizationId);

    if (session.role === 'DEMO_VIEWER') {
      throw new Error('Demo viewers cannot create workspaces.');
    }

    const resp = await this.safeServerFetch('/api/tenant/workspace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.sessionToken}`,
      },
      body: JSON.stringify(params),
    });

    if (resp && resp.ok) {
      const ws = await resp.json();
      session.workspaceId = ws.id;
      session.workspaceName = ws.name;
      this.cacheSession(session);
      return ws;
    }

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

    session.workspaceId = ws.id;
    session.workspaceName = ws.name;
    this.sessions.set(session.token, session);
    this.saveState();
    return ws;
  }

  // ─── 6. Save Company Profile & Business DNA (Server-First) ────────────────

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
  }): Promise<{ companyProfile: CompanyInfoRecord; businessDNA: StoredBusinessDNA }> {
    const session = this.assertSession(params.sessionToken);
    this.assertOrganizationOwnership(session, params.organizationId);

    if (session.role === 'DEMO_VIEWER') {
      throw new Error('Demo viewers cannot modify live Business DNA.');
    }

    const resp = await this.safeServerFetch('/api/tenant/dna', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.sessionToken}`,
      },
      body: JSON.stringify(params),
    });

    if (resp && resp.ok) {
      const data = await resp.json();
      this.companyProfiles.set(params.organizationId, data.companyProfile);
      this.dnaModels.set(params.organizationId, data.businessDNA);
      this.saveState();
      return data;
    }

    const businessId = `biz_${params.organizationId.replace(/^org_/, '')}`;
    const cleanName = params.companyName.trim();
    const cleanUrl = params.websiteUrl.trim();
    const cleanIndustry = params.industry || 'technology_saas';
    const cleanMission = params.mission?.trim() || `To empower and transform the ${cleanIndustry.replace('_', ' ')} industry through automated intelligence.`;
    const cleanUvp = params.uvp?.trim() || `Autonomous brand intelligence, real-time website compilation, and automated execution for ${cleanName}.`;
    const cleanProcessGap = params.processGap?.trim() || 'Manual departmental workflows, fragmented tool stacks, and operational lead time drag.';
    const cleanFinancialPain = params.financialPain?.trim() || '$1.2M in annual overhead lost to execution friction.';
    const cleanTargetAudience = params.targetAudience?.trim() || 'Modern enterprise executives, operations directors, and growing commercial teams.';

    const companyProfile: CompanyInfoRecord = {
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      businessId,
      companyName: cleanName,
      websiteUrl: cleanUrl,
      industry: cleanIndustry,
      mission: cleanMission,
      uvp: cleanUvp,
      processGap: cleanProcessGap,
      financialPain: cleanFinancialPain,
      targetAudience: cleanTargetAudience,
      updatedAt: new Date().toISOString(),
    };

    const businessDNA: StoredBusinessDNA = {
      id: `dna_${params.organizationId.replace(/^org_/, '')}`,
      businessId,
      organizationId: params.organizationId,
      schemaVersion: '1.0',
      confidenceScore: 0.94,
      companyIdentity: {
        companyName: cleanName,
        industry: cleanIndustry,
        stage: 'growth',
        mission: cleanMission,
        uniqueValueProposition: cleanUvp,
        coreValues: ['Operational Speed', 'Customer Excellence', 'Deterministic Accuracy', 'Zero-Trust Integrity'],
      },
      opportunityPillars: {
        financialPain: cleanFinancialPain,
        processGap: cleanProcessGap,
        stakeholderAlignment: 'Executive Leadership (Direct Sponsor)',
      },
      brandVoice: {
        primaryTone: 'authoritative',
        wordsToUse: ['autonomous', 'precision', 'streamlined', 'enterprise', 'intelligence'],
        wordsToAvoid: ['manual', 'slow', 'legacy', 'approximate'],
      },
      customerProfile: {
        targetAudience: cleanTargetAudience,
        primaryPainPoints: [cleanProcessGap, cleanFinancialPain, 'Lack of unified operational visibility'],
        buyerPersonas: [
          { name: 'VP of Growth & Operations', role: 'Executive Champion', challenges: [cleanProcessGap, 'Budget efficiency'] },
          { name: 'Head of Brand Strategy', role: 'Brand Custodian', challenges: ['Consistency across channels', 'Fast turnaround'] },
        ],
      },
      competitivePositioning: {
        marketPosition: 'Market Leader & Autonomous Pioneer',
        primaryCompetitors: ['Legacy Consultancies', 'Manual SaaS Point Tools'],
        keyDifferentiators: ['Closed-loop Business DNA', 'Self-generating websites', 'Multi-domain zero-trust governance'],
      },
      websiteAnalysis: {
        primaryUrl: cleanUrl,
        colors: ['#4f46e5', '#10b981', '#0f172a', '#6366f1', '#38bdf8'],
        fonts: ['Inter', 'Space Grotesk', 'JetBrains Mono'],
      },
      updatedAt: new Date().toISOString(),
    };

    this.companyProfiles.set(params.organizationId, companyProfile);
    this.dnaModels.set(params.organizationId, businessDNA);
    this.saveState();

    return { companyProfile, businessDNA };
  }

  // ─── 7. Tenant-Isolated Queries & Updates ────────────────────────────────

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

  getBusinessDNA(sessionToken: string, organizationId: string): StoredBusinessDNA | null {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.dnaModels.get(organizationId) || null;
  }

  updateBusinessDNA(
    sessionToken: string,
    organizationId: string,
    updates: Partial<StoredBusinessDNA>
  ): StoredBusinessDNA {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    if (session.role === 'DEMO_VIEWER') {
      throw new Error('Demo viewers cannot modify Business DNA.');
    }

    const existing = this.dnaModels.get(organizationId);
    if (!existing) {
      throw new Error(`Business DNA not found for organization '${organizationId}'.`);
    }

    const updated: StoredBusinessDNA = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.dnaModels.set(organizationId, updated);
    this.saveState();
    return updated;
  }

  // ─── 8. Session Validation & Lifecycle ────────────────────────────────────

  private cacheSession(session: UserSession): void {
    this.sessions.set(session.token, session);
    if (this.isLocalStorageAvailable()) {
      window.localStorage.setItem(ACTIVE_SESSION_KEY, session.token);
    }
  }

  private createSessionInternal(
    user: UserAccount,
    org?: OrganizationRecord,
    ws?: WorkspaceRecord
  ): UserSession {
    const token = generateSecureToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

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

    this.cacheSession(session);
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
    this.safeServerFetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    this.sessions.delete(token);
    if (this.isLocalStorageAvailable()) {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
    this.saveState();
  }

  // ─── 9. Security Guard Assertions ─────────────────────────────────────────

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

    if (session.role === 'DEMO_VIEWER') {
      if (organizationId !== 'org_demo_sandbox') {
        throw new Error(`Security Violation: Demo viewers cannot access live tenant '${organizationId}'.`);
      }
      return org;
    }

    if (org.ownerUserId !== session.userId) {
      throw new Error(`Security Violation: User '${session.userId}' is not authorized to access organization '${organizationId}'.`);
    }
    return org;
  }

  clearAll(): void {
    this.users.clear();
    this.organizations.clear();
    this.workspaces.clear();
    this.companyProfiles.clear();
    this.dnaModels.clear();
    this.sessions.clear();
    if (this.isLocalStorageAvailable()) {
      window.localStorage.removeItem(STORAGE_KEY_AUTH);
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }
}

// Backwards compatibility layer
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
    if (session.role === 'DEMO_VIEWER') {
      return false; // Zero administrative permissions in demo mode
    }

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
