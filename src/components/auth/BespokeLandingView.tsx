import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  Lock, 
  Cpu, 
  Activity, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Globe, 
  Database,
  Eye
} from 'lucide-react';
import { OnboardingWizard } from './OnboardingWizard';
import { AccountManager, UserSession } from '../../core/saas/auth';
import { PodiumLandingSection } from '../podium/PodiumLandingSection';
import { FloatingWebChatWidget } from '../podium/FloatingWebChatWidget';

interface BespokeLandingViewProps {
  onAuthenticated: (session: UserSession) => void;
}

export const BespokeLandingView: React.FC<BespokeLandingViewProps> = ({ onAuthenticated }) => {
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login' | null>(null);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'graph' | 'agents' | 'risk'>('graph');

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Ambient Grid Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-950/15 blur-3xl" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-indigo-950/20 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* Top Cybernetic Navigation */}
      <header className="relative z-10 border-b border-white/[0.07] bg-[#07090e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Protocol Badge */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white font-black text-xl shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <span className="relative z-10">T</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">TACF</span>
                <span className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase">OS</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider">Brand-First Autonomous Business AI</p>
            </div>
          </div>

          {/* Center Navigation Pillars */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-400">
            <a href="#architecture" className="hover:text-slate-100 transition-colors">01. ARCHITECTURE</a>
            <a href="#intelligence" className="hover:text-slate-100 transition-colors">02. INTELLIGENCE</a>
            <a href="#governance" className="hover:text-slate-100 transition-colors">03. ZERO-TRUST</a>
          </nav>

          {/* Identity Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthModalMode('login')}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModalMode('signup')}
              className="relative group px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer border border-indigo-400/30 flex items-center gap-1.5"
            >
              <span>Initialize Identity</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Viewport */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-indigo-950/60 border border-indigo-500/40 px-4 py-1.5 text-xs font-mono text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-white font-semibold">Autonomous Business DNA Core</span>
            <span className="text-indigo-400/60">|</span>
            <span className="text-slate-400">Enterprise AI OS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
            The Closed-Loop <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Business AI Operating System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Replace fragmented prompts with a living <strong className="text-white">Business DNA Graph</strong>. 
            Synthesizes marketing intelligence, website automation, and risk-governed autonomous execution for modern enterprises.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => setAuthModalMode('signup')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-indigo-400/40"
            >
              <span>Get Started with TACF OS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAuthModalMode('login')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign In to Workspace</span>
            </button>
            <button
              onClick={async () => {
                const demo = await AccountManager.getInstance().launchDemoSession();
                onAuthenticated(demo.session);
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-mono text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Demo Sandbox</span>
            </button>
          </div>
        </section>

        {/* Live Interactive Telemetry Preview Console */}
        <section id="architecture" className="relative rounded-2xl border border-white/[0.1] bg-slate-950/80 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-xs font-mono text-slate-400">tacf-core-runtime // telemetry-v1.0.0</span>
            </div>

            {/* Sub-tab Telemetry Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveTelemetryTab('graph')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTelemetryTab === 'graph'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DNA Graph
              </button>
              <button
                onClick={() => setActiveTelemetryTab('agents')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTelemetryTab === 'agents'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                8 Active Agents
              </button>
              <button
                onClick={() => setActiveTelemetryTab('risk')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTelemetryTab === 'risk'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Zero-Trust Risk Engine
              </button>
            </div>
          </div>

          {/* Interactive Console Screen */}
          <div className="pt-6">
            {activeTelemetryTab === 'graph' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-slate-900/60 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 uppercase">Node 01 · Identity</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">LOCKED</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">Brand Voice & Core UVP</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authoritative extraction of company mission, target audience personas, and primary brand pillars.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 uppercase">Node 02 · Opportunity</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">SYNTHESIZED</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">3 Opportunity Pillars</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Identifies Financial Pain ($1.2M+ drag), Process Gaps (manual bottlenecks), and Executive Sponsors.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 uppercase">Node 03 · Execution</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">MONITORED</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">Multi-Domain Intelligence</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Continuous cross-domain coordination between Marketing, Sales, Operations, and Zero-Trust Security.
                  </p>
                </div>
              </div>
            )}

            {activeTelemetryTab === 'agents' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: '@brand', role: 'Identity Architect', status: 'Active' },
                  { name: '@content', role: 'Copy Synthesizer', status: 'Active' },
                  { name: '@website', role: 'HTML5 Compiler', status: 'Active' },
                  { name: '@publishing', role: 'Distribution Router', status: 'Active' },
                  { name: '@security', role: 'Zero-Trust Guardian', status: 'Active' },
                  { name: '@analytics', role: 'Capacity Modeler', status: 'Active' },
                  { name: '@learning', role: 'Memory Write-Back', status: 'Active' },
                  { name: '@lead', role: 'Prospecting Engine', status: 'Active' },
                ].map((agent, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-300">{agent.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">{agent.role}</p>
                    <span className="text-[10px] font-mono text-slate-500">Reputation: 98/100</span>
                  </div>
                ))}
              </div>
            )}

            {activeTelemetryTab === 'risk' && (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Zero-Trust Risk Classification Matrix</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">ISOL-01 & ISOL-02 Compliant</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold block mb-1">LOW RISK</span>
                    <span className="text-slate-300 text-[11px]">Auto-executed (e.g. read telemetry, draft copy)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30">
                    <span className="text-indigo-400 font-bold block mb-1">MEDIUM RISK</span>
                    <span className="text-slate-300 text-[11px]">Logged execution (e.g. website compilation)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30">
                    <span className="text-amber-400 font-bold block mb-1">HIGH RISK</span>
                    <span className="text-slate-300 text-[11px]">Executive approval required</span>
                  </div>
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30">
                    <span className="text-red-400 font-bold block mb-1">CRITICAL RISK</span>
                    <span className="text-slate-300 text-[11px]">Dual admin cryptographic sign-off</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Feature Grid */}
        {/* 🌟 PODIUM-POWERED CONVERSATIONAL LEAD & REVENUE ENGINE SHOWCASE */}
        <PodiumLandingSection onStartOnboarding={() => setAuthModalMode('signup')} />

        {/* Feature Grid */}
        <section id="intelligence" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-white/[0.08] space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">AI Website Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomously generate, preview, and export responsive HTML5 client websites in seconds across 5 enterprise design themes.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-white/[0.08] space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Autonomous Lead Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuously discovers prospective clients, maps their operational bottlenecks, and calculates financial ROI opportunities.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-white/[0.08] space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Closed-Loop Memory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every marketing decision, client feedback, and execution result is written back to tenant memory for continuous compound learning.
            </p>
          </div>
        </section>
      </main>

      {/* Floating WebChat-to-SMS Widget (Podium Style) */}
      <FloatingWebChatWidget />

      {/* Footer */}
      <footer className="border-t border-white/[0.07] bg-[#07090e]/90 py-8 text-center text-xs font-mono text-slate-500">
        <p>TACF Operating System · Version 1.0.0 Production Release · Closed-Loop Business AI</p>
      </footer>

      {/* Interactive Identity & Onboarding Stepper Modal */}
      {authModalMode && (
        <OnboardingWizard
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onComplete={(session) => {
            setAuthModalMode(null);
            onAuthenticated(session);
          }}
        />
      )}
    </div>
  );
};
