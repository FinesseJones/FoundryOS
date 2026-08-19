import React from 'react';

interface BillingViewProps {
  tokenUsage: { used: number; total: number };
}

export const BillingView: React.FC<BillingViewProps> = ({ tokenUsage }) => {
  const percentage = Math.min(100, Math.round((tokenUsage.used / tokenUsage.total) * 100));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          Customer Portal — <span className="text-gradient">Billing & Subscriptions</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage your organization plan, token budget allocations, and invoice history.
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="glass-card p-8 space-y-6 border-indigo-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Current Active Plan</span>
            <h3 className="text-2xl font-extrabold text-white">Growth Tier ($199/mo)</h3>
          </div>
          <span className="badge-approved text-xs px-3 py-1 rounded-full font-bold">Active Subscription</span>
        </div>

        {/* Token Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Monthly Token Budget Usage</span>
            <span className="text-indigo-400 font-mono">
              {tokenUsage.used.toLocaleString()} / {tokenUsage.total.toLocaleString()} tokens ({percentage}%)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
          <p className="text-slate-400">Renews on August 27, 2026. Automatic token rollover enabled.</p>
          <button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 font-bold text-white transition-colors">
            Upgrade Plan Allocation
          </button>
        </div>
      </div>

      {/* Invoices History */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-200 text-sm border-b border-white/10 pb-3">Recent Invoices</h3>

        <div className="divide-y divide-white/10 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200">Invoice #INV-2026-07</p>
              <p className="text-slate-500 text-[11px]">July 27, 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-slate-300 font-bold">$199.00</span>
              <span className="badge-approved text-[10px] px-2 py-0.5 rounded-full font-bold">PAID</span>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200">Invoice #INV-2026-06</p>
              <p className="text-slate-500 text-[11px]">June 27, 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-slate-300 font-bold">$199.00</span>
              <span className="badge-approved text-[10px] px-2 py-0.5 rounded-full font-bold">PAID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
