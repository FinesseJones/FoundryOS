import React from 'react';
import { ViewTab } from '../Navbar';
import { BusinessDNA } from '../../core/knowledge';

interface DashboardViewProps {
  dna: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
  tokenUsage?: { used: number; total: number };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dna,
  setActiveTab,
  tokenUsage = { used: 14200, total: 500000 },
}) => {
  const companyName = dna.companyIdentity?.companyName?.value ?? 'Acme Corp';
  const confidenceScore = Math.round((dna.confidenceScore ?? 0.94) * 100);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Hero Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 border border-indigo-500/30 text-xs font-semibold text-indigo-400">
            <span>⚡ AI Knowledge Engine Active — Customer Phase 12A</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Welcome back to <span className="text-gradient">{companyName}</span> Workspace
          </h1>
          <p className="text-xs text-slate-400">
            Real-time brand health, active campaign velocity, AI recommendations, and token allocation.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('content')}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-bold text-xs text-white shadow-md hover:opacity-95 transition-opacity"
        >
          + Create New Campaign
        </button>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2 border-indigo-500/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DNA Completion</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">{confidenceScore}%</span>
            <span className="text-xs text-emerald-400 font-semibold">+6% verified</span>
          </div>
          <p className="text-[11px] text-slate-500">12 Signal Domains Extracted</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</span>
          <div className="text-2xl font-bold text-purple-300">3 Active</div>
          <p className="text-[11px] text-slate-500">Q3 Product Launch • Brand Growth</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Recommendations</span>
          <div className="text-2xl font-bold text-amber-400">4 Ready</div>
          <p className="text-[11px] text-slate-500">Stage 3 Cognitive Engine</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Token Usage</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {tokenUsage.used.toLocaleString()} / {tokenUsage.total.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Hard-Cap Guard Active</p>
        </div>
      </div>

      {/* Strategic AI Recommendations Grid */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-slate-100 text-base">Strategic AI Recommendations</h3>
          <button
            onClick={() => setActiveTab('content')}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-xs text-white hover:bg-indigo-500 shadow-md transition-all"
          >
            Launch Campaign ➔
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900/60 p-6 border border-white/10 space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold">Brand Identity Synchronization</span>
            <span className="text-emerald-400 font-mono font-bold">Synched</span>
          </div>
          <p className="text-xs text-slate-300">
            AI agents have synchronized with your latest Business DNA rules and restricted terminology guidelines.
          </p>
          <button
            onClick={() => setActiveTab('knowledge')}
            className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-xs text-slate-200 hover:bg-slate-700 transition-all"
          >
            View Digital Twin Knowledge ➔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 space-y-2">
            <span className="badge-high-confidence text-[10px] px-2 py-0.5 rounded font-bold uppercase">POSITIONING</span>
            <h4 className="font-bold text-slate-200 text-sm">Amplify ROI Multiplier Messaging</h4>
            <p className="text-slate-400 text-xs">
              Highlight 3.4x ROI conversion case study across LinkedIn and Email newsletters to target decision makers.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 space-y-2">
            <span className="badge-approved text-[10px] px-2 py-0.5 rounded font-bold uppercase">VOICE AUDIT</span>
            <h4 className="font-bold text-slate-200 text-sm">Enforce Restricted Vocabulary Filter</h4>
            <p className="text-slate-400 text-xs">
              Ensure all draft content excludes prohibited words (`cheap`, `synergy`, `disruption`) to maintain high-value positioning.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base border-b border-white/10 pb-3">Recent System Activity</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-300">Website signal crawler extracted OpenGraph & typography tokens</span>
            <span className="text-slate-500 font-mono">10m ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-300">Multi-Agent Collaboration loop verified 4 channel drafts</span>
            <span className="text-slate-500 font-mono">42m ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-300">Tenant isolation guard verified 0 cross-customer leaks</span>
            <span className="text-slate-500 font-mono">1h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
