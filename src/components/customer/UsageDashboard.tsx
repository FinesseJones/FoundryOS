import React, { useState } from 'react';
import { CustomerTab } from './CustomerShell';
import type { ApiKeyRecord } from '../../core/saas/api-keys';
import { requestApiKeyGeneration } from '../../core/saas/api-key-client';

interface UsageDashboardProps {
  tokenUsage: { used: number; total: number };
  setActiveTab: (tab: CustomerTab) => void;
}

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ tokenUsage }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([
    {
      id: 'key_cust_001',
      prefix: 'bf_live_9a8b7c6d...',
      keyHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      name: 'Production Customer Key',
      organizationId: 'org_customer_001',
      rateLimitPerMin: 60,
      requestCount: 420,
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
      const { rawKey, record } = await requestApiKeyGeneration('org_customer_001', `API Key #${apiKeys.length + 1}`);
      setApiKeys((prev) => [...prev, record]);
      setLatestRawKey(rawKey);
    } catch (err: any) {
      setKeyError(err.message || 'Failed to generate API key');
    } finally {
      setIsLoadingKey(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <span>Usage Metering & API Access</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Usage & <span className="text-gradient">API Key Portal</span>
          </h1>
          <p className="text-xs text-slate-400">
            Monitor token consumption, plan tier limits, and manage production SHA-256 API keys.
          </p>
        </div>

        <button
          onClick={handleCreateKey}
          disabled={isLoadingKey}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-bold text-xs text-white shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {isLoadingKey && <span className="h-2 w-2 rounded-full bg-white animate-ping" />}
          <span>{isLoadingKey ? 'Generating Key...' : '+ Generate New API Key'}</span>
        </button>
      </div>

      {keyError && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs font-bold text-rose-300">
          ⚠️ {keyError}
        </div>
      )}

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

      {/* Usage Meter Card */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-base">Monthly Token Usage Meter</h3>
          <span className="text-xs font-bold text-indigo-400">
            {Math.round((tokenUsage.used / tokenUsage.total) * 100)}% Consumed
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (tokenUsage.used / tokenUsage.total) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{tokenUsage.used.toLocaleString()} Used</span>
          <span>{tokenUsage.total.toLocaleString()} Monthly Allowance</span>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">Active SHA-256 API Keys</h3>
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
