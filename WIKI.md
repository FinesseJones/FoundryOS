# TACF System Wiki & Technical Documentation

Welcome to the **TACF (Brand-First Autonomous Business AI Operating System)** Technical Wiki. This document provides a complete reference for the platform architecture, data models, intelligence layer, execution engine, governance framework, and commercial launch playbook.

---

## 📚 Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Business DNA Core & Ingestion Pipeline](#2-business-dna-core--ingestion-pipeline)
3. [Multi-Domain Intelligence Stack](#3-multi-domain-intelligence-stack)
4. [Autonomous Execution Engine & Risk Controls](#4-autonomous-execution-engine--risk-controls)
5. [Customer Automation & Workflow Marketplace](#5-customer-automation--workflow-marketplace)
6. [Agent Governance, RBAC & Reputation](#6-agent-governance-rbac--reputation)
7. [Operational Launch & Pricing Blueprint](#7-operational-launch--pricing-blueprint)
8. [Tenant Isolation & Security Standards](#8-tenant-isolation--security-standards)

---

## 1. System Architecture Overview

TACF is engineered as a **closed-loop business operating system**. Rather than relying on static prompt templates, TACF maintains a dynamic, multi-tenant Business DNA model that informs intelligent multi-agent collaboration, risk-managed execution, and continuous memory write-back.

```
+-----------------------------------------------------------------------------+
|                            CUSTOMER WORKSPACE                               |
|          (Onboarding -> Business DNA -> Automations -> Marketplace)          |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
|                             BUSINESS DNA CORE                               |
|        Website Crawl • Document Parse • Brand Voice Sync • Revisions        |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
|                          INTELLIGENCE LAYER (AI OS)                         |
|   Marketing Intel • Sales Intel • Operations Intel • Security Intel • Score |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
|                         AUTONOMOUS EXECUTION ENGINE                         |
|  Plan Creation • Risk Evaluation (LOW/MED/HIGH/CRIT) • Approval Manager    |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
|                   AGENT GOVERNANCE & CLOSED-LOOP MEMORY                     |
|  Identity Registry • RBAC Permission Matrix • Versioning • Reputation Badges|
|                       MemoryRepository ('automation_learning')             |
+-----------------------------------------------------------------------------+
```

---

## 2. Business DNA Core & Ingestion Pipeline

The **Business DNA** represents the authoritative, structured knowledge graph of a tenant organization.

### Key Data Subsections
- **Company Identity**: Name, tagline, mission, industry, founding story, core values.
- **Brand Voice & Guidelines**: Personality traits, tone matrix, vocabulary rules, prohibited terms.
- **Product Portfolio**: Products, features, pricing models, value propositions, target use-cases.
- **Customer Profile**: Target audience segments, buyer personas, pain points, objection handling.
- **Competitive Landscape**: Competitors, key differentiators, positioning matrix.

### Ingestion Components
- **`WebsiteAgent`**: Crawls target URLs, extracts visual brand signals, and parses site hierarchy.
- **`ExtractionPipeline`**: Processes uploaded PDF, DOCX, and text documents into token-aware semantic chunks.
- **`KnowledgeRefreshEngine`**: Performs continuous change detection; updates Business DNA with new revision history (`v1`, `v2`, `v3`).

---

## 3. Multi-Domain Intelligence Stack

TACF structures enterprise business intelligence into 4 core domain services and 1 cross-domain analytics engine:

```
+-----------------------------------------------------------------------------+
|                       UNIFIED MATURITY SCORE ENGINE                         |
|                (FOUNDATION -> EXPANDING -> AUTONOMOUS)                      |
+----------------------+----------------------+-------------------------------+
|                      |                      |                               |
▼                      ▼                      ▼                               ▼
Marketing Intel        Sales Intel            Operations Intel                Security Intel
• Campaign Strategy    • Opportunity Detect   • Process Bottlenecks           • Posture Audit
• Content Calendar     • Lead Scoring         • Resource Efficiency           • Risk Vectors
• Channel Allocations  • Next-Best Action     • SLA Optimizations             • TACF Matrix
```

### Intelligence Services & Outputs
1. **`MarketingIntelligenceService`**: Generates multi-channel content plans, strategic campaign blueprints, and positioning recommendations.
2. **`SalesIntelligenceService` & `OpportunityDetectionService`**: Analyzes sales funnel health, prioritizes high-value opportunities, and prescribes next-best-action sequences.
3. **`OperationsIntelligenceService`**: Identifies operational bottlenecks, workflow friction points, and resource allocation efficiencies.
4. **`SecurityIntelligenceService`**: Audits tenant posture across 6 risk vectors (access control, data leakage, delegation depth, API quotas, key hygiene, policy violations).
5. **`IntelligenceAnalyticsService`**: Calculates overall business maturity score (0–100) and orchestrates unified performance learning updates.

---

## 4. Autonomous Execution Engine & Risk Controls

The execution engine translates high-level customer objectives into structured multi-agent workflows.

```
Objective Input
      │
      ▼
createExecutionPlan()
      │
      ▼
evaluateExecutionRisk()
      │
  ┌───┴───────────────────────────┐
  ▼                               ▼
LOW Risk                       HIGH / CRITICAL Risk
  │                               │
  ▼                               ▼
executeApprovedWorkflow()      requestExecutionApproval()
(Auto-executed by engine)       (Gated in Approval Center until sign-off)
```

### Risk & Approval Governance
- **`LOW` Risk**: Routine operations (e.g. content drafting, internal reporting). Auto-executed by the engine.
- **`HIGH` Risk**: Customer-facing or revenue actions (e.g. lead outreach, pricing adjustments). Requires human admin sign-off.
- **`CRITICAL` Risk**: Security configuration modifications or administrative actions. Gated by strict multi-role approval sign-off.

---

## 5. Customer Automation & Workflow Marketplace

The **Customer Automation Layer** provides self-service workflow creation, scheduling, versioning, and marketplace publishing.

### Components
- **`CustomerAutomationService`**: Manages configured automations (`DRAFT`, `ACTIVE`, `PAUSED`, `FAILED`).
- **`AutomationScheduler`**: Manages cron trigger schedules with state machine progression (`WAITING` → `TRIGGERED` → `EXECUTING` → `COMPLETED`).
- **`AutomationVersioningService`**: Captures version snapshots (`v1`, `v2`, `v3`), validates migration safety, and performs atomic rollbacks with audit event logging (`AUTOMATION_ROLLED_BACK`).
- **`AutomationBuilderService`**: Custom workflow definition builder with DFS cycle detection and condition evaluation engine (`EQUALS`, `GREATER_THAN`, `CONTAINS`, `IN_LIST`).
- **`MarketplaceService`**: Package submission, review/approval workflow, catalog discovery filters, and single-click customer installations.

---

## 6. Agent Governance, RBAC & Reputation

TACF provides enterprise-grade AI governance to prevent unauthorized agent behavior.

### 1. Agent Identity Registry (`AgentIdentityRegistry`)
- Manages 7 core system agents (`@brand`, `@content`, `@publishing`, `@website`, `@security`, `@analytics`, `@learning`).
- Enforces lifecycle states: `PROVISIONED` → `ACTIVE` → `PAUSED` → `SUSPENDED` → `DEPRECATED`.

### 2. RBAC Permission Matrix (`AgentAuthorizationService`)
- Granular permissions for 12 actions: `read:dna`, `write:dna`, `read:content`, `write:content`, `read:analytics`, `write:analytics`, `read:security`, `write:security`, `rotate:keys`, `read:memory`, `write:memory`, `execute:workflow`, `publish:external`, `manage:automations`.
- Enforces 4 data security classification levels: `PUBLIC` < `INTERNAL` < `CONFIDENTIAL` < `RESTRICTED`.

### 3. Agent Reputation Service (`AgentReputationService`)
- Collects metrics: execution speed, token usage, success rate, and customer feedback.
- Weighted reputation score (0–100) with real-time badging:
  - `EXCELLENT` (>= 90)
  - `GOOD` (>= 75)
  - `NEEDS_IMPROVEMENT` (>= 60)
  - `CRITICAL_RISK` (< 60)

---

## 7. Operational Launch & Pricing Blueprint

Commercial launch strategy focusing on value-based business automation tiers:

### Pricing Tiers

```
+------------------------+  +------------------------+  +------------------------+
|        STARTER         |  |         GROWTH         |  |       ENTERPRISE       |
|    $49 / month         |  |    $199 / month        |  |    $499+ / month       |
+------------------------+  +------------------------+  +------------------------+
| • Business DNA Setup   |  | • Full DNA + Refresh   |  | • Multi-Tenant Workspace|
| • Marketing Intel      |  | • All 4 Intel Domains  |  | • Custom Workflow Builder|
| • 2 System Agents      |  | • 7 System Agents      |  | • Advanced RBAC & Audit |
| • Basic Recommendations|  | • 10 Active Automations|  | • Unlimited Automations|
| • Manual Execution     |  | • Automated Scheduler  |  | • Dedicated Support    |
+------------------------+  +------------------------+  +------------------------+
```

### Customer Onboarding Journey
1. **Signup & Organization Creation** (256-bit secure session generation)
2. **Website & Document Ingestion** (Auto-extraction of Business DNA)
3. **DNA Review & Approval** (Visual Brand & Positioning verification)
4. **Workspace Activation** (Immediate intelligence recommendations & template activation)

---

## 8. Tenant Isolation & Security Standards

### Multi-Tenant Security Contract
- **Isolation Rule 1 (`ISOL-01`)**: Every query to `BusinessDNARepository`, `MemoryRepository`, `AuditRepository`, `CustomerAutomationService`, and `MarketplaceService` must evaluate `organizationId` + `businessId` ownership.
- **Isolation Rule 2 (`ISOL-02`)**: Cross-tenant read/write attempts throw explicit `Tenant Security Violation` or `CustomerAutomation: access denied`.
- **Cryptographic Security**: API keys stored as SHA-256 digest hashes without raw key leakage.
- **Cost Protection**: LLM Gateway hard-caps token budgets and throws `QuotaExceededError` on cap breach.

---

*TACF Technical Documentation — Version 1.0.0*
