# Deployment Process & Infrastructure Runbook

This guide outlines the production deployment workflow, environment configuration, containerization, and continuous integration / continuous deployment (CI/CD) pipelines for **TACF**.

---

## 1. Environment Requirements

- **Node.js**: >= v20.0.0
- **TypeScript**: strict mode (`npx tsc --noEmit`)
- **Package Manager**: `npm` / `npx`
- **Environment Variables**: Defined in `.env` (derived from `.env.example`)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/tacf_prod
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
LLM_GATEWAY_TOKEN_CAP=500000
```

---

## 2. Pre-Deployment Automated Quality Gate

Before any release artifact is built or deployed, the complete automated test suite must pass with 0 failures:

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Execute Full E2E & Hardening Test Suite (37 Test Files)
npx tsx --test src/core/knowledge/tests/schema.test.ts \
               src/core/context/tests/context-engine.test.ts \
               src/core/cognitive/tests/cognitive-engine.test.ts \
               src/core/agents/tests/*.test.ts \
               src/core/automation/tests/*.test.ts \
               src/core/providers/tests/*.test.ts \
               src/core/ingestion/tests/*.test.ts \
               src/core/persistence/tests/*.test.ts \
               src/core/saas/tests/*.test.ts \
               tests/e2e/*.test.ts \
               tests/hardening/*.test.ts
```

---

## 3. Production Build & Deployment Pipeline

```
GitHub Push / Release Tag
         │
         ▼
Automated CI Pipeline (Type Check + 121 Tests Pass)
         │
         ▼
Production Build Artifact (`npm run build`)
         │
         ▼
Docker Container Image Creation
         │
         ▼
Staging Environment Automated Verification
         │
         ▼
Zero-Downtime Production Deployment (Rolling Update)
         │
         ▼
Post-Deploy Health Check & Alert Monitoring
```

### Docker Container Runbook
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 4. Monitoring & Health Verification

- **Health Check Endpoint**: `/api/health` — Verifies database connection, memory repository status, and LLM gateway availability.
- **Error Tracking**: Integrated Sentry / Application Performance Monitoring (APM).
- **Quota Alert Monitoring**: Automated alerts dispatched if tenant token caps reach 90% threshold.
