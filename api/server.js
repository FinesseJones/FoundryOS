import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let rootDir = path.resolve(__dirname, "..");
if (!fs.existsSync(path.join(rootDir, "package.json")) && fs.existsSync(path.join(__dirname, "package.json"))) {
  rootDir = __dirname;
}

// Locate and load .env synchronously from root or cwd
const envCandidates = [
  path.join(rootDir, ".env"),
  path.join(process.cwd(), ".env"),
  path.join(__dirname, ".env"),
];

for (const cand of envCandidates) {
  if (fs.existsSync(cand)) {
    dotenv.config({ path: cand, override: true });
    break;
  }
}

// Guarantee DATABASE_URL resolves properly for SQLite vs PostgreSQL
const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");
if (!isPostgres) {
  const defaultDbPath = path.resolve(rootDir, "data/foundry.db");
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
    process.env.DATABASE_URL = `file:${defaultDbPath}`;
  } else if (process.env.DATABASE_URL.startsWith("file:.") || (!process.env.DATABASE_URL.startsWith("file:/") && process.env.DATABASE_URL.startsWith("file:"))) {
    const relPath = process.env.DATABASE_URL.replace(/^file:/, "");
    process.env.DATABASE_URL = `file:${path.resolve(rootDir, relPath)}`;
  }
}

import express from "express";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

const app = express();

const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_1UAnCLLUpAOiyhmZYbRKEHk0",
  growth: process.env.STRIPE_PRICE_GROWTH || "price_1UAnCLLUpAOiyhmZ8AruC2Ew",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "price_1UAnCMLUpAOiyhmZNeAsbeOR",
};

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.trim()) {
    return null;
  }
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
  });
}

// ─── 1. Stripe Raw Webhook Endpoint (MUST be before express.json()) ─────────

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !webhookSecret.trim()) {
      console.error("[Stripe Webhook] Error: STRIPE_WEBHOOK_SECRET not configured on server.");
      return res.status(500).json({ error: "Stripe webhook secret not configured." });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe secret key not configured." });
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header." });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    console.log(`[Stripe Webhook] Verified event received: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          let organizationId = session.client_reference_id || session.metadata?.organizationId;
          const stripeCustomerId = session.customer;
          const stripeSubscriptionId = session.subscription;
          const planTier = session.metadata?.planTier || "growth";

          if (!organizationId && stripeCustomerId) {
            const existingOrg = await prisma.organization.findUnique({
              where: { stripeCustomerId },
            });
            organizationId = existingOrg?.id;
          }

          if (organizationId) {
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                stripeCustomerId,
                stripeSubscriptionId,
                planTier,
                subscriptionStatus: "active",
              },
            });
            console.log(`[Stripe Webhook] Organization '${organizationId}' activated on tier '${planTier}'.`);
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          let organizationId = subscription.metadata?.organizationId;
          const stripeCustomerId = subscription.customer;
          const stripeSubscriptionId = subscription.id;
          const planTier = subscription.metadata?.planTier || "growth";
          const status = subscription.status;
          const currentPeriodStart = typeof subscription.current_period_start === 'number' && !isNaN(subscription.current_period_start)
            ? new Date(subscription.current_period_start * 1000)
            : new Date();
          const currentPeriodEnd = typeof subscription.current_period_end === 'number' && !isNaN(subscription.current_period_end)
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 3600 * 1000);
          const stripePriceId = subscription.items?.data?.[0]?.price?.id || "";

          if (!organizationId && stripeCustomerId) {
            const existingOrg = await prisma.organization.findUnique({
              where: { stripeCustomerId },
            });
            organizationId = existingOrg?.id;
          }

          if (organizationId) {
            await prisma.subscription.upsert({
              where: { stripeSubscriptionId },
              create: {
                organizationId,
                stripeCustomerId,
                stripeSubscriptionId,
                stripePriceId,
                planTier,
                status,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
              },
              update: {
                status,
                planTier,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
              },
            });

            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                stripeCustomerId,
                stripeSubscriptionId,
                planTier,
                subscriptionStatus: status,
                currentPeriodEnd,
              },
            });
            console.log(`[Stripe Webhook] Updated subscription for org '${organizationId}' to status '${status}'.`);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const organizationId = subscription.metadata?.organizationId;
          const stripeSubscriptionId = subscription.id;

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId },
            data: { status: "canceled" },
          });

          if (organizationId) {
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                subscriptionStatus: "canceled",
              },
            });
            console.log(`[Stripe Webhook] Subscription canceled for org '${organizationId}'.`);
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object;
          const stripeSubscriptionId = invoice.subscription;
          if (stripeSubscriptionId) {
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId },
              data: { status: "active" },
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const stripeSubscriptionId = invoice.subscription;
          if (stripeSubscriptionId) {
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId },
              data: { status: "past_due" },
            });
            await prisma.organization.updateMany({
              where: { stripeSubscriptionId },
              data: { subscriptionStatus: "past_due" },
            });
          }
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("[Stripe Webhook] Error processing event:", err);
      res.status(500).json({ error: "Failed to process webhook event." });
    }
  }
);

// ─── 2. Global JSON Body Parser (Applied to all remaining routes) ───────────

app.use(express.json({ limit: "2mb" }));

// ─── 3. Server-Side Scrypt Password Hashing ─────────────────────────────────

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

// ─── 4. Server Authentication & httpOnly Cookie Handling ───────────────────

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieParts = [
    `foundry_session=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=604800", // 7 days
  ];
  if (isProd) {
    cookieParts.push("Secure");
  }
  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "foundry_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

async function authenticateSession(req, res, next) {
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

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Invalid session token. Please sign in again." });
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    clearSessionCookie(res);
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }

  req.session = session;
  req.user = session.user;
  next();
}

async function assertOrgOwnership(req, res, organizationId) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

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

// ─── 5. Health Check Endpoint ───────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");
    res.json({
      ok: true,
      service: "foundryos-api",
      key: !!process.env.NVIDIA_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      database: isPostgres ? "prisma_postgresql" : "prisma_sqlite",
      databaseUrl: process.env.DATABASE_URL,
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── 6. Server-Side Authentication Endpoints ────────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ error: `Account '${normalizedEmail}' already exists.` });
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: normalizedEmail,
        name: (name || "").trim() || normalizedEmail.split("@")[0],
        role: "ADMIN",
        passwordHash,
      },
    });

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        id: token,
        token,
        userId: user.id,
        role: user.role,
        organizationId: "",
        organizationName: "",
        expiresAt,
      },
    });

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

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Find primary organization & workspace
    const primaryOrg = await prisma.organization.findFirst({
      where: { ownerUserId: user.id },
      include: { workspaces: true },
    });

    let primaryWs = primaryOrg?.workspaces?.[0] || null;
    let businessDNA = null;

    if (primaryOrg) {
      const dnaRecord = await prisma.businessDNA.findUnique({
        where: { organizationId: primaryOrg.id },
      });
      if (dnaRecord) {
        try {
          businessDNA = JSON.parse(dnaRecord.dataJson);
        } catch {}
      }
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        id: token,
        token,
        userId: user.id,
        role: user.role,
        organizationId: primaryOrg ? primaryOrg.id : "",
        organizationName: primaryOrg ? primaryOrg.name : "",
        workspaceId: primaryWs ? primaryWs.id : "",
        workspaceName: primaryWs ? primaryWs.name : "",
        expiresAt,
      },
    });

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

// Master Super-Admin Server-Verified Login
app.post("/api/auth/master-login", async (req, res) => {
  try {
    const { email, masterSecret } = req.body;
    const requiredSecret = process.env.MASTER_ADMIN_SECRET;

    if (!requiredSecret || !requiredSecret.trim()) {
      return res.status(500).json({ error: "Master admin secret not configured on server." });
    }

    if (!masterSecret || typeof masterSecret !== "string") {
      return res.status(401).json({ error: "Access Denied: Invalid Master Admin secret key." });
    }

    // Constant-time comparison using fixed-length SHA-256 digests
    const submittedHash = crypto.createHash("sha256").update(masterSecret).digest();
    const requiredHash = crypto.createHash("sha256").update(requiredSecret).digest();

    if (!crypto.timingSafeEqual(submittedHash, requiredHash)) {
      return res.status(401).json({ error: "Access Denied: Invalid Master Admin secret key." });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail || "admin@foundryos.tech" },
    });

    if (!user) {
      const userId = `usr_master_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      user = await prisma.user.create({
        data: {
          id: userId,
          email: normalizedEmail || (process.env.SECURITY_ALERT_EMAIL || "admin@foundryos.tech"),
          name: "Master Platform Administrator",
          role: "SUPER_ADMIN",
        },
      });
    } else if (user.role !== "SUPER_ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "SUPER_ADMIN" },
      });
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        id: token,
        token,
        userId: user.id,
        role: "SUPER_ADMIN",
        organizationId: "org_foundry_hq_master",
        organizationName: "FoundryOS Master Control Plane",
        workspaceId: "ws_master_root",
        workspaceName: "Master Platform Root",
        expiresAt,
      },
    });

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

// Logout Endpoint
app.post("/api/auth/logout", async (req, res) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    const cookies = parseCookies(req);
    token = cookies.foundry_session;
  }

  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }

  clearSessionCookie(res);
  res.json({ ok: true, message: "Logged out successfully." });
});

// Demo Sandbox Endpoint
app.post("/api/auth/demo", async (_req, res) => {
  try {
    const demoToken = `demo_${generateSessionToken()}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    let demoUser = await prisma.user.findUnique({
      where: { email: "guest.demo@tacfos.tech" },
    });

    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          id: "usr_demo_sandbox",
          email: "guest.demo@tacfos.tech",
          name: "Demo Guest",
          role: "DEMO_VIEWER",
        },
      });
    }

    let demoOrg = await prisma.organization.findUnique({
      where: { id: "org_demo_sandbox" },
    });

    if (!demoOrg) {
      demoOrg = await prisma.organization.create({
        data: {
          id: "org_demo_sandbox",
          name: "Acme Corp (Demo Sandbox)",
          ownerUserId: demoUser.id,
          industry: "technology_saas",
          planTier: "starter",
        },
      });
    }

    let demoWs = await prisma.workspace.findFirst({
      where: { organizationId: "org_demo_sandbox" },
    });

    if (!demoWs) {
      demoWs = await prisma.workspace.create({
        data: {
          id: "ws_demo_sandbox",
          organizationId: "org_demo_sandbox",
          name: "Evaluation Sandbox",
          slug: "evaluation-sandbox",
        },
      });
    }

    const demoDNAObj = {
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
          { name: "Prospective Buyer", role: "Evaluator", challenges: ["Feature validation"] },
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
      updatedAt: new Date().toISOString(),
    };

    await prisma.businessDNA.upsert({
      where: { businessId: "biz_demo_sandbox" },
      create: {
        id: "dna_demo_sandbox",
        organizationId: "org_demo_sandbox",
        businessId: "biz_demo_sandbox",
        dataJson: JSON.stringify(demoDNAObj),
      },
      update: {
        dataJson: JSON.stringify(demoDNAObj),
      },
    });

    const demoSession = await prisma.session.create({
      data: {
        id: demoToken,
        token: demoToken,
        userId: demoUser.id,
        role: "DEMO_VIEWER",
        organizationId: "org_demo_sandbox",
        organizationName: "Acme Corp (Demo Sandbox)",
        workspaceId: demoWs.id,
        workspaceName: demoWs.name,
        expiresAt,
      },
    });

    setSessionCookie(res, demoToken);
    res.json({
      session: demoSession,
      organization: demoOrg,
      workspace: demoWs,
      businessDNA: demoDNAObj,
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

// ─── 7. Stripe Subscription & Billing Endpoints (Fail-Closed) ───────────────

app.post("/api/billing/create-checkout-session", authenticateSession, async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe secret key not configured on server. Fail closed: please set STRIPE_SECRET_KEY in environment or .env.",
      });
    }

    const { organizationId, planTier, successUrl, cancelUrl } = req.body;
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required." });
    }

    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const tier = (planTier || "growth").toLowerCase();
    const priceId = STRIPE_PRICES[tier];

    if (!priceId) {
      return res.status(400).json({
        error: `Invalid plan tier '${planTier}'. Standardized tiers are starter ($497), growth ($997), enterprise ($2,497).`,
      });
    }

    // 1. Get or create Stripe Customer
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: org.name,
        metadata: {
          organizationId: org.id,
          userId: req.user.id,
        },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // 2. Create Checkout Session using exact Stripe Price ID
    const appOrigin = req.headers.origin || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: org.id,
      mode: "subscription",
      managed_payments: { enabled: false },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        organizationId: org.id,
        planTier: tier,
        priceId,
      },
      subscription_data: {
        metadata: {
          organizationId: org.id,
          planTier: tier,
          priceId,
        },
      },
      success_url: successUrl || `${appOrigin}/?session_id={CHECKOUT_SESSION_ID}&billing=success`,
      cancel_url: cancelUrl || `${appOrigin}/?billing=canceled`,
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
      planTier: tier,
      priceId,
      stripeCustomerId: customerId,
    });
  } catch (err) {
    console.error("[Stripe Billing] Error creating checkout session:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/billing/subscription/:organizationId", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const sub = await prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      organizationId: org.id,
      planTier: org.planTier,
      subscriptionStatus: org.subscriptionStatus,
      stripeCustomerId: org.stripeCustomerId,
      stripeSubscriptionId: org.stripeSubscriptionId,
      currentPeriodEnd: org.currentPeriodEnd,
      subscription: sub || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 8. Server-Side Tenant Endpoints (Strict ISOL-01 Enforcement) ───────────

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
    const org = await prisma.organization.create({
      data: {
        id: orgId,
        name: name.trim(),
        ownerUserId: req.session.userId,
        industry: industry || "technology_saas",
        planTier: planTier || "growth",
      },
    });

    await prisma.session.update({
      where: { token: req.session.token },
      data: {
        organizationId: org.id,
        organizationName: org.name,
      },
    });

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
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const wsId = `ws_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const ws = await prisma.workspace.create({
      data: {
        id: wsId,
        organizationId,
        name: (name || "").trim() || "Primary Workspace",
        slug: (slug || name || "primary").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
    });

    await prisma.session.update({
      where: { token: req.session.token },
      data: {
        workspaceId: ws.id,
        workspaceName: ws.name,
      },
    });

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
      targetAudience,
    } = req.body;

    const org = await assertOrgOwnership(req, res, organizationId);
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
    const now = new Date();

    const companyProfile = await prisma.companyProfile.upsert({
      where: { organizationId },
      create: {
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
      },
      update: {
        workspaceId: workspaceId || "",
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
      },
    });

    const businessDNAObj = {
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
      updatedAt: now.toISOString(),
    };

    const businessDNA = await prisma.businessDNA.upsert({
      where: { organizationId },
      create: {
        id: `dna_${organizationId.replace(/^org_/, "")}`,
        organizationId,
        businessId,
        dataJson: JSON.stringify(businessDNAObj),
      },
      update: {
        dataJson: JSON.stringify(businessDNAObj),
      },
    });

    res.status(201).json({ companyProfile, businessDNA: businessDNAObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Business DNA
app.get("/api/tenant/dna/:organizationId", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const dna = await prisma.businessDNA.findUnique({
    where: { organizationId },
  });

  if (!dna) {
    return res.status(404).json({ error: `Business DNA not found for organization '${organizationId}'.` });
  }

  try {
    res.json(JSON.parse(dna.dataJson));
  } catch {
    res.json(dna);
  }
});

// Update Business DNA
app.put("/api/tenant/dna/:organizationId", authenticateSession, async (req, res) => {
  try {
    if (req.session.role === "DEMO_VIEWER") {
      return res.status(403).json({ error: "Demo viewers cannot modify Business DNA." });
    }

    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const existing = await prisma.businessDNA.findUnique({
      where: { organizationId },
    });

    if (!existing) {
      return res.status(404).json({ error: `Business DNA not found for organization '${organizationId}'.` });
    }

    let existingObj = {};
    try {
      existingObj = JSON.parse(existing.dataJson);
    } catch {}

    const updatedObj = {
      ...existingObj,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await prisma.businessDNA.update({
      where: { organizationId },
      data: {
        dataJson: JSON.stringify(updatedObj),
      },
    });

    res.json(updatedObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 9. Authoritative Organization System of Record Endpoints ───────────────

// 9.1 Full Organization State Bundle
app.get("/api/tenant/organization/:organizationId/state", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const [
    workspaces,
    profile,
    dnaRecord,
    insights,
    recommendations,
    artifacts,
    agentTasks,
    approvals,
    auditEvents,
    subscriptions,
  ] = await Promise.all([
    prisma.workspace.findMany({ where: { organizationId } }),
    prisma.companyProfile.findUnique({ where: { organizationId } }),
    prisma.businessDNA.findUnique({ where: { organizationId } }),
    prisma.insightRecord.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.recommendationRecord.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.artifactRecord.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.agentTaskRecord.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.approvalRequest.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
    prisma.auditEvent.findMany({ where: { organizationId }, orderBy: { timestamp: "desc" }, take: 500 }),
    prisma.subscription.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
  ]);

  let businessDNA = null;
  if (dnaRecord) {
    try {
      businessDNA = JSON.parse(dnaRecord.dataJson);
    } catch {}
  }

  res.json({
    organization: org,
    companyProfile: profile || null,
    businessDNA,
    workspaces,
    subscriptions,
    insights: insights.map((i) => {
      try {
        return { id: i.id, organizationId: i.organizationId, title: i.title, summary: i.summary, category: i.category, impact: i.impact, createdAt: i.createdAt.toISOString(), ...JSON.parse(i.dataJson || "{}") };
      } catch {
        return i;
      }
    }),
    recommendations: recommendations.map((r) => {
      try {
        return { id: r.id, organizationId: r.organizationId, title: r.title, description: r.description, priority: r.priority, status: r.status, createdAt: r.createdAt.toISOString(), ...JSON.parse(r.dataJson || "{}") };
      } catch {
        return r;
      }
    }),
    artifacts: artifacts.map((a) => {
      try {
        return { id: a.id, organizationId: a.organizationId, title: a.title, type: a.type, content: a.content, createdAt: a.createdAt.toISOString(), ...JSON.parse(a.dataJson || "{}") };
      } catch {
        return a;
      }
    }),
    agentTasks: agentTasks.map((t) => {
      try {
        return { id: t.id, organizationId: t.organizationId, agentName: t.agentName, taskTitle: t.taskTitle, status: t.status, createdAt: t.createdAt.toISOString(), ...JSON.parse(t.dataJson || "{}") };
      } catch {
        return t;
      }
    }),
    approvals,
    executions: [],
    auditEvents: auditEvents.map((e) => {
      try {
        return { id: e.id, organizationId: e.organizationId, businessId: e.businessId, action: e.action, changedBy: e.changedBy, timestamp: e.timestamp.toISOString(), details: JSON.parse(e.detailsJson) };
      } catch {
        return e;
      }
    }),
  });
});

// 9.2 Insights
app.get("/api/tenant/organization/:organizationId/insights", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const records = await prisma.insightRecord.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(records.map((i) => {
    try {
      return { id: i.id, organizationId: i.organizationId, title: i.title, summary: i.summary, category: i.category, impact: i.impact, createdAt: i.createdAt.toISOString(), ...JSON.parse(i.dataJson || "{}") };
    } catch {
      return i;
    }
  }));
});

app.post("/api/tenant/organization/:organizationId/insights", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const id = req.body.id || `ins_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const created = await prisma.insightRecord.create({
      data: {
        id,
        organizationId,
        title: req.body.title || "Operational Insight",
        summary: req.body.summary || "",
        category: req.body.category || "operations",
        impact: req.body.impact || "medium",
        dataJson: JSON.stringify(req.body),
      },
    });

    res.status(201).json({ id: created.id, ...req.body, organizationId, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9.3 Recommendations
app.get("/api/tenant/organization/:organizationId/recommendations", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const records = await prisma.recommendationRecord.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(records.map((r) => {
    try {
      return { id: r.id, organizationId: r.organizationId, title: r.title, description: r.description, priority: r.priority, status: r.status, createdAt: r.createdAt.toISOString(), ...JSON.parse(r.dataJson || "{}") };
    } catch {
      return r;
    }
  }));
});

app.post("/api/tenant/organization/:organizationId/recommendations", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const id = req.body.id || `rec_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const created = await prisma.recommendationRecord.create({
      data: {
        id,
        organizationId,
        title: req.body.title || "Strategic Recommendation",
        description: req.body.description || "",
        priority: req.body.priority || "high",
        status: req.body.status || "OPEN",
        dataJson: JSON.stringify(req.body),
      },
    });

    res.status(201).json({ id: created.id, ...req.body, organizationId, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9.4 Artifacts
app.get("/api/tenant/organization/:organizationId/artifacts", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const records = await prisma.artifactRecord.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(records.map((a) => {
    try {
      return { id: a.id, organizationId: a.organizationId, title: a.title, type: a.type, content: a.content, createdAt: a.createdAt.toISOString(), ...JSON.parse(a.dataJson || "{}") };
    } catch {
      return a;
    }
  }));
});

app.post("/api/tenant/organization/:organizationId/artifacts", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const id = req.body.id || `art_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const created = await prisma.artifactRecord.create({
      data: {
        id,
        organizationId,
        title: req.body.title || "Generated Artifact",
        type: req.body.type || "document",
        content: req.body.content || "",
        dataJson: JSON.stringify(req.body),
      },
    });

    res.status(201).json({ id: created.id, ...req.body, organizationId, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9.5 Agent Tasks
app.get("/api/tenant/organization/:organizationId/agent-tasks", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const records = await prisma.agentTaskRecord.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(records.map((t) => {
    try {
      return { id: t.id, organizationId: t.organizationId, agentName: t.agentName, taskTitle: t.taskTitle, status: t.status, createdAt: t.createdAt.toISOString(), ...JSON.parse(t.dataJson || "{}") };
    } catch {
      return t;
    }
  }));
});

app.post("/api/tenant/organization/:organizationId/agent-tasks", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const id = req.body.id || `task_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const created = await prisma.agentTaskRecord.create({
      data: {
        id,
        organizationId,
        agentName: req.body.agentName || "GeneralAgent",
        taskTitle: req.body.taskTitle || "Automated Task",
        status: req.body.status || "PENDING",
        dataJson: JSON.stringify(req.body),
      },
    });

    res.status(201).json({ id: created.id, ...req.body, organizationId, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9.6 Human Approvals
app.get("/api/tenant/organization/:organizationId/approvals", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const records = await prisma.approvalRequest.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  res.json(records);
});

app.post("/api/tenant/organization/:organizationId/approvals", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const id = req.body.id || `appr_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const created = await prisma.approvalRequest.create({
      data: {
        id,
        organizationId,
        businessId: req.body.businessId || "",
        workflowRunId: req.body.workflowRunId || "",
        actionTitle: req.body.actionTitle || "Action Approval Request",
        description: req.body.description || "",
        status: req.body.status || "PENDING",
        proposedByAgent: req.body.proposedByAgent || "Agent",
      },
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/tenant/organization/:organizationId/approvals/:approvalId", authenticateSession, async (req, res) => {
  try {
    const { organizationId, approvalId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const existing = await prisma.approvalRequest.findUnique({
      where: { id: approvalId },
    });

    if (!existing || existing.organizationId !== organizationId) {
      return res.status(404).json({ error: `Approval item '${approvalId}' not found.` });
    }

    const updated = await prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: req.body.status || existing.status,
        reviewedBy: req.user.email,
        reviewNote: req.body.reviewNotes || req.body.reviewNote || existing.reviewNote,
        resolvedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9.7 Audit Events
app.get("/api/tenant/organization/:organizationId/audit-events", authenticateSession, async (req, res) => {
  const { organizationId } = req.params;
  const org = await assertOrgOwnership(req, res, organizationId);
  if (!org) return;

  const records = await prisma.auditEvent.findMany({
    where: { organizationId },
    orderBy: { timestamp: "desc" },
    take: 500,
  });

  res.json(records.map((e) => {
    try {
      return {
        id: e.id,
        organizationId: e.organizationId,
        businessId: e.businessId,
        action: e.action,
        changedBy: e.changedBy,
        timestamp: e.timestamp.toISOString(),
        details: JSON.parse(e.detailsJson),
      };
    } catch {
      return e;
    }
  }));
});

app.post("/api/tenant/organization/:organizationId/audit-events", authenticateSession, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const org = await assertOrgOwnership(req, res, organizationId);
    if (!org) return;

    const id = req.body.id || `evt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const created = await prisma.auditEvent.create({
      data: {
        id,
        organizationId,
        businessId: req.body.businessId || "",
        action: req.body.action || "SYSTEM_AUDIT",
        changedBy: req.body.changedBy || req.user.email,
        detailsJson: JSON.stringify(req.body.details || req.body),
        timestamp: new Date(req.body.timestamp || Date.now()),
      },
    });

    res.status(201).json({
      id: created.id,
      organizationId: created.organizationId,
      businessId: created.businessId,
      action: created.action,
      changedBy: created.changedBy,
      timestamp: created.timestamp.toISOString(),
      details: req.body.details || req.body,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 10. LLM Proxy Route (NVIDIA NIM Primary, Ollama Fallback) ─────────────

const OLLAMA_URL = process.env.OLLAMA_HOST ? `${process.env.OLLAMA_HOST}/api/chat` : "http://localhost:11434/api/chat";

app.post("/api/chat", async (req, res) => {
  const model = req.body.model || process.env.NVIDIA_MODEL || "meta/llama-3.2-90b-vision-instruct";
  const messages = req.body.messages || [];
  const temperature = req.body.temperature ?? 0.6;
  const max_tokens = req.body.max_tokens ?? 1500;

  // 1. Primary: NVIDIA NIM Cloud Models (Sole Production Provider)
  if (NVIDIA_KEY) {
    try {
      const r = await fetch(NVIDIA_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NVIDIA_KEY}`,
          "Content-Type": "application/json",
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
        if (process.env.ENABLE_FALLBACK_PROVIDERS !== "true") {
          return res.status(r.status).json({
            error: `NVIDIA NIM upstream error: ${r.status} ${r.statusText}`,
            details: errData,
            code: "NVIDIA_UPSTREAM_ERROR",
          });
        }
      }
    } catch (e) {
      console.warn("[LLM Proxy] NVIDIA NIM connection error:", e.message);
      if (process.env.ENABLE_FALLBACK_PROVIDERS !== "true") {
        return res.status(502).json({
          error: `NVIDIA NIM connection failed: ${e.message}`,
          code: "NVIDIA_CONNECTION_FAILED",
        });
      }
    }
  }

  // 2. Secondary Fallback: Local Ollama (Only if ENABLE_FALLBACK_PROVIDERS=true)
  if (process.env.ENABLE_FALLBACK_PROVIDERS === "true") {
    try {
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3.1:latest";
      const ollamaResp = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
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
              },
            },
          ],
          provider: "ollama-local",
        });
      }
    } catch (_ollamaErr) {
      // Local Ollama unavailable
    }
  }

  // 3. Clean Enterprise Error: Fail Closed
  return res.status(503).json({
    error: "AI provider temporarily unavailable. Your Business DNA remains intact. Please configure your NVIDIA_API_KEY.",
    code: "AI_PROVIDER_UNAVAILABLE",
    provider: "nvidia",
  });
});

// ─── 11. Startup & Server Initialization ────────────────────────────────────

const PORT = process.env.PORT || 8787;

async function ensureDatabaseSchema() {
  const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");
  const schemaPath = isPostgres ? "./prisma/schema.postgresql.prisma" : "./prisma/schema.prisma";
  try {
    if (!isPostgres) {
      const dbFilePath = process.env.DATABASE_URL.replace(/^file:/, "");
      if (!fs.existsSync(dbFilePath) || fs.statSync(dbFilePath).size === 0) {
        console.log("[Prisma] Fresh SQLite DB detected. Auto-syncing schema...");
        const { execSync } = await import("node:child_process");
        execSync(`npx prisma db push --skip-generate --schema=${schemaPath}`, {
          cwd: rootDir,
          stdio: "pipe",
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        });
        console.log("[Prisma] Fresh SQLite DB schema initialized successfully.");
      }
    }
  } catch (err) {
    console.warn("[Prisma] Schema auto-sync check:", err.message);
  }
}

async function startServer() {
  try {
    await ensureDatabaseSchema();
    await prisma.$connect();
    const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");
    if (isPostgres) {
      console.log(`[Prisma] PostgreSQL Database connected successfully (${process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}).`);
    } else {
      console.log(`[Prisma] SQLite Database connected successfully at ${process.env.DATABASE_URL} (PostgreSQL ready, pending DATABASE_URL).`);
    }

    app.listen(PORT, () => {
      console.log(`[FoundryOS API Server] Listening on :${PORT} (${isPostgres ? "PostgreSQL" : "SQLite"}).`);
    });
  } catch (err) {
    console.error("[Prisma] Database connection error:", err);
    process.exit(1);
  }
}

startServer();
