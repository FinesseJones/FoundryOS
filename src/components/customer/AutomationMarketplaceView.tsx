import React, { useState } from 'react';
import {
  AutomationTemplate,
  AutomationRecord,
  PREBUILT_AUTOMATION_TEMPLATES,
  CustomerAutomationService,
} from '../../core/automation/customer-automation-service';
import { ExecutionPlan, ExecutionApprovalRequest, ExecutionLearningRecord } from '../../core/execution/autonomous-execution-service';

interface IntelligenceMetrics {
  successRate: number; // e.g. 0.96
  timeSavedHours: number; // e.g. 42
  improvementRecommendations: string[];
  optimizationSuggestions: string[];
}

interface AutomationMarketplaceViewProps {
  autoService?: CustomerAutomationService;
  organizationId?: string;
  businessId?: string;
  templates?: AutomationTemplate[];
  automations?: AutomationRecord[];
  executions?: ExecutionPlan[];
  approvals?: ExecutionApprovalRequest[];
  learnings?: ExecutionLearningRecord[];
  intelligenceMetrics?: IntelligenceMetrics;
  onCreateAutomation?: (templateId: string) => void;
  onActivateAutomation?: (automationId: string) => void;
  onPauseAutomation?: (automationId: string) => void;
  onExecuteAutomation?: (automationId: string) => void;
  onResolveApproval?: (requestId: string, approved: boolean, notes?: string) => void;
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
    ACTIVE: 'text-emerald-300 bg-emerald-900/40 border border-emerald-500/30',
    DRAFT: 'text-slate-300 bg-slate-800/50',
    PAUSED: 'text-amber-300 bg-amber-900/40 border border-amber-500/30',
    FAILED: 'text-rose-300 bg-rose-900/40 border border-rose-500/30',
    COMPLETED: 'text-cyan-300 bg-cyan-900/40 border border-cyan-500/30',
  };
  return map[s] ?? 'text-slate-400';
};

export const AutomationMarketplaceView: React.FC<AutomationMarketplaceViewProps> = ({
  templates = PREBUILT_AUTOMATION_TEMPLATES,
  automations,
  executions,
  approvals = [],
  learnings = [],
  intelligenceMetrics = {
    successRate: 0.96,
    timeSavedHours: 42.5,
    improvementRecommendations: [
      'Enable parallel approval lanes for sales follow-up sequences',
      'Refine trigger schedules to run content creation pipelines during off-peak hours',
      'Automate monthly executive intelligence report dispatching',
    ],
    optimizationSuggestions: [
      'Increase token budget ceiling for complex multi-agent marketing strategies',
      'Connect security monitoring check alerts to instant webhook notifications',
    ],
  },
  onCreateAutomation,
  onActivateAutomation,
  onPauseAutomation,
  onExecuteAutomation,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'my_automations' | 'history' | 'intelligence'>('templates');
  const [domainFilter, setDomainFilter] = useState('ALL');

  const filteredTemplates = domainFilter === 'ALL'
    ? (templates ?? [])
    : (templates ?? []).filter((t) => t.domain === domainFilter);

  const activeCount = (automations ?? []).filter((a) => a.status === 'ACTIVE').length;

  const tabs = [
    { key: 'templates', label: `Automation Templates (${(templates ?? []).length})` },
    { key: 'my_automations', label: `My Automations (${(automations ?? []).length})` },
    { key: 'history', label: `Execution History (${(executions ?? []).length})` },
    { key: 'intelligence', label: 'Automation Intelligence' },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <span>Customer Automation & Workflow Marketplace</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Workflow <span className="text-gradient">Marketplace</span>
        </h1>
        <p className="text-xs text-slate-400">
          Discover, configure, schedule, activate, and monitor reusable AI business workflows powered by your Business DNA.
        </p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Marketplace Templates', value: (templates ?? []).length, color: 'text-blue-400' },
          { label: 'Active Automations', value: activeCount, color: 'text-emerald-400' },
          { label: 'Configured Total', value: (automations ?? []).length, color: 'text-cyan-400' },
          { label: 'Executions Run', value: (executions ?? []).length, color: 'text-purple-400' },
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
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 border-b-transparent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Automation Templates ───────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm">Reusable Workflow Template Library</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Domain Filter:</span>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Domains</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="security">Security</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div key={tmpl.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{tmpl.name}</h4>
                    <span className={`text-[10px] font-bold rounded border px-2 py-0.5 flex-shrink-0 ${riskBadge(tmpl.riskLevel)}`}>
                      {tmpl.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{tmpl.description}</p>

                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded capitalize">
                      Domain: {tmpl.domain}
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      ⏱ {tmpl.estimatedExecutionTime}
                    </span>
                    {tmpl.approvalRequired && (
                      <span className="bg-amber-950/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        Requires Approval
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Required Agents</span>
                    <div className="flex gap-1.5">
                      {tmpl.requiredAgents.map((ag) => (
                        <span key={ag} className="text-[10px] font-mono bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-white/5">
                          @{ag}Agent
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onCreateAutomation?.(tmpl.id)}
                    className="w-full rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white font-bold text-xs py-2 shadow transition-opacity"
                  >
                    + Create Automation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 2: My Automations ───────────────────────────────────────── */}
      {activeTab === 'my_automations' && (
        <div className="space-y-5">
          <h3 className="font-bold text-slate-100 text-sm">Configured Customer Automations</h3>

          {(automations ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No automations configured. Select a template from the library.</p>
          ) : (
            <div className="space-y-4">
              {(automations ?? []).map((aut) => (
                <div key={aut.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{aut.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold rounded px-2 py-0.5 ${statusBadge(aut.status)}`}>
                          {aut.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Schedule: {aut.schedule} (Trigger: {aut.triggerType})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {aut.status === 'DRAFT' || aut.status === 'PAUSED' ? (
                        <button
                          onClick={() => onActivateAutomation?.(aut.id)}
                          className="rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 shadow"
                        >
                          Activate ▶
                        </button>
                      ) : aut.status === 'ACTIVE' ? (
                        <button
                          onClick={() => onPauseAutomation?.(aut.id)}
                          className="rounded bg-amber-900/50 hover:bg-amber-900 text-amber-200 border border-amber-500/30 text-xs font-bold px-3 py-1.5"
                        >
                          Pause ⏸
                        </button>
                      ) : null}

                      <button
                        onClick={() => onExecuteAutomation?.(aut.id)}
                        className="rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 shadow"
                      >
                        ⚡ Run Now
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Execution Frequency: <strong className="text-slate-200 font-mono">{aut.schedule}</strong></span>
                    <span>Last Execution: <strong className="text-slate-200 font-mono">{aut.lastExecutedAt ? new Date(aut.lastExecutedAt).toLocaleTimeString() : 'Never'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Execution History ────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <h3 className="font-bold text-slate-100 text-sm">Workflow Runs & Execution History</h3>

          {(executions ?? []).length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No execution history recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {(executions ?? []).map((ex) => {
                const approval = approvals.find((a) => a.executionId === ex.executionId);
                const learning = learnings.find((l) => l.executionId === ex.executionId);

                return (
                  <div key={ex.executionId} className="glass-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{ex.objective}</h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {ex.executionId} • Domain: {ex.domain}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold rounded px-2.5 py-0.5 ${statusBadge(ex.status)}`}>
                        {ex.status} ({ex.completionPercent}%)
                      </span>
                    </div>

                    {/* Execution Results */}
                    {ex.results && ex.results.length > 0 && (
                      <div className="space-y-1 rounded bg-slate-900/60 p-3">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Execution Results</span>
                        <ul className="space-y-1">
                          {ex.results.map((res: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">✓</span> {res}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Approval History */}
                    {approval && (
                      <div className="rounded bg-amber-950/20 border border-amber-500/20 p-3 text-xs space-y-1">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Approval History</span>
                        <div className="text-slate-300">
                          Status: <strong className="text-amber-300 capitalize">{approval.status}</strong> by {approval.requiredApprover}
                        </div>
                        <p className="text-[11px] text-slate-400">{approval.reason}</p>
                      </div>
                    )}

                    {/* AI Learning Updates */}
                    {learning && (
                      <div className="rounded bg-purple-950/20 border border-purple-500/20 p-3 text-xs space-y-1">
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">AI Learning Updates</span>
                        <div className="text-slate-300">
                          Outcome: <strong className="text-purple-300 font-bold">{learning.outcome}</strong>
                        </div>
                        <ul className="space-y-1">
                          {learning.learnings.map((lr: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-400">• {lr}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Automation Intelligence ─────────────────────────────── */}
      {activeTab === 'intelligence' && (
        <div className="space-y-5">
          <h3 className="font-bold text-slate-100 text-sm">Automation Intelligence & Optimization</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Success Rate */}
            <div className="glass-card p-5 space-y-2 border-emerald-500/20">
              <span className="text-xs text-slate-400 font-semibold">Automation Success Rate</span>
              <div className="text-4xl font-extrabold text-emerald-400">
                {Math.round(intelligenceMetrics.successRate * 100)}%
              </div>
              <p className="text-[11px] text-slate-400">Measured across all active AI business workflow executions.</p>
            </div>

            {/* Time Saved Estimates */}
            <div className="glass-card p-5 space-y-2 border-cyan-500/20">
              <span className="text-xs text-slate-400 font-semibold">Estimated Time Saved</span>
              <div className="text-4xl font-extrabold text-cyan-400">
                {intelligenceMetrics.timeSavedHours} <span className="text-sm font-normal text-slate-400">hours / month</span>
              </div>
              <p className="text-[11px] text-slate-400">Estimated manual operational effort eliminated by automated agent execution.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Improvement Recommendations */}
            <div className="rounded-lg bg-purple-950/20 border border-purple-500/20 p-5 space-y-3">
              <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider">Improvement Recommendations</h4>
              <ul className="space-y-2">
                {intelligenceMetrics.improvementRecommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-purple-400 font-bold">→</span> {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Optimization Suggestions */}
            <div className="rounded-lg bg-blue-950/20 border border-blue-500/20 p-5 space-y-3">
              <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider">Optimization Suggestions</h4>
              <ul className="space-y-2">
                {intelligenceMetrics.optimizationSuggestions.map((sug: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400 font-bold">⚡</span> {sug}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
