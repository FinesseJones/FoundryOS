## Brand First / TACF: market, revenue, and implementation plan

Your strongest initial positioning is not “AI that generates content.” It is:

> **A governed business-context layer that lets AI agents use approved company knowledge safely and audibly.**

There is no validated company-specific revenue data in the documents you provided, so the figures below are **scenario estimates, not forecasts**.

### Market and revenue opportunity

Your best initial customers are:

- **Agencies and fractional operators** managing multiple clients
- **Multi-brand companies** needing centralized brand governance
- **AI-forward SMB and mid-market teams** with fragmented business knowledge

A practical pricing hypothesis:

| Tier | Indicative price | Target |
|---|---:|---|
| Starter | $500-$1,000/month | Small teams and early agencies |
| Growth | $1,500-$3,000/month | Agencies and growing companies |
| Scale | $5,000-$12,000/month | Multi-brand organizations |
| Enterprise | $25,000-$100,000+ annual contract | Larger organizations with governance needs |

Illustrative ARR scenarios:

- 25 customers at $8,000 ACV: **$200,000 ARR**
- 100 customers at $15,000 ACV: **$1,500,000 ARR**
- 250 customers at $24,000 ACV: **$6,000,000 ARR**

These are planning scenarios only. Validate them through **3-5 paid design partners**, not survey responses. The most important proof points are reduced production time, fewer revision cycles, fewer unsupported claims, and recurring weekly usage.

Amplitude’s AI Visibility capability could help you measure how often Brand First appears in AI-generated answers and compare it with competitors, but it is **not a general market-size measurement**. [1]

## TypeScript schema for `KnowledgeField<T>`

```ts
// src/core/knowledge/schema/shared/metadata.ts

export type ISODateString = string & {
  readonly __brand: "ISODateString";
};

export type TenantId = string & {
  readonly __brand: "TenantId";
};

export type BusinessId = string & {
  readonly __brand: "BusinessId";
};

export type UserId = string & {
  readonly __brand: "UserId";
};

export type AuditEventId = string & {
  readonly __brand: "AuditEventId";
};

export type ApprovalStatus =
  | "draft"
  | "proposed"
  | "approved"
  | "rejected"
  | "deprecated";

export type KnowledgeSourceType =
  | "user_input"
  | "document"
  | "integration"
  | "agent"
  | "system"
  | "import";

export interface KnowledgeSourceReference {
  readonly sourceType: KnowledgeSourceType;
  readonly sourceId: string;
  readonly uri?: string;
  readonly locator?: string;
  readonly title?: string;
  readonly excerptHash?: string;
}

export interface Provenance {
  readonly sources: readonly KnowledgeSourceReference[];
  readonly confidence: number;
  readonly modelUsed?: string;
  readonly extractedAt?: ISODateString;
  readonly reasoningSummary?: string;
}

export interface ApprovalMetadata {
  readonly status: ApprovalStatus;
  readonly approvedBy?: UserId;
  readonly approvedAt?: ISODateString;
  readonly rejectionReason?: string;
  readonly reviewComment?: string;
}

export interface FieldAuditMetadata {
  readonly createdAt: ISODateString;
  readonly createdBy: UserId;
  readonly updatedAt: ISODateString;
  readonly updatedBy: UserId;
  readonly version: number;
  readonly auditEventId: AuditEventId;
  readonly previousVersionHash?: string;
}

export interface KnowledgeField<T> {
  readonly key: string;
  readonly value: T;

  readonly tenantId: TenantId;
  readonly businessId: BusinessId;

  readonly provenance: Provenance;
  readonly approval: ApprovalMetadata;

  readonly effectiveFrom: ISODateString;
  readonly effectiveUntil?: ISODateString;

  readonly audit: FieldAuditMetadata;
  readonly contentHash: string;
}
```

The important design choice is that **confidence, provenance, and approval are separate**. A field can be highly confident but still require human approval.

## Zod cross-field validators

```ts
// src/core/knowledge/schema/business-dna/validators.ts

import { z } from "zod";

export function validateKnowledgeFieldCrossFields(
  field: {
    status: z.infer<typeof ApprovalStatusSchema>;
    provenance: z.infer<typeof ProvenanceSchema>;
    approval: z.infer<typeof ApprovalMetadataSchema>;
    effectiveFrom: string;
    effectiveUntil?: string;
    audit: z.infer<typeof FieldAuditMetadataSchema>;
  },
  ctx: z.RefinementCtx,
): void {
  const from = Date.parse(field.effectiveFrom);

  if (Number.isNaN(from)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["effectiveFrom"],
      message: "effectiveFrom must be a valid ISO timestamp",
    });
  }

  if (field.effectiveUntil) {
    const until = Date.parse(field.effectiveUntil);

    if (Number.isNaN(until) || until <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveUntil"],
        message: "effectiveUntil must be later than effectiveFrom",
      });
    }
  }

  if (field.approval.status !== field.status) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["approval", "status"],
      message: "approval.status must match the field status",
    });
  }

  if (field.status === "approved") {
    if (field.provenance.sources.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["provenance", "sources"],
        message: "Approved fields require provenance sources",
      });
    }

    if (!field.approval.approvedBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approval", "approvedBy"],
        message: "Approved fields require approvedBy",
      });
    }

    if (!field.approval.approvedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approval", "approvedAt"],
        message: "Approved fields require approvedAt",
      });
    }
  }

  if (
    field.status === "rejected" &&
    !field.approval.rejectionReason
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["approval", "rejectionReason"],
      message: "Rejected fields require rejectionReason",
    });
  }

  if (
    field.audit.version > 1 &&
    !field.audit.previousVersionHash
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["audit", "previousVersionHash"],
      message: "Versions after 1 require previousVersionHash",
    });
  }

  if (
    Date.parse(field.audit.updatedAt) <
    Date.parse(field.audit.createdAt)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["audit", "updatedAt"],
      message: "updatedAt cannot precede createdAt",
    });
  }
}

export function validateBusinessDNACrossFields(
  dna: {
    tenantId: string;
    businessId: string;
    name: KnowledgeFieldSchemaOutput<string>;
    mission: KnowledgeFieldSchemaOutput<string>;
    positioning: KnowledgeFieldSchemaOutput<string>;
    targetAudiences: KnowledgeFieldSchemaOutput<readonly Audience[]>;
    approvedClaims: KnowledgeFieldSchemaOutput<readonly ApprovedClaim[]>;
    tone: KnowledgeFieldSchemaOutput<readonly ToneAttribute[]>;
    prohibitedClaims: KnowledgeFieldSchemaOutput<readonly string[]>;
    createdAt: string;
    updatedAt: string;
  },
  ctx: z.RefinementCtx,
): void {
  const fields = [
    ["name", dna.name],
    ["mission", dna.mission],
    ["positioning", dna.positioning],
    ["targetAudiences", dna.targetAudiences],
    ["approvedClaims", dna.approvedClaims],
    ["tone", dna.tone],
    ["prohibitedClaims", dna.prohibitedClaims],
  ] as const;

  for (const [fieldName, field] of fields) {
    if (field.tenantId !== dna.tenantId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [fieldName, "tenantId"],
        message: "Field tenantId must match BusinessDNA.tenantId",
      });
    }

    if (field.businessId !== dna.businessId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [fieldName, "businessId"],
        message: "Field businessId must match BusinessDNA.businessId",
      });
    }
  }

  if (Date.parse(dna.updatedAt) < Date.parse(dna.createdAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["updatedAt"],
      message: "BusinessDNA.updatedAt cannot precede createdAt",
    });
  }

  if (dna.approvedClaims.approval.status === "approved") {
    dna.approvedClaims.value.forEach((claim, index) => {
      if (
        claim.riskLevel === "high" &&
        claim.evidence.length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["approvedClaims", "value", index, "evidence"],
          message:
            "High-risk approved claims require at least two evidence references",
        });
      }
    });
  }

  if (
    dna.name.approval.status === "approved" &&
    dna.positioning.approval.status === "approved" &&
    dna.name.value.trim().toLowerCase() ===
      dna.positioning.value.trim().toLowerCase()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["positioning", "value"],
      message: "Positioning must not be identical to the business name",
    });
  }
}
```

The referenced schemas can be composed like this:

```ts
// src/core/knowledge/schema/business-dna/business-dna.schema.ts

import { z } from "zod";
import {
  validateBusinessDNACrossFields,
  validateKnowledgeFieldCrossFields,
} from "./validators";

export const ApprovalStatusSchema = z.enum([
  "draft",
  "proposed",
  "approved",
  "rejected",
  "deprecated",
]);

export const ISODateStringSchema = z
  .string()
  .datetime({ offset: true });

export const ProvenanceSchema = z.object({
  sources: z.array(
    z.object({
      sourceType: z.enum([
        "user_input",
        "document",
        "integration",
        "agent",
        "system",
        "import",
      ]),
      sourceId: z.string().min(1),
      uri: z.string().url().optional(),
      locator: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      excerptHash: z.string().min(1).optional(),
    }).strict(),
  ),
  confidence: z.number().min(0).max(1),
  modelUsed: z.string().min(1).optional(),
  extractedAt: ISODateStringSchema.optional(),
  reasoningSummary: z.string().min(1).optional(),
}).strict();

export const ApprovalMetadataSchema = z.object({
  status: ApprovalStatusSchema,
  approvedBy: z.string().min(1).optional(),
  approvedAt: ISODateStringSchema.optional(),
  rejectionReason: z.string().min(1).optional(),
  reviewComment: z.string().min(1).optional(),
}).strict();

export const FieldAuditMetadataSchema = z.object({
  createdAt: ISODateStringSchema,
  createdBy: z.string().min(1),
  updatedAt: ISODateStringSchema,
  updatedBy: z.string().min(1),
  version: z.number().int().positive(),
  auditEventId: z.string().min(1),
  previousVersionHash: z.string().min(1).optional(),
}).strict();

export function knowledgeFieldSchema<T>(
  valueSchema: z.ZodType<T>,
) {
  return z.object({
    key: z.string().min(1),
    value: valueSchema,
    tenantId: z.string().min(1),
    businessId: z.string().min(1),
    provenance: ProvenanceSchema,
    approval: ApprovalMetadataSchema,
    effectiveFrom: ISODateStringSchema,
    effectiveUntil: ISODateStringSchema.optional(),
    audit: FieldAuditMetadataSchema,
    contentHash: z.string().min(1),
  })
    .strict()
    .superRefine((field, ctx) => {
      validateKnowledgeFieldCrossFields(
        {
          ...field,
          status: field.approval.status,
        },
        ctx,
      );
    });
}
```

## End-to-end contract test suite

Use Node’s test runner with `tsx`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test:contracts": "node --import tsx --test \"tests/**/*.test.ts\"",
    "verify": "npm run typecheck && npm run test:contracts"
  }
}
```

```ts
// tests/e2e/knowledge-contract.test.ts

import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

import {
  BusinessDNASchema,
  knowledgeFieldSchema,
} from "../../src/core/knowledge/schema/business-dna/business-dna.schema";

import {
  assertBrandGenerationAllowed,
} from "../../src/core/knowledge/brand-generator";

import {
  InMemoryAuditStore,
} from "../../src/core/knowledge/schema/shared/audit";

const timestamps = {
  created: "2026-01-01T00:00:00.000Z",
  updated: "2026-01-02T00:00:00.000Z",
} as const;

function approvedField<T>(
  key: string,
  value: T,
): Record<string, unknown> {
  return {
    key,
    value,
    tenantId: "tenant-acme",
    businessId: "business-acme",
    provenance: {
      sources: [
        {
          sourceType: "document",
          sourceId: "brand-strategy-v1",
          locator: "page:3",
        },
      ],
      confidence: 0.98,
      reasoningSummary: "Extracted from approved brand documentation",
    },
    approval: {
      status: "approved",
      approvedBy: "user-founder",
      approvedAt: timestamps.updated,
    },
    effectiveFrom: timestamps.created,
    audit: {
      createdAt: timestamps.created,
      createdBy: "user-founder",
      updatedAt: timestamps.updated,
      updatedBy: "user-founder",
      version: 1,
      auditEventId: `audit-${key}`,
    },
    contentHash: `hash-${key}`,
  };
}

function validBusinessDNA(): Record<string, unknown> {
  return {
    schemaVersion: 1,
    tenantId: "tenant-acme",
    businessId: "business-acme",

    name: approvedField("brand.name", "Acme"),
    mission: approvedField(
      "brand.mission",
      "Help teams operate with clarity",
    ),
    positioning: approvedField(
      "brand.positioning",
      "The trusted operating layer for modern teams",
    ),

    targetAudiences: approvedField("brand.targetAudiences", [
      {
        name: "Operations leaders",
        description: "Leaders responsible for scalable execution",
        priority: "primary",
      },
    ]),

    approvedClaims: approvedField("brand.approvedClaims", [
      {
        claim: "Acme reduces operational rework",
        evidence: ["case-study-001", "customer-interview-002"],
        riskLevel: "high",
      },
    ]),

    tone: approvedField("brand.tone", [
      {
        attribute: "clear",
        intensity: 0.9,
      },
    ]),

    prohibitedClaims: approvedField("brand.prohibitedClaims", [
      "guaranteed results",
      "zero risk",
    ]),

    createdAt: timestamps.created,
    updatedAt: timestamps.updated,
    updatedBy: "user-founder",
  };
}

test("valid BusinessDNA parses", () => {
  const result = BusinessDNASchema.safeParse(validBusinessDNA());

  assert.equal(result.success, true);
});

test("serialization and rehydration preserve the contract", () => {
  const original = BusinessDNASchema.parse(validBusinessDNA());
  const restored = BusinessDNASchema.parse(
    JSON.parse(JSON.stringify(original)),
  );

  assert.deepEqual(restored, original);
  assert.equal(restored.name.contentHash, "hash-brand.name");
});

test("unknown BusinessDNA properties are rejected", () => {
  const payload = {
    ...validBusinessDNA(),
    unexpected: true,
  };

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("invalid timestamps are rejected", () => {
  const payload = {
    ...validBusinessDNA(),
    updatedAt: "not-a-timestamp",
  };

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("confidence must remain between zero and one", () => {
  const payload = validBusinessDNA() as {
    name: {
      provenance: {
        confidence: number;
      };
    };
  };

  payload.name.provenance.confidence = 1.5;

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("approved fields require provenance", () => {
  const payload = validBusinessDNA() as {
    name: {
      provenance: {
        sources: unknown[];
      };
    };
  };

  payload.name.provenance.sources = [];

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("approved fields require an approver and approval timestamp", () => {
  const payload = validBusinessDNA() as {
    name: {
      approval: {
        approvedBy?: string;
        approvedAt?: string;
      };
    };
  };

  delete payload.name.approval.approvedBy;
  delete payload.name.approval.approvedAt;

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("field tenant isolation is enforced", () => {
  const payload = validBusinessDNA() as {
    mission: {
      tenantId: string;
    };
  };

  payload.mission.tenantId = "tenant-attacker";

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("field business isolation is enforced", () => {
  const payload = validBusinessDNA() as {
    positioning: {
      businessId: string;
    };
  };

  payload.positioning.businessId = "business-other";

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("high-risk claims require multiple evidence references", () => {
  const payload = validBusinessDNA() as {
    approvedClaims: {
      value: Array<{
        evidence: string[];
      }>;
    };
  };

  payload.approvedClaims.value[0].evidence = ["one-source"];

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("effectiveUntil must follow effectiveFrom", () => {
  const field = {
    ...approvedField("brand.name", "Acme"),
    effectiveUntil: "2025-01-01T00:00:00.000Z",
  };

  assert.equal(
    knowledgeFieldSchema(z.string()).safeParse(field).success,
    false,
  );
});

test("version two requires a previous version hash", () => {
  const payload = validBusinessDNA() as {
    name: {
      audit: {
        version: number;
        previousVersionHash?: string;
      };
    };
  };

  payload.name.audit.version = 2;

  assert.equal(BusinessDNASchema.safeParse(payload).success, false);
});

test("brand generation requires approved Business DNA", () => {
  const dna = validBusinessDNA() as {
    positioning: {
      approval: {
        status: "approved" | "draft";
      };
    };
  };

  dna.positioning.approval.status = "draft";

  assert.throws(
    () => assertBrandGenerationAllowed(dna as never),
    /approved Business DNA/,
  );
});

test("audit events preserve order and hash continuity", async () => {
  const store = new InMemoryAuditStore();

  await store.append({
    id: "event-1",
    tenantId: "tenant-acme",
    actorId: "user-founder",
    type: "knowledge_field_created",
    entityType: "knowledge_field",
    entityId: "field-1",
    entityVersion: 1,
    occurredAt: timestamps.created,
    payloadHash: "payload-1",
    eventHash: "event-hash-1",
  });

  await store.append({
    id: "event-2",
    tenantId: "tenant-acme",
    actorId: "user-founder",
    type: "knowledge_field_approved",
    entityType: "knowledge_field",
    entityId: "field-1",
    entityVersion: 1,
    occurredAt: timestamps.updated,
    payloadHash: "payload-2",
    previousEventHash: "event-hash-1",
    eventHash: "event-hash-2",
  });

  const events = await store.getByEntity(
    "knowledge_field",
    "field-1",
  );

  assert.equal(events.length, 2);
  assert.equal(events[1].previousEventHash, "event-hash-1");
});

test("audit chain rejects an incorrect previous hash", async () => {
  const store = new InMemoryAuditStore();

  await store.append({
    id: "event-1",
    tenantId: "tenant-acme",
    actorId: "user-founder",
    type: "knowledge_field_created",
    entityType: "knowledge_field",
    entityId: "field-1",
    entityVersion: 1,
    occurredAt: timestamps.created,
    payloadHash: "payload-1",
    eventHash: "event-hash-1",
  });

  await assert.rejects(
    () =>
      store.append({
        id: "event-2",
        tenantId: "tenant-acme",
        actorId: "user-founder",
        type: "knowledge_field_approved",
        entityType: "knowledge_field",
        entityId: "field-1",
        entityVersion: 1,
        occurredAt: timestamps.updated,
        payloadHash: "payload-2",
        previousEventHash: "wrong-hash",
        eventHash: "event-hash-2",
      }),
    /chain continuity check failed/,
  );
});
```

One correction before implementation: the sample test suite should avoid mutating `readonly` domain objects directly. Build mutable test fixtures or use a typed `deepClone` helper, then pass the clone into the validator. That keeps production types strict while allowing invalid-payload tests.

For the brand generator, I recommend making the contract:

- Input: approved Business DNA plus an explicit objective and audience
- Output: structured headlines, value propositions, proof points, warnings, and source IDs
- Status: always `proposed` initially
- Publication: blocked until human approval
- Audit: record the Business DNA version hashes used to generate the result

[View AI Visibility documentation →](https://app.amplitude.com)

Below is the cleanest way to fit the earlier design into your current TACF setup.

## 1. Recommended architecture

Keep your existing `src/core/knowledge` as the canonical source of business knowledge. Add separate layers for tenancy, audit, approvals, agents, brand generation, and design-partner research:

```text
src/
├── core/
│   ├── knowledge/
│   │   ├── contracts/
│   │   │   ├── confidence.ts
│   │   │   ├── provenance.ts
│   │   │   ├── knowledge-field.ts
│   │   │   ├── business-dna.ts
│   │   │   └── index.ts
│   │   ├── schema/
│   │   │   ├── knowledge-field.schema.ts
│   │   │   ├── business-dna.schema.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── knowledge-repository.ts
│   │   │   └── audit-repository.ts
│   │   └── services/
│   │       ├── knowledge-service.ts
│   │       └── knowledge-merger.ts
│   │
│   ├── tenancy/
│   │   ├── tenant-context.ts
│   │   └── tenant-guard.ts
│   │
│   ├── audit/
│   │   ├── audit-event.ts
│   │   └── audit-writer.ts
│   │
│   ├── approvals/
│   │   ├── approval-contracts.ts
│   │   └── approval-policy.ts
│   │
│   ├── agents/
│   │   ├── contracts/
│   │   │   ├── agent-request.ts
│   │   │   ├── agent-response.ts
│   │   │   ├── agent-runtime.ts
│   │   │   ├── agent-tool.ts
│   │   │   └── workflow.ts
│   │   ├── runtime/
│   │   │   ├── agent-runtime-service.ts
│   │   │   ├── policy-engine.ts
│   │   │   ├── request-router.ts
│   │   │   └── tool-executor.ts
│   │   └── tools/
│   │       ├── tool-registry.ts
│   │       ├── knowledge-search.tool.ts
│   │       └── knowledge-proposal.tool.ts
│   │
│   ├── brand/
│   │   ├── contracts/
│   │   │   └── brand-generation.ts
│   │   └── services/
│   │       └── brand-generation-service.ts
│   │
│   └── research/
│       ├── design-partner.contracts.ts
│       └── design-partner.metrics.ts
│
├── application/
│   ├── agents/
│   ├── knowledge/
│   ├── approvals/
│   └── research/
│
└── infrastructure/
    ├── persistence/
    ├── llm/
    ├── audit/
    └── tools/
```

Your existing deployment, support, privacy, and terms documents should remain product-level constraints. They should not be imported directly into the agent loop as unstructured prompt text. Convert enforceable rules into typed policies.

---

# 2. Full TypeScript contracts

## 2.1 Primitive and provenance contracts

```ts
// src/core/knowledge/contracts/confidence.ts

export type ConfidenceScore = number & {
  readonly __brand: "ConfidenceScore";
};

export function confidenceScore(value: number): ConfidenceScore {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("Confidence must be between 0 and 1");
  }

  return value as ConfidenceScore;
}

export type KnowledgeStatus =
  | "unknown"
  | "proposed"
  | "confirmed"
  | "rejected"
  | "superseded";
```

```ts
// src/core/knowledge/contracts/provenance.ts

export type ProvenanceSource =
  | "user"
  | "design_partner"
  | "uploaded_document"
  | "website"
  | "crm"
  | "agent_inference"
  | "system_default"
  | "imported";

export type ProvenanceReference =
  | {
      readonly kind: "conversation";
      readonly conversationId: string;
      readonly messageId?: string;
    }
  | {
      readonly kind: "document";
      readonly documentId: string;
      readonly locator?: string;
    }
  | {
      readonly kind: "url";
      readonly url: string;
      readonly retrievedAt: string;
    }
  | {
      readonly kind: "record";
      readonly system: string;
      readonly recordId: string;
    }
  | {
      readonly kind: "manual";
      readonly note?: string;
    };

export interface Provenance {
  readonly source: ProvenanceSource;
  readonly references: readonly ProvenanceReference[];
  readonly capturedAt: string;
  readonly capturedBy: string;
  readonly extractionMethod:
    | "direct"
    | "structured_import"
    | "llm_extraction"
    | "human_review"
    | "system_default";
  readonly sourceVersion?: string;
}
```

## 2.2 `KnowledgeField<T>`

```ts
// src/core/knowledge/contracts/knowledge-field.ts

import type {
  ConfidenceScore,
  KnowledgeStatus,
} from "./confidence";
import type { Provenance } from "./provenance";

export interface KnowledgeField<T> {
  readonly value: T;
  readonly status: KnowledgeStatus;
  readonly confidence: ConfidenceScore;
  readonly provenance: readonly Provenance[];

  /**
   * Monotonically increasing field revision.
   */
  readonly revision: number;

  /**
   * ISO-8601 timestamp of the latest accepted revision.
   */
  readonly updatedAt: string;

  /**
   * Actor responsible for the latest revision.
   */
  readonly updatedBy: string;

  /**
   * Explanation for inferred, rejected, or superseded values.
   */
  readonly rationale?: string;
}

export interface KnowledgeFieldUpdate<T> {
  readonly value: T;
  readonly status?: KnowledgeStatus;
  readonly confidence?: ConfidenceScore;
  readonly provenance: readonly Provenance[];
  readonly rationale?: string;
}
```

Treat fields as immutable. An update creates a new revision and audit event rather than mutating the previous value.

## 2.3 Canonical `BusinessDNA`

Your earlier documents use several possible vocabularies. Choose one canonical model now. The following structure is more extensible than a flat object:

```ts
// src/core/knowledge/contracts/business-dna.ts

import type { KnowledgeField } from "./knowledge-field";

export interface BusinessDNA {
  readonly tenantId: string;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  readonly company: {
    readonly name: KnowledgeField<string>;
    readonly description: KnowledgeField<string>;
    readonly industry: KnowledgeField<string>;
    readonly stage: KnowledgeField<
      | "idea"
      | "pre_revenue"
      | "early_revenue"
      | "growth"
      | "mature"
      | "unknown"
    >;
    readonly geography: KnowledgeField<readonly string[]>;
  };

  readonly audience: {
    readonly primary: KnowledgeField<string>;
    readonly secondary: KnowledgeField<readonly string[]>;
    readonly problems: KnowledgeField<readonly string[]>;
    readonly desiredOutcomes: KnowledgeField<readonly string[]>;
    readonly buyingTriggers: KnowledgeField<readonly string[]>;
    readonly objections: KnowledgeField<readonly string[]>;
  };

  readonly positioning: {
    readonly category: KnowledgeField<string>;
    readonly promise: KnowledgeField<string>;
    readonly differentiators: KnowledgeField<readonly string[]>;
    readonly alternatives: KnowledgeField<readonly string[]>;
    readonly proofPoints: KnowledgeField<readonly string[]>;
  };

  readonly brand: {
    readonly mission: KnowledgeField<string>;
    readonly vision: KnowledgeField<string>;
    readonly values: KnowledgeField<readonly string[]>;
    readonly personality: KnowledgeField<readonly string[]>;
    readonly voice: KnowledgeField<readonly string[]>;
    readonly toneConstraints: KnowledgeField<readonly string[]>;
    readonly forbiddenLanguage: KnowledgeField<readonly string[]>;
  };

  readonly offer: {
    readonly products: KnowledgeField<readonly string[]>;
    readonly services: KnowledgeField<readonly string[]>;
    readonly pricingModel: KnowledgeField<string>;
    readonly deliveryModel: KnowledgeField<string>;
    readonly guarantees: KnowledgeField<readonly string[]>;
  };

  readonly constraints: {
    readonly legal: KnowledgeField<readonly string[]>;
    readonly regulatory: KnowledgeField<readonly string[]>;
    readonly accessibility: KnowledgeField<readonly string[]>;
    readonly privacy: KnowledgeField<readonly string[]>;
    readonly claimsNotAllowed: KnowledgeField<readonly string[]>;
  };
}

export type BusinessDNAFieldPath =
  | "company.name"
  | "company.description"
  | "company.industry"
  | "company.stage"
  | "company.geography"
  | "audience.primary"
  | "audience.secondary"
  | "audience.problems"
  | "audience.desiredOutcomes"
  | "audience.buyingTriggers"
  | "audience.objections"
  | "positioning.category"
  | "positioning.promise"
  | "positioning.differentiators"
  | "positioning.alternatives"
  | "positioning.proofPoints"
  | "brand.mission"
  | "brand.vision"
  | "brand.values"
  | "brand.personality"
  | "brand.voice"
  | "brand.toneConstraints"
  | "brand.forbiddenLanguage"
  | "offer.products"
  | "offer.services"
  | "offer.pricingModel"
  | "offer.deliveryModel"
  | "offer.guarantees"
  | "constraints.legal"
  | "constraints.regulatory"
  | "constraints.accessibility"
  | "constraints.privacy"
  | "constraints.claimsNotAllowed";
```

This gives agents a fixed vocabulary and prevents them from inventing alternate paths such as `brandVoice`, `voice`, and `tone` for the same concept.

---

# 3. Audit and tenancy contracts

## 3.1 Tenant context

```ts
// src/core/tenancy/tenant-context.ts

export type TenantRole =
  | "owner"
  | "admin"
  | "editor"
  | "reviewer"
  | "viewer"
  | "support";

export interface TenantContext {
  readonly tenantId: string;
  readonly actorId: string;
  readonly roles: readonly TenantRole[];
  readonly requestId: string;
  readonly correlationId: string;
  readonly environment:
    | "development"
    | "staging"
    | "production";
}
```

```ts
// src/core/tenancy/tenant-guard.ts

import type { TenantContext } from "./tenant-context";

export interface TenantScoped {
  readonly tenantId: string;
}

export function assertTenantAccess(
  context: TenantContext,
  resource: TenantScoped,
): void {
  if (context.tenantId !== resource.tenantId) {
    throw new Error("Tenant isolation violation");
  }
}
```

Every repository method should receive `TenantContext`. Never trust a tenant ID supplied only inside an agent prompt or request body.

## 3.2 Audit events

```ts
// src/core/audit/audit-event.ts

interface BaseAuditEvent {
  readonly id: string;
  readonly tenantId: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly schemaVersion: 1;
}

export type AuditEvent =
  | KnowledgeFieldProposedEvent
  | KnowledgeFieldConfirmedEvent
  | KnowledgeFieldRejectedEvent
  | AgentRunStartedEvent
  | AgentRunCompletedEvent
  | ToolInvocationEvent
  | ApprovalRequestedEvent
  | ApprovalGrantedEvent
  | ApprovalRejectedEvent
  | BrandArtifactCreatedEvent;

export interface KnowledgeFieldProposedEvent
  extends BaseAuditEvent {
  readonly type: "knowledge.field.proposed";
  readonly fieldPath: string;
  readonly recordId: string;
  readonly proposedValueHash: string;
  readonly confidence: number;
  readonly provenance: readonly string[];
}

export interface KnowledgeFieldConfirmedEvent
  extends BaseAuditEvent {
  readonly type: "knowledge.field.confirmed";
  readonly fieldPath: string;
  readonly recordId: string;
  readonly confirmedValueHash: string;
}

export interface KnowledgeFieldRejectedEvent
  extends BaseAuditEvent {
  readonly type: "knowledge.field.rejected";
  readonly fieldPath: string;
  readonly recordId: string;
  readonly reason: string;
}

export interface AgentRunStartedEvent
  extends BaseAuditEvent {
  readonly type: "agent.run.started";
  readonly runId: string;
  readonly agentId: string;
  readonly requestType: string;
}

export interface AgentRunCompletedEvent
  extends BaseAuditEvent {
  readonly type: "agent.run.completed";
  readonly runId: string;
  readonly status:
    | "completed"
    | "failed"
    | "cancelled"
    | "awaiting_approval";
  readonly outputHash?: string;
}

export interface ToolInvocationEvent
  extends BaseAuditEvent {
  readonly type: "agent.tool.invoked";
  readonly runId: string;
  readonly toolName: string;
  readonly inputHash: string;
  readonly outputHash?: string;
  readonly status: "succeeded" | "failed" | "denied";
  readonly denialReason?: string;
}

export interface ApprovalRequestedEvent
  extends BaseAuditEvent {
  readonly type: "approval.requested";
  readonly approvalId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly requestedAction: string;
}

export interface ApprovalGrantedEvent
  extends BaseAuditEvent {
  readonly type: "approval.granted";
  readonly approvalId: string;
  readonly approverId: string;
}

export interface ApprovalRejectedEvent
  extends BaseAuditEvent {
  readonly type: "approval.rejected";
  readonly approvalId: string;
  readonly approverId: string;
  readonly reason: string;
}

export interface BrandArtifactCreatedEvent
  extends BaseAuditEvent {
  readonly type: "brand.artifact.created";
  readonly artifactId: string;
  readonly artifactType: string;
  readonly sourceRunId: string;
}
```

```ts
// src/core/audit/audit-writer.ts

import type { AuditEvent } from "./audit-event";
import type { TenantContext } from "../tenancy/tenant-context";

export interface AuditWriter {
  append(
    context: TenantContext,
    event: AuditEvent,
  ): Promise<void>;
}

export interface AuditReader {
  listByTenant(
    context: TenantContext,
    options?: {
      readonly correlationId?: string;
      readonly after?: string;
      readonly limit?: number;
    },
  ): Promise<readonly AuditEvent[]>;
}
```

The production repository should reject updates, deletes, missing tenant context, and missing correlation IDs.

---

# 4. Agent runtime architecture

Use a controlled state machine rather than an unrestricted agent loop:

```text
Request
  -> Validate request
  -> Verify tenant and actor
  -> Load BusinessDNA snapshot
  -> Build approved knowledge context
  -> Evaluate policy
  -> Plan agent steps
  -> Validate tool permissions
  -> Execute tools
  -> Validate model/tool output
  -> Request approval if required
  -> Persist artifact
  -> Append audit events
  -> Return typed response
```

## 4.1 Agent definitions

```ts
// src/core/agents/contracts/agent-runtime.ts

export type AgentId =
  | "knowledge-curator"
  | "brand-strategist"
  | "brand-generator"
  | "design-partner-reviewer";

export type AgentCapability =
  | "read_knowledge"
  | "propose_knowledge"
  | "confirm_knowledge"
  | "generate_brand_artifact"
  | "request_approval"
  | "read_audit"
  | "write_audit";

export type AgentAction =
  | "propose_knowledge"
  | "confirm_knowledge"
  | "generate_brand_artifact"
  | "publish_brand_artifact";

export interface AgentDefinition {
  readonly id: AgentId;
  readonly version: string;
  readonly capabilities: readonly AgentCapability[];
  readonly requiresApprovalFor: readonly AgentAction[];
  readonly maxToolCalls: number;
  readonly maxRuntimeMs: number;
}
```

## 4.2 Requests

```ts
// src/core/agents/contracts/agent-request.ts

import type { AgentId } from "./agent-runtime";
import type { TenantContext } from "../../tenancy/tenant-context";

interface BaseAgentRequest {
  readonly requestId: string;
  readonly tenant: TenantContext;
  readonly agentId: AgentId;
  readonly requestedAt: string;
  readonly idempotencyKey: string;
}

export type AgentRequest =
  | KnowledgeExtractionRequest
  | BrandStrategyRequest
  | BrandGenerationRequest
  | DesignPartnerReviewRequest;

export interface KnowledgeExtractionRequest
  extends BaseAgentRequest {
  readonly type: "knowledge.extract";
  readonly input:
    | {
        readonly sourceType: "conversation";
        readonly conversationId: string;
        readonly messages: readonly ConversationMessage[];
      }
    | {
        readonly sourceType: "document";
        readonly documentId: string;
        readonly text: string;
      };
  readonly targetFields?: readonly BusinessDNAFieldPath[];
}

export interface BrandStrategyRequest
  extends BaseAgentRequest {
  readonly type: "brand.strategy";
  readonly objective: string;
  readonly constraints?: readonly string[];
}

export interface BrandGenerationRequest
  extends BaseAgentRequest {
  readonly type: "brand.generate";
  readonly objective: string;
  readonly format: "draft" | "production_candidate";
  readonly approvalMode: "none" | "required";
}

export interface DesignPartnerReviewRequest
  extends BaseAgentRequest {
  readonly type: "design_partner.review";
  readonly artifactId: string;
  readonly responses: readonly DesignPartnerResponse[];
}

export interface ConversationMessage {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
  readonly createdAt: string;
}

export interface DesignPartnerResponse {
  readonly questionId: string;
  readonly answer:
    | string
    | number
    | boolean
    | readonly string[];
  readonly confidence?: number;
  readonly notes?: string;
}
```

## 4.3 Responses

```ts
// src/core/agents/contracts/agent-response.ts

export type AgentResponse =
  | KnowledgeExtractionResponse
  | BrandStrategyResponse
  | BrandGenerationResponse
  | ApprovalRequiredResponse
  | AgentFailureResponse;

interface BaseAgentResponse {
  readonly requestId: string;
  readonly runId: string;
  readonly agentId: string;
  readonly status:
    | "completed"
    | "awaiting_approval"
    | "failed";
  readonly createdAt: string;
  readonly warnings: readonly AgentWarning[];
}

export interface KnowledgeExtractionResponse
  extends BaseAgentResponse {
  readonly type: "knowledge.extract.result";
  readonly status: "completed";
  readonly proposals: readonly KnowledgeProposal[];
}

export interface BrandStrategyResponse
  extends BaseAgentResponse {
  readonly type: "brand.strategy.result";
  readonly status: "completed";
  readonly strategy: BrandStrategyOutput;
}

export interface BrandGenerationResponse
  extends BaseAgentResponse {
  readonly type: "brand.generate.result";
  readonly status: "completed";
  readonly artifact: BrandArtifact;
}

export interface ApprovalRequiredResponse
  extends BaseAgentResponse {
  readonly type: "approval.required";
  readonly status: "awaiting_approval";
  readonly approvalId: string;
  readonly requestedAction: AgentAction;
  readonly resourceId: string;
  readonly summary: string;
}

export interface AgentFailureResponse
  extends BaseAgentResponse {
  readonly type: "agent.failure";
  readonly status: "failed";
  readonly errorCode: string;
  readonly message: string;
  readonly retryable: boolean;
}

export interface AgentWarning {
  readonly code: string;
  readonly message: string;
  readonly fieldPath?: string;
}

export interface KnowledgeProposal {
  readonly fieldPath: BusinessDNAFieldPath;
  readonly value: unknown;
  readonly confidence: number;
  readonly provenance: readonly Provenance[];
  readonly rationale: string;
}

export interface BrandStrategyOutput {
  readonly positioning: string;
  readonly audience: string;
  readonly promise: string;
  readonly personality: readonly string[];
  readonly voice: readonly string[];
  readonly risks: readonly string[];
  readonly unresolvedQuestions: readonly string[];
}

export interface BrandArtifact {
  readonly id: string;
  readonly tenantId: string;
  readonly type:
    | "brand_strategy"
    | "brand_identity"
    | "brand_generator_input";
  readonly version: number;
  readonly content: unknown;
  readonly sourceRunId: string;
  readonly knowledgeVersion: number;
  readonly createdAt: string;
}
```

## 4.4 Tool contracts

```ts
// src/core/agents/contracts/agent-tool.ts

import { z } from "zod";
import type { AgentCapability } from "./agent-runtime";
import type { TenantContext } from "../../tenancy/tenant-context";

export interface ToolExecutionContext {
  readonly tenant: TenantContext;
  readonly runId: string;
  readonly agentId: string;
  readonly correlationId: string;
}

export interface ToolDefinition<TInput, TOutput> {
  readonly name: string;
  readonly version: string;
  readonly inputSchema: z.ZodType<TInput>;
  readonly outputSchema: z.ZodType<TOutput>;
  readonly requiredCapability: AgentCapability;
  readonly sideEffect: "none" | "propose" | "write" | "publish";
  readonly execute: (
    context: ToolExecutionContext,
    input: TInput,
  ) => Promise<TOutput>;
}
```

The model may request a tool, but application code must decide whether the tool is allowed. The model must never decide tenant identity, authorization, approval requirements, or persistence behavior.

---

# 5. Runtime policy and workflow state

```ts
// src/core/agents/runtime/policy-engine.ts

import type {
  AgentAction,
  AgentDefinition,
  AgentCapability,
} from "../contracts/agent-runtime";
import type { TenantContext } from "../../tenancy/tenant-context";

export interface PolicyDecision {
  readonly allowed: boolean;
  readonly requiresApproval: boolean;
  readonly reason: string;
}

export interface RuntimePolicy {
  evaluate(input: {
    readonly tenant: TenantContext;
    readonly agent: AgentDefinition;
    readonly action: AgentAction;
    readonly resourceType: string;
    readonly resourceId?: string;
  }): Promise<PolicyDecision>;
}

export class DefaultRuntimePolicy
  implements RuntimePolicy
{
  public async evaluate(input: {
    tenant: TenantContext;
    agent: AgentDefinition;
    action: AgentAction;
    resourceType: string;
    resourceId?: string;
  }): Promise<PolicyDecision> {
    const capability = capabilityFor(input.action);

    if (!input.agent.capabilities.includes(capability)) {
      return {
        allowed: false,
        requiresApproval: false,
        reason: "Agent lacks the required capability",
      };
    }

    if (
      input.action === "publish_brand_artifact" &&
      !input.tenant.roles.some((role) =>
        role === "owner" || role === "admin",
      )
    ) {
      return {
        allowed: false,
        requiresApproval: false,
        reason: "Publishing requires owner or admin access",
      };
    }

    return {
      allowed: true,
      requiresApproval:
        input.agent.requiresApprovalFor.includes(input.action),
      reason: "Allowed by runtime policy",
    };
  }
}

function capabilityFor(
  action: AgentAction,
): AgentCapability {
  switch (action) {
    case "propose_knowledge":
      return "propose_knowledge";
    case "confirm_knowledge":
      return "confirm_knowledge";
    case "generate_brand_artifact":
    case "publish_brand_artifact":
      return "generate_brand_artifact";
  }
}
```

```ts
// src/core/agents/contracts/workflow.ts

export type WorkflowState =
  | {
      readonly status: "created";
      readonly workflowId: string;
      readonly tenantId: string;
      readonly runId: string;
      readonly version: number;
    }
  | {
      readonly status: "running";
      readonly workflowId: string;
      readonly tenantId: string;
      readonly runId: string;
      readonly version: number;
      readonly step: number;
      readonly toolCalls: number;
    }
  | {
      readonly status: "awaiting_approval";
      readonly workflowId: string;
      readonly tenantId: string;
      readonly runId: string;
      readonly version: number;
      readonly approvalId: string;
      readonly resourceId: string;
      readonly requestedAction: AgentAction;
    }
  | {
      readonly status: "completed";
      readonly workflowId: string;
      readonly tenantId: string;
      readonly runId: string;
      readonly version: number;
      readonly artifactId?: string;
      readonly outputHash: string;
    }
  | {
      readonly status: "failed";
      readonly workflowId: string;
      readonly tenantId: string;
      readonly runId: string;
      readonly version: number;
      readonly errorCode: string;
      readonly message: string;
      readonly retryable: boolean;
    }
  | {
      readonly status: "cancelled";
      readonly workflowId: string;
      readonly tenantId: string;
      readonly runId: string;
      readonly version: number;
      readonly reason: string;
    };

export function canTransition(
  from: WorkflowState["status"],
  to: WorkflowState["status"],
): boolean {
  const transitions: Record<
    WorkflowState["status"],
    readonly WorkflowState["status"][]
  > = {
    created: ["running", "cancelled"],
    running: [
      "running",
      "awaiting_approval",
      "completed",
      "failed",
      "cancelled",
    ],
    awaiting_approval: [
      "running",
      "completed",
      "failed",
      "cancelled",
    ],
    completed: [],
    failed: ["running", "cancelled"],
    cancelled: [],
  };

  return transitions[from].includes(to);
}
```

---

# 6. Brand generator contract

The brand generator should be a domain service, not a raw model endpoint.

```ts
// src/core/brand/contracts/brand-generation.ts

import type { BusinessDNA } from "../../knowledge/contracts/business-dna";

export interface BrandGenerationInput {
  readonly tenantId: string;
  readonly knowledgeVersion: number;
  readonly businessDna: BusinessDNA;
  readonly objective: string;
  readonly format: "draft" | "production_candidate";
  readonly constraints: readonly string[];
}

export interface BrandGenerationResult {
  readonly artifact: BrandArtifact;
  readonly validation: BrandArtifactValidation;
}

export interface BrandArtifact {
  readonly id: string;
  readonly tenantId: string;
  readonly version: number;
  readonly status: "proposed" | "approved" | "rejected";
  readonly objective: string;
  readonly headlines: readonly string[];
  readonly valuePropositions: readonly string[];
  readonly proofPoints: readonly {
    readonly claim: string;
    readonly sourceIds: readonly string[];
  }[];
  readonly warnings: readonly string[];
  readonly sourceKnowledgeVersion: number;
  readonly sourceFieldHashes: readonly string[];
  readonly generatedAt: string;
  readonly generatedBy: string;
}

export interface BrandArtifactValidation {
  readonly valid: boolean;
  readonly errors: readonly BrandValidationIssue[];
  readonly warnings: readonly BrandValidationIssue[];
}

export interface BrandValidationIssue {
  readonly code:
    | "missing_required_field"
    | "unsupported_claim"
    | "privacy_risk"
    | "legal_risk"
    | "inconsistent_voice"
    | "unresolved_knowledge";
  readonly message: string;
  readonly fieldPath?: string;
  readonly severity: "error" | "warning";
}
```

Recommended behavior:

- Draft generation may be allowed without approval.
- Production candidates should be marked `proposed`.
- Publication should always require approval.
- Approval must reference the exact artifact version and Business DNA version.
- Any new artifact version invalidates approval for the previous version.
- Unsupported claims should become warnings or errors, never silently invented facts.

---

# 7. Design-partner validation structure

Validate the product loop, not just whether people like the generated copy.

## Stage 0: Internal validation

Use synthetic or internal tenants to verify:

- tenant isolation,
- schema validation,
- audit completeness,
- approval bypass prevention,
- invalid model-output handling,
- idempotency,
- rejected knowledge preservation.

## Stage 1: Guided design partners

Recruit **3-5 paid design partners**. Each should complete:

1. Business intake
2. Business DNA review
3. Correction of at least three fields
4. Brand strategy generation
5. Provenance review
6. Artifact approval or rejection
7. Regeneration after correction
8. Final interview

Choose partners with:

- a recurring brand or marketing workflow,
- existing strategy documents,
- a named decision-maker,
- willingness to review outputs,
- a measurable baseline.

## Stage 2: Semi-guided validation

Expand to a larger group only after the runtime invariants are stable. Reduce facilitation and measure:

- time to first useful output,
- knowledge correction rate,
- provenance-view rate,
- approval completion rate,
- artifact regeneration rate,
- artifact edit rate,
- unresolved-risk count,
- support requests,
- abandonment points,
- repeat usage.

## Design-partner contracts

```ts
// src/core/research/design-partner.contracts.ts

export type DesignPartnerCohort =
  | "internal"
  | "guided"
  | "semi_guided"
  | "production_candidate";

export interface DesignPartnerSession {
  readonly id: string;
  readonly tenantId: string;
  readonly partnerId: string;
  readonly cohort: DesignPartnerCohort;
  readonly facilitatorId?: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly hypothesisIds: readonly string[];
  readonly consent: {
    readonly researchParticipation: boolean;
    readonly dataUse: boolean;
    readonly recording: boolean;
  };
  readonly milestones: readonly DesignPartnerMilestone[];
}

export type DesignPartnerMilestone =
  | {
      readonly type: "intake_completed";
      readonly occurredAt: string;
    }
  | {
      readonly type: "knowledge_reviewed";
      readonly occurredAt: string;
      readonly fieldsReviewed: number;
      readonly fieldsAccepted: number;
      readonly fieldsRejected: number;
    }
  | {
      readonly type: "artifact_generated";
      readonly occurredAt: string;
      readonly artifactId: string;
    }
  | {
      readonly type: "artifact_approved";
      readonly occurredAt: string;
      readonly artifactId: string;
    }
  | {
      readonly type: "artifact_rejected";
      readonly occurredAt: string;
      readonly artifactId: string;
      readonly reason: string;
    }
  | {
      readonly type: "session_abandoned";
      readonly occurredAt: string;
      readonly step: string;
      readonly reason?: string;
    };

export interface DesignPartnerFeedback {
  readonly id: string;
  readonly tenantId: string;
  readonly sessionId: string;
  readonly artifactId?: string;
  readonly submittedAt: string;
  readonly ratings: {
    readonly accuracy?: number;
    readonly usefulness?: number;
    readonly trust?: number;
    readonly control?: number;
    readonly clarity?: number;
  };
  readonly qualitative: {
    readonly whatWasRight?: string;
    readonly whatWasWrong?: string;
    readonly whatWasMissing?: string;
    readonly whatWasSurprising?: string;
    readonly wouldUseAgain?: boolean;
  };
  readonly corrections: readonly {
    readonly fieldPath?: string;
    readonly original: unknown;
    readonly corrected: unknown;
    readonly reason?: string;
  }[];
}
```

```ts
// src/core/research/design-partner.metrics.ts

export interface DesignPartnerMetrics {
  readonly timeToFirstUsefulOutputMs: number;
  readonly knowledgeFieldsReviewed: number;
  readonly knowledgeAcceptanceRate: number;
  readonly knowledgeCorrectionRate: number;
  readonly provenanceViewRate: number;
  readonly approvalCompletionRate: number;
  readonly artifactRegenerationRate: number;
  readonly artifactEditRate: number;
  readonly unresolvedRiskCount: number;
  readonly supportRequestCount: number;
  readonly abandonmentRate: number;
}
```

Before each cohort, define the decision criteria in writing. Do not treat arbitrary thresholds as universal product truth.

---

# 8. How to integrate this with your current setup

Your current foundation already has:

```text
src/core/knowledge/
├── README.md
├── architecture.md
├── index.ts
├── schema/
│   ├── shared/
│   └── business-dna/
```

Use it as follows:

| Existing area | Add or move here |
|---|---|
| `schema/shared/metadata.ts` | `KnowledgeField<T>`, provenance, approval metadata |
| `schema/shared/confidence.ts` | `ConfidenceScore`, confidence utilities |
| `schema/shared/timestamps.ts` | ISO timestamp schemas and helpers |
| `schema/shared/audit.ts` | Audit event types and append-only interfaces |
| `schema/business-dna/business-dna.types.ts` | Canonical `BusinessDNA` contract |
| `schema/business-dna/business-dna.schema.ts` | Zod field and Business DNA schemas |
| `schema/business-dna/validators.ts` | Cross-field validation rules |
| `schema/business-dna/defaults.ts` | Default generator |
| New `src/core/tenancy/` | Tenant context and access guards |
| New `src/core/approvals/` | Approval requests and decisions |
| New `src/core/agents/` | Runtime, tools, requests, responses, workflows |
| New `src/core/brand/` | Brand generator contracts and service |
| New `src/core/research/` | Design-partner sessions and feedback |

## Recommended implementation order

1. **Freeze the canonical Business DNA vocabulary.**
2. Add `KnowledgeField<T>` and provenance contracts.
3. Add Zod schemas and cross-field validators.
4. Add tenant context to every repository interface.
5. Add append-only audit events.
6. Implement read-only knowledge retrieval.
7. Implement knowledge proposals.
8. Add approval requests.
9. Implement a brand strategy draft artifact.
10. Add the brand generator.
11. Add publication only after approval and audit tests pass.
12. Run the guided design-partner cohort.

## Important reconciliation items

Your current documents should explicitly resolve:

- whether `businessId` is distinct from `tenantId`,
- whether `confirmed` and `approved` mean the same thing,
- whether confidence means model confidence or source reliability,
- whether audit records can be deleted when customer data is deleted,
- whether support staff can inspect customer data,
- whether design-partner recordings are retained,
- whether generated artifacts are customer-owned,
- whether agent runs are synchronous or asynchronous.

The most important architectural boundary is:

> **Agents may propose and generate. Application policy controls permissions. Humans confirm and publish. Audit records explain every consequential action.**

This gives you a safe path from the current knowledge foundation to a governed agent runtime and client-specific brand generator without turning the first version into an uncontrolled autonomous system.


## Why you need design partners

Design partners are not just people who give feedback. They are early customers who help you prove that Brand First solves a **real, recurring, paid problem**.

They help you validate four things that surveys cannot reliably prove:

1. **Value**: Does the product reduce production time or revision work?
2. **Trust**: Will customers rely on provenance, approvals, and claim warnings?
3. **Repeatability**: Do they use the workflow every week?
4. **Willingness to pay**: Will they pay to continue after the pilot?

A survey can tell you that an idea sounds useful. A paid design partner shows whether someone will provide real business data, use the product in a real workflow, review its outputs, and continue paying.

## Add a brand for AI Visibility

AI Visibility is useful for measuring how often a brand appears in AI-generated answers, its average position, and how it compares with competitors. It measures AI share of voice and competitive positioning, not total market size.

To add Brand First:

1. Open AI Visibility and choose the brand setup or competitor settings.
2. Enter the brand name: **Brand First** or **TACF**.
3. Enter the official website URL.
4. Add relevant competitors by name and website URL.
5. Review the tracked prompts and topics before using the results as a baseline.

I verified the current workspace, and no AI Visibility brand is configured yet, so there is no Brand First visibility baseline available today. I cannot create the brand from the tools currently enabled here, but I can help you define the exact brand name, URL, competitors, topics, and prompt set to enter.

## Outreach template

**Subject:** Paid design partner opportunity for Brand First

Hi [Name],

I’m building Brand First, a governed AI platform that turns a company’s strategy, brand guidelines, customer knowledge, and approved claims into structured Business DNA that AI workflows can use safely.

I’m looking for a small number of paid design partners who regularly produce [campaign briefs / website messaging / sales content / brand strategy deliverables].

During the pilot, we would:

- Convert your existing brand and business materials into a structured knowledge layer
- Generate one recurring deliverable using that approved context
- Track production time, revision cycles, unsupported claims, and approval effort
- Review the results together each week
- Improve the workflow based on your team’s real usage

The pilot would run for [30 days] and cost [$X]. It would require one business owner, access to relevant brand materials, and a weekly review session.

The goal is not to sell you an unfinished general-purpose AI system. It is to determine whether this specific workflow creates measurable value for your team.

Would you be open to a 20-minute conversation to see whether [workflow] is a good fit?

Best,  
[Your name]

## Pilot metrics to instrument

The current project has no pilot-specific events, so these metrics require instrumentation before they can be measured reliably. I created a temporary placeholder chart, but it is not a validated pilot scorecard:

[View pilot usage chart draft →](https://app.amplitude.com/analytics/winter-cherry-750253/chart/new/36ffd9l5)

Track these events:

```text
pilot_workflow_started
pilot_workflow_completed
pilot_output_revised
pilot_unsupported_claim_flagged
pilot_approval_submitted
pilot_approval_completed
```

Recommended properties:

```text
workflow_id
design_partner_id
workflow_version
artifact_id
production_duration_seconds
revision_count
claim_status
approval_status
```

Your core scorecard should be:

| Outcome | Measurement |
|---|---|
| Faster production | Time from workflow start to completed artifact |
| Fewer revisions | Number of revisions per artifact |
| Safer claims | Unsupported claims per artifact |
| Trust and control | Approval completion and rejection reasons |
| Repeat usage | Completed workflows per partner per week |
| Commercial validation | Pilot continuation or paid conversion |

Use a baseline period before the pilot, then compare the same workflow during the pilot. The strongest signal is not a high satisfaction rating; it is a partner who repeatedly uses the workflow, approves the outputs, and pays to continue.


AI Visibility is available from the Amplitude home page under **Marketing Analytics → AI Visibility**. In some interface versions, it may also appear directly in the top navigation. The current project is `default` in the `winter-cherry-750253` workspace.

To prepare the competitor list, open **Competitor Settings → Add Competitor**, then enter each competitor’s name and official website URL. AI Visibility compares visibility percentage, average rank, prompt mentions, topics, and citations across the tracked brands. [1]

## Recommended initial competitor set for Brand First

Because Brand First is positioned around governed business context, Business DNA, brand governance, and AI workflows, use a balanced list rather than only direct competitors:

| Category | Candidate | Why include it |
|---|---|---|
| Direct | **Brandfolder** | Brand asset and brand-governance alternative |
| Direct/adjacent | **Frontify** | Brand management and guidelines alternative |
| Adjacent | **Guru** | Internal knowledge and AI knowledge-management alternative |
| Adjacent | **Notion** | Flexible workspace and company-knowledge alternative |
| Adjacent | **Writer** | Enterprise AI and governed content alternative |
| Adjacent | **Typeface** | AI-powered brand content and marketing alternative |
| Build alternative | **ChatGPT** | General AI workspace customers may use instead |
| Build alternative | **Custom internal AI platform** | Represents the build-versus-buy option |

I recommend starting with **five**, so the comparison remains interpretable:

1. Brandfolder  
2. Frontify  
3. Guru  
4. Writer  
5. Typeface  

Before entering them, verify each official website URL and decide whether your primary tracked brand should be called **Brand First**, **TACF**, or both through aliases. I cannot add the competitors directly because the available account actions expose AI Visibility reporting but not competitor-list write access.

One important limitation: the current project has no configured AI Visibility brand yet, so you will need to add the primary Brand First/TACF brand before competitor comparisons can produce results. AI Visibility data is refreshed weekly, and its results measure AI-generated-answer presence rather than total market size. [2]