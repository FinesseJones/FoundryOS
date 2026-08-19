import React, { useState } from 'react';
import {
  MarketingStrategy,
  CampaignRecommendation,
  MarketingOpportunity,
} from '../../core/marketing/marketing-intelligence-service';
import { ContentPlanItem } from '../../core/marketing/content-planning-service';

import { ViewTab } from '../Navbar';
import { BusinessDNA } from '../../core/knowledge';

interface MarketingIntelligenceViewProps {
  dna?: BusinessDNA;
  setActiveTab?: (tab: ViewTab) => void;
  strategies?: MarketingStrategy[];
  recommendations?: CampaignRecommendation[];
  opportunities?: MarketingOpportunity[];
  contentPlan?: ContentPlanItem[];
  onCreateStrategy?: (goal: string) => void;
  onGenerateRecommendation?: (type: string) => void;
  onAnalyzeOpportunity?: (context: string) => void;
  onGenerateContentPlan?: () => void;
}

const priorityColor = (p: string) =>
  p === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

const urgencyColor = (u: string) =>
  u === 'IMMEDIATE' ? 'text-rose-400' : u === 'SHORT_TERM' ? 'text-amber-400' : 'text-sky-400';

export const MarketingIntelligenceView: React.FC<MarketingIntelligenceViewProps> = ({
  dna,
  setActiveTab,
  strategies = [],
  recommendations = [],
  opportunities = [],
  contentPlan = [],
  onCreateStrategy,
  onGenerateRecommendation,
  onAnalyzeOpportunity,
  onGenerateContentPlan,
}) => {
  const [subTab, setSubTab] = useState<'strategy' | 'recommendations' | 'opportunities' | 'content'>('strategy');
  const [strategyGoal, setStrategyGoal] = useState('');
  const [recType, setRecType] = useState('Awareness');
  const [oppContext, setOppContext] = useState('');

  const tabs = [
    { key: 'strategy', label: 'Campaign Strategy' },
    { key: 'recommendations', label: 'Recommendations' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'content', label: 'Content Plan' },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3.5 py-1 border border-violet-500/30 text-xs font-semibold text-violet-400">
          <span>AI-Powered Marketing Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Marketing <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="text-xs text-slate-400">
          Transform your Business DNA into actionable campaigns, content plans, and growth strategies.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Strategies', value: strategies.length, color: 'text-violet-400' },
          { label: 'Recommendations', value: recommendations.length, color: 'text-indigo-400' },
          { label: 'Opportunities', value: opportunities.length, color: 'text-amber-400' },
          { label: 'Content Items', value: contentPlan.length, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-t transition-colors ${
              subTab === t.key
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}

      {/* ─── Campaign Strategy ───────────────────────────────────────────── */}
      {subTab === 'strategy' && (
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-3 border-violet-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Create Marketing Strategy</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder='e.g. "Increase local awareness by 40% in Q3"'
                value={strategyGoal}
                onChange={(e) => setStrategyGoal(e.target.value)}
                className="flex-1 min-w-[280px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={() => { onCreateStrategy?.(strategyGoal); setStrategyGoal(''); }}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Generate Strategy →
              </button>
            </div>
          </div>

          {strategies.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No strategies generated yet.</p>
          ) : (
            <div className="space-y-4">
              {strategies.map((s) => (
                <div key={s.id} className="glass-card p-5 space-y-3 border-violet-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{s.goal}</h4>
                      <span className={`text-[10px] font-bold rounded px-2 py-0.5 mt-1 inline-block ${
                        s.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-900/30' : 'text-amber-400 bg-amber-900/30'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{s.campaignTimeline}</span>
                  </div>
                  <p className="text-xs text-slate-300">{s.messagingDirection}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Channels</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.recommendedChannels.map((c) => (
                          <span key={c} className="rounded bg-indigo-900/40 border border-indigo-500/20 px-2 py-0.5 text-indigo-300 text-[10px]">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Metrics</span>
                      <ul className="mt-1 space-y-0.5">
                        {s.successMetrics.slice(0, 2).map((m) => (
                          <li key={m} className="text-[10px] text-slate-400">✓ {m}</li>
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

      {/* ─── Campaign Recommendations ────────────────────────────────────── */}
      {subTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-3 border-indigo-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Generate Campaign Recommendation</h3>
            <div className="flex gap-3 flex-wrap">
              <select
                value={recType}
                onChange={(e) => setRecType(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {['Awareness', 'Lead Generation', 'Retention', 'Product Launch', 'Community Building'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={() => onGenerateRecommendation?.(recType)}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Generate →
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.map((r) => (
              <div key={r.id} className="glass-card p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-100 text-sm">{r.headline}</h4>
                  <span className={`text-[10px] font-bold rounded border px-2 py-0.5 flex-shrink-0 ${priorityColor(r.priority)}`}>
                    {r.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{r.description}</p>
                <div className="text-[11px] text-emerald-400 font-semibold">📈 {r.estimatedImpact}</div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="text-center py-8 text-slate-500 text-xs">No recommendations yet. Generate one above.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Opportunities ───────────────────────────────────────────────── */}
      {subTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-3 border-amber-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Analyze Marketing Opportunity</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder='e.g. "Educational content engagement is rising"'
                value={oppContext}
                onChange={(e) => setOppContext(e.target.value)}
                className="flex-1 min-w-[280px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => { onAnalyzeOpportunity?.(oppContext); setOppContext(''); }}
                className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Analyze →
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {opportunities.map((o) => (
              <div key={o.id} className="glass-card p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-100 text-sm">{o.title}</h4>
                  <span className={`text-[10px] font-bold flex-shrink-0 ${urgencyColor(o.urgency)}`}>
                    ● {o.urgency.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{o.rationale}</p>
                <div className="text-[11px] text-indigo-300">→ {o.recommendedAction}</div>
              </div>
            ))}
            {opportunities.length === 0 && (
              <p className="text-center py-8 text-slate-500 text-xs">No opportunities analyzed yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Content Plan ────────────────────────────────────────────────── */}
      {subTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Brand-Aligned Content Calendar</h3>
            <button
              onClick={onGenerateContentPlan}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ↺ Generate Calendar
            </button>
          </div>

          {contentPlan.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No content planned yet. Generate a calendar above.</p>
          ) : (
            <div className="glass-card divide-y divide-white/10">
              {contentPlan.map((item) => (
                <div key={item.id} className="px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-xs">{item.title}</span>
                      <span className="rounded bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 font-bold">
                        {item.channel.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{item.contentTheme}</div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="text-slate-300 font-mono">{item.recommendedPostDate}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${
                      item.status === 'APPROVED' ? 'text-emerald-400' : item.status === 'IN_REVIEW' ? 'text-amber-400' : 'text-slate-400'
                    }`}>{item.status}</div>
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
