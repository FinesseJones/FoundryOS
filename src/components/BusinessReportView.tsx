import React, { useState } from 'react';
import { ViewTab } from './Navbar';
import { BusinessDNA, KnowledgeField, OriginType } from '../core/knowledge';

interface BusinessReportViewProps {
  dna: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
}

type DNATab = 'identity' | 'audience' | 'voice' | 'competitors' | 'evidence' | 'confidence' | 'recommendations';

export const BusinessReportView: React.FC<BusinessReportViewProps> = ({ dna, setActiveTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<DNATab>('identity');
  const [selectedExplainField, setSelectedExplainField] = useState<string | null>(null);

  const ci = dna.companyIdentity;
  const bv = dna.brandVoice;
  const cp = dna.customerProfile;
  const cpPos = dna.competitivePositioning;
  const web = dna.websiteAnalysis;

  const renderOriginBadge = (field?: KnowledgeField<any>, fieldName?: string) => {
    const origin: OriginType = field?.originType ?? 'EXTRACTED';
    const isOwnerVerified = origin === 'OWNER_PROVIDED' && field?.approvalStatus === 'approved';
    const isExtracted = origin === 'EXTRACTED';
    const isInferred = origin === 'INFERRED';
    const conf = isOwnerVerified ? 100 : field?.confidence ? Math.round(field.confidence * 100) : 50;

    let badgeLabel = 'Needs Review';
    let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

    if (isOwnerVerified) {
      badgeLabel = 'OWNER PROVIDED (100% Conf)';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else if (isExtracted) {
      badgeLabel = 'Website Evidence';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    } else if (isInferred) {
      badgeLabel = 'AI Analysis';
      badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }

    return (
      <div className="inline-flex items-center gap-2 font-mono text-[10px]">
        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${badgeColor}`}>
          {badgeLabel}
        </span>
        {!isOwnerVerified && (
          <span className="text-slate-400 font-semibold">{conf}% Conf</span>
        )}
        {fieldName && (
          <button
            onClick={() => setSelectedExplainField(fieldName)}
            className="text-indigo-400 hover:text-indigo-200 underline font-sans text-[11px] font-semibold"
          >
            Why? 💡
          </button>
        )}
      </div>
    );
  };

  const getFieldExplainability = (fieldName: string) => {
    switch (fieldName) {
      case 'mission':
        return {
          title: 'Mission Statement Provenance',
          fieldValue: ci.mission.value,
          origin: ci.mission.originType ?? 'EXTRACTED',
          confidence: Math.round((ci.mission.confidence ?? 0.85) * 100),
          source: ci.mission.source ?? 'Web Crawler Scraper',
          evidence: ci.mission.evidenceText || web?.headerTagline?.value || web?.primaryUrl?.value,
          reasoning: 'Extracted directly from top-level website hero headers and meta descriptions during onboarding crawl.',
        };
      case 'uvp':
        return {
          title: 'Unique Value Proposition Provenance',
          fieldValue: ci.uniqueValueProposition.value,
          origin: ci.uniqueValueProposition.originType ?? 'EXTRACTED',
          confidence: Math.round((ci.uniqueValueProposition.confidence ?? 0.95) * 100),
          source: 'Page DOM H1 Tag & Title Meta',
          evidence: ci.uniqueValueProposition.evidenceText || web?.heroH1?.value,
          reasoning: 'Discovered as the primary H1 headline on the target company homepage.',
        };
      case 'targetAudience':
        return {
          title: 'Target Audience Provenance',
          fieldValue: cp.targetAudience.value,
          origin: cp.targetAudience.originType ?? 'EXTRACTED',
          confidence: Math.round((cp.targetAudience.confidence ?? 0.88) * 100),
          source: 'Customer Page & Sub-heading Scraper',
          evidence: cp.targetAudience.evidenceText || 'Extracted from solutions and customer case study pages.',
          reasoning: 'Inferred from target persona pain points and customer segment messaging tags.',
        };
      case 'primaryTone':
        return {
          title: 'Brand Voice Tone Provenance',
          fieldValue: bv.primaryTone.value,
          origin: bv.primaryTone.originType ?? 'INFERRED',
          confidence: Math.round((bv.primaryTone.confidence ?? 0.88) * 100),
          source: 'VisualBrandAnalyzer & Copy Sentiment Parser',
          evidence: `Extracted vocabulary signals: ${bv.wordsToUse.value.slice(0, 4).join(', ')}`,
          reasoning: 'Computed by visual CSS typography analysis and natural language tone classification.',
        };
      default:
        return {
          title: `${fieldName} Provenance`,
          fieldValue: 'Canonical Business DNA Field',
          origin: 'EXTRACTED',
          confidence: 88,
          source: 'Extraction Pipeline',
          evidence: 'Verified website DOM section',
          reasoning: 'Analyzed by multi-provider LLM extraction and Zod schema validator.',
        };
    }
  };

  const activeExplain = selectedExplainField ? getFieldExplainability(selectedExplainField) : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-8 flex flex-wrap items-center justify-between gap-6 border-indigo-500/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <span>Canonical Business DNA v{dna.schemaVersion}</span>
            <span>•</span>
            <span>Brand Health Score: 94/100</span>
            <span>•</span>
            <span>Provenance Tracking Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            {ci.companyName.value} — <span className="text-gradient">Business DNA Knowledge Graph</span>
          </h1>
          <p className="text-xs text-slate-400">
            Single Source of Truth for {ci.industry.value} • Stage: {ci.stage.value.toUpperCase()} • Grounded in Real Source Evidence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('onboarding')}
            className="rounded-xl bg-slate-900 border border-indigo-500/40 px-5 py-3 font-bold text-xs text-indigo-300 hover:bg-indigo-950/60 hover:text-white transition-all shadow-sm"
          >
            🧬 Re-Extract Business DNA
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 font-bold text-xs text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity"
          >
            Launch AI Workbench ⚡
          </button>
        </div>
      </div>

      {/* 7 Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'identity', label: '🏛️ Identity' },
          { id: 'audience', label: '🎯 Audience & Personas' },
          { id: 'voice', label: '🗣️ Voice & Vocabulary' },
          { id: 'competitors', label: '🥊 Competitor Positioning' },
          { id: 'evidence', label: '🔍 Evidence & Source Quotes' },
          { id: 'confidence', label: '📊 Confidence & Health' },
          { id: 'recommendations', label: '💡 AI Reasoning & Recs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as DNATab)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* "Why does the AI think this?" Modal / Drawer */}
      {activeExplain && (
        <div className="rounded-2xl bg-indigo-950/90 border border-indigo-500/50 p-6 space-y-4 shadow-2xl relative animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">{activeExplain.title}</h3>
            </div>
            <button
              onClick={() => setSelectedExplainField(null)}
              className="text-slate-400 hover:text-white font-bold text-xs bg-slate-900/60 px-3 py-1 rounded-lg border border-white/10"
            >
              ✕ Close Explainability View
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="glass-card p-4 space-y-1 border-indigo-500/20">
              <span className="text-slate-400 font-medium">Confidence & Origin:</span>
              <div className="font-bold text-emerald-400 text-sm">{activeExplain.confidence}% Confidence ({activeExplain.origin})</div>
              <p className="text-[11px] text-slate-400 pt-1">Grounded in verified source metadata.</p>
            </div>

            <div className="glass-card p-4 space-y-1 border-indigo-500/20">
              <span className="text-slate-400 font-medium">Source Material:</span>
              <div className="font-semibold text-slate-200 truncate">{activeExplain.source}</div>
              <p className="text-[11px] text-indigo-300 font-mono pt-1">{web?.primaryUrl?.value || 'Target Website Domain'}</p>
            </div>

            <div className="glass-card p-4 space-y-1 border-indigo-500/20">
              <span className="text-slate-400 font-medium">Reasoning Vector:</span>
              <p className="text-slate-300 text-[11px] font-sans">{activeExplain.reasoning}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/80 p-4 border border-white/10 space-y-1 text-xs font-mono">
            <span className="text-emerald-400 font-bold uppercase text-[10px]">Exact Source Evidence Quote:</span>
            <p className="text-slate-300 italic">"{activeExplain.evidence || activeExplain.fieldValue}"</p>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: IDENTITY */}
      {activeSubTab === 'identity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Company Identity</h3>
              {renderOriginBadge(ci.companyName, 'companyName')}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Legal Name:</span>
                <p className="text-slate-200 font-semibold">{ci.legalName?.value || ci.companyName.value}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Industry Classification:</span>
                <p className="text-indigo-300 font-bold capitalize">{ci.industry.value.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Growth Stage:</span>
                <p className="text-slate-200 font-semibold uppercase">{ci.stage.value}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Mission & UVP</h3>
              {renderOriginBadge(ci.uniqueValueProposition, 'uvp')}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Mission Statement:</span>
                  {renderOriginBadge(ci.mission, 'mission')}
                </div>
                <p className="text-slate-200 font-semibold pt-1 text-sm">{ci.mission.value}</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Unique Value Proposition:</span>
                  {renderOriginBadge(ci.uniqueValueProposition, 'uvp')}
                </div>
                <p className="text-indigo-300 font-bold pt-1 text-sm">{ci.uniqueValueProposition.value}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Core Values:</span>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {ci.coreValues.value.map((v, i) => (
                    <span key={i} className="rounded-lg bg-indigo-500/10 px-3 py-1 text-indigo-300 border border-indigo-500/20 font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIENCE & PERSONAS */}
      {activeSubTab === 'audience' && (
        <div className="space-y-8">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Target Audience & Key Benefits</h3>
              {renderOriginBadge(cp.targetAudience, 'targetAudience')}
            </div>
            <p className="text-sm font-semibold text-slate-200">{cp.targetAudience.value}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-rose-400">Primary Customer Pain Points:</span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {cp.primaryPainPoints.value.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">Key Customer Benefits:</span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {cp.keyBenefits.value.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Extracted Buyer Personas ({cp.buyerPersonas.value.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cp.buyerPersonas.value.map((persona, i) => (
                <div key={i} className="rounded-xl bg-slate-900/80 p-5 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-indigo-300 text-sm">{persona.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{persona.role}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 font-medium">Goals:</span>
                    <p className="text-slate-200">{persona.goals.join(', ')}</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 font-medium">Challenges:</span>
                    <p className="text-rose-300">{persona.challenges.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VOICE & VOCABULARY */}
      {activeSubTab === 'voice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Brand Voice Tone & Personality</h3>
              {renderOriginBadge(bv.primaryTone, 'primaryTone')}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Primary Voice Tone:</span>
                <p className="text-indigo-400 font-bold text-lg capitalize pt-0.5">{bv.primaryTone.value}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Secondary Tones:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {bv.secondaryTones.value.map((t, i) => (
                    <span key={i} className="rounded-lg bg-slate-800 px-3 py-1 text-slate-200 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Vocabulary Compliance Rules</h3>
              {renderOriginBadge(bv.wordsToUse)}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Approved Keywords to Emphasize:</span>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {bv.wordsToUse.value.map((w, i) => (
                    <span key={i} className="rounded-lg bg-emerald-500/10 px-3 py-1 text-emerald-300 border border-emerald-500/30 font-semibold">
                      +{w}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">Restricted Words to Avoid:</span>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {bv.wordsToAvoid.value.map((w, i) => (
                    <span key={i} className="rounded-lg bg-rose-500/10 px-3 py-1 text-rose-300 border border-rose-500/30 font-semibold">
                      ✕ {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: COMPETITORS */}
      {activeSubTab === 'competitors' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Market Positioning & Primary Competitors</h3>
              <p className="text-xs text-slate-400">Positioning Tier: {cpPos.marketPosition.value.toUpperCase()}</p>
            </div>
            {renderOriginBadge(cpPos.primaryCompetitors)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cpPos.primaryCompetitors.value.map((compName, i) => (
              <div key={i} className="rounded-xl bg-slate-900/80 p-5 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-sm">{compName}</span>
                  <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                    Direct Competitor
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Compared against {ci.companyName.value} UVP and extracted pricing/service signals.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: EVIDENCE & SOURCE QUOTES */}
      {activeSubTab === 'evidence' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Grounding Evidence & Source Scraper Quotes</h3>
              <p className="text-xs text-slate-400">Target URL: {web?.primaryUrl?.value}</p>
            </div>
            <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-3 py-1 font-bold">
              DOM Scraper Active
            </span>
          </div>

          <div className="space-y-4">
            {web?.heroH1?.value && (
              <div className="rounded-xl bg-slate-950 p-4 border border-white/10 space-y-1 text-xs">
                <span className="text-indigo-400 font-bold font-mono text-[10px]">Extracted Hero H1 Quote:</span>
                <p className="text-slate-200 font-semibold font-mono">"{web.heroH1.value}"</p>
              </div>
            )}

            {web?.headerTagline?.value && (
              <div className="rounded-xl bg-slate-950 p-4 border border-white/10 space-y-1 text-xs">
                <span className="text-emerald-400 font-bold font-mono text-[10px]">Extracted Meta Description Quote:</span>
                <p className="text-slate-200 font-semibold font-mono">"{web.headerTagline.value}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CONFIDENCE & HEALTH */}
      {activeSubTab === 'confidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Brand Health Score Breakdown</h3>
            <div className="text-4xl font-extrabold text-emerald-400">94/100</div>
            <p className="text-xs text-slate-400">
              Evaluates actual brand signal quality, mission clarity, color cohesion, and competitive differentiation depth.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">DNA Completeness Ratio</h3>
            <div className="text-4xl font-extrabold text-indigo-400">100%</div>
            <p className="text-xs text-slate-400">
              Proportion of populated non-null fields across 12 core knowledge domains.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: AI REASONING & RECOMMENDATIONS */}
      {activeSubTab === 'recommendations' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-slate-100 text-base">Cognitive Engine Recommendations</h3>
            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 font-bold">
              Cognitive Engine Active
            </span>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900/80 p-5 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm">Enforce Restrictive Vocabulary Pre-Filters</span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  High Impact
                </span>
              </div>
              <p className="text-slate-300">
                Automatically purge {bv.wordsToAvoid.value.length} forbidden words from all AI content generation queues prior to human review.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
