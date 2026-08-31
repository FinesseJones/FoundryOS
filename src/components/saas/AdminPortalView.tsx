import React, { useState, useMemo } from 'react';
import { ViewTab } from '../Navbar';
import { SaaSBillingManager, SubscriptionStatus } from '../../core/saas/billing';
import type { ApiKeyRecord } from '../../core/saas/api-keys';
import { requestApiKeyGeneration } from '../../core/saas/api-key-client';

export interface AdminClientRecord {
  organizationId: string;
  organizationName: string;
  workspaceId: string;
  workspaceName: string;
  businessDnaVersion: string;
  status: 'Active' | 'Onboarding' | 'Suspended';
  planTier: string;
  tokenUsage: number;
  primaryContact: string;
  createdAt: string;
}

import { SaaSAuthManager } from '../../core/saas/auth';
import { CustomerStateManager } from '../../core/saas/customer-state';
import { AuditRepository } from '../../core/persistence/repositories';
import { HyperionEngineControl } from './HyperionEngineControl';

interface AdminPortalViewProps {
  authManager?: SaaSAuthManager;
  billingManager?: SaaSBillingManager;
  stateManager?: CustomerStateManager;
  auditRepo?: AuditRepository;
  organizationName?: string;
  tokenUsage?: { used: number; total: number };
  setActiveTab: (tab: ViewTab) => void;
  clients?: AdminClientRecord[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (workspaceId: string) => void;
  onCreateNewWorkspace?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  authManager,
  billingManager: billingManagerProp,
  stateManager,
  auditRepo,
  organizationName = 'TACF HQ Corp',
  tokenUsage = { used: 14200, total: 500000 },
  setActiveTab,
  clients = [
    {
      organizationId: 'org_apex_001',
      organizationName: 'Apex HVAC Corp',
      workspaceId: 'ws_hvac_001',
      workspaceName: 'Apex HVAC Workspace',
      businessDnaVersion: 'Apex HVAC DNA v1',
      status: 'Active',
      planTier: 'Growth',
      tokenUsage: 14200,
      primaryContact: 'admin@apexhvac.com',
      createdAt: '2026-07-28',
    },
    {
      organizationId: 'org_sweet_002',
      organizationName: 'Sweet Harvest LLC',
      workspaceId: 'ws_rest_002',
      workspaceName: 'Sweet Harvest Workspace',
      businessDnaVersion: 'Sweet Harvest DNA v1',
      status: 'Active',
      planTier: 'Growth',
      tokenUsage: 8900,
      primaryContact: 'hello@sweetharvest.com',
      createdAt: '2026-07-28',
    },
    {
      organizationId: 'org_datadog_003',
      organizationName: 'Datadog HQ Inc',
      workspaceId: 'ws_saas_003',
      workspaceName: 'Datadog Demo Workspace',
      businessDnaVersion: 'Datadog DNA v1',
      status: 'Active',
      planTier: 'Enterprise',
      tokenUsage: 45200,
      primaryContact: 'dev@datadoghq.com',
      createdAt: '2026-07-27',
    },
  ],
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateNewWorkspace,
}) => {
  const billingManager = useMemo(() => billingManagerProp ?? new SaaSBillingManager(), [billingManagerProp]);
  const [subscription] = useState<SubscriptionStatus>(() => billingManager.getSubscription('org_acme_001'));
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([
    {
      id: 'key_prod_001',
      prefix: 'bf_live_8f91a8d9...',
      keyHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      name: 'Production SDK Key',
      organizationId: 'org_acme_001',
      rateLimitPerMin: 60,
      requestCount: 1420,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [latestRawKey, setLatestRawKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleCreateKey = async () => {
    setIsLoadingKey(true);
    setKeyError(null);
    try {
      const { rawKey, record } = await requestApiKeyGeneration('org_acme_001', `Server Key #${apiKeys.length + 1}`);
      setApiKeys((prev) => [...prev, record]);
      setLatestRawKey(rawKey);
    } catch (err: any) {
      setKeyError(err.message || 'Failed to generate API Key');
    } finally {
      setIsLoadingKey(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Portal Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Owner Admin Layer — Multi-Tenant Isolation Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Platform Operator <span className="text-gradient">Admin Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage multi-client organizations, isolated workspaces, Business DNA profiles, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onCreateNewWorkspace && (
            <button
              onClick={onCreateNewWorkspace}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 font-bold text-xs text-white shadow-md hover:brightness-110 transition-all"
            >
              + Create Client Workspace
            </button>
          )}

          <button
            onClick={handleCreateKey}
            disabled={isLoadingKey}
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 font-bold text-xs text-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingKey && <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />}
            <span>{isLoadingKey ? 'Generating Key...' : '+ Generate API Key'}</span>
          </button>
        </div>
      </div>

      {keyError && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs font-bold text-rose-300">
          ⚠️ {keyError}
        </div>
      )}

      {/* Raw Key Display Modal/Banner */}
      {latestRawKey && (
        <div className="rounded-xl bg-purple-950/60 border border-purple-500/40 p-5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px]">
              ⚠️ Save Your Secret API Key (Shown Once)
            </span>
            <button
              onClick={() => setLatestRawKey(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-slate-300">
            Store this key securely. The raw key is hashed using SHA-256 and will never be shown again:
          </p>
          <div className="font-mono bg-slate-950 px-4 py-2 rounded-lg border border-white/10 text-emerald-400 font-bold select-all break-all">
            {latestRawKey}
          </div>
        </div>
      )}

      {/* Real Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2 border-emerald-500/30">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Subscription Tier</span>
          <div className="text-2xl font-extrabold text-emerald-400 capitalize">{subscription.planTier}</div>
          <p className="text-[11px] text-slate-500">Status: {subscription.status.toUpperCase()} • Billing Active</p>
        </div>

        <div className="glass-card p-6 space-y-2 border-indigo-500/30">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Organizations</span>
          <div className="text-2xl font-extrabold text-indigo-400">{clients.length} Clients</div>
          <p className="text-[11px] text-slate-500">Multi-Tenant Isolation Enforced</p>
        </div>

        <div className="glass-card p-6 space-y-2 border-purple-500/30">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Platform Token Usage</span>
          <div className="text-2xl font-extrabold text-purple-400">{tokenUsage.used.toLocaleString()} Tokens</div>
          <p className="text-[11px] text-slate-500">Quota: {tokenUsage.total.toLocaleString()} Max Limit</p>
        </div>

        <div className="glass-card p-6 space-y-2 border-amber-500/30">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active SHA-256 Keys</span>
          <div className="text-2xl font-extrabold text-amber-400">{apiKeys.length} Keys</div>
          <p className="text-[11px] text-slate-500">Encrypted in DB Vault</p>
        </div>
      </div>

      {/* 🚀 Hyperion Autonomous Engine Control & Live Telemetry */}
      <HyperionEngineControl />

      {/* Client Organizations & Workspaces Table */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Client Organizations & Workspaces</h2>
            <p className="text-xs text-slate-400">
              Master management view across all active SaaS client accounts and isolated workspace containers.
            </p>
          </div>
          {onCreateNewWorkspace && (
            <button
              onClick={onCreateNewWorkspace}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:opacity-95 transition-opacity"
            >
              + Provision New Client Workspace
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Organization & Workspace</th>
                <th className="pb-3 px-3">Business DNA</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Plan Tier</th>
                <th className="pb-3 px-3">Token Consumption</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
              {clients.map((client) => {
                const isActiveContext = activeWorkspaceId === client.workspaceId;
                return (
                  <tr key={client.workspaceId} className={isActiveContext ? 'bg-indigo-500/10' : 'hover:bg-slate-800/40'}>
                    <td className="py-4 px-3 space-y-0.5">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{client.organizationName}</span>
                        {isActiveContext && (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-2 py-0.2 font-extrabold">
                            Active Context
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">Workspace: {client.workspaceName} ({client.workspaceId})</div>
                    </td>

                    <td className="py-4 px-3 font-semibold text-indigo-300">
                      {client.businessDnaVersion}
                    </td>

                    <td className="py-4 px-3">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold">
                        ● {client.status}
                      </span>
                    </td>

                    <td className="py-4 px-3 font-semibold text-slate-200">
                      {client.planTier}
                    </td>

                    <td className="py-4 px-3 font-mono text-slate-300">
                      {client.tokenUsage.toLocaleString()} tokens
                    </td>

                    <td className="py-4 px-3 text-right">
                      {onSelectWorkspace && (
                        <button
                          onClick={() => onSelectWorkspace(client.workspaceId)}
                          className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-all ${
                            isActiveContext
                              ? 'bg-slate-800 text-slate-400 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
                          }`}
                        >
                          {isActiveContext ? 'Current Workspace' : 'Switch Context ➔'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active API Keys List */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">Active SHA-256 Encrypted API Keys</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Key Name</th>
                <th className="pb-2">Prefix</th>
                <th className="pb-2">SHA-256 Hash Digest</th>
                <th className="pb-2">Rate Limit</th>
                <th className="pb-2">Requests</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {apiKeys.map((k) => (
                <tr key={k.id}>
                  <td className="py-3 font-sans font-semibold text-slate-200">{k.name}</td>
                  <td className="py-3 text-indigo-400">{k.prefix}</td>
                  <td className="py-3 text-slate-400 text-[11px] truncate max-w-xs">{k.keyHash}</td>
                  <td className="py-3 text-emerald-400 font-sans font-bold">{k.rateLimitPerMin}/min</td>
                  <td className="py-3 font-sans">{k.requestCount}</td>
                  <td className="py-3 text-slate-400 font-sans">{k.createdAt.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
