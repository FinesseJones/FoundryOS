# Privacy Policy & Data Security Standards

**Last Updated**: July 27, 2026

At **TACF**, protecting your enterprise business data, brand identity, and customer privacy is our highest priority. This Privacy Policy details how we handle data within the TACF Autonomous Business AI Operating System.

---

## 1. Information We Collect
- **Account & Registration Data**: Name, work email address, user role, organization name, and billing details.
- **Business DNA Signals**: Company website URLs, uploaded brand guidelines, customer profiles, product collateral, and ingested documentation.
- **Agent Metrics & Execution Logs**: Anonymized execution speed, token counts, error tracebacks, and agent reputation scores.

## 2. Multi-Tenant Data Isolation Contract
- **Strict Tenant Wall**: TACF enforces cryptographic and programmatic tenant isolation (`ISOL-01` and `ISOL-02`). Every query evaluates `organizationId` + `businessId` ownership.
- **Cross-Tenant Prevention**: Organization A can never view, query, or infer data belonging to Organization B. Cross-tenant access attempts immediately fail and trigger security audit events.

## 3. Data Classification & RBAC Access Controls
TACF classifies all internal data into 4 security levels:
- `PUBLIC`: Information intended for public distribution (marketing copy, press releases).
- `INTERNAL`: Standard operational data accessible to tenant agents.
- `CONFIDENTIAL`: Business DNA strategy, sales opportunities, and financial performance metrics.
- `RESTRICTED`: Security credentials, API keys, and administrative access tokens (accessible only by `@security` agent and Org Admins).

## 4. Encryption & Credential Hygiene
- **In-Transit**: TLS 1.3 encryption for all HTTP/WebSocket traffic.
- **At-Rest**: AES-256 encryption for database records and file attachments.
- **API Key Storage**: API keys are hashed using SHA-256 digests; plain-text keys are never stored or logged.

## 5. Your Data Rights & Deletion
Customers may export their complete Business DNA graph, memory records, and audit logs at any time. Upon account termination, Customer Data is permanently purged from active repositories within 30 days.

---
*For privacy inquiries or compliance requests, contact privacy@tacf-ai.com.*
