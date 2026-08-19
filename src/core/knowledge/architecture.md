# Brand First — Knowledge Layer Architecture

## 1. Proposed Type Relationships

The knowledge system is designed around a single domain-agnostic atomic primitive:

```typescript
export interface KnowledgeField<T> {
  value: T;
  confidence: number;            // 0.0 to 1.0 score
  source: string;                // e.g. "website", "manual", "learning", "onboarding_form"
  modelUsed?: string | null;     // e.g. "ollama/llama3", "claude-3-5-sonnet"
  timestamp: string;             // ISO 8601 string
  approvalStatus: ApprovalStatus;// 'pending' | 'approved' | 'rejected'
  reasoningSummary?: string | null; // AI rationale or user annotation
}
```

Every attribute inside any knowledge domain wraps its underlying value inside `KnowledgeField<T>`.

### Data Hierarchy

```
BusinessDNA
 ├── companyIdentity: CompanyIdentity
 │    ├── companyName: KnowledgeField<string>
 │    ├── industry: KnowledgeField<IndustryCategory | string>
 │    ├── stage: KnowledgeField<CompanyStage>
 │    ├── mission: KnowledgeField<string>
 │    └── uniqueValueProposition: KnowledgeField<string>
 ├── brandVoice: BrandVoiceProfile
 │    ├── primaryTone: KnowledgeField<VoiceTone | string>
 │    ├── toneDescriptors: KnowledgeField<string[]>
 │    └── wordsToAvoid: KnowledgeField<string[]>
 ├── customerProfile: IdealCustomerProfile
 │    ├── targetAudience: KnowledgeField<string>
 │    └── buyerPersonas: KnowledgeField<BuyerPersona[]>
 └── competitivePositioning: CompetitivePositioning
      ├── marketPosition: KnowledgeField<MarketPosition | string>
      └── keyDifferentiators: KnowledgeField<string[]>
```

## 2. Why This Design Supports Future Expansion

1. **Domain Isolation & Zero Contamination**:
   The shared primitive layer (`schema/shared/`) is completely decoupled from Business DNA. Future domains—such as `CustomerMemory`, `SalesIntelligence`, or `ProductCatalog`—will simply import `KnowledgeField<T>`, `ApprovalStatus`, and `AuditEvent` without altering any existing schemas or data models.

2. **Generic Processing Pipeline Compatibility**:
   Because every field exposes `value`, `confidence`, `source`, `approvalStatus`, and `timestamp`, the downstream Knowledge Engine (Stage 2) can evaluate health scores, apply confidence weightings, and perform diff computations dynamically across any domain using generic traversal algorithms.

3. **Additive Schema Evolution**:
   New fields or domain models can be added seamlessly by creating a schema subfolder (e.g. `schema/customer-memory/`). Zod handles schema defaults and optional properties smoothly without breaking backward compatibility.

## 3. Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Universal Field Wrapper (`KnowledgeField<T>`)** | Bakes provenance, AI attribution, confidence, and approval status directly into each data point, eliminating complex DB join tables. |
| **Zod Schema + TypeScript Interface Parity** | Ensures compile-time strictness via TS types and runtime input safety via Zod validation schemas. |
| **Pure Functional Contracts** | All schema files, defaults, and validators are side-effect free and run seamlessly in any JS/TS environment (Node, Edge, Browser, React Server Components). |
| **Strict Enums with Escape Hatches** | Standardized choices (e.g. `CompanyStage`, `VoiceTone`) are provided via Zod enums, while allowing custom strings (`VoiceTone | string`) for extended flexibility. |
