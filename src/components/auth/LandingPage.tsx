import React, { useState } from 'react';

interface LandingPageProps {
  onStartOnboarding: (url: string, companyName?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartOnboarding }) => {
  const [urlInput, setUrlInput] = useState('https://www.datadoghq.com');
  const [companyNameInput, setCompanyNameInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    let formattedUrl = urlInput.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    onStartOnboarding(formattedUrl, companyNameInput.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-lg shadow-lg">
            T
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-gradient">TACF AI</span>
            <span className="ml-2 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              BI Platform v1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onStartOnboarding('https://www.trane.com', 'Apex HVAC')}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            Try Demo Mode
          </button>
          <button
            onClick={() => onStartOnboarding('https://www.datadoghq.com')}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
          >
            Get Started ➔
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 border border-indigo-500/30 text-xs font-bold text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Brand-First Autonomous Business AI Twin</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight max-w-4xl">
          Turn Your Website Into an <span className="text-gradient">AI Executive Operating System</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Extract your company's Business DNA in 60 seconds. Our 13-node Knowledge Graph powers an autonomous executive team that monitors marketing, sales, and operations.
        </p>

        {/* TACF Beta Disclaimer Banner */}
        <div className="w-full max-w-xl rounded-xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950/80 border border-indigo-500/30 p-3.5 text-center text-xs text-slate-300 space-y-1 shadow-lg">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
            TACF Beta
          </div>
          <p className="text-slate-300 font-medium">
            Your Business DNA is generated from publicly available website signals. Review and approve information before activating AI workflows.
          </p>
        </div>

        {/* Self-Serve Onboarding Input Card */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl glass-card p-4 space-y-3 border-indigo-500/30 shadow-2xl rounded-2xl"
        >
          <div className="space-y-2 text-left px-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enter Your Company Website URL
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500 text-sm font-mono">https://</span>
              <input
                type="text"
                value={urlInput.replace(/^https?:\/\//, '')}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="company.com"
                className="w-full rounded-xl bg-slate-900 border border-white/10 pl-20 pr-4 py-3 text-sm text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-left px-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyNameInput}
              onChange={(e) => setCompanyNameInput(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-[11px] text-slate-400 flex-wrap">
            <span className="text-slate-500 font-sans">Or try a real company:</span>
            <button
              type="button"
              onClick={() => onStartOnboarding('https://www.datadoghq.com', 'Datadog')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500 hover:text-indigo-300 transition-all"
            >
              datadoghq.com
            </button>
            <button
              type="button"
              onClick={() => onStartOnboarding('https://www.trane.com', 'Trane Technologies')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500 hover:text-indigo-300 transition-all"
            >
              trane.com
            </button>
            <button
              type="button"
              onClick={() => onStartOnboarding('https://www.shopify.com', 'Shopify')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500 hover:text-indigo-300 transition-all"
            >
              shopify.com
            </button>
            <button
              type="button"
              onClick={() => onStartOnboarding('https://www.hubspot.com', 'HubSpot')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500 hover:text-indigo-300 transition-all"
            >
              hubspot.com
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm py-3.5 shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <span>Analyze My Business Website ➔</span>
          </button>
        </form>

        {/* Feature Pill Highlights */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full text-left text-xs">
          <div className="glass-card p-4 space-y-1">
            <div className="font-bold text-indigo-300">🧬 1. Business DNA Extraction</div>
            <div className="text-slate-400">Crawls website, extracts positioning, tone, ICP, and competitors automatically.</div>
          </div>
          <div className="glass-card p-4 space-y-1">
            <div className="font-bold text-purple-300">🧠 2. 13-Node Knowledge Graph</div>
            <div className="text-slate-400">Constructs a living Digital Twin that grounds every AI agent decision.</div>
          </div>
          <div className="glass-card p-4 space-y-1">
            <div className="font-bold text-emerald-300">⚡ 3. Auditable Executive Actions</div>
            <div className="text-slate-400">Generates marketing & sales recommendations with full evidence trails.</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-4 text-center text-xs text-slate-500">
        TACF Autonomous Business AI OS • Version 1.0 Production Release
      </footer>
    </div>
  );
};
