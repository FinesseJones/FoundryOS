import React from 'react';
import { ViewTab } from '../Navbar';
import { BusinessDNA } from '../../core/knowledge';

interface CustomersViewProps {
  dna: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ dna, setActiveTab }) => {
  const cp = dna.customerProfile;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <span>🎯 Ideal Customer Profile & Personas</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            What Do We Know About Our <span className="text-gradient">Customers?</span>
          </h1>
          <p className="text-xs text-slate-400">
            Customer DNA • Target ICP, buyer personas, primary pain points, and customer feedback intelligence.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('workspace')}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-bold text-xs text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity"
        >
          Create Targeted Campaign 🚀
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target ICP */}
        <div className="glass-card p-6 space-y-4 border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase">Target ICP</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
              cp.targetAudience.originType === 'OWNER_PROVIDED' && cp.targetAudience.approvalStatus === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}>
              {cp.targetAudience.originType === 'OWNER_PROVIDED' && cp.targetAudience.approvalStatus === 'approved'
                ? 'OWNER PROVIDED'
                : 'Website Evidence'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-100">Ideal Buyer Description</h3>
          <p className="text-xs text-slate-300 font-semibold">{cp.targetAudience.value}</p>
        </div>

        {/* Primary Pain Points */}
        <div className="glass-card p-6 space-y-4 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase">Customer Pain Points</span>
            <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold">
              Website Evidence
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-100">Solvable Market Friction</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {cp.primaryPainPoints.value.map((pp, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-rose-400">🚨</span>
                <span>{pp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
