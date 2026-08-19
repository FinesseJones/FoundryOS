import React from 'react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          Analytics & Content ROI — <span className="text-gradient">Analytics Agent</span>
        </h1>
        <p className="text-xs text-slate-400">
          Real-time performance scoring, lead attribution, and engagement intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Content ROI</span>
          <div className="text-3xl font-extrabold text-emerald-400">3.4x</div>
          <p className="text-[11px] text-slate-500">Revenue return vs token generation cost.</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
          <div className="text-3xl font-extrabold text-indigo-400">4.2%</div>
          <p className="text-[11px] text-slate-500">+1.2% above industry baseline.</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Engagement Score</span>
          <div className="text-3xl font-extrabold text-purple-400">8.7/10</div>
          <p className="text-[11px] text-slate-500">Audience resonance across channels.</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</span>
          <div className="text-3xl font-extrabold text-amber-400">3 Active</div>
          <p className="text-[11px] text-slate-500">Summer Scale 2026 & Product Launch.</p>
        </div>
      </div>

      {/* Top Topics Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-200 text-sm border-b border-white/10 pb-3">Top Performing Content Topics</h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="font-semibold text-slate-200">1. Ultra-Low Latency Benchmark Report</span>
            <span className="text-emerald-400 font-bold">4.8x ROI</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="font-semibold text-slate-200">2. Customer Case Study: 10x Speed</span>
            <span className="text-emerald-400 font-bold">3.9x ROI</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="font-semibold text-slate-200">3. Brand First Architecture Deep Dive</span>
            <span className="text-indigo-400 font-bold">3.1x ROI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
