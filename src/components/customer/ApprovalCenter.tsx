import React from 'react';
import { CustomerTab } from './CustomerShell';

interface ApprovalCenterProps {
  pendingApprovalsCount: number;
  setActiveTab: (tab: CustomerTab) => void;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  pendingApprovalsCount,
  setActiveTab,
}) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 border border-amber-500/30 text-xs font-semibold text-amber-400">
            <span>Human-In-The-Loop AI Activity Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            AI Activity & <span className="text-gradient">Approval Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review agent tasks, workflow run statuses, pending approval requests, and learning memory updates.
          </p>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="glass-card p-6 space-y-4 border-amber-500/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-slate-100 text-base">Pending Human Approval Requests</h3>
          <span className="badge-pending text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
            {pendingApprovalsCount} Pending
          </span>
        </div>

        {pendingApprovalsCount === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <span className="text-lg block mb-1">🎉</span>
            All AI agent outputs approved! No pending approval requests in queue.
          </div>
        ) : (
          <div className="divide-y divide-white/10 text-xs">
            <div className="py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">Publish Social Announcement</span>
                  <span className="badge-pending text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    HIGH RISK (&gt;0.6)
                  </span>
                </div>
                <p className="text-slate-400 text-xs">Proposed by ContentAgent for LinkedIn channel publishing.</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors">
                  Approve Asset
                </button>
                <button className="rounded-lg bg-rose-950/60 text-rose-300 border border-rose-500/30 px-4 py-2 text-xs font-bold hover:bg-rose-900/60 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Workflow Status Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base border-b border-white/10 pb-3">7 Specialized Agent Status Monitor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Brand Intelligence Agent</span>
              <span className="text-slate-500 text-[11px]">Domain: brand_identity</span>
            </div>
            <span className="text-emerald-400 font-bold text-[11px]">● ACTIVE</span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Content Strategy Agent</span>
              <span className="text-slate-500 text-[11px]">Domain: content_plans</span>
            </div>
            <span className="text-emerald-400 font-bold text-[11px]">● ACTIVE</span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Publishing Agent</span>
              <span className="text-slate-500 text-[11px]">Domain: schedule</span>
            </div>
            <span className="text-amber-400 font-bold text-[11px]">● PAUSED_FOR_APPROVAL</span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Analytics & ROI Agent</span>
              <span className="text-slate-500 text-[11px]">Domain: analytics</span>
            </div>
            <span className="text-emerald-400 font-bold text-[11px]">● ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
