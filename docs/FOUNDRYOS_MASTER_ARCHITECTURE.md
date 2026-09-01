# 🛸 FoundryOS — Master Technical Architecture & Module Guide

Welcome to the definitive architectural specification for **FoundryOS**, the Autonomous Business & Revenue Operating System.

---

## 🏛️ System Architecture Topology

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FOUNDRYOS PLATFORM TOPOLOGY                                   │
├───────────────────────────────┬───────────────────────────────┬─────────────────────────────┤
│ 1. CLIENT CONVERSATION ENGINE │ 2. BUSINESS DNA OS            │ 3. AUTONOMOUS HYPERION CORE │
│ • Omnichannel Unified Inbox   │ • Living Brand Voice Schema   │ • 3-Tier Multi-Inference    │
│ • 1-Tap Google 5★ Reviews     │ • 3 Opportunity Pillars       │ • Website Studio + Deck Ingest│
│ • Stripe Text-to-Pay Invoicing│ • Continuous Web Refresh      │ • Social Media Engine & Cal │
│ • 24/7 Missed-Call Auto-Text  │ • Canonical State Machine     │ • Goose / Osaurus Workers   │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 4. GOVERNANCE & SECURITY      │ 5. REVENUE & PIPELINE CRM     │ 6. MULTI-TENANT DEPLOYMENT  │
│ • Zero-Trust 6D Risk Tensor   │ • Autonomous AI Prospecting   │ • Local Port 5174 Sandbox   │
│ • Mahalanobis 3.0σ Anomaly Det│ • Project Deep Dive & Delivery│ • Production VPS (2.25.113.26)│
│ • Immutable Audit Logs        │ • Financial Forecasting       │ • Caddy 2 Reverse Proxy     │
│ • Granular RBAC Matrix        │ • Capacity & Bottleneck KPIs  │ • Multi-Tenant DB Isolation │
└───────────────────────────────┴───────────────────────────────┴─────────────────────────────┘
```

---

## 📦 Complete Module Directory (All 18 Modules)

### 1. 📬 Unified Omnichannel Inbox (`/inbox`)
- **Function:** Real-time 2-way SMS, WebChat-to-Text, and Google Local Services messaging.
- **Key Capabilities:** Mississippi contractor grounding header, verified SOP badges (`[SOP #EM-HVAC-04 Verified]`), customer equipment telemetry drawer (*Trane 200-Ton Rooftop Chiller*), and 1-tap dispatch triggers.

### 2. ⭐ Reputation & Review Multiplier (`/reviews`)
- **Function:** Automated 1-tap Google Review requests sent via SMS post-service.
- **Key Capabilities:** AI Brand Voice auto-responses to customer reviews with 99.8% semantic grounding.

### 3. 💳 Instant Payments & Text-to-Pay (`/payments`)
- **Function:** Collect deposits, retainers, and emergency invoices via SMS payment links.
- **Key Capabilities:** Instant Stripe payment links, 4-hour settlement rate, automated receipts, and transaction audit trails.

### 4. 🧬 Business DNA OS & Customer Intelligence (`/customer_intelligence`)
- **Function:** The authoritative single source of truth for every tenant.
- **Key Capabilities:** Multi-domain intelligence across Marketing, Sales, Operations, and Zero-Trust Security with continuous learning loops and memory write-backs.

### 5. 🏷️ Services Catalog & Offerings (`/services`)
- **Function:** Master catalog of client transformation blueprints and high-margin retainers.
- **Key Capabilities:** Turnkey offerings including Commercial HVAC VRF, Trenchless Hydrojetting, Autonomous Social Media Engine ($997/mo), and Fortune 500 Web Infrastructure ($2,500 + $250/mo).

### 6. 🚀 AI Branding & Positioning Center (`/branding`)
- **Function:** Synthesizes executive brand positioning guides and taglines.
- **Key Capabilities:** 3-tier resilient generator (Cloud NVIDIA NIM $\rightarrow$ Local Ollama $\rightarrow$ Deterministic DNA Synthesizer) with zero 404 failure states.

### 7. 🔥 Targeted SMS Marketing Broadcasts (`/campaigns`)
- **Function:** High-converting promotional text blasts with 98% open rates.
- **Key Capabilities:** Audience segmentation, pre-season tune-up drops, and 10DLC compliance throttling.

### 8. 📞 Virtual Phones & Missed-Call Auto-Text (`/phones`)
- **Function:** 24/7 missed-call safety net.
- **Key Capabilities:** Sub-15s AI instant text-backs when a call is missed, capturing the caller's emergency before they call a competitor.

### 9. 🌐 AI Website Studio & Staging Sandbox (`/studio`)
- **Function:** Autonomous Fortune 500 website compilation.
- **Key Capabilities:** Ingests Google Local Services listings, Google Presentations / slide decks, or raw notes; generates interactive responsive sites with live ROI calculators and SMS booking widgets.

### 10. 📱 Autonomous Social Media Growth Studio (`/social`)
- **Function:** Multi-channel social media management and brand voice marketing.
- **Key Capabilities:** Multi-platform profile provisioning kit (LinkedIn, X, Instagram, Facebook, Google Business), 4-week AI brand voice post generator, interactive visual calendar, auto-scheduler, and live feed previews.

### 11. 📋 Project Governance & Deep Dive (`/projects`)
- **Function:** Enterprise project tracking and milestone execution.
- **Key Capabilities:** Budget burn charts, phase progression, and automated delivery sign-offs.

### 12. ⚡ Client Pipeline & Opportunity CRM (`/leads`)
- **Function:** Autonomous enterprise lead discovery agent.
- **Key Capabilities:** Quantifies 3 opportunity pillars (Financial Pain, Process Gap, Stakeholder Alignment) with 1-click "Build Site" integration.

### 13. 📈 Operations Analytics & Capacity (`/analytics`)
- **Function:** Departmental workload forecasting and bottleneck identification.
- **Key Capabilities:** Lead time tracking, risk ratings, and strategic resource reallocation recommendations.

### 14. 📊 Financial & Operational Reports (`/reports`)
- **Function:** Comprehensive revenue reports and multi-currency financial forecasts.
- **Key Capabilities:** Contract value analytics, project margin analysis, and exportable PDF summaries.

### 15. 👥 User & Team Directory (`/users`)
- **Function:** Enterprise RBAC and team assignments.
- **Key Capabilities:** High-contrast spacious table, staff ID tags (`#EM-1001`), direct phone extensions, and RBAC badges.

### 16. 🛡️ System Audit Logs (`/audit`)
- **Function:** Immutable chronological security record.
- **Key Capabilities:** Tracks logins, tenant modifications, approval actions, and policy enforcement events.

### 17. ⚙️ Global System Settings (`/settings`)
- **Function:** Fortune 500 Enterprise KaaS Control Matrix.
- **Key Capabilities:** 5 tabs (Living DNA, 3-Tier Multi-Inference, Zero-Trust 6D Risk Tensor, 10DLC & Stripe, Multi-Company Sandbox Switcher).

### 18. 👑 Master Tenant Control Plane (`/master_admin`)
- **Function:** Root multi-tenant control plane for platform super-administrators.
- **Key Capabilities:** Global tenant roster, cross-organization quotas, API key management, and subscription tier billing.

---

## 🚢 Production Deployment Architecture

FoundryOS runs on a clean, unified 3-tier architecture:

1. **`api` (`foundryos-api`):** Node.js Express backend with Prisma ORM (SQLite / PostgreSQL), server-side authentication, Stripe subscriptions, and AI inference gateway on port 8787.
2. **`caddy` (`foundryos-caddy`):** Reverse proxy managing automated HTTPS SSL certificates, proxying `/api/*` to the API backend, and directly serving the compiled React 19 SPA frontend with client-side SPA routing.
3. **`frontend` (React 19 SPA):** Single Page Application static bundle served directly through Caddy.
