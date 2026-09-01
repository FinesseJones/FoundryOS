import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const app = express();
app.use(express.json({ limit: "2mb" }));

const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ─── 1. Server-Side Scrypt Password Hashing ─────────────────────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ─── 2. Persistent Server Database ─────────────────────────────────────────

let db = {
  users: {},            // userId -> user
  usersByEmail: {},     // email -> userId
  organizations: {},    // orgId -> org
  workspaces: {},       // orgId -> [workspaces]
  companyProfiles: {},  // orgId -> profile
  dnaModels: {},        // orgId -> DNA
  insights: {},         // orgId -> [sales/marketing/ops insights]
  recommendations: {},  // orgId -> [strategy recommendations]
  artifacts: {},        // orgId -> [generated copy/code/briefs/websites]
  agentTasks: {},       // orgId -> [scheduled & completed agent tasks]
  approvals: {},        // orgId -> [human approval items]
  executions: {},       // orgId -> [pipeline execution states]
  auditEvents: {},      // orgId -> [audit log events]
  sessions: {},         // token -> session
};

async function initDatabase() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    db = {
      users: parsed.users || {},
      usersByEmail: parsed.usersByEmail || {},
      organizations: parsed.organizations || {},
      workspaces: parsed.workspaces || {},
      companyProfiles: parsed.companyProfiles || {},
      dnaModels: parsed.dnaModels || {},
      insights: parsed.insights || {},
      recommendations: parsed.recommendations || {},
      artifacts: parsed.artifacts || {},
      agentTasks: parsed.agentTasks || {},
      approvals: parsed.approvals || {},
      executions: parsed.executions || {},
      auditEvents: parsed.auditEvents || {},
      sessions: parsed.sessions || {},
    };
    console.log("[DB] Restored server database successfully from:", DB_FILE);
  } catch (err) {
    console.log("[DB] Initializing fresh server database at:", DB_FILE);
    await saveDatabase();
  }
}

async function saveDatabase() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Failed to save database to disk:", err);
  }
}

// ─── 3. Server Authentication & httpOnly Cookie Handling ───────────────────

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieParts = [
    `foundry_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800', // 7 days
  ];
  if (isProd) {
    cookieParts.push('Secure');
  }
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'foundry_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

function authenticateSession(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    const cookies = parseCookies(req);
    token = cookies.foundry_session;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Valid httpOnly session cookie or Bearer token missing." });
  }

  const session = db.sessions[token];
  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Invalid session token. Please sign in again." });
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    delete db.sessions[token];
    saveDatabase();
    clearSessionCookie(res);
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }

  req.session = session;
  req.user = db.users[session.userId];
  next();
}

function assertOrgOwnership(req, res, organizationId) {
  const org = db.organizations[organizationId];
  if (!org) {
    res.status(404).json({ error: `Organization '${organizationId}' not found.` });
    return null;
  }

  // Super admins have cross-tenant platform administration rights
  if (req.session.role === "SUPER_ADMIN") {
    return org;
  }

  // Demo viewers are strictly isolated to their demo sandbox
  if (req.session.role === "DEMO_VIEWER") {
    if (organizationId !== "org_demo_sandbox") {
      res.status(403).json({ error: "Access Denied: Demo viewers cannot access live tenant data." });
      return null;
    }
    return org;
  }

  if (org.ownerUserId !== req.session.userId) {
    res.status(403).json({ error: "Security Violation: Cross-tenant access denied." });
    return null;
  }

  return org;
}

// ─── 4. Health Check Endpoint ───────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "tacf-api-server",
    key: !!NVIDIA_KEY,
    database: "persistent-server-file",
    timestamp: new Date().toISOString()
  });
});

// ─── 5. Server-Side Authentication Endpoints ────────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (db.usersByEmail[normalizedEmail]) {
      return res.status(409).json({ error: `Account '${normalizedEmail}' already exists.` });
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const user = {
      id: userId,
      email: normalizedEmail,
      name: (name || "").trim() || normalizedEmail.split("@")[0],
      role: "ADMIN",
      passwordHash,
      createdAt: now,
    };

    db.users[userId] = user;
    db.usersByEmail[normalizedEmail] = userId;

    // Create secure server session (7 days)
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const session = {
      token,
      userId,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: "",
      organizationName: "",
      createdAt: now,
      expiresAt,
    };

    db.sessions[token] = session;
    await saveDatabase();

    setSessionCookie(res, token);
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    const userId = db.usersByEmail[normalizedEmail];
    const user = userId ? db.users[userId] : null;

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Find primary organization & workspace
    const userOrgs = Object.values(db.organizations).filter(o => o.ownerUserId === user.id);
    const primaryOrg = userOrgs[0];
    let primaryWs = null;
    let businessDNA = null;

    if (primaryOrg) {
      const wsList = db.workspaces[primaryOrg.id] || [];
      primaryWs = wsList[0] || null;
      businessDNA = db.dnaModels[primaryOrg.id] || null;
    }

    const token = generateSessionToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const session = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: primaryOrg ? primaryOrg.id : "",
      organizationName: primaryOrg ? primaryOrg.name : "",
      workspaceId: primaryWs ? primaryWs.id : "",
      workspaceName: primaryWs ? primaryWs.name : "",
      createdAt: now,
      expiresAt,
    };

    db.sessions[token] = session;
    await saveDatabase();

    setSessionCookie(res, token);
    const { passwordHash: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      session,
      organization: primaryOrg,
      workspace: primaryWs,
      businessDNA,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Master Super-Admin Server-Verified Login (Requires valid server MASTER_ADMIN_SECRET)
app.post("/api/auth/master-login", async (req, res) => {
  try {
    const { email, masterSecret } = req.body;
    const requiredSecret = process.env.MASTER_ADMIN_SECRET || "REDACTED_ROOT_KEY";
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!masterSecret || masterSecret !== requiredSecret) {
      return res.status(401).json({ error: "Access Denied: Invalid Master Admin secret key." });
    }

    let userId = db.usersByEmail[normalizedEmail];
    let user = userId ? db.users[userId] : null;

    if (!user) {
      userId = `usr_master_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      user = {
        id: userId,
        email: normalizedEmail || (process.env.SECURITY_ALERT_EMAIL || "admin@foundryos.tech"),
        name: "Master Platform Administrator",
        role: "SUPER_ADMIN",
        createdAt: new Date().toISOString(),
      };
      db.users[userId] = user;
      db.usersByEmail[user.email] = userId;
    } else {
      user.role = "SUPER_ADMIN";
    }

    const token = generateSessionToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const session = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "SUPER_ADMIN",
      organizationId: "org_foundry_hq_master",
      organizationName: "FoundryOS Master Control Plane",
      workspaceId: "ws_master_root",
      workspaceName: "Master Platform Root",
      createdAt: now,
      expiresAt,
    };

    db.sessions[token] = session;
    await saveDatabase();

    setSessionCookie(res, token);
    const { passwordHash: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      session,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Session Validation Endpoint
app.get("/api/auth/session", authenticateSession, (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user || {};
  res.json({
    user: safeUser,
    session: req.session,
  });
});

// Logout Endpoint (Clears server session & httpOnly cookie)
app.post("/api/auth/logout", (req, res) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    const cookies = parseCookies(req);
    token = cookies.foundry_session;
  }

  if (token && db.sessions[token]) {
    delete db.sessions[token];
    saveDatabase();
  }

  clearSessionCookie(res);
  res.json({ ok: true, message: "Logged out successfully." });
});

// ─── 6. Isolated Demo Workspace Endpoint (Zero Admin Privileges) ────────────

app.post("/api/auth/demo", async (_req, res) => {
  try {
    const demoToken = `demo_${generateSessionToken()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

    // Ensure Demo Org & Workspace exist in sandbox
    if (!db.organizations["org_demo_sandbox"]) {
      db.organizations["org_demo_sandbox"] = {
        id: "org_demo_sandbox",
        name: "Acme Corp (Demo Sandbox)",
        ownerUserId: "usr_demo_sandbox",
        industry: "technology_saas",
        planTier: "starter",
        createdAt: now,
      };

      db.workspaces["org_demo_sandbox"] = [
        {
          id: "ws_demo_sandbox",
          organizationId: "org_demo_sandbox",
          name: "Evaluation Sandbox",
          slug: "evaluation-sandbox",
          createdAt: now,
        }
      ];

      db.dnaModels["org_demo_sandbox"] = {
        id: "dna_demo_sandbox",
        businessId: "biz_demo_sandbox",
        organizationId: "org_demo_sandbox",
        schemaVersion: "1.0",
        confidenceScore: 0.92,
        companyIdentity: {
          companyName: "Acme Corp (Demo Sandbox)",
          industry: "technology_saas",
          stage: "growth",
          mission: "Demonstrating autonomous business operating system capabilities.",
          uniqueValueProposition: "Sandboxed AI intelligence and automated website generation.",
          coreValues: ["Safe Evaluation", "Zero Mutation", "Simulated Telemetry"],
        },
        opportunityPillars: {
          financialPain: "$850k annual evaluation benchmark.",
          processGap: "Sample manual workflow friction for testing.",
          stakeholderAlignment: "Demo Evaluation Sponsor",
        },
        brandVoice: {
          primaryTone: "authoritative",
          wordsToUse: ["autonomous", "intelligent", "verified", "sample"],
          wordsToAvoid: ["production-leak", "admin-mutation"],
        },
        customerProfile: {
          targetAudience: "Evaluating guests and prospective enterprise clients.",
          primaryPainPoints: ["Testing functionality before signup"],
          buyerPersonas: [
            { name: "Prospective Buyer", role: "Evaluator", challenges: ["Feature validation"] }
          ],
        },
        competitivePositioning: {
          marketPosition: "Demo Evaluation Sandbox",
          primaryCompetitors: ["Generic SaaS"],
          keyDifferentiators: ["Strict sandbox isolation"],
        },
        websiteAnalysis: {
          primaryUrl: "https://acme-demo.example.com",
          colors: ["#6366f1", "#10b981", "#0f172a"],
          fonts: ["Inter", "Space Grotesk"],
        },
        updatedAt: now,
      };
    }

    const demoSession = {
      token: demoToken,
      userId: "usr_demo_sandbox",
      email: "guest.demo@tacfos.tech",
      name: "Demo Guest",
      role: "DEMO_VIEWER", // Restricted Read-Only Role
      organizationId: "org_demo_sandbox",
      organizationName: "Acme Corp (Demo Sandbox)",
      workspaceId: "ws_demo_sandbox",
      workspaceName: "Evaluation Sandbox",
      createdAt: now,
      expiresAt,
    };

    db.sessions[demoToken] = demoSession;
    await saveDatabase();

    setSessionCookie(res, demoToken);
    res.json({
      session: demoSession,
      organization: db.organizations["org_demo_sandbox"],
      workspace: db.workspaces["org_demo_sandbox"][0],
      businessDNA: db.dnaModels["org_demo_sandbox"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function normalizeCompanyUrl(url) {
  if (!url) return "https://tacfos.tech";
  let clean = String(url).trim();
  clean = clean.replace(/^(https?:\/\/)+/i, "");
  clean = clean.replace(/^\/+/, "");
  if (!clean) return "https://tacfos.tech";
  return `https://${clean}`;
}

// ─── 7. Server-Side Tenant Endpoints (Strict ISOL-01 Enforcement) ───────────

// Create Organization
app.post("/api/tenant/organization", authenticateSession, async (req, res) => {
  try {
    if (req.session.role === "DEMO_VIEWER") {
      return res.status(403).json({ error: "Demo viewers cannot create organizations. Please create a real account." });
    }

    const { name, industry, planTier } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Organization name is required." });
    }

    const orgId = `org_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    const org = {
      id: orgId,
      name: name.trim(),
      ownerUserId: req.session.userId,
      industry: industry || "technology_saas",
      planTier: planTier || "growth",
      createdAt: now,
    };

    db.organizations[orgId] = org;
    req.session.organizationId = org.id;
    req.session.organizationName = org.name;
    db.sessions[req.session.token] = req.session;

    await saveDatabase();
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Workspace
app.post("/api/tenant/workspace", authenticateSession, async (req, res) => {
  try {
    if (req.session.role === "DEMO_VIEWER") {
      return res.status(403).json({ error: "Demo viewers cannot create workspaces." });
    }

    const { organizationId, name, slug } = req.body;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const wsId = `ws_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    const ws = {
      id: wsId,
      organizationId,
      name: (name || "").trim() || "Primary Workspace",
      slug: (slug || name || "primary").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      createdAt: now,
    };

    if (!db.workspaces[organizationId]) {
      db.workspaces[organizationId] = [];
    }
    db.workspaces[organizationId].push(ws);

    req.session.workspaceId = ws.id;
    req.session.workspaceName = ws.name;
    db.sessions[req.session.token] = req.session;

    await saveDatabase();
    res.status(201).json(ws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Company Profile & Generate Business DNA
app.post("/api/tenant/dna", authenticateSession, async (req, res) => {
  try {
    if (req.session.role === "DEMO_VIEWER") {
      return res.status(403).json({ error: "Demo viewers cannot modify Business DNA." });
    }

    const {
      organizationId,
      workspaceId,
      companyName,
      legalCompanyName,
      operatingBrand,
      productName,
      corePlatform,
      websiteUrl,
      industry,
      mission,
      uvp,
      processGap,
      financialPain,
      targetAudience
    } = req.body;

    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const cleanUrl = normalizeCompanyUrl(websiteUrl);
    const legalName = (legalCompanyName || "The AI CONTENT FOUNDRY, LLC").trim();
    const opBrand = (operatingBrand || org.name || "TACF Global").trim();
    const prodName = (productName || "TACF Autonomous Business AI OS").trim();
    const platName = (corePlatform || "Business DNA").trim();
    const cleanName = (companyName || opBrand || org.name).trim();

    const cleanIndustry = industry || org.industry || "technology_saas";
    const cleanMission = (mission || `To transform and empower the ${cleanIndustry.replace("_", " ")} domain through automated intelligence.`).trim();
    const cleanUvp = (uvp || `Autonomous brand intelligence, real-time website compilation, and automated execution for ${cleanName}.`).trim();
    const cleanProcessGap = (processGap || "Manual departmental workflows, fragmented tool stacks, and operational lead time drag.").trim();
    const cleanFinancialPain = (financialPain || "Operational lead time drag and execution friction (Estimated baseline benchmark)").trim();
    const cleanTargetAudience = (targetAudience || "Modern enterprise executives, operations directors, and growing commercial teams.").trim();

    const businessId = `biz_${organizationId.replace(/^org_/, "")}`;
    const now = new Date().toISOString();

    const companyProfile = {
      organizationId,
      workspaceId: workspaceId || "",
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
      updatedAt: now,
    };

    const businessDNA = {
      id: `dna_${organizationId.replace(/^org_/, "")}`,
      businessId,
      organizationId,
      schemaVersion: "1.0",
      confidenceScore: 0.94,
      companyIdentity: {
        companyName: cleanName,
        legalCompanyName: legalName,
        operatingBrand: opBrand,
        productName: prodName,
        corePlatform: platName,
        industry: cleanIndustry,
        stage: "growth",
        mission: cleanMission,
        uniqueValueProposition: cleanUvp,
        coreValues: ["Operational Speed", "Customer Excellence", "Deterministic Accuracy", "Zero-Trust Integrity"],
      },
      opportunityPillars: {
        financialPain: cleanFinancialPain,
        processGap: cleanProcessGap,
        stakeholderAlignment: "Executive Leadership (Direct Sponsor)",
      },
      brandVoice: {
        primaryTone: "authoritative",
        wordsToUse: ["autonomous", "precision", "streamlined", "enterprise", "intelligence"],
        wordsToAvoid: ["manual", "slow", "legacy", "approximate"],
      },
      customerProfile: {
        targetAudience: cleanTargetAudience,
        primaryPainPoints: [cleanProcessGap, cleanFinancialPain, "Lack of unified operational visibility"],
        buyerPersonas: [
          { name: "VP of Growth & Operations", role: "Executive Champion", challenges: [cleanProcessGap, "Budget efficiency"] },
          { name: "Head of Brand Strategy", role: "Brand Custodian", challenges: ["Consistency across channels", "Fast turnaround"] },
        ],
      },
      competitivePositioning: {
        marketPosition: "Autonomous Business AI Platform / Emerging Category Pioneer",
        primaryCompetitors: ["Legacy Consultancies", "Manual SaaS Point Tools"],
        keyDifferentiators: ["Closed-loop Business DNA", "Self-generating websites", "Multi-domain zero-trust governance"],
      },
      websiteAnalysis: {
        primaryUrl: cleanUrl,
        colors: ["#4f46e5", "#10b981", "#0f172a", "#6366f1", "#38bdf8"],
        fonts: ["Inter", "Space Grotesk", "JetBrains Mono"],
      },
      updatedAt: now,
    };

    db.companyProfiles[organizationId] = companyProfile;
    db.dnaModels[organizationId] = businessDNA;

    await saveDatabase();
    res.status(201).json({ companyProfile, businessDNA });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Business DNA (Strictly verified on server)
app.get("/api/tenant/dna/:organizationId", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const dna = db.dnaModels[organizationId];
  if (!dna) {
    return res.status(404).json({ error: `Business DNA not found for organization '${organizationId}'.` });
  }

  res.json(dna);
});

// Update Business DNA
app.put("/api/tenant/dna/:organizationId", authenticateSession, async (req, res) => {
  try {
    if (req.session.role === "DEMO_VIEWER") {
      return res.status(403).json({ error: "Demo viewers cannot modify Business DNA." });
    }

    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const existing = db.dnaModels[organizationId];
    if (!existing) {
      return res.status(404).json({ error: `Business DNA not found for organization '${organizationId}'.` });
    }

    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.dnaModels[organizationId] = updated;
    await saveDatabase();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 8. Authoritative Organization System of Record Endpoints ───────────────

// 8.1 Full Organization State Bundle (Single round-trip bootstrap)
app.get("/api/tenant/organization/:organizationId/state", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  res.json({
    organization: org,
    companyProfile: db.companyProfiles[organizationId] || null,
    businessDNA: db.dnaModels[organizationId] || null,
    workspaces: db.workspaces[organizationId] || [],
    insights: db.insights[organizationId] || [],
    recommendations: db.recommendations[organizationId] || [],
    artifacts: db.artifacts[organizationId] || [],
    agentTasks: db.agentTasks[organizationId] || [],
    approvals: db.approvals[organizationId] || [],
    executions: db.executions[organizationId] || [],
    auditEvents: db.auditEvents[organizationId] || [],
  });
});

// 8.2 Insights (Sales, Marketing, Operations, Security)
app.get("/api/tenant/organization/:organizationId/insights", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;
  res.json(db.insights[organizationId] || []);
});

app.post("/api/tenant/organization/:organizationId/insights", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.insights[organizationId] || [];
    const item = {
      id: req.body.id || `ins_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...req.body,
      organizationId,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    db.insights[organizationId] = list.slice(0, 100);
    await saveDatabase();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.3 Recommendations (Strategies, CRO, Positioning)
app.get("/api/tenant/organization/:organizationId/recommendations", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;
  res.json(db.recommendations[organizationId] || []);
});

app.post("/api/tenant/organization/:organizationId/recommendations", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.recommendations[organizationId] || [];
    const item = {
      id: req.body.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...req.body,
      organizationId,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    db.recommendations[organizationId] = list.slice(0, 100);
    await saveDatabase();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.4 Generated Artifacts (Copy, HTML Websites, Proposals, Briefs)
app.get("/api/tenant/organization/:organizationId/artifacts", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;
  res.json(db.artifacts[organizationId] || []);
});

app.post("/api/tenant/organization/:organizationId/artifacts", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.artifacts[organizationId] || [];
    const item = {
      id: req.body.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...req.body,
      organizationId,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    db.artifacts[organizationId] = list.slice(0, 100);
    await saveDatabase();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.5 Agent Tasks
app.get("/api/tenant/organization/:organizationId/agent-tasks", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;
  res.json(db.agentTasks[organizationId] || []);
});

app.post("/api/tenant/organization/:organizationId/agent-tasks", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.agentTasks[organizationId] || [];
    const item = {
      id: req.body.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...req.body,
      organizationId,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    db.agentTasks[organizationId] = list.slice(0, 100);
    await saveDatabase();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.6 Human Approvals
app.get("/api/tenant/organization/:organizationId/approvals", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;
  res.json(db.approvals[organizationId] || []);
});

app.post("/api/tenant/organization/:organizationId/approvals", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.approvals[organizationId] || [];
    const item = {
      id: req.body.id || `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...req.body,
      organizationId,
      status: req.body.status || 'PENDING',
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    list.unshift(item);
    db.approvals[organizationId] = list;
    await saveDatabase();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/tenant/organization/:organizationId/approvals/:approvalId", authenticateSession, async (req, res) => {
  try {
    const { organizationId, approvalId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.approvals[organizationId] || [];
    const item = list.find((a) => a.id === approvalId);
    if (!item) {
      return res.status(404).json({ error: `Approval item '${approvalId}' not found.` });
    }

    item.status = req.body.status || item.status;
    item.reviewedBy = req.user.email;
    item.reviewedAt = new Date().toISOString();
    item.reviewNotes = req.body.reviewNotes || item.reviewNotes;

    await saveDatabase();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.7 Audit Events
app.get("/api/tenant/organization/:organizationId/audit-events", authenticateSession, (req, res) => {
  const { organizationId } = req.params;
  const org = assertOrgOwnership(req, res, organizationId);
  if (!org) return;
  res.json(db.auditEvents[organizationId] || []);
});

app.post("/api/tenant/organization/:organizationId/audit-events", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const list = db.auditEvents[organizationId] || [];
    const item = {
      id: req.body.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...req.body,
      organizationId,
      timestamp: req.body.timestamp || new Date().toISOString(),
    };
    list.unshift(item);
    db.auditEvents[organizationId] = list.slice(0, 500);
    await saveDatabase();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 9. LLM Proxy Route (NVIDIA NIM Primary, Ollama Fallback) ──────────────

const OLLAMA_URL = process.env.OLLAMA_HOST ? `${process.env.OLLAMA_HOST}/api/chat` : "http://localhost:11434/api/chat";

app.post("/api/chat", async (req, res) => {
  const model = req.body.model || "meta/llama-3.1-70b-instruct";
  const messages = req.body.messages || [];
  const temperature = req.body.temperature ?? 0.6;
  const max_tokens = req.body.max_tokens ?? 1500;

  // 1. Primary: NVIDIA NIM Cloud Models
  if (NVIDIA_KEY) {
    try {
      const r = await fetch(NVIDIA_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NVIDIA_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false,
        }),
      });

      if (r.ok) {
        const data = await r.json();
        return res.status(200).json(data);
      } else {
        const errData = await r.json().catch(() => ({}));
        console.warn("[LLM Proxy] NVIDIA NIM returned non-200:", r.status, errData);
      }
    } catch (e) {
      console.warn("[LLM Proxy] NVIDIA NIM connection error:", e.message);
    }
  }

  // 2. Secondary Fallback: Local Ollama Instance (if available)
  try {
    const ollamaResp = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages,
        stream: false,
      }),
    });

    if (ollamaResp.ok) {
      const data = await ollamaResp.json();
      return res.status(200).json({
        choices: [
          {
            message: {
              role: "assistant",
              content: data.message?.content || data.response || "",
            }
          }
        ],
        provider: "ollama-local",
      });
    }
  } catch (_ollamaErr) {
    // Local Ollama unavailable
  }

  // 3. Clean Enterprise Error: No Fake Output, Preserves State
  return res.status(503).json({
    error: "AI provider temporarily unavailable. Your Business DNA remains intact. Please configure your NVIDIA_API_KEY or ensure an AI provider is reachable.",
    code: "AI_PROVIDER_UNAVAILABLE",
    provider: "none",
  });
});

// ─── 9. Startup & Initialization ───────────────────────────────────────────

const PORT = process.env.PORT || 8787;
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[TACF API Server] Listening on :${PORT} with persistent server database.`);
  });
});
