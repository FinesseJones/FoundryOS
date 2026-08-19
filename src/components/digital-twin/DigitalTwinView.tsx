import React, { useState, useMemo } from 'react';
import { ViewTab } from '../Navbar';
import { BusinessDNA, CustomerKnowledgeGraph, createDefaultCustomerKnowledgeGraph, createDefaultBusinessDNA } from '../../core/knowledge';
import { BusinessReportView } from '../BusinessReportView';
import { LiveEventBus } from '../../core/events/live-event-bus';

interface DigitalTwinViewProps {
  dna?: BusinessDNA;
  organizationId?: string;
  workspaceId?: string;
  setActiveTab: (tab: ViewTab) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  dna,
  organizationId = 'org_default',
  workspaceId = 'ws_default',
  setActiveTab,
}) => {
  const [showRawDna, setShowRawDna] = useState(false);
  const companyName = dna?.companyIdentity?.companyName?.value || 'ABC HVAC & Climate';

  const defaultDna = dna ?? createDefaultBusinessDNA('biz_default');
  const knowledgeGraph: CustomerKnowledgeGraph = createDefaultCustomerKnowledgeGraph(
    defaultDna.businessId,
    organizationId,
    workspaceId,
    defaultDna
  );

  const eventBus = useMemo(() => LiveEventBus.getInstance(), []);
  const recentEvents = eventBus.getRecentEvents(5);

  const learningHistory = [
    {
      timestamp: '15 minutes ago',
      learnedFrom: 'Google Business Review Feed & Customer Inquiries',
      newKnowledge: 'Customers increasingly ask about 0% APR financing options for emergency AC replacement installations.',
      confidence: 94,
      automatedActionsTaken: [
        'Updated Sales DNA objection handling script with flexible financing rates',
        'Updated Website FAQ page with financing eligibility terms',
        'Suggested new blog article: "How to Finance Your Home AC Replacement in 2026"',
        'Refined Customer Success Chatbot context for financing questions',
      ],
    },
    {
      timestamp: '2 hours ago',
      learnedFrom: 'Local Google Search Console Query Telemetry',
      newKnowledge: 'Local search queries for "heat pump rebates Houston" increased by +34%.',
      confidence: 91,
      automatedActionsTaken: [
        'Updated Marketing DNA campaign target keywords',
        'Queued targeted Facebook ad set for local eco-rebate promotion',
      ],
    },
  ];

  const nodes = [
    { id: 'n1', label: '1. Business DNA', icon: '🏛️', status: 'Canonical Kernel', color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' },
    { id: 'n2', label: '2. Brand DNA', icon: '🗣️', status: 'Tone & Voice Guidelines', color: 'border-purple-500/40 text-purple-300 bg-purple-500/10' },
    { id: 'n3', label: '3. Product DNA', icon: '📦', status: 'Product Catalog & Features', color: 'border-pink-500/40 text-pink-300 bg-pink-500/10' },
    { id: 'n4', label: '4. Service DNA', icon: '🛠️', status: 'Service SLAs & Offerings', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
    { id: 'n5', label: '5. Customer DNA', icon: '🎯', status: 'ICP & Personas', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
    { id: 'n6', label: '6. Marketing DNA', icon: '🚀', status: 'Campaign Pillars & Channels', color: 'border-violet-500/40 text-violet-300 bg-violet-500/10' },
    { id: 'n7', label: '7. Sales DNA', icon: '💼', status: 'Value Props & Objections', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
    { id: 'n8', label: '8. Operations DNA', icon: '⚙️', status: 'Latency SLAs & Approvals', color: 'border-blue-500/40 text-blue-300 bg-blue-500/10' },
    { id: 'n9', label: '9. Financial DNA', icon: '💳', status: 'Subscription Tier & Quotas', color: 'border-teal-500/40 text-teal-300 bg-teal-500/10' },
    { id: 'n10', label: '10. Employee DNA', icon: '👥', status: 'Team Invites & RBAC', color: 'border-orange-500/40 text-orange-300 bg-orange-500/10' },
    { id: 'n11', label: '11. Workflow DNA', icon: '🔄', status: 'Active Recipes & Triggers', color: 'border-rose-500/40 text-rose-300 bg-rose-500/10' },
    { id: 'n12', label: '12. AI Memory', icon: '🧠', status: '742 Scraped Evidence Quotes', color: 'border-sky-500/40 text-sky-300 bg-sky-500/10' },
    { id: 'n13', label: '13. Learned Intelligence', icon: '⚡', status: 'Self-Improving Signals', color: 'border-lime-500/40 text-lime-300 bg-lime-500/10' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Digital Twin Living Status Header */}
      <div className="glass-card p-8 border-indigo-500/30 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Continuous Learning Engine Active • Live Event Bus Ingestion</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
              {companyName} <span className="text-gradient">Business Brain</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Continuously watching your website, CRM, reviews, search trends, and competitor movements.
            </p>
          </div>

          <button
            onClick={() => setShowRawDna(!showRawDna)}
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 font-bold text-xs text-slate-300 hover:bg-slate-800 transition-all"
          >
            {showRawDna ? 'Hide Business Kernel' : 'Inspect Raw Kernel ⚙️'}
          </button>
        </div>

        {/* Continuous Learning Feed Banner */}
        <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Latest Knowledge Acquired by System</span>
            </span>
            <span className="text-xs font-mono text-slate-400">Last learned 15 mins ago</span>
          </div>

          {learningHistory.map((item, idx) => (
            <div key={idx} className="space-y-3 pt-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-100 leading-relaxed font-sans">
                  "{item.newKnowledge}"
                </p>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold px-2 py-0.5 flex-shrink-0">
                  {item.confidence}% Confidence
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Automated System Actions Executed:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                  {item.automatedActionsTaken.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-2 border border-white/5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="truncate">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 13-Node Interactive Business Brain Visualizer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🧠 Customer Knowledge Graph (13 Live Knowledge Nodes)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((node) => (
            <div key={node.id} className={`glass-card p-5 space-y-2 border ${node.color} hover:border-indigo-500/60 transition-all cursor-pointer`}>
              <div className="flex items-center justify-between">
                <span className="text-xl">{node.icon}</span>
                <span className="text-[10px] font-bold font-mono text-slate-400">{node.id}</span>
              </div>
              <h3 className="font-bold text-slate-100 text-sm">{node.label}</h3>
              <p className="text-xs text-slate-400">{node.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Raw Kernel Inspector */}
      {showRawDna && dna && (
        <div className="space-y-4 border-t border-white/10 pt-8">
          <h2 className="text-base font-bold text-slate-100">⚙️ Underlying Business DNA Kernel</h2>
          <BusinessReportView dna={dna} setActiveTab={setActiveTab} />
        </div>
      )}
    </div>
  );
};
