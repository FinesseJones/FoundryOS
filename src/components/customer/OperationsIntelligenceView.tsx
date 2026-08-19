import React, { useState } from 'react';
import {
  OperationsInsight,
  EfficiencyOpportunity,
  ProcessRecommendation,
} from '../../core/operations/operations-intelligence-service';

import { ViewTab } from '../Navbar';

interface OperationsIntelligenceViewProps {
  setActiveTab?: (tab: ViewTab) => void;
  insights?: OperationsInsight[];
  efficiencyOpportunities?: EfficiencyOpportunity[];
  recommendations?: ProcessRecommendation[];
  onAnalyzeOperations?: (type: string, processArea: string) => void;
  onIdentifyOpportunity?: (processArea: string, type: string) => void;
  onGenerateRecommendation?: (type: string) => void;
}

const priorityBadge = (p: string) => {
  const map: Record<string, string> = {
    CRITICAL: 'text-rose-300 bg-rose-900/40 border-rose-500/30',
    HIGH: 'text-orange-300 bg-orange-900/40 border-orange-500/30',
    MEDIUM: 'text-amber-300 bg-amber-900/40 border-amber-500/30',
    LOW: 'text-sky-300 bg-sky-900/40 border-sky-500/30',
  };
  return map[p] ?? 'text-slate-300 bg-slate-800 border-white/10';
};

const effortBadge = (e: string) =>
  e === 'LOW' ? 'text-emerald-400' : e === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400';

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    IDENTIFIED: 'text-slate-400 bg-slate-800/50',
    UNDER_REVIEW: 'text-amber-400 bg-amber-900/30',
    APPROVED: 'text-blue-400 bg-blue-900/30',
    IMPLEMENTING: 'text-violet-400 bg-violet-900/30',
    COMPLETED: 'text-emerald-400 bg-emerald-900/30',
  };
  return map[s] ?? 'text-slate-400';
};

const confidenceBar = (score: number) => {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 font-mono w-8">{pct}%</span>
    </div>
  );
};

const insightTypes = [
  'PROCESS_BOTTLENECK', 'AUTOMATION_OPPORTUNITY', 'RESOURCE_ALLOCATION',
  'WORKFLOW_INEFFICIENCY', 'QUALITY_IMPROVEMENT', 'COST_REDUCTION',
];

const recTypes = [
  'Process Automation', 'Workflow Streamlining', 'Resource Optimization',
  'Quality Management', 'Cost Efficiency', 'Digital Transformation',
];

export const OperationsIntelligenceView: React.FC<OperationsIntelligenceViewProps> = ({
  insights,
  efficiencyOpportunities,
  recommendations,
  onAnalyzeOperations,
  onIdentifyOpportunity,
  onGenerateRecommendation,
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'efficiency' | 'recommendations'>('insights');
  const [insightType, setInsightType] = useState('PROCESS_BOTTLENECK');
  const [processArea, setProcessArea] = useState('');
  const [oppType, setOppType] = useState('Time Reduction');
  const [oppArea, setOppArea] = useState('');
  const [recType, setRecType] = useState('Process Automation');

  const tabs = [
    { key: 'insights', label: 'Operations Insights' },
    { key: 'efficiency', label: 'Efficiency Opportunities' },
    { key: 'recommendations', label: 'Process Plans' },
  ] as const;

  const criticalCount = (insights ?? []).filter((i) => i.priority === 'CRITICAL').length;
  const autoOpps = (insights ?? []).filter((i) => i.insightType === 'AUTOMATION_OPPORTUNITY').length;
  const totalSaving = (efficiencyOpportunities ?? [])
    .reduce((sum, o) => sum + parseInt(o.costSavingEstimate.replace(/[^0-9]/g, '') || '0'), 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3.5 py-1 border border-teal-500/30 text-xs font-semibold text-teal-400">
          <span>AI-Powered Operations Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Operations <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="text-xs text-slate-400">
          Identify process bottlenecks, efficiency opportunities, and workflow improvements powered by your Business DNA.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Insights', value: (insights ?? []).length, color: 'text-teal-400' },
          { label: 'Critical Issues', value: criticalCount, color: 'text-rose-400' },
          { label: 'Automation Opps', value: autoOpps, color: 'text-violet-400' },
          {
            label: 'Est. Annual Savings',
            value: totalSaving > 0 ? `$${(totalSaving / 1000).toFixed(0)}k` : '—',
            color: 'text-emerald-400',
          },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-t transition-colors ${
              activeTab === t.key
                ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Operations Insights ───────────────────────────────────────────── */}
      {activeTab === 'insights' && (
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-3 border-teal-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Analyze Business Process</h3>
            <div className="flex flex-wrap gap-3">
              <select
                value={insightType}
                onChange={(e) => setInsightType(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {insightTypes.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder='Process area e.g. "Customer onboarding" or "Invoice approval"'
                value={processArea}
                onChange={(e) => setProcessArea(e.target.value)}
                className="flex-1 min-w-[260px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => { onAnalyzeOperations?.(insightType, processArea); setProcessArea(''); }}
                className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Analyze →
              </button>
            </div>
          </div>

          {(insights ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No insights yet. Analyze a process above.</p>
          ) : (
            <div className="space-y-4">
              {(insights ?? []).map((i) => (
                <div key={i.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-100 text-sm">{i.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold rounded border px-2 py-0.5 ${priorityBadge(i.priority)}`}>
                          {i.priority}
                        </span>
                        <span className={`text-[10px] font-bold rounded px-2 py-0.5 ${statusBadge(i.status)}`}>
                          {i.status}
                        </span>
                        <span className={`text-[10px] font-semibold ${effortBadge(i.implementationEffort)}`}>
                          Effort: {i.implementationEffort}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{i.processArea}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-900/60 p-3 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Current State</span>
                      <p className="text-slate-400">{i.currentState}</p>
                    </div>
                    <div className="rounded-lg bg-teal-900/20 border border-teal-500/20 p-3 space-y-1">
                      <span className="text-[10px] text-teal-400 uppercase tracking-wider font-bold">Recommended Change</span>
                      <p className="text-slate-300">{i.recommendedChange}</p>
                    </div>
                  </div>

                  {confidenceBar(i.confidence)}
                  <div className="text-[11px] text-emerald-300 font-semibold">📈 {i.estimatedImpact}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Efficiency Opportunities ──────────────────────────────────────── */}
      {activeTab === 'efficiency' && (
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-3 border-violet-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Identify Efficiency Opportunity</h3>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder='Process area e.g. "Contract review"'
                value={oppArea}
                onChange={(e) => setOppArea(e.target.value)}
                className="flex-1 min-w-[220px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <select
                value={oppType}
                onChange={(e) => setOppType(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {['Time Reduction', 'Cost Savings', 'Error Elimination', 'Automation', 'Headcount Optimization'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={() => { onIdentifyOpportunity?.(oppArea, oppType); setOppArea(''); }}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Identify →
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(efficiencyOpportunities ?? []).map((o) => (
              <div key={o.id} className="glass-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{o.opportunityType} — {o.processArea}</h4>
                    <span className={`text-[10px] font-bold rounded border px-2 py-0.5 mt-1 inline-block ${priorityBadge(o.priority)}`}>
                      {o.priority}
                    </span>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className="text-emerald-400 font-bold">⏱ {o.timesSavingEstimate}</div>
                    <div className="text-cyan-400 font-bold">💰 {o.costSavingEstimate}</div>
                  </div>
                </div>
                {confidenceBar(o.confidence)}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Required Actions</span>
                  <ul className="space-y-1">
                    {o.requiredActions.map((a, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400">
                        <span className="text-teal-400 mr-1">{idx + 1}.</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {(efficiencyOpportunities ?? []).length === 0 && (
              <p className="text-center py-8 text-slate-500 text-xs">No efficiency opportunities identified yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Process Plans ─────────────────────────────────────────────────── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={recType}
              onChange={(e) => setRecType(e.target.value)}
              className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {recTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button
              onClick={() => onGenerateRecommendation?.(recType)}
              className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ↻ Generate Plan
            </button>
          </div>

          {(recommendations ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No process plans yet. Generate one above.</p>
          ) : (
            <div className="space-y-4">
              {(recommendations ?? []).map((r) => (
                <div key={r.id} className="glass-card p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{r.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{r.timeline}</span>
                  </div>
                  <p className="text-xs text-slate-400">{r.rationale}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] text-teal-400 uppercase tracking-wider font-bold">Implementation Steps</span>
                      <ol className="space-y-1">
                        {r.steps.map((s, i) => (
                          <li key={i} className="text-[11px] text-slate-400">
                            <span className="text-teal-400 font-bold mr-1">{i + 1}.</span>{s}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Success Metrics</span>
                      <ul className="space-y-1">
                        {r.successMetrics.map((m, i) => (
                          <li key={i} className="text-[11px] text-slate-400">✓ {m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
