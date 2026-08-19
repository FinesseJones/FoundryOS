import React, { useState } from 'react';
import { ViewTab } from '../Navbar';
import { BusinessDNA, CustomerKnowledgeGraph, createDefaultCustomerKnowledgeGraph } from '../../core/knowledge';
import { BusinessReportView } from '../BusinessReportView';

interface KnowledgeGraphViewProps {
  dna: BusinessDNA;
  organizationId: string;
  workspaceId: string;
  setActiveTab: (tab: ViewTab) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  dna,
  organizationId,
  workspaceId,
  setActiveTab,
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('business');

  const graph: CustomerKnowledgeGraph = createDefaultCustomerKnowledgeGraph(
    dna.businessId,
    organizationId,
    workspaceId,
    dna
  );

  const nodes = [
    { id: 'business', name: '1. Business DNA 🏛️', desc: 'Company Identity, Mission & UVP', tag: 'Core Twin' },
    { id: 'brand', name: '2. Brand DNA 🗣️', desc: 'Tone, Keywords & Style Rules', tag: 'Voice' },
    { id: 'product', name: '3. Product DNA 📦', desc: 'Product Catalog & Core Features', tag: 'Catalog' },
    { id: 'service', name: '4. Service DNA 🛠️', desc: 'Services & SLA Deliverables', tag: 'SLA' },
    { id: 'customer', name: '5. Customer DNA 🎯', desc: 'ICP, Personas & Pain Points', tag: 'Audience' },
    { id: 'marketing', name: '6. Marketing DNA 🚀', desc: 'Pillars, Angles & Channels', tag: 'Strategy' },
    { id: 'sales', name: '7. Sales DNA 💼', desc: 'Pitch Hooks & Objection Scripts', tag: 'Conversion' },
    { id: 'operations', name: '8. Operations DNA ⚙️', desc: 'Approval Rules & Latency SLAs', tag: 'Ops' },
    { id: 'financial', name: '9. Financial DNA 💳', desc: 'Quota & Tier Allocations', tag: 'Billing' },
    { id: 'employee', name: '10. Employee DNA 👥', desc: 'Team Members & Access RBAC', tag: 'Team' },
    { id: 'workflow', name: '11. Workflow DNA 🔄', desc: 'Active Triggers & Recipes', tag: 'Automation' },
    { id: 'memory', name: '12. AI Memory 🧠', desc: 'Scraped Quotes & Evidence DOM', tag: 'Evidence' },
    { id: 'learning', name: '13. Learned Intelligence ⚡', desc: 'Quality Scores & Self-Improvement', tag: 'Self-Learning' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Knowledge Graph Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 border border-purple-500/20 text-xs font-semibold text-purple-400">
            <span>🧠 Digital Twin & Intelligence Graph</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Customer <span className="text-gradient">Knowledge Graph</span>
          </h1>
          <p className="text-xs text-slate-400">
            What has the AI learned? • 13 interconnected DNA nodes feeding 7 specialized AI agents without redundant prompting.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('onboarding')}
          className="rounded-xl bg-slate-900 border border-indigo-500/30 px-5 py-3 font-bold text-xs text-indigo-300 hover:bg-indigo-950/50 hover:text-white transition-all"
        >
          ⚡ Refresh Knowledge Graph
        </button>
      </div>

      {/* 13 Node Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
              selectedNode === node.id
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'glass-card text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block">{node.tag}</span>
            <h3 className="text-xs font-bold text-slate-100 truncate">{node.name}</h3>
            <p className="text-[10px] text-slate-400 truncate">{node.desc}</p>
          </button>
        ))}
      </div>

      {/* Node Detail Container */}
      <div className="glass-card p-8 border-indigo-500/30 space-y-6">
        {selectedNode === 'business' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase">Node 1 of 13</span>
                <h2 className="text-2xl font-bold text-slate-100">Business DNA — Canonical Operating System Profile</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold font-mono border ${
                dna.companyIdentity.mission.originType === 'OWNER_PROVIDED' && dna.companyIdentity.mission.approvalStatus === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                {dna.companyIdentity.mission.originType === 'OWNER_PROVIDED' && dna.companyIdentity.mission.approvalStatus === 'approved'
                  ? 'OWNER APPROVED (100% Conf)'
                  : 'Website Evidence & AI Analysis'}
              </span>
            </div>
            {/* Embed 7-tab canonical BusinessReportView */}
            <BusinessReportView dna={dna} setActiveTab={setActiveTab} />
          </div>
        )}

        {selectedNode === 'brand' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-xl font-bold text-slate-100">Brand DNA & Style Directives</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900/90 p-4 border border-white/10 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Primary Tone:</span>
                <p className="text-indigo-300 font-bold capitalize text-sm">{graph.brandDNA.primaryTone.value}</p>
              </div>
              <div className="rounded-xl bg-slate-900/90 p-4 border border-white/10 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Restricted Terms (Words to Avoid):</span>
                <p className="text-rose-300 font-mono">{graph.brandDNA.wordsToAvoid.value.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {selectedNode === 'product' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-xl font-bold text-slate-100">Product DNA & Offerings</h2>
            <div className="rounded-xl bg-slate-900/90 p-4 border border-white/10 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Product Catalog:</span>
              {graph.productDNA.productCatalog.value.map((p, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/10 py-2">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <span className="text-indigo-400 font-mono">{p.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedNode === 'customer' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-xl font-bold text-slate-100">Customer DNA & Buyer Profile</h2>
            <div className="rounded-xl bg-slate-900/90 p-4 border border-white/10 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Ideal Target Audience:</span>
              <p className="text-slate-200 text-sm font-semibold">{graph.customerDNA.targetAudience.value}</p>
            </div>
          </div>
        )}

        {selectedNode !== 'business' && selectedNode !== 'brand' && selectedNode !== 'product' && selectedNode !== 'customer' && (
          <div className="py-8 text-center space-y-3">
            <span className="text-3xl">🧬</span>
            <h3 className="text-lg font-bold text-slate-100 capitalize">{selectedNode} DNA Node Active</h3>
            <p className="text-xs text-slate-400">Integrated into ContextBuilder • Automatically supplied to 7 specialized AI agents during task execution.</p>
          </div>
        )}
      </div>
    </div>
  );
};
