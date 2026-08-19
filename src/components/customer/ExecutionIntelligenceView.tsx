import React, { useState } from 'react';
import {
  ExecutionPlan,
  ExecutionApprovalRequest,
  ExecutionLearningRecord,
} from '../../core/execution/autonomous-execution-service';

interface ExecutionIntelligenceViewProps {
  plans: ExecutionPlan[];
  approvals: ExecutionApprovalRequest[];
  learnings: ExecutionLearningRecord[];
  onCreatePlan?: (objective: string, domain: string) => void;
  onApproveExecution?: (approvalId: string) => void;
  onRejectExecution?: (approvalId: string) => void;
  onExecutePlan?: (executionId: string) => void;
}

const riskBadge = (r: string) => {
  const map: Record<string, string> = {
    CRITICAL: 'text-rose-300 bg-rose-900/40 border-rose-500/30',
    HIGH: 'text-orange-300 bg-orange-900/40 border-orange-500/30',
    MEDIUM: 'text-amber-300 bg-amber-900/40 border-amber-500/30',
    LOW: 'text-emerald-300 bg-emerald-900/40 border-emerald-500/30',
  };
  return map[r] ?? 'text-slate-400 bg-slate-800/40 border-white/10';
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    PLANNED: 'text-slate-300 bg-slate-800/50',
    AWAITING_APPROVAL: 'text-amber-300 bg-amber-900/40 border border-amber-500/30',
    EXECUTING: 'text-cyan-300 bg-cyan-900/40 border border-cyan-500/30',
    COMPLETED: 'text-emerald-300 bg-emerald-900/40 border border-emerald-500/30',
    FAILED: 'text-rose-300 bg-rose-900/40 border border-rose-500/30',
    CANCELED: 'text-slate-400 bg-slate-800/30',
  };
  return map[s] ?? 'text-slate-400';
};

export const ExecutionIntelligenceView: React.FC<ExecutionIntelligenceViewProps> = ({
  plans,
  approvals,
  learnings,
  onCreatePlan,
  onApproveExecution,
  onRejectExecution,
  onExecutePlan,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'approvals' | 'active' | 'learning'>('plans');
  const [objective, setObjective] = useState('');
  const [domain, setDomain] = useState('marketing');

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const activeWorkflows = plans.filter((p) => p.status === 'EXECUTING' || p.status === 'COMPLETED');

  const tabs = [
    { key: 'plans', label: 'Execution Plans' },
    { key: 'approvals', label: `Approval Center (${pendingApprovals.length})` },
    { key: 'active', label: `Active Workflows (${activeWorkflows.length})` },
    { key: 'learning', label: `Execution Learning (${learnings.length})` },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <span>Autonomous Business Execution Workflows</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Autonomous Business <span className="text-gradient">Execution</span>
        </h1>
        <p className="text-xs text-slate-400">
          Transform AI intelligence recommendations into controlled, risk-evaluated, agent-orchestrated business execution.
        </p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: plans.length, color: 'text-cyan-400' },
          { label: 'Pending Approvals', value: pendingApprovals.length, color: 'text-amber-400' },
          { label: 'Active / Completed', value: activeWorkflows.length, color: 'text-emerald-400' },
          { label: 'Learnings Recorded', value: learnings.length, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-t transition-colors ${
              activeTab === t.key
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Execution Plans ────────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-3 border-emerald-500/20">
            <h3 className="font-bold text-slate-100 text-sm">Create Execution Plan</h3>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder='Objective e.g. "Launch Q3 Re-engagement Campaign"'
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="flex-1 min-w-[280px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="security">Security</option>
              </select>
              <button
                onClick={() => { onCreatePlan?.(objective, domain); setObjective(''); }}
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow"
              >
                Create Plan →
              </button>
            </div>
          </div>

          {plans.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No execution plans created yet.</p>
          ) : (
            <div className="space-y-4">
              {plans.map((p) => (
                <div key={p.executionId} className="glass-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-100 text-sm">{p.objective}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold rounded border px-2 py-0.5 ${riskBadge(p.riskLevel)}`}>
                          {p.riskLevel} RISK
                        </span>
                        <span className={`text-[10px] font-bold rounded px-2 py-0.5 ${statusBadge(p.status)}`}>
                          {p.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono capitalize">
                          Domain: {p.domain}
                        </span>
                      </div>
                    </div>

                    {p.status === 'PLANNED' && !p.approvalRequired && (
                      <button
                        onClick={() => onExecutePlan?.(p.executionId)}
                        className="rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 shadow"
                      >
                        Execute Now →
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Estimated Impact: </span>
                    {p.estimatedImpact}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Required Agents</span>
                    <div className="flex gap-2">
                      {p.requiredAgents.map((ag) => (
                        <span key={ag} className="text-[10px] font-mono bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-white/5">
                          @{ag}Agent
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Approval Center ────────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div className="space-y-5">
          <h3 className="font-bold text-slate-100 text-sm">Human Approval Gate Center</h3>

          {pendingApprovals.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No pending execution approvals.</p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((req) => {
                const plan = plans.find((p) => p.executionId === req.executionId);
                return (
                  <div key={req.approvalId} className="glass-card p-5 space-y-4 border-amber-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{plan?.objective ?? req.executionId}</h4>
                        <p className="text-xs text-amber-300 mt-1">{req.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold rounded border px-2 py-0.5 text-amber-300 bg-amber-900/40 border-amber-500/30">
                        APPROVAL REQUIRED
                      </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => onApproveExecution?.(req.approvalId)}
                        className="rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 shadow"
                      >
                        ✓ Approve Execution
                      </button>
                      <button
                        onClick={() => onRejectExecution?.(req.approvalId)}
                        className="rounded bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-500/30 text-xs font-bold px-4 py-2"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Active Workflows ───────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-5">
          <h3 className="font-bold text-slate-100 text-sm">Active & Completed Workflows</h3>

          {activeWorkflows.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No active or completed executions yet.</p>
          ) : (
            <div className="space-y-4">
              {activeWorkflows.map((p) => (
                <div key={p.executionId} className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100 text-sm">{p.objective}</h4>
                    <span className={`text-[10px] font-bold rounded px-2.5 py-0.5 ${statusBadge(p.status)}`}>
                      {p.status} ({p.completionPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${p.completionPercent}%` }}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Execution Log Results</span>
                    <ul className="space-y-1">
                      {p.results.map((res, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span> {res}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Execution Learning ─────────────────────────────────────── */}
      {activeTab === 'learning' && (
        <div className="space-y-5">
          <h3 className="font-bold text-slate-100 text-sm">Execution Outcome Learnings</h3>

          {learnings.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No execution learnings recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {learnings.map((l, idx) => (
                <div key={idx} className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">Execution: {l.executionId}</span>
                    <span className={`text-[10px] font-bold rounded px-2.5 py-0.5 ${
                      l.outcome === 'SUCCESS' ? 'text-emerald-300 bg-emerald-900/40' : 'text-amber-300 bg-amber-900/40'
                    }`}>
                      {l.outcome}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Persisted Execution Directives</span>
                    <ul className="space-y-1">
                      {l.learnings.map((lr, i) => (
                        <li key={i} className="text-xs text-slate-300">• {lr}</li>
                      ))}
                    </ul>
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
