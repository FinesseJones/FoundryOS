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

export function normalizeCompanyUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  // Strip repeated or duplicated protocols e.g. "https://https://" or "http://https://"
  clean = clean.replace(/^(https?:\/\/)+/i, '');
  clean = clean.replace(/^\/+/, '');
  if (!clean) return '';
  return `https://${clean}`;
}

export interface CompanyInfoRecord {
  organizationId: string;
  workspaceId: string;
  businessId: string;
  companyName: string;
  legalCompanyName?: string;
  operatingBrand?: string;
  productName?: string;
  corePlatform?: string;
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
    legalCompanyName?: string;
    operatingBrand?: string;
    productName?: string;
    corePlatform?: string;
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
  private insights: Map<string, any[]> = new Map();
  private recommendations: Map<string, any[]> = new Map();
  private artifacts: Map<string, any[]> = new Map();
  private agentTasks: Map<string, any[]> = new Map();
  private approvals: Map<string, any[]> = new Map();
  private executions: Map<string, any[]> = new Map();
  private auditEvents: Map<string, any[]> = new Map();
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
      const resp = await fetch(endpoint, options);
      const contentType = resp.headers.get('content-type') || '';
      // If server returns HTML or non-JSON (e.g. Vite SPA fallback for /api routes), ignore server and use client state
      if (!contentType.includes('application/json') && !contentType.includes('application/problem+json')) {
        return null;
      }
      return resp;
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
        if (data.insights) this.insights = new Map(Object.entries(data.insights));
        if (data.recommendations) this.recommendations = new Map(Object.entries(data.recommendations));
        if (data.artifacts) this.artifacts = new Map(Object.entries(data.artifacts));
        if (data.agentTasks) this.agentTasks = new Map(Object.entries(data.agentTasks));
        if (data.approvals) this.approvals = new Map(Object.entries(data.approvals));
        if (data.executions) this.executions = new Map(Object.entries(data.executions));
        if (data.auditEvents) this.auditEvents = new Map(Object.entries(data.auditEvents));
        if (data.sessions) this.sessions = new Map(Object.entries(data.sessions));
      }
    } catch (e) {
      console.warn('FoundryOS AccountManager: Failed to restore state from storage', e);
    }

    // Seed Master Super Admin if not present
    if (!this.users.has('admin@foundryos.tech')) {
      const superAdminUser: UserAccount = {
        id: 'usr_finessejones_master',
        email: 'admin@foundryos.tech',
        name: 'Finesse Jones',
        role: 'SUPER_ADMIN',
        createdAt: '2026-08-31T00:00:00.000Z',
      };
      this.users.set('admin@foundryos.tech', superAdminUser);
    }

    // Seed Real Client: Environment Masters, Inc. (Jackson, MS)
    if (!this.organizations.has('org_env_masters_ms')) {
      this.organizations.set('org_env_masters_ms', {
        id: 'org_env_masters_ms',
        name: 'Environment Masters, Inc. (Jackson, MS)',
        ownerUserId: 'usr_ray_buckley_ms',
        industry: 'hvac_plumbing_electrical',
        planTier: 'enterprise',
        createdAt: '1957-01-01T00:00:00.000Z',
      });

      this.workspaces.set('org_env_masters_ms', [{
        id: 'ws_env_masters_jackson',
        organizationId: 'org_env_masters_ms',
        name: 'Jackson MS Headquarters Workspace',
        slug: 'environment-masters-jackson-ms',
        createdAt: '2026-08-31T00:00:00.000Z',
      }]);

      this.companyProfiles.set('ws_env_masters_jackson', {
        organizationId: 'org_env_masters_ms',
        workspaceId: 'ws_env_masters_jackson',
        companyName: 'Environment Masters, Inc.',
        websiteUrl: 'https://environmentmasters.com',
        businessDescription: 'Premier commercial and residential HVAC, plumbing, electrical, and smart building automation contractor serving Jackson, Madison, and Central Mississippi since 1957.',
        industry: 'HVAC, Mechanical & Commercial Electrical Contracting',
        targetAudience: 'Commercial facility managers, hospital operations directors, municipal infrastructure leads, and Mississippi homeowners.',
        valuePropositions: [
          'Jackson Mississippi Metro Leader in HVAC & Plumbing Since 1957',
          '24/7 Rapid Emergency Response with Priority One Maintenance Guarantees',
          'Licensed Master Electricians, Mechanical Engineers & DDC Automation Specialists',
          '1-Tap Transparent SMS Text-to-Pay & Instant Review Dispatch'
        ],
        brandTone: 'authoritative_responsive_institutional',
        keyCompetitors: ['AirSouth Cooling', 'Ewing Kessler', 'Upchurch Plumbing'],
        targetMarket: 'Jackson, Ridgeland, Madison, Pearl, Brandon, Central Mississippi',
        updatedAt: new Date().toISOString(),
      });
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
        insights: Object.fromEntries(this.insights),
        recommendations: Object.fromEntries(this.recommendations),
        artifacts: Object.fromEntries(this.artifacts),
        agentTasks: Object.fromEntries(this.agentTasks),
        approvals: Object.fromEntries(this.approvals),
        executions: Object.fromEntries(this.executions),
        auditEvents: Object.fromEntries(this.auditEvents),
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
      try {
        if (resp.ok) {
          const data = await resp.json();
          this.cacheSession(data.session);
          return data;
        } else {
          const errData = await resp.json().catch(() => ({}));
          if (errData.error) throw new Error(errData.error);
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('JSON')) {
          throw err;
        }
        // Fall back to client local sandbox
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
      try {
        if (resp.ok) {
          const data = await resp.json();
          this.cacheSession(data.session);
          return data;
        } else {
          const errData = await resp.json().catch(() => ({}));
          if (errData.error) throw new Error(errData.error);
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('JSON')) {
          throw err;
        }
        // Fall back to client local sandbox
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
      try {
        const org = await resp.json();
        this.organizations.set(org.id, org);
        session.organizationId = org.id;
        session.organizationName = org.name;
        this.sessions.set(session.token, session);
        this.cacheSession(session);
        this.saveState();
        return org;
      } catch {
        // Fall back to local creation
      }
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
      try {
        const ws = await resp.json();
        const existing = this.workspaces.get(params.organizationId) || [];
        this.workspaces.set(params.organizationId, [...existing.filter(w => w.id !== ws.id), ws]);
        session.workspaceId = ws.id;
        session.workspaceName = ws.name;
        this.sessions.set(session.token, session);
        this.cacheSession(session);
        this.saveState();
        return ws;
      } catch {
        // Fall back to local creation
      }
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
    legalCompanyName?: string;
    operatingBrand?: string;
    productName?: string;
    corePlatform?: string;
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
      try {
        const data = await resp.json();
        this.companyProfiles.set(params.organizationId, data.companyProfile);
        this.dnaModels.set(params.organizationId, data.businessDNA);
        this.saveState();
        return data;
      } catch {
        // Fall back to local creation
      }
    }

    const businessId = `biz_${params.organizationId.replace(/^org_/, '')}`;
    const cleanUrl = normalizeCompanyUrl(params.websiteUrl);
    const cleanName = (params.companyName || params.operatingBrand || 'Client Enterprise').trim();
    const legalName = (params.legalCompanyName || `${cleanName}, LLC`).trim();
    const opBrand = (params.operatingBrand || cleanName).trim();
    const prodName = (params.productName || `${cleanName} Platform`).trim();
    const platName = (params.corePlatform || 'Business DNA').trim();

    const cleanIndustry = params.industry || 'commercial_services';
    const cleanMission = params.mission?.trim() || `To deliver premier, reliable, and high-performance solutions in ${cleanIndustry.replace('_', ' ')}.`;
    const cleanUvp = params.uvp?.trim() || `Market-leading reliability, rapid execution, and trusted client service for ${cleanName}.`;
    const cleanProcessGap = params.processGap?.trim() || 'Manual departmental workflows, fragmented tool stacks, and operational lead time drag.';
    const cleanFinancialPain = params.financialPain?.trim() || 'Operational lead time drag and execution friction (Estimated baseline benchmark)';
    const cleanTargetAudience = params.targetAudience?.trim() || 'Modern enterprise executives, operations directors, and commercial property leads.';

    const companyProfile: CompanyInfoRecord = {
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      businessId,
      companyName: cleanName,
      legalCompanyName: legalName,
      operatingBrand: opBrand,
      productName: prodName,
      corePlatform: platName,
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
        legalCompanyName: legalName,
        operatingBrand: opBrand,
        productName: prodName,
        corePlatform: platName,
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
        marketPosition: 'Autonomous Business AI Platform / Emerging Category Pioneer',
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

    // Sanitize primaryUrl if updated
    if (updates.websiteAnalysis?.primaryUrl) {
      updates.websiteAnalysis.primaryUrl = normalizeCompanyUrl(updates.websiteAnalysis.primaryUrl);
    }

    const updated: StoredBusinessDNA = {
      ...existing,
      ...updates,
      companyIdentity: {
        ...existing.companyIdentity,
        ...(updates.companyIdentity || {}),
      },
      opportunityPillars: {
        ...existing.opportunityPillars,
        ...(updates.opportunityPillars || {}),
      },
      brandVoice: {
        ...existing.brandVoice,
        ...(updates.brandVoice || {}),
      },
      customerProfile: {
        ...existing.customerProfile,
        ...(updates.customerProfile || {}),
      },
      competitivePositioning: {
        ...existing.competitivePositioning,
        ...(updates.competitivePositioning || {}),
      },
      websiteAnalysis: {
        ...existing.websiteAnalysis,
        ...(updates.websiteAnalysis || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    this.dnaModels.set(organizationId, updated);
    this.saveState();

    // Async sync to server if available
    this.safeServerFetch(`/api/tenant/dna/${organizationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(updated),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for DNA update', err));

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

  // ─── 9. Authoritative Organization System of Record ────────────────────────

  async loadOrganizationState(sessionToken: string, organizationId: string): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const resp = await this.safeServerFetch(`/api/tenant/organization/${organizationId}/state`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
      },
    });

    if (resp && resp.ok) {
      const data = await resp.json();
      if (data.organization) this.organizations.set(organizationId, data.organization);
      if (data.companyProfile) this.companyProfiles.set(organizationId, data.companyProfile);
      if (data.businessDNA) this.dnaModels.set(organizationId, data.businessDNA);
      if (data.workspaces) this.workspaces.set(organizationId, data.workspaces);
      if (data.insights) this.insights.set(organizationId, data.insights);
      if (data.recommendations) this.recommendations.set(organizationId, data.recommendations);
      if (data.artifacts) this.artifacts.set(organizationId, data.artifacts);
      if (data.agentTasks) this.agentTasks.set(organizationId, data.agentTasks);
      if (data.approvals) this.approvals.set(organizationId, data.approvals);
      if (data.executions) this.executions.set(organizationId, data.executions);
      if (data.auditEvents) this.auditEvents.set(organizationId, data.auditEvents);
      this.saveState();
      return data;
    }

    return {
      organization: this.organizations.get(organizationId) || null,
      companyProfile: this.companyProfiles.get(organizationId) || null,
      businessDNA: this.dnaModels.get(organizationId) || null,
      workspaces: this.workspaces.get(organizationId) || [],
      insights: this.insights.get(organizationId) || [],
      recommendations: this.recommendations.get(organizationId) || [],
      artifacts: this.artifacts.get(organizationId) || [],
      agentTasks: this.agentTasks.get(organizationId) || [],
      approvals: this.approvals.get(organizationId) || [],
      executions: this.executions.get(organizationId) || [],
      auditEvents: this.auditEvents.get(organizationId) || [],
    };
  }

  async saveInsight(sessionToken: string, organizationId: string, insight: any): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.insights.get(organizationId) || [];
    const item = {
      id: insight.id || `ins_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...insight,
      organizationId,
      createdAt: insight.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    this.insights.set(organizationId, list.slice(0, 100));
    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify(item),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for insight', err));

    return item;
  }

  getInsights(sessionToken: string, organizationId: string): any[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.insights.get(organizationId) || [];
  }

  async saveRecommendation(sessionToken: string, organizationId: string, recommendation: any): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.recommendations.get(organizationId) || [];
    const item = {
      id: recommendation.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...recommendation,
      organizationId,
      createdAt: recommendation.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    this.recommendations.set(organizationId, list.slice(0, 100));
    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify(item),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for recommendation', err));

    return item;
  }

  getRecommendations(sessionToken: string, organizationId: string): any[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.recommendations.get(organizationId) || [];
  }

  async saveArtifact(sessionToken: string, organizationId: string, artifact: any): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.artifacts.get(organizationId) || [];
    const item = {
      id: artifact.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...artifact,
      organizationId,
      createdAt: artifact.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    this.artifacts.set(organizationId, list.slice(0, 100));
    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify(item),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for artifact', err));

    return item;
  }

  getArtifacts(sessionToken: string, organizationId: string): any[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.artifacts.get(organizationId) || [];
  }

  async saveAgentTask(sessionToken: string, organizationId: string, task: any): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.agentTasks.get(organizationId) || [];
    const item = {
      id: task.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...task,
      organizationId,
      createdAt: task.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    this.agentTasks.set(organizationId, list.slice(0, 100));
    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/agent-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify(item),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for agent-task', err));

    return item;
  }

  getAgentTasks(sessionToken: string, organizationId: string): any[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.agentTasks.get(organizationId) || [];
  }

  async saveApproval(sessionToken: string, organizationId: string, approval: any): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.approvals.get(organizationId) || [];
    const item = {
      id: approval.id || `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...approval,
      organizationId,
      status: approval.status || 'PENDING',
      createdAt: approval.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    this.approvals.set(organizationId, list);
    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/approvals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify(item),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for approval', err));

    return item;
  }

  async updateApproval(sessionToken: string, organizationId: string, approvalId: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.approvals.get(organizationId) || [];
    const item = list.find(a => a.id === approvalId);
    if (!item) {
      throw new Error(`Approval '${approvalId}' not found.`);
    }

    item.status = status;
    item.reviewedBy = session.email;
    item.reviewedAt = new Date().toISOString();
    item.reviewNotes = notes || item.reviewNotes;

    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/approvals/${approvalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify({ status, reviewNotes: notes }),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for approval update', err));

    return item;
  }

  getApprovals(sessionToken: string, organizationId: string): any[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.approvals.get(organizationId) || [];
  }

  async logAuditEvent(sessionToken: string, organizationId: string, event: any): Promise<any> {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);

    const list = this.auditEvents.get(organizationId) || [];
    const item = {
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...event,
      organizationId,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    list.unshift(item);
    this.auditEvents.set(organizationId, list.slice(0, 500));
    this.saveState();

    this.safeServerFetch(`/api/tenant/organization/${organizationId}/audit-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify(item),
    }).catch(err => console.warn('TACF AccountManager: Server sync warning for audit event', err));

    return item;
  }

  getAuditEvents(sessionToken: string, organizationId: string): any[] {
    const session = this.assertSession(sessionToken);
    this.assertOrganizationOwnership(session, organizationId);
    return this.auditEvents.get(organizationId) || [];
  }

  // ─── 10. Security Guard Assertions ────────────────────────────────────────

  private assertSession(token: string): UserSession {
    const session = this.validateSession(token);
    if (!session) {
      throw new Error('Security Violation: Invalid or expired session. Authentication required.');
    }
    return session;
  }

  private assertOrganizationOwnership(session: UserSession, organizationId: string): OrganizationRecord {
    let org = this.organizations.get(organizationId);

    // Auto-heal if organization exists in active session from backend
    if (!org && session.organizationId === organizationId) {
      org = {
        id: organizationId,
        name: session.organizationName || 'Organization',
        ownerUserId: session.userId,
        industry: 'technology_saas',
        planTier: 'growth',
        createdAt: new Date().toISOString(),
      };
      this.organizations.set(organizationId, org);
      this.saveState();
    }

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
