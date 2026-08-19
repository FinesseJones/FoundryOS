import React, { useState, useMemo } from 'react';
import { ViewTab } from '../Navbar';
import { BusinessDNA } from '../../core/knowledge';
import { ContinuousLearningEngine, ExecutiveTask } from '../../core/learning/continuous-learning-engine';
import { LiveEventBus } from '../../core/events/live-event-bus';

interface TodayViewProps {
  dna?: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
  onApproveAction?: (actionId: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ dna, setActiveTab, onApproveAction }) => {
  const companyName = dna?.companyIdentity?.companyName?.value || 'ABC HVAC & Climate';

  const learningEngine = useMemo(() => new ContinuousLearningEngine(), []);
  const eventBus = useMemo(() => LiveEventBus.getInstance(), []);

  const [tasks, setTasks] = useState<ExecutiveTask[]>(() => learningEngine.getActiveTasks());
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>('MKT-2471');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [rejectedTaskIds, setRejectedTaskIds] = useState<string[]>([]);

  const handleAction = (taskId: string) => {
    learningEngine.approveTask(taskId);
    setCompletedTaskIds((prev) => [...prev, taskId]);
    onApproveAction?.(taskId);
  };

  const handleReject = (taskId: string) => {
    setRejectedTaskIds((prev) => [...prev, taskId]);
  };

  const recentEvents = eventBus.getRecentEvents(3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Executive Greeting Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Event Bus Active • Continuous Learning Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Good Morning, <span className="text-gradient">{companyName}</span> 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your AI Executive Team has evaluated real-time search signals, website traffic, CRM pipelines, and customer reviews.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai_team')}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-bold text-xs text-white shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
        >
          <span>🧠 View AI Executive Team</span>
          <span>➔</span>
        </button>
      </div>

      {/* CEO Executive Brief Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">👔 CEO Executive Brief</h2>
          <span className="text-[11px] text-slate-500 font-mono">Live Event Feed: {recentEvents.length} Recent Ingestion Signals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 space-y-2 border-indigo-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue Intelligence</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Awaiting Data</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No customer revenue data connected yet. Connect your billing/CRM systems to activate live velocity metrics.
            </p>
          </div>

          <div className="glass-card p-5 space-y-2 border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Appointments</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Awaiting Data</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No calendar or scheduling integration connected. Connect Google Calendar/HubSpot to track bookings.
            </p>
          </div>

          <div className="glass-card p-5 space-y-2 border-cyan-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Website Traffic & Conversions</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Awaiting Data</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect Google Analytics or Datadog RUM to stream real-time visitor traffic and conversion rates.
            </p>
          </div>
        </div>
      </div>

      {/* AI Executive Auditable Task Feed with Expandable Evidence Trails */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>⚡ Auditable AI Executive Action Feed</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold">
              {tasks.length - completedTaskIds.length - rejectedTaskIds.length} Pending Actions
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Every action includes full reasoning & evidence sources</span>
        </div>

        <div className="space-y-6">
          {tasks.map((task) => {
            const isDone = completedTaskIds.includes(task.taskId);
            const isRejected = rejectedTaskIds.includes(task.taskId);
            const isExpanded = expandedTaskId === task.taskId;

            if (isRejected) return null;

            return (
              <div
                key={task.taskId}
                className={`glass-card p-6 space-y-5 transition-all duration-300 ${
                  isDone ? 'opacity-60 border-emerald-500/20 bg-slate-950/40' : 'border-white/10 hover:border-indigo-500/40'
                }`}
              >
                {/* Task Header Bar */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-2xl shadow-inner">
                      {task.executiveAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-xs">{task.executiveRole}</span>
                        <span className="font-mono text-[11px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.2 rounded border border-indigo-500/20">
                          Task ID: {task.taskId}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-100 text-base mt-0.5">{task.headline}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Confidence Score</span>
                      <div className="text-emerald-400 font-bold font-mono text-sm">
                        {Math.round(task.confidenceScore * 100)}%
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.taskId)}
                      className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Evidence ▲' : 'View Evidence & Sources ▼'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-14">{task.summary}</p>

                {/* EXPANDABLE EVIDENCE & REASONING DRAWER */}
                {isExpanded && (
                  <div className="ml-14 rounded-2xl bg-slate-950/90 border border-indigo-500/30 p-5 space-y-4 text-xs font-sans shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                        <span>🔍 Verified Reasoning Chain & Evidence Audit Trail</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">Node Grounding: Active</span>
                    </div>

                    {/* Reasoning Chain */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified System Rationale:</span>
                      <ul className="space-y-1.5 pl-1">
                        {task.reasoningChain.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-emerald-400 font-bold flex-shrink-0">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Executive Decision */}
                    <div className="rounded-xl bg-indigo-950/50 p-3.5 border border-indigo-500/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Proposed Executive Decision:</span>
                      <p className="font-semibold text-slate-100">{task.proposedDecision}</p>
                    </div>

                    {/* Verified Evidence Sources */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Evidence & Data Sources:</span>
                      <div className="flex flex-wrap gap-2">
                        {task.evidenceSources.map((source) => (
                          <div
                            key={source.id}
                            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 border border-white/10 text-[11px] font-mono text-slate-300"
                          >
                            <span className="text-cyan-400">●</span>
                            <span className="font-bold">{source.name}</span>
                            <span className="text-[10px] text-slate-500">({source.id})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 pl-14">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>Grounded in Business DNA</span>
                    <span>•</span>
                    <span>Confidence: {Math.round(task.confidenceScore * 100)}%</span>
                  </div>

                  {isDone ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>✓ Action Executed & Logged</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReject(task.taskId)}
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/10 font-bold text-xs px-3 py-2 transition-all"
                      >
                        Reject ✕
                      </button>
                      <button
                        onClick={() => setExpandedTaskId(task.taskId)}
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 font-bold text-xs px-3 py-2 transition-all"
                      >
                        Modify ✏️
                      </button>
                      <button
                        onClick={() => handleAction(task.taskId)}
                        className={`rounded-lg bg-gradient-to-r ${task.accentGradient} text-white font-bold text-xs px-5 py-2 hover:opacity-90 transition-opacity shadow-md`}
                      >
                        {task.actionLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
