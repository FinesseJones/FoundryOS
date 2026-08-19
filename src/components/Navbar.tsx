import React from 'react';

export type ViewTab =
  | 'today'
  | 'clients'
  | 'ai_team'
  | 'growth'
  | 'operations'
  | 'assets'
  | 'automation'
  | 'inbox'
  | 'digital_twin'
  | 'home'
  | 'marketing'
  | 'sales'
  | 'customers'
  | 'content'
  | 'automations'
  | 'ai_agents'
  | 'knowledge'
  | 'settings'
  | 'landing'
  | 'workspace'
  | 'auth'
  | 'onboarding'
  | 'report'
  | 'calendar'
  | 'generate'
  | 'approvals'
  | 'publishing'
  | 'analytics'
  | 'billing'
  | 'marketplace'
  | 'docs'
  | 'admin';

export interface ClientWorkspaceOption {
  workspaceId: string;
  workspaceName: string;
  organizationName: string;
}

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  workspaces: ClientWorkspaceOption[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateNewWorkspace: () => void;
  tokenUsage: { used: number; total: number };
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateNewWorkspace,
  tokenUsage,
  pendingApprovalsCount,
}) => {
  const primaryTabs: { id: ViewTab; label: string; badge?: number }[] = [
    { id: 'today', label: '🏠 Today' },
    { id: 'clients', label: '👥 Clients' },
    { id: 'ai_team', label: '🧠 AI Team' },
    { id: 'growth', label: '📈 Growth' },
    { id: 'operations', label: '⚙️ Operations' },
    { id: 'assets', label: '📂 Assets' },
    { id: 'automation', label: '🤖 Automation' },
    { id: 'inbox', label: '💬 Inbox', badge: pendingApprovalsCount },
    { id: 'digital_twin', label: '🌐 Digital Twin' },
  ];

  return (
    <>
      {/* TACF Beta Disclaimer Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-500/30 px-6 py-2 text-center text-xs text-slate-300 flex items-center justify-center gap-2 flex-wrap">
        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
          TACF Beta
        </span>
        <span className="font-medium">
          Your Business DNA is generated from publicly available website signals. Review and approve information before activating AI workflows.
        </span>
      </div>

      <header className="sticky top-0 z-50 glass-card rounded-none border-b border-white/10 px-6 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand Logo & Client Workspace Switcher */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setActiveTab('today')}
            className="flex cursor-pointer items-center gap-2.5 font-bold text-lg tracking-tight"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/20">
              <span className="text-white text-base">⚡</span>
            </div>
            <span className="text-gradient">TACF AI OS</span>
          </div>

          {/* Client Workspace Switcher Dropdown */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-1 border border-indigo-500/30 text-xs text-slate-300 shadow-inner">
            <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Client:</span>
            <select
              value={activeWorkspaceId}
              onChange={(e) => {
                if (e.target.value === '__CREATE_NEW__') {
                  onCreateNewWorkspace();
                } else {
                  onSelectWorkspace(e.target.value);
                }
              }}
              className="bg-transparent font-semibold text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              {workspaces.map((w) => (
                <option key={w.workspaceId} value={w.workspaceId} className="bg-slate-900 text-slate-200">
                  {w.workspaceName}
                </option>
              ))}
              <option value="__CREATE_NEW__" className="bg-indigo-950 font-bold text-indigo-300">
                + Create New Client Workspace
              </option>
            </select>
          </div>
        </div>

        {/* 10-Tab Navigation Bar */}
        <nav className="hidden xl:flex items-center gap-1">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Actions & HQ Admin */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('onboarding')}
            className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300 transition-all"
          >
            + New Client
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all"
          >
            HQ Admin ⚙️
          </button>
        </div>
      </div>
    </header>
    </>
  );
};
