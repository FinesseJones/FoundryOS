# Customer Support Process & SLA Runbook

This document defines the customer support escalation workflow, service level agreements (SLAs), and issue resolution procedures for the **TACF Platform**.

---

## 1. Support Channels

Customers can submit requests and report issues via:

1. **In-App Customer Workspace**: Navigate to **Settings → Support & Feedback** to submit a ticket.
2. **Email Support**: Send direct requests to `support@tacf-ai.com`.
3. **Emergency Escalation (Enterprise Tier)**: Dedicated Slack/Teams channel and hotline for `P1 - CRITICAL` outages.

---

## 2. Issue Severity & Response SLAs

| Priority | Definition | Target First Response | Target Resolution |
| :--- | :--- | :--- | :--- |
| **P1 - CRITICAL** | Platform outage, workspace unaccessible, or security breach | < 1 hour | < 4 hours |
| **P2 - HIGH** | Core feature blocked (e.g. agent execution failure, schedule halt) | < 4 hours | < 24 hours |
| **P3 - MEDIUM** | Minor bug, UI display issue, or non-blocking performance drop | < 12 hours | < 3 business days |
| **P4 - LOW** | General question, feature request, or feedback | < 24 hours | Next release cycle |

---

## 3. Incident Management & Bug Resolution Workflow

```
Customer Reports Issue
         │
         ▼
Logged in Ticket System (Assign Severity P1–P4)
         │
         ▼
Diagnostic Log Inspection (Audit Repository & Agent Execution Logs)
         │
         ▼
Hotfix / Patch Developed
         │
         ▼
Automated Test Suite Executed (npx tsx --test tests/*)
         │
         ▼
Staging Deployment & Verification
         │
         ▼
Production Patch Applied & Customer Notified
```

---

## 4. Administrative Diagnostics Tools

Customer Support Engineers utilize internal TACF diagnostic endpoints:
- `AuditRepository.listEvents({ organizationId, businessId })` — Review security and execution logs.
- `AgentReputationService.getAgentPerformanceSummary()` — Audit agent failure rates and error tracebacks.
- `LLMGateway.getQuotaStatus()` — Verify if token budget hard-caps have been reached.
