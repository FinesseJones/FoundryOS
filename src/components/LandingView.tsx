import React from 'react';
import { ViewTab } from './Navbar';

interface LandingViewProps {
  setActiveTab: (tab: ViewTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setActiveTab }) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Brand First Engine v1.0 — Now Live</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
          Every AI Agent Thinks, Speaks & Decides as{' '}
          <span className="text-gradient">Your Canonical Brand</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
          Stop generating generic AI copy. Brand First builds a self-learning Business DNA layer that governs every prompt, workflow, campaign, and automated publishing pipeline.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('onboarding')}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
          >
            Launch Business DNA Wizard ⚡
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className="glass-card glass-card-hover px-8 py-4 font-semibold text-slate-200"
          >
            View Sample DNA Report 📊
          </button>
        </div>
      </section>

      {/* Interactive Architecture Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-100">Powered by 5 Autonomous Core Engines</h2>
          <p className="text-slate-400 text-sm">Deterministic, strict-typed knowledge architecture with zero fake placeholders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card glass-card-hover p-6 space-y-3">
            <div className="text-indigo-400 text-2xl">🧬</div>
            <h3 className="font-bold text-lg text-slate-200">Stage 1: Knowledge Foundation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Canonical Business DNA model wrapping every property with confidence scores, source lineage, and approval states.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 space-y-3">
            <div className="text-purple-400 text-2xl">⚡</div>
            <h3 className="font-bold text-lg text-slate-200">Stage 2: Context Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-source real-time context retrieval, multi-factor ranking, and progressive token budget optimization.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 space-y-3">
            <div className="text-pink-400 text-2xl">🧠</div>
            <h3 className="font-bold text-lg text-slate-200">Stage 3: Cognitive Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-perspective reasoning traces, automated self-reflection, governance decision checks, and recommendation insights.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 space-y-3">
            <div className="text-emerald-400 text-2xl">🤖</div>
            <h3 className="font-bold text-lg text-slate-200">Stage 4: Agent Framework</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              7 specialized autonomous agents (Brand, Content, Publishing, Website, Security, Analytics, Learning) enforcing strict access matrix.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 space-y-3">
            <div className="text-cyan-400 text-2xl">🔄</div>
            <h3 className="font-bold text-lg text-slate-200">Stage 5: Automation Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time EventBus, trigger condition rules, multi-step workflow execution, human approval gates, and notifications.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 space-y-3 border-indigo-500/30 bg-indigo-950/20">
            <div className="text-amber-400 text-2xl">🛡️</div>
            <h3 className="font-bold text-lg text-slate-200">Human-in-the-Loop Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-risk or low-confidence outputs automatically pause for human review before staging or publishing.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="space-y-8 pt-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-100">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-sm">Scale your brand voice across every channel with predictable token budgets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="glass-card p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Starter</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>
              <p className="text-xs text-slate-400">Perfect for single brand founders scaling content.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2">✓ 1 Business DNA Profile</li>
                <li className="flex items-center gap-2">✓ 50,000 Monthly Context Tokens</li>
                <li className="flex items-center gap-2">✓ Brand & Content Agents</li>
                <li className="flex items-center gap-2">✓ Human Approval Workflow</li>
              </ul>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3 font-semibold text-xs text-white transition-colors"
            >
              Select Starter Plan
            </button>
          </div>

          {/* Growth Plan (Featured) */}
          <div className="glass-card p-8 space-y-6 flex flex-col justify-between border-indigo-500/50 shadow-indigo-500/20 relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-0.5 text-[10px] font-bold text-white tracking-wider uppercase shadow-md">
              Most Popular
            </span>
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Growth</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$199</span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>
              <p className="text-xs text-slate-400">Ideal for growing teams and active marketing campaigns.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2">✓ 5 Business DNA Profiles</li>
                <li className="flex items-center gap-2">✓ 500,000 Monthly Context Tokens</li>
                <li className="flex items-center gap-2">✓ All 7 Autonomous Agents</li>
                <li className="flex items-center gap-2">✓ Cognitive Reflection & Reasoning</li>
                <li className="flex items-center gap-2">✓ EventBus & Automated Workflows</li>
              </ul>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 py-3 font-bold text-xs text-white shadow-lg transition-opacity"
            >
              Start 14-Day Growth Trial
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-card p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Enterprise</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$499</span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>
              <p className="text-xs text-slate-400">Custom multi-tenant organizations & dedicated SLAs.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2">✓ Unlimited Business DNA Profiles</li>
                <li className="flex items-center gap-2">✓ Unlimited Token Allowance</li>
                <li className="flex items-center gap-2">✓ Dedicated Security & Audit Agents</li>
                <li className="flex items-center gap-2">✓ Custom API & Webhook Integrations</li>
              </ul>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3 font-semibold text-xs text-white transition-colors"
            >
              Contact Enterprise Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
