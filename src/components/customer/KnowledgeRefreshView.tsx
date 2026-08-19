import React, { useState } from 'react';
import { RefreshRecord, RefreshSchedule, RefreshFrequency } from '../../core/ingestion/knowledge-refresh-service';
import { DataSourceRecord } from '../../core/ingestion/data-source-service';

interface KnowledgeRefreshViewProps {
  sources: DataSourceRecord[];
  refreshHistory: RefreshRecord[];
  schedules: Record<string, RefreshSchedule>;
  onManualRefresh?: (sourceId: string) => void;
  onScheduleRefresh?: (sourceId: string, frequency: RefreshFrequency) => void;
}

export const KnowledgeRefreshView: React.FC<KnowledgeRefreshViewProps> = ({
  sources,
  refreshHistory,
  schedules,
  onManualRefresh,
  onScheduleRefresh,
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState<Record<string, RefreshFrequency>>({});

  const totalSources = sources.length;
  const currentSources = refreshHistory.filter((r) => r.status === 'COMPLETED').length;
  const healthPct = totalSources > 0 ? Math.round((currentSources / totalSources) * 100) : 0;

  const statusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-400';
      case 'NO_CHANGES': return 'text-sky-400';
      case 'RUNNING': return 'text-amber-400';
      case 'FAILED': return 'text-rose-400';
      case 'SCHEDULED': return 'text-indigo-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <span>Continuous Knowledge Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
          Knowledge <span className="text-gradient">Refresh</span>
        </h1>
        <p className="text-xs text-slate-400">
          Keep your Business DNA synchronized with the latest intelligence from all connected sources.
        </p>
      </div>

      {/* Knowledge Health Score */}
      <div className="glass-card p-6 flex items-center gap-8 border-emerald-500/20">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1e293b" strokeWidth="3.8" />
            <circle
              cx="18" cy="18" r="15.9155" fill="none"
              stroke={healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3.8"
              strokeDasharray={`${healthPct} ${100 - healthPct}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-extrabold text-slate-100">{healthPct}%</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Business Knowledge Health</h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentSources} of {totalSources} sources are fully synchronized.
          </p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base border-b border-white/10 pb-3">
          Source Refresh Controls ({sources.length})
        </h3>

        {sources.length === 0 && (
          <p className="text-center py-8 text-slate-500 text-xs">No sources connected. Add a website or document first.</p>
        )}

        <div className="divide-y divide-white/10">
          {sources.map((src) => {
            const schedule = schedules[src.id];
            const lastRefresh = refreshHistory.filter((r) => r.sourceId === src.id).at(-1);

            return (
              <div key={src.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{src.sourceName}</span>
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                      {src.sourceType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-x-3">
                    <span>Last refreshed: {lastRefresh?.completedAt ? new Date(lastRefresh.completedAt).toLocaleTimeString() : 'Never'}</span>
                    {schedule?.nextRefreshAt && (
                      <span className="text-indigo-300">Next: {new Date(schedule.nextRefreshAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {lastRefresh && lastRefresh.changesDetected > 0 && (
                    <div className="text-[10px] text-emerald-400">
                      {lastRefresh.changesDetected} change(s) incorporated
                    </div>
                  )}
                  {lastRefresh?.status === 'FAILED' && (
                    <div className="text-[10px] text-rose-400">⚠ Refresh failed: {lastRefresh.error}</div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Schedule selector */}
                  <select
                    value={selectedFrequency[src.id] ?? 'MANUAL'}
                    onChange={(e) =>
                      setSelectedFrequency((prev) => ({
                        ...prev,
                        [src.id]: e.target.value as RefreshFrequency,
                      }))
                    }
                    className="rounded-lg bg-slate-900 border border-white/10 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MANUAL">Manual Only</option>
                    <option value="DAILY">Auto — Daily</option>
                    <option value="WEEKLY">Auto — Weekly</option>
                    <option value="MONTHLY">Auto — Monthly</option>
                  </select>

                  {selectedFrequency[src.id] && selectedFrequency[src.id] !== 'MANUAL' && onScheduleRefresh && (
                    <button
                      onClick={() => onScheduleRefresh(src.id, selectedFrequency[src.id]!)}
                      className="rounded-lg bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 text-xs font-bold hover:bg-indigo-800/60 transition-colors"
                    >
                      Set Schedule
                    </button>
                  )}

                  <button
                    onClick={() => onManualRefresh?.(src.id)}
                    className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-4 py-1.5 hover:opacity-90 transition-opacity shadow"
                  >
                    ↻ Refresh Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refresh History */}
      {refreshHistory.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-base border-b border-white/10 pb-3">
            Refresh History ({refreshHistory.length} events)
          </h3>
          <div className="divide-y divide-white/10 text-xs">
            {[...refreshHistory].reverse().map((r) => (
              <div key={r.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-200">{r.sourceName}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className={`font-bold text-[11px] ${statusColor(r.status)}`}>● {r.status}</span>
                  {r.changesDetected > 0 && (
                    <span className="ml-2 text-emerald-400 text-[10px]">{r.changesDetected} changes</span>
                  )}
                </div>
                <span className="text-slate-500 font-mono text-[10px]">
                  {r.completedAt ? new Date(r.completedAt).toLocaleString() : 'In progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
