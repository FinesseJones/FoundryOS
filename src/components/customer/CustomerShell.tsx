import React, { useState } from 'react';
import { CustomerLifecycleState } from '../../core/saas/customer-state';
import { UserSession } from '../../core/saas/auth';

export type CustomerTab = 'dashboard' | 'dna_profile' | 'campaigns' | 'approvals' | 'usage';

interface CustomerShellProps {
  session: UserSession;
  lifecycleState: CustomerLifecycleState;
  dnaCompletionPercent: number;
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  pendingApprovalsCount: number;
  children: React.ReactNode;
}

export const CustomerShell: React.FC<CustomerShellProps> = ({
  session,
  lifecycleState,
  dnaCompletionPercent,
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  children,
}) => {
  const tabs: { id: CustomerTab; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Executive Dashboard ⚡' },
    { id: 'dna_profile', label: 'Business DNA Profile' },
    { id: 'campaigns', label: 'Campaign Workspace' },
    { id: 'approvals', label: 'AI Activity & Approvals', badge: pendingApprovalsCount },
    { id: 'usage', label: 'Usage & API Keys' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* SaaS Tenant Header */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-b border-white/10 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
                <span className="text-white text-lg">⚡</span>
              </div>
              <span className="text-gradient">Brand First</span>
            </div>

            <div className="hidden sm:flex items-center gap-3 rounded-lg bg-slate-900/80 px-3.5 py-1.5 border border-white/10 text-xs text-slate-300">
              <span className="text-slate-500 font-medium">Organization:</span>
              <span className="font-bold text-slate-100">{session.organizationName}</span>
              <span className="h-3 w-px bg-white/20" />
              <span className="badge-high-confidence text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                {session.role}
              </span>
            </div>
          </div>

          {/* Customer Lifecycle Badge & DNA Progress */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 rounded-xl bg-slate-900/60 px-3.5 py-1.5 border border-white/10 text-xs">
              <span className="text-slate-400 font-medium">Lifecycle:</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide">
                ● {lifecycleState}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">{dnaCompletionPercent}% DNA Complete</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/40">
                {session.name.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">{session.name}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl mt-3 flex items-center gap-1 border-t border-white/10 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="ml-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.2 text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
};
