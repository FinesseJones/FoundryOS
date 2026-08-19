# Brand First — Knowledge Layer (Stage 1 Foundation)

This directory contains the foundational knowledge contracts for the Brand First architecture.
Every AI agent, engine, workflow, and automation retrieves its understanding of a business through these typed schemas — nothing reads directly from unstructured websites or raw external data.

## Structure

```
src/core/knowledge/
├── README.md                                 ← overview & usage guide
├── architecture.md                           ← type design & expansion rationale
├── index.ts                                  ← single barrel export file
│
├── schema/
│   ├── shared/                               ← domain-agnostic primitives
│   │   ├── confidence.ts                     ← ConfidenceScore & tier utilities
│   │   ├── metadata.ts                       ← KnowledgeField<T>, ApprovalStatus & provenance
│   │   ├── audit.ts                          ← AuditEvent schema & audit log generator
│   │   └── timestamps.ts                     ← Timestamps schema & ISO helpers
│   │
│   └── business-dna/                         ← first concrete knowledge domain
│       ├── enums.ts                          ← Stage, Industry, VoiceTone, Position enums
│       ├── business-dna.types.ts             ← TS interfaces (CompanyIdentity, BrandVoice, etc.)
│       ├── business-dna.schema.ts            ← Zod validation schemas
│       ├── validators.ts                     ← cross-field validation rules
│       └── defaults.ts                       ← default BusinessDNA generator
```

## Core Principles

1. **Strict TypeScript** — Zero `any`. All properties and methods are strictly typed.
2. **Zod Runtime Contracts** — Enforces runtime integrity on inbound data, AI payloads, and API requests.
3. **Domain-Agnostic Core Container** — `KnowledgeField<T>` wraps values with provenance (confidence, source, modelUsed, timestamp, approvalStatus, reasoningSummary).
4. **Immutable Audit Trails** — Every state change produces an append-only `AuditEvent`.
5. **Decoupled Architecture** — Core schemas and types have zero side effects (no database or external HTTP dependencies).

## Usage Example

```typescript
import {
  createDefaultBusinessDNA,
  validateBusinessDNA,
  BUSINESS_DNA_SCHEMA,
  confidenceTier,
} from './src/core/knowledge';

// 1. Generate default Business DNA
const dna = createDefaultBusinessDNA('biz_123', {
  companyIdentity: {
    companyName: { value: 'Acme Corp' },
  },
});

// 2. Perform cross-field validation
const validation = validateBusinessDNA(dna);
console.log('Is valid:', validation.valid);

// 3. Inspect field provenance & confidence
console.log('Name:', dna.companyIdentity.companyName.value);
console.log('Confidence Tier:', confidenceTier(dna.companyIdentity.companyName.confidence));
```
