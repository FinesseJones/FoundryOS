import React from 'react';
import { ViewTab } from './Navbar';

interface PublishingViewProps {
  setActiveTab: (tab: ViewTab) => void;
}

export const PublishingView: React.FC<PublishingViewProps> = ({ setActiveTab }) => {
  const stagedLogs = [
    {
      id: 'pub_101',
      channel: 'LinkedIn',
      title: 'Series A Product Launch Post',
      stagedAt: '2026-07-27 13:30:00',
      status: 'STAGED_READY',
    },
    {
      id: 'pub_102',
      channel: 'X (Twitter)',
      title: 'Low Latency Benchmarking Report',
      stagedAt: '2026-07-27 11:15:00',
      status: 'PUBLISHED',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Publishing Log — <span className="text-gradient">Publishing Agent</span>
          </h1>
          <p className="text-xs text-slate-400">
            Audit history of staged, approved, and published content across digital channels.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-200 text-sm border-b border-white/10 pb-3">Delivery Queue & History</h3>

        <div className="divide-y divide-white/10 text-xs">
          {stagedLogs.map((log) => (
            <div key={log.id} className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">{log.title}</span>
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20">
                    {log.channel}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">Staged Time: {log.stagedAt}</p>
              </div>

              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  log.status === 'PUBLISHED' ? 'badge-approved' : 'badge-high-confidence'
                }`}
              >
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
