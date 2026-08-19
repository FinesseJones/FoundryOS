import React, { useState } from 'react';
import { SalesInsight, CustomerOpportunity } from '../../core/sales/sales-intelligence-service';
import { DetectedOpportunity } from '../../core/sales/opportunity-detection-service';

import { ViewTab } from '../Navbar';
import { BusinessDNA } from '../../core/knowledge';

interface SalesIntelligenceViewProps {
  dna?: BusinessDNA;
  setActiveTab?: (tab: ViewTab) => void;
  insights?: SalesInsight[];
  opportunities?: CustomerOpportunity[];
  detectedOpportunities?: DetectedOpportunity[];
  nextBestAction?: { action: string; rationale: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' };
  onCreateInsight?: (type: string, segment: string) => void;
  onDetectOpportunities?: () => void;
  onGenerateNextBestAction?: () => void;
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
  'CUSTOMER_SEGMENT', 'ENGAGEMENT_PATTERN', 'RETENTION_RISK',
  'UPSELL_OPPORTUNITY', 'REENGAGEMENT', 'PRODUCT_INTEREST',
];

export const SalesIntelligenceView: React.FC<SalesIntelligenceViewProps> = ({
  insights,
  opportunities,
  detectedOpportunities,
  nextBestAction,
  onCreateInsight,
  onDetectOpportunities,
  onGenerateNextBestAction,
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'opportunities' | 'detected' | 'nba'>('insights');
  const [insightType, setInsightType] = useState('CUSTOMER_SEGMENT');
  const [segment, setSegment] = useState('');

  const tabs = [
    { key: 'insights', label: 'Sales Insights' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'detected', label: 'Auto-Detected' },
    { key: 'nba', label: 'Next Best Action' },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
          <span>AI-Powered Sales Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Sales & Customer <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="text-xs text-slate-400">
          Turn your Business DNA into actionable customer insights, opportunity detection, and next best sales actions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sales Insights', value: (insights ?? []).length, color: 'text-cyan-400' },
          { label: 'Opportunities', value: (opportunities ?? []).length, color: 'text-violet-400' },
          { label: 'Auto-Detected', value: (detectedOpportunities ?? []).length, color: 'text-amber-400' },
          {
            label: 'Critical Signals',
            value: (detectedOpportunities ?? []).filter((o) => o.priority === 'CRITICAL').length,
            color: 'text-rose-400',
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
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Sales Insights ─────────────────────────────────────────────────── */}
      {activeTab === 'insights' && (
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-3 border-cyan-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Generate Sales Insight</h3>
            <div className="flex flex-wrap gap-3">
              <select
                value={insightType}
                onChange={(e) => setInsightType(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {insightTypes.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder='Customer segment e.g. "SMB repeat buyers"'
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="flex-1 min-w-[240px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => { onCreateInsight?.(insightType, segment); setSegment(''); }}
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Generate Insight →
              </button>
            </div>
          </div>

          {(insights ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No insights yet. Generate one above.</p>
          ) : (
            <div className="space-y-4">
              {(insights ?? []).map((i) => (
                <div key={i.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{i.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Segment: {i.customerSegment}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold rounded border px-2 py-0.5 flex-shrink-0 ${priorityBadge(i.priority)}`}>
                      {i.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{i.description}</p>
                  {confidenceBar(i.confidence)}
                  <div className="text-[11px] text-cyan-300">→ {i.recommendedAction}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Opportunities ─────────────────────────────────────────────────── */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          {(opportunities ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No opportunities analyzed yet.</p>
          ) : (
            (opportunities ?? []).map((o) => (
              <div key={o.id} className="glass-card p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-100 text-sm">{o.opportunityType}</span>
                  <span className={`text-[10px] font-bold rounded px-2 py-0.5 ${
                    o.status === 'OPEN' ? 'text-emerald-400 bg-emerald-900/30' : 'text-amber-400 bg-amber-900/30'
                  }`}>{o.status}</span>
                </div>
                <p className="text-xs text-slate-400">Segment: {o.customerSegment}</p>
                <p className="text-xs text-slate-400">{o.businessReason}</p>
                {confidenceBar(o.confidence)}
                <div className="text-[11px] text-emerald-300">📈 {o.estimatedValue}</div>
                <div className="text-[11px] text-violet-300">→ {o.nextBestAction}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Auto-Detected ─────────────────────────────────────────────────── */}
      {activeTab === 'detected' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Automatic Opportunity Detection</h3>
            <button
              onClick={onDetectOpportunities}
              className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ⚡ Scan Now
            </button>
          </div>

          {(detectedOpportunities ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">Run a scan to detect opportunities.</p>
          ) : (
            <div className="space-y-3">
              {[...(detectedOpportunities ?? [])]
                .sort((a, b) =>
                  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(a.priority) -
                  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(b.priority)
                )
                .map((o) => (
                  <div key={o.id} className="glass-card p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200 text-xs">
                        {o.opportunityType.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold rounded border px-2 py-0.5 ${priorityBadge(o.priority)}`}>
                        {o.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{o.businessReason}</p>
                    {confidenceBar(o.confidenceScore)}
                    <div className="text-[10px] text-cyan-300">→ {o.recommendedAction}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Next Best Action ──────────────────────────────────────────────── */}
      {activeTab === 'nba' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Next Best Sales Action</h3>
            <button
              onClick={onGenerateNextBestAction}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ↻ Generate
            </button>
          </div>

          {!nextBestAction ? (
            <p className="text-center py-8 text-slate-500 text-xs">Click Generate to synthesize your highest-value next action.</p>
          ) : (
            <div className="glass-card p-6 space-y-4 border-violet-500/20">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold rounded border px-2.5 py-1 ${priorityBadge(nextBestAction.priority)}`}>
                  {nextBestAction.priority} PRIORITY
                </span>
                <span className="text-[10px] text-slate-500">Synthesized from all intelligence signals</span>
              </div>
              <div className="rounded-lg bg-violet-900/20 border border-violet-500/20 p-4">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Recommended Action</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{nextBestAction.action}</p>
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">AI Rationale: </span>
                {nextBestAction.rationale}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
