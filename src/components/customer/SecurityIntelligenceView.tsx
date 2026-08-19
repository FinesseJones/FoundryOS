import React, { useState } from 'react';
import {
  SecurityPostureReport,
  DetectedSecurityRisk,
  SecurityRecommendation,
} from '../../core/security/security-intelligence-service';

interface SecurityIntelligenceViewProps {
  postureReport?: SecurityPostureReport;
  detectedRisks: DetectedSecurityRisk[];
  recommendations: SecurityRecommendation[];
  onAnalyzePosture?: () => void;
  onDetectRisks?: () => void;
  onGenerateRecommendation?: () => void;
}

const severityBadge = (s: string) => {
  const map: Record<string, string> = {
    CRITICAL: 'text-rose-300 bg-rose-900/40 border-rose-500/30',
    HIGH: 'text-orange-300 bg-orange-900/40 border-orange-500/30',
    MEDIUM: 'text-amber-300 bg-amber-900/40 border-amber-500/30',
    LOW: 'text-emerald-300 bg-emerald-900/40 border-emerald-500/30',
  };
  return map[s] ?? 'text-slate-400 bg-slate-800/40 border-white/10';
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

export const SecurityIntelligenceView: React.FC<SecurityIntelligenceViewProps> = ({
  postureReport,
  detectedRisks,
  recommendations,
  onAnalyzePosture,
  onDetectRisks,
  onGenerateRecommendation,
}) => {
  const [activeTab, setActiveTab] = useState<'posture' | 'risks' | 'recommendations'>('posture');

  const tabs = [
    { key: 'posture', label: 'Security Posture' },
    { key: 'risks', label: `Risk Detection (${detectedRisks.length})` },
    { key: 'recommendations', label: `Recommendations (${recommendations.length})` },
  ] as const;

  const criticalRisks = detectedRisks.filter((r) => r.severity === 'CRITICAL').length;
  const highRisks = detectedRisks.filter((r) => r.severity === 'HIGH').length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3.5 py-1 border border-rose-500/30 text-xs font-semibold text-rose-400">
          <span>AI-Powered Security Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Security & Risk <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="text-xs text-slate-400">
          Continuous security monitoring, risk detection, agent behavior auditing, and automated posture analysis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Security Score',
            value: postureReport ? `${postureReport.securityScore}/100` : '—',
            color: postureReport && postureReport.securityScore >= 80 ? 'text-emerald-400' : 'text-amber-400',
          },
          {
            label: 'Risk Level',
            value: postureReport ? postureReport.riskLevel : '—',
            color: postureReport && postureReport.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-rose-400',
          },
          { label: 'Critical Risks', value: criticalRisks, color: 'text-rose-400' },
          { label: 'High Risks', value: highRisks, color: 'text-orange-400' },
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
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Security Posture ────────────────────────────────────────── */}
      {activeTab === 'posture' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Security Posture Report</h3>
            <button
              onClick={onAnalyzePosture}
              className="rounded-lg bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              🛡 Run Security Review
            </button>
          </div>

          {!postureReport ? (
            <p className="text-center py-8 text-slate-500 text-xs">Run a security review to analyze your posture.</p>
          ) : (
            <div className="space-y-4">
              <div className="glass-card p-6 space-y-4 border-rose-500/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold">Security Posture Index</span>
                    <div className="text-4xl font-extrabold text-slate-100">
                      {postureReport.securityScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold rounded border px-3 py-1 ${severityBadge(postureReport.riskLevel)}`}>
                    {postureReport.riskLevel} RISK LEVEL
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Strengths */}
                  <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-4 space-y-2">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Security Strengths</h4>
                    <ul className="space-y-1.5">
                      {postureReport.strengths.map((s, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="rounded-lg bg-amber-950/20 border border-amber-500/20 p-4 space-y-2">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Identified Weaknesses</h4>
                    <ul className="space-y-1.5">
                      {postureReport.weaknesses.map((w, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">⚠️</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Improvements */}
                  <div className="rounded-lg bg-rose-950/20 border border-rose-500/20 p-4 space-y-2">
                    <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider">Recommended Improvements</h4>
                    <ul className="space-y-1.5">
                      {postureReport.recommendedActions.map((a, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">→</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Risk Detection ─────────────────────────────────────────── */}
      {activeTab === 'risks' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Active Risk Detection</h3>
            <button
              onClick={onDetectRisks}
              className="rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ⚡ Scan for Risks
            </button>
          </div>

          {detectedRisks.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No active security risks detected.</p>
          ) : (
            <div className="space-y-3">
              {[...detectedRisks]
                .sort((a, b) =>
                  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(a.severity) -
                  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(b.severity)
                )
                .map((r) => (
                  <div key={r.id} className="glass-card p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-100 text-sm">
                        {r.riskType.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold rounded border px-2.5 py-0.5 ${severityBadge(r.severity)}`}>
                        {r.severity}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Evidence: </span>
                      {r.evidence}
                    </div>

                    {confidenceBar(r.confidence)}

                    <div className="text-[11px] text-rose-300 font-semibold">
                      → Action Required: {r.recommendedAction}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Security Recommendations ───────────────────────────────── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Security Recommendations & Action Plans</h3>
            <button
              onClick={onGenerateRecommendation}
              className="rounded-lg bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
            >
              ↻ Generate Action Plan
            </button>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No recommendations generated yet.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map((r) => (
                <div key={r.id} className="glass-card p-6 space-y-4 border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{r.recommendation}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Area: {r.affectedArea}</span>
                    </div>
                    <span className={`text-[10px] font-bold rounded border px-2.5 py-0.5 ${severityBadge(r.priority)}`}>
                      {r.priority} PRIORITY
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider font-bold">Remediation Plan</span>
                    <ol className="space-y-1.5">
                      {r.actionPlan.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-rose-400 font-bold">{idx + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Expected Improvement</span>
                      <p className="text-slate-300 mt-1">{r.expectedImprovement}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timeline</span>
                      <p className="text-slate-300 mt-1">{r.timeline}</p>
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
