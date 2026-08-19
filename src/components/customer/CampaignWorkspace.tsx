import React from 'react';
import { CustomerTab } from './CustomerShell';

interface CampaignWorkspaceProps {
  setActiveTab: (tab: CustomerTab) => void;
}

export const CampaignWorkspace: React.FC<CampaignWorkspaceProps> = ({ setActiveTab }) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 border border-purple-500/30 text-xs font-semibold text-purple-400">
            <span>Action-First Campaign Workbench</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Campaign <span className="text-gradient">Workspace</span>
          </h1>
          <p className="text-xs text-slate-400">
            Actionable campaign matrix, channel content drafts, and 1-click strategic triggers.
          </p>
        </div>

        <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-bold text-xs text-white shadow-md hover:opacity-95 transition-opacity">
          + Launch Campaign Directive
        </button>
      </div>

      {/* Active Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-3 border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100 text-sm">Q3 Enterprise Product Launch</span>
            <span className="badge-high-confidence text-[10px] px-2 py-0.5 rounded font-bold uppercase">75% Complete</span>
          </div>
          <p className="text-slate-400 text-xs">
            Multi-channel campaign launching Business DNA Platform v1 across LinkedIn, X, and Email.
          </p>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full w-3/4 rounded-full" />
          </div>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100 text-sm">Brand Voice Consistency Audit</span>
            <span className="badge-approved text-[10px] px-2 py-0.5 rounded font-bold uppercase">ACTIVE</span>
          </div>
          <p className="text-slate-400 text-xs">
            Ongoing brand voice enforcer scanning content assets for prohibited words.
          </p>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-full rounded-full" />
          </div>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100 text-sm">Competitive ROI Case Study</span>
            <span className="badge-pending text-[10px] px-2 py-0.5 rounded font-bold uppercase">STAGED</span>
          </div>
          <p className="text-slate-400 text-xs">
            3.4x ROI conversion case study campaign targeting enterprise decision makers.
          </p>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full w-1/2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
