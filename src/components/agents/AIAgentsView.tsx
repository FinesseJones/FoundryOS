import React from 'react';
import { ViewTab } from '../Navbar';
import { AgentRegistry } from '../../core/agents';

interface AIAgentsViewProps {
  agentRegistry: AgentRegistry;
  setActiveTab: (tab: ViewTab) => void;
}

export const AIAgentsView: React.FC<AIAgentsViewProps> = ({ agentRegistry, setActiveTab }) => {
  const executiveTeam = [
    {
      role: 'CEO Agent',
      avatar: '👔',
      name: 'Chief Executive Officer Agent',
      queue: { completed: 18, running: 1, waitingApproval: 1, blocked: 0 },
      activeJob: {
        title: 'Evaluating Weekly Business KPIs & Unit Economics',
        progressPct: 88,
        collectingSteps: [
          { name: 'Revenue Telemetry', done: true },
          { name: 'Customer Retention Rate', done: true },
          { name: 'Ad Spend Efficiency', done: true },
          { name: 'Competitive Threats', done: false },
        ],
        outputTargets: ['Executive Brief', 'Growth Recommendations'],
      },
      accentColor: 'border-emerald-500/30',
    },
    {
      role: 'Marketing Director',
      avatar: '📢',
      name: 'Marketing Intelligence Director',
      queue: { completed: 12, running: 3, waitingApproval: 2, blocked: 0 },
      activeJob: {
        title: 'Building Local Emergency AC Summer Campaign',
        progressPct: 72,
        collectingSteps: [
          { name: 'Website Signals', done: true },
          { name: 'Customer Reviews', done: true },
          { name: 'Competitor Pricing', done: true },
          { name: 'Search Trends', done: false },
        ],
        outputTargets: ['Facebook Offer', 'Google Search Ads', 'Instagram Story Copy'],
      },
      accentColor: 'border-violet-500/30',
    },
    {
      role: 'Sales Director',
      avatar: '💼',
      name: 'Sales & Revenue Director',
      queue: { completed: 14, running: 2, waitingApproval: 1, blocked: 0 },
      activeJob: {
        title: 'Re-Engaging Cold Inbound HVAC Replacement Leads',
        progressPct: 64,
        collectingSteps: [
          { name: 'CRM Pipeline DB', done: true },
          { name: 'Lead Interaction History', done: true },
          { name: 'Objection Handling Bank', done: false },
          { name: 'Financing Offer Terms', done: false },
        ],
        outputTargets: ['Personalized Cold Follow-ups', 'Financing Deck'],
      },
      accentColor: 'border-cyan-500/30',
    },
    {
      role: 'Customer Success',
      avatar: '💬',
      name: 'Customer Success Lead',
      queue: { completed: 24, running: 1, waitingApproval: 1, blocked: 0 },
      activeJob: {
        title: 'Responding to Overnight Google & Yelp Reviews',
        progressPct: 92,
        collectingSteps: [
          { name: 'Google Business Webhook', done: true },
          { name: 'Yelp Rating Feed', done: true },
          { name: 'Brand Voice Tone Policy', done: true },
          { name: 'Technician Punctuality Logs', done: true },
        ],
        outputTargets: ['7 Public Review Responses'],
      },
      accentColor: 'border-amber-500/30',
    },
    {
      role: 'Operations Manager',
      avatar: '⚙️',
      name: 'Operations & Workflow Manager',
      queue: { completed: 31, running: 2, waitingApproval: 0, blocked: 0 },
      activeJob: {
        title: 'Optimizing Emergency Dispatcher Latency SLAs',
        progressPct: 55,
        collectingSteps: [
          { name: 'Call Telemetry Gateway', done: true },
          { name: 'Dispatch Queue Logs', done: true },
          { name: 'Routing Automation Recipe', done: false },
          { name: 'Shift Capacity Matrix', done: false },
        ],
        outputTargets: ['Dispatcher SLA Optimization Plan'],
      },
      accentColor: 'border-blue-500/30',
    },
  ];

  React.useEffect(() => {
    console.log('\n========================================');
    console.log('[AI Executive Workforce Execution Logs] Grounded in Business DNA:');
    executiveTeam.forEach((exec) => {
      console.log(`  - [${exec.role}] Queue: Completed (${exec.queue.completed}) | Running (${exec.queue.running}) | Waiting Approval (${exec.queue.waitingApproval}) | Blocked (${exec.queue.blocked})`);
      console.log(`    Active Work Job: "${exec.activeJob.title}" [${exec.activeJob.progressPct}% Job Completion]`);
      console.log(`    Steps Completed: ${exec.activeJob.collectingSteps.filter((s) => s.done).map((s) => `✓ ${s.name}`).join(', ')}`);
      console.log(`    Building Deliverables: ${exec.activeJob.outputTargets.join(', ')}`);
    });
    console.log('========================================\n');
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Executive Workforce • Real Work Queues & Job Step Meters</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Your AI <span className="text-gradient">Executive Team at Work</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Measurable work queues, active job step pipelines, and execution throughput grounded in Business DNA.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('today')}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-bold text-xs text-white shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
        >
          <span>🏠 View Today Action Feed</span>
          <span>➔</span>
        </button>
      </div>

      {/* Living Executive Team List with Measurable Queues */}
      <div className="space-y-6">
        {executiveTeam.map((exec) => (
          <div key={exec.role} className={`glass-card p-6 space-y-5 ${exec.accentColor} hover:border-indigo-500/50 transition-all`}>
            {/* Header & Work Queue Counters */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-2xl shadow-inner">
                  {exec.avatar}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-indigo-400 uppercase">{exec.role}</div>
                  <h3 className="text-lg font-extrabold text-slate-100">{exec.name}</h3>
                </div>
              </div>

              {/* Measurable Work Queue Counters */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="rounded-xl bg-slate-900 px-3 py-1.5 border border-white/5 space-y-0.5 text-center">
                  <div className="text-emerald-400 font-extrabold text-sm">{exec.queue.completed}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Completed</div>
                </div>
                <div className="rounded-xl bg-slate-900 px-3 py-1.5 border border-white/5 space-y-0.5 text-center">
                  <div className="text-indigo-300 font-extrabold text-sm flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                    <span>{exec.queue.running}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Running</div>
                </div>
                <div className="rounded-xl bg-slate-900 px-3 py-1.5 border border-white/5 space-y-0.5 text-center">
                  <div className="text-amber-400 font-extrabold text-sm">{exec.queue.waitingApproval}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Waiting Approval</div>
                </div>
                <div className="rounded-xl bg-slate-900 px-3 py-1.5 border border-white/5 space-y-0.5 text-center">
                  <div className="text-slate-500 font-extrabold text-sm">{exec.queue.blocked}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Blocked</div>
                </div>
              </div>
            </div>

            {/* Active Job Progress & Step Meter */}
            <div className="rounded-2xl bg-slate-950/80 p-5 space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Active Work Job</span>
                  <h4 className="font-bold text-slate-100 text-sm">{exec.activeJob.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold font-mono text-emerald-400">{exec.activeJob.progressPct}%</span>
                  <div className="text-[10px] text-slate-500">Job Completion</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${exec.activeJob.progressPct}%` }}
                />
              </div>

              {/* Step Checklist */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {exec.activeJob.collectingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg p-2.5 border text-[11px] font-mono ${
                      step.done
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 animate-pulse'
                    }`}
                  >
                    <span>{step.done ? '✓' : '⚡'}</span>
                    <span className="truncate">{step.name}</span>
                  </div>
                ))}
              </div>

              {/* Output Targets */}
              <div className="flex items-center gap-2 text-[11px] pt-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Building Deliverables:</span>
                {exec.activeJob.outputTargets.map((target, idx) => (
                  <span key={idx} className="rounded bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 text-indigo-300 font-mono">
                    {target}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
