import React, { useState } from 'react';
import {
  IntelligenceScoreReport,
  PerformanceReport,
  WinningPattern,
  IntelligenceRecommendation,
  LearningOutcomeRecord,
} from '../../core/intelligence/intelligence-analytics-service';

interface IntelligenceAnalyticsViewProps {
  scoreReport?: IntelligenceScoreReport;
  performanceReports: PerformanceReport[];
  winningPatterns: WinningPattern[];
  recommendations: IntelligenceRecommendation[];
  learningHistory: LearningOutcomeRecord[];
  onCalculateScore?: () => void;
  onAnalyzePerformance?: () => void;
  onIdentifyPatterns?: () => void;
  onGenerateRecommendations?: () => void;
}

const maturityBadge = (m: string) => {
  const map: Record<string, string> = {
    AUTONOMOUS: 'text-purple-300 bg-purple-900/40 border-purple-500/30',
    ADVANCED: 'text-emerald-300 bg-emerald-900/40 border-emerald-500/30',
    OPTIMIZED: 'text-cyan-300 bg-cyan-900/40 border-cyan-500/30',
    DEVELOPING: 'text-amber-300 bg-amber-900/40 border-amber-500/30',
    FOUNDATION: 'text-slate-300 bg-slate-800/40 border-white/10',
  };
  return map[m] ?? 'text-slate-400 bg-slate-800/40 border-white/10';
};

const confidenceBar = (score: number) => {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-cyan-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 font-mono w-8">{pct}%</span>
    </div>
  );
};

export const IntelligenceAnalyticsView: React.FC<IntelligenceAnalyticsViewProps> = ({
  scoreReport,
  performanceReports,
  winningPatterns,
  recommendations,
  learningHistory,
  onCalculateScore,
  onAnalyzePerformance,
  onIdentifyPatterns,
  onGenerateRecommendations,
}) => {
  const [activeTab, setActiveTab] = useState<'score' | 'performance' | 'learning' | 'roadmap'>('score');

  const tabs = [
    { key: 'score', label: 'Intelligence Score' },
    { key: 'performance', label: `Performance (${performanceReports.length})` },
    { key: 'learning', label: `AI Learning Center (${winningPatterns.length})` },
    { key: 'roadmap', label: `Roadmap (${recommendations.length})` },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 border border-purple-500/30 text-xs font-semibold text-purple-400">
          <span>Autonomous Performance & Learning Layer</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Intelligence Analytics & <span className="text-gradient">Performance Learning</span>
        </h1>
        <p className="text-xs text-slate-400">
          Measure AI decision impact, extract winning business patterns, and accelerate autonomous improvement loops.
        </p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Intelligence Score',
            value: scoreReport ? `${scoreReport.intelligenceScore}/100` : '—',
            color: 'text-purple-400',
          },
          {
            label: 'Maturity Level',
            value: scoreReport ? scoreReport.maturityLevel : '—',
            color: 'text-emerald-400',
          },
          { label: 'Winning Patterns', value: winningPatterns.length, color: 'text-cyan-400' },
          { label: 'Learnings Stored', value: learningHistory.length, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-t transition-colors ${
              activeTab === t.key
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Intelligence Score ──────────────────────────────────────── */}
      {activeTab === 'score' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Business Intelligence Scorecard</h3>
            <button
              onClick={onCalculateScore}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              🧠 Calculate Score
            </button>
          </div>

          {!scoreReport ? (
            <p className="text-center py-8 text-slate-500 text-xs">Calculate your score to see maturity and breakdown.</p>
          ) : (
            <div className="glass-card p-6 space-y-6 border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Unified Business Intelligence Score</span>
                  <div className="text-5xl font-extrabold text-slate-100">
                    {scoreReport.intelligenceScore} <span className="text-sm text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold rounded border px-3.5 py-1.5 ${maturityBadge(scoreReport.maturityLevel)}`}>
                  {scoreReport.maturityLevel} MATURITY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-4 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">System Strengths</h4>
                  <ul className="space-y-1.5">
                    {scoreReport.strengths.map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-purple-950/20 border border-purple-500/20 p-4 space-y-2">
                  <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">Improvement Areas</h4>
                  <ul className="space-y-1.5">
                    {scoreReport.improvementAreas.map((a, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-purple-400 font-bold">→</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Performance Analytics ─────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Cross-Domain Performance Analytics</h3>
            <button
              onClick={onAnalyzePerformance}
              className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              📊 Analyze Performance
            </button>
          </div>

          {performanceReports.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">Run performance analysis to view domain metrics.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceReports.map((p) => (
                <div key={p.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm capitalize">{p.area} Intelligence</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {Math.round(p.successRate * 100)}% Success Rate
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Impact Score</span>
                      <span className="font-mono">{p.impactScore} / 1.0</span>
                    </div>
                    {confidenceBar(p.impactScore)}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Lessons Learned</span>
                    <ul className="space-y-1">
                      {p.lessonsLearned.map((l, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300">• {l}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] text-cyan-300 font-semibold">
                    → Adjustment: {p.recommendedAdjustment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: AI Learning Center ─────────────────────────────────────── */}
      {activeTab === 'learning' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Winning Patterns & Memory Growth</h3>
            <button
              onClick={onIdentifyPatterns}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ⚡ Extract Patterns
            </button>
          </div>

          {winningPatterns.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No winning patterns identified yet.</p>
          ) : (
            <div className="space-y-4">
              {winningPatterns.map((wp) => (
                <div key={wp.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100 text-sm">{wp.pattern}</h4>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {Math.round(wp.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Empirical Evidence: </span>
                    {wp.evidence}
                  </p>

                  <div className="text-[11px] text-emerald-300 font-semibold">
                    → Future AI Directive: {wp.futureRecommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Improvement Roadmap ───────────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Autonomous Improvement Roadmap</h3>
            <button
              onClick={onGenerateRecommendations}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ↻ Generate Roadmap
            </button>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No roadmap recommendations generated yet.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map((r) => (
                <div key={r.id} className="glass-card p-6 space-y-4 border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100 text-sm">{r.recommendation}</h4>
                    <span className="text-[10px] font-bold rounded border px-2.5 py-0.5 text-purple-300 bg-purple-900/40 border-purple-500/30">
                      {r.priority} PRIORITY
                    </span>
                  </div>

                  <div className="text-xs text-emerald-400 font-semibold">
                    📈 Projected Impact: {r.expectedImpact}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Action Plan</span>
                    <ol className="space-y-1.5">
                      {r.implementationSteps.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-purple-400 font-bold">{idx + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Timeline: <span className="text-slate-200 font-mono">{r.timeline}</span>
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
