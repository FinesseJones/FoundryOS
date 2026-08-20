"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Sparkles, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Code2, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  Building2, 
  Layers, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Star,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  generateClientWebsite, 
  generateStandaloneHtml, 
  WEBSITE_THEMES, 
  type GeneratedWebsite, 
  type WebsiteTheme 
} from "@/core/website-builder";
import { type Lead } from "./Leads";

interface WebsiteStudioProps {
  initialLead?: Lead | null;
  allLeads?: Lead[];
}

const WebsiteStudio: React.FC<WebsiteStudioProps> = ({ initialLead, allLeads = [] }) => {
  // Input parameters
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead ? String(initialLead.id) : 'custom');
  const [customCompanyName, setCustomCompanyName] = useState<string>(initialLead?.companyName || 'Apex Innovations');
  const [customIndustry, setCustomIndustry] = useState<string>(initialLead?.industry || 'saas');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('indigo');

  // Studio UI state
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewTab, setViewTab] = useState<'preview' | 'code'>('preview');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // When selected lead changes, update inputs
  const handleLeadSelect = (leadIdStr: string) => {
    setSelectedLeadId(leadIdStr);
    if (leadIdStr === 'custom') {
      setCustomCompanyName('Apex Innovations');
      setCustomIndustry('saas');
    } else {
      const found = allLeads.find(l => String(l.id) === leadIdStr);
      if (found) {
        setCustomCompanyName(found.companyName);
        setCustomIndustry(found.industry || 'saas');
      }
    }
  };

  // Generate website model
  const generatedWebsite: GeneratedWebsite = useMemo(() => {
    return generateClientWebsite({
      companyName: customCompanyName,
      industry: customIndustry,
      themeId: selectedThemeId,
    });
  }, [customCompanyName, customIndustry, selectedThemeId]);

  const activeTheme: WebsiteTheme = WEBSITE_THEMES[selectedThemeId] || WEBSITE_THEMES.indigo;
  const standaloneHtml: string = useMemo(() => {
    return generateStandaloneHtml(generatedWebsite);
  }, [generatedWebsite]);

  // Download standalone HTML file
  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWebsite.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`🎉 Downloaded standalone website package for ${generatedWebsite.companyName}!`);
  };

  // Copy HTML code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(standaloneHtml);
      setCopied(true);
      toast.success('📋 Production HTML copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  // Simulated AI regeneration
  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 600));
    setIsGenerating(false);
    toast.success(`✨ Regenerated custom website for ${generatedWebsite.companyName}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 1. STUDIO HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Website Studio & Staging Sandbox</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Client Website Generator
            </h1>
            <p className="text-slate-400 text-xs max-w-xl">
              Autonomously generate and stage high-converting, mobile-responsive websites for prospects and clients who do not have a modern digital footprint.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML' : 'Copy HTML'}</span>
            </Button>
            <Button
              onClick={handleDownloadHtml}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Website Package</span>
            </Button>
          </div>
        </div>

        {/* 2. CONFIGURATION & VIEWPORT CONTROLS BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
          {/* Client / Lead Selector */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Target Client / Prospect</label>
            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadSelect(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
            >
              <option value="custom">-- Custom Client --</option>
              {allLeads.map(l => (
                <option key={l.id} value={String(l.id)}>
                  {l.companyName} ({l.currentStage})
                </option>
              ))}
            </select>
          </div>

          {/* Business Name */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Company Name</label>
            <Input
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              placeholder="e.g. Apex Innovations"
              className="h-9 bg-slate-800 border-slate-700 text-white text-xs rounded-xl"
            />
          </div>

          {/* Industry Niche */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Industry Architecture</label>
            <select
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
            >
              <option value="saas">B2B SaaS / Enterprise Tech</option>
              <option value="legal">Legal Counsel & Advisory</option>
              <option value="healthcare">Healthcare & Clinical Network</option>
              <option value="hvac">HVAC & Facility Services</option>
            </select>
          </div>

          {/* Theme Selector */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Visual Theme</label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
            >
              {Object.values(WEBSITE_THEMES).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* View Mode & Viewport Switchers */}
          <div className="lg:col-span-3 flex items-end justify-between gap-2">
            {/* Viewport switcher */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg transition-all ${viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg transition-all ${viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg transition-all ${viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setViewTab('preview')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${viewTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewTab('code')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${viewTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Code2 className="w-3 h-3" />
                <span>Code</span>
              </button>
            </div>

            <Button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
              title="Regenerate Site Copy"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* 3. LIVE SANDBOX / CODE CANVAS */}
        <div className="flex justify-center items-start min-h-[680px]">
          {viewTab === 'code' ? (
            <div className="w-full rounded-3xl bg-slate-950 border border-slate-800 p-6 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>index.html (Self-Contained Tailwind CSS + Modern Architecture)</span>
                </div>
                <Button
                  onClick={handleCopyCode}
                  size="sm"
                  variant="outline"
                  className="border-slate-800 bg-slate-900 text-slate-300 text-xs"
                >
                  {copied ? 'Copied' : 'Copy All Code'}
                </Button>
              </div>
              <pre className="text-xs text-slate-300 font-mono overflow-x-auto p-4 bg-slate-900/80 rounded-2xl max-h-[600px] border border-slate-800/80 leading-relaxed">
                {standaloneHtml}
              </pre>
            </div>
          ) : (
            <div 
              className={`transition-all duration-300 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 ${
                viewportMode === 'mobile' ? 'w-[380px]' :
                viewportMode === 'tablet' ? 'w-[780px]' :
                'w-full'
              }`}
            >
              {/* Browser Mockup Chrome Bar */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="px-4 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 max-w-xs truncate">
                  <span>https://{generatedWebsite.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">
                  {viewportMode}
                </div>
              </div>

              {/* Rendered Live Website Sandbox Frame */}
              <div 
                style={{ backgroundColor: activeTheme.bgDark, color: activeTheme.textColor }}
                className="overflow-y-auto max-h-[720px] scroll-smooth selection:bg-indigo-500 selection:text-white"
              >
                {/* 1. Header */}
                <header style={{ backgroundColor: `${activeTheme.bgDark}ee`, borderColor: activeTheme.borderColor }} className="sticky top-0 z-20 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      style={{ background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.accentColor})` }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                    >
                      {generatedWebsite.companyName.charAt(0)}
                    </div>
                    <span className="font-extrabold text-base tracking-tight text-white">{generatedWebsite.companyName}</span>
                  </div>

                  <nav className="hidden md:flex items-center space-x-6 text-xs font-medium" style={{ color: activeTheme.mutedColor }}>
                    <span>Services</span>
                    <span>Why Us</span>
                    <span>Pricing</span>
                    <span>Reviews</span>
                  </nav>

                  <button
                    style={{ backgroundColor: activeTheme.primaryColor }}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white shadow-md transition-opacity hover:opacity-90"
                  >
                    {generatedWebsite.hero.ctaPrimary}
                  </button>
                </header>

                {/* 2. Hero Section */}
                <section className="pt-16 pb-12 px-6 text-center">
                  <div 
                    style={{ backgroundColor: `${activeTheme.primaryColor}25`, color: activeTheme.accentColor, borderColor: `${activeTheme.primaryColor}40` }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border mb-6"
                  >
                    <span>{generatedWebsite.hero.badge}</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-4">
                    {generatedWebsite.hero.headline}
                  </h1>
                  <p style={{ color: activeTheme.mutedColor }} className="text-xs sm:text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
                    {generatedWebsite.hero.subheadline}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button 
                      style={{ backgroundColor: activeTheme.primaryColor }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white text-xs shadow-lg transition-opacity hover:opacity-90"
                    >
                      {generatedWebsite.hero.ctaPrimary}
                    </button>
                    <button 
                      style={{ backgroundColor: activeTheme.cardBg, borderColor: activeTheme.borderColor, color: activeTheme.textColor }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs border transition-opacity hover:opacity-80"
                    >
                      {generatedWebsite.hero.ctaSecondary}
                    </button>
                  </div>

                  {/* Metrics Strip */}
                  <div className="max-w-4xl mx-auto mt-12">
                    <div 
                      style={{ backgroundColor: `${activeTheme.cardBg}cc`, borderColor: activeTheme.borderColor }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl border backdrop-blur-xl"
                    >
                      {generatedWebsite.metrics.map((m, idx) => (
                        <div key={idx} className="text-center">
                          <div style={{ color: activeTheme.accentColor }} className="text-2xl font-black">{m.value}</div>
                          <div style={{ color: activeTheme.mutedColor }} className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 3. Services Section */}
                <section style={{ borderColor: activeTheme.borderColor }} className="py-14 px-6 border-t">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-2xl font-extrabold text-white mb-2">Core Capabilities & Solutions</h2>
                    <p style={{ color: activeTheme.mutedColor }} className="text-xs">Engineered to solve operational bottlenecks and accelerate enterprise revenue.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {generatedWebsite.services.map((s, idx) => (
                      <div 
                        key={idx}
                        style={{ backgroundColor: activeTheme.cardBg, borderColor: activeTheme.borderColor }}
                        className="p-6 rounded-2xl border"
                      >
                        {s.badge && (
                          <span 
                            style={{ backgroundColor: `${activeTheme.primaryColor}20`, color: activeTheme.accentColor }}
                            className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3"
                          >
                            {s.badge}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                        <p style={{ color: activeTheme.mutedColor }} className="text-xs leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. Pricing Section */}
                <section style={{ backgroundColor: `${activeTheme.cardBg}40`, borderColor: activeTheme.borderColor }} className="py-14 px-6 border-t">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-2xl font-extrabold text-white mb-2">Transparent Investment Plans</h2>
                    <p style={{ color: activeTheme.mutedColor }} className="text-xs">Straightforward pricing aligned with measurable business outcomes.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl mx-auto items-stretch">
                    {generatedWebsite.pricing.map((p, idx) => (
                      <div 
                        key={idx}
                        style={{ 
                          backgroundColor: activeTheme.cardBg, 
                          borderColor: p.isPopular ? activeTheme.primaryColor : activeTheme.borderColor 
                        }}
                        className={`p-6 rounded-2xl border ${p.isPopular ? 'border-2 shadow-xl relative' : ''} flex flex-col justify-between`}
                      >
                        <div>
                          {p.isPopular && (
                            <div 
                              style={{ backgroundColor: activeTheme.primaryColor }}
                              className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full"
                            >
                              Most Popular
                            </div>
                          )}
                          <h3 className="text-base font-bold text-white">{p.name}</h3>
                          <p style={{ color: activeTheme.mutedColor }} className="text-[11px] mt-0.5 mb-4">{p.description}</p>
                          <div className="flex items-baseline mb-4">
                            <span className="text-2xl font-black text-white">{p.price}</span>
                            <span style={{ color: activeTheme.mutedColor }} className="text-[10px] ml-1">{p.period}</span>
                          </div>
                          <ul className="space-y-2 mb-6 text-[11px]">
                            {p.features.map((f, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-1.5">
                                <span style={{ color: activeTheme.accentColor }} className="font-bold">✓</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button 
                          style={{ backgroundColor: p.isPopular ? activeTheme.primaryColor : activeTheme.borderColor }}
                          className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-opacity hover:opacity-90"
                        >
                          {p.ctaText}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Contact / Lead Capture */}
                <section style={{ borderColor: activeTheme.borderColor }} className="py-14 px-6 border-t">
                  <div className="max-w-xl mx-auto p-8 rounded-3xl border shadow-xl" style={{ backgroundColor: activeTheme.cardBg, borderColor: activeTheme.borderColor }}>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-extrabold text-white mb-1.5">{generatedWebsite.leadCapture.headline}</h2>
                      <p style={{ color: activeTheme.mutedColor }} className="text-xs">{generatedWebsite.leadCapture.subheadline}</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); toast.success('Form submission simulated successfully!'); }} className="space-y-3">
                      <div>
                        <label style={{ color: activeTheme.mutedColor }} className="block text-[11px] font-semibold mb-1">Full Name</label>
                        <input type="text" required placeholder="Alex Mercer" style={{ backgroundColor: activeTheme.bgDark, borderColor: activeTheme.borderColor }} className="w-full px-3 py-2 rounded-xl border text-white text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label style={{ color: activeTheme.mutedColor }} className="block text-[11px] font-semibold mb-1">Business Email</label>
                        <input type="email" required placeholder="alex@company.com" style={{ backgroundColor: activeTheme.bgDark, borderColor: activeTheme.borderColor }} className="w-full px-3 py-2 rounded-xl border text-white text-xs focus:outline-none" />
                      </div>
                      <button 
                        type="submit"
                        style={{ backgroundColor: activeTheme.primaryColor }}
                        className="w-full py-3 rounded-xl font-bold text-white text-xs shadow-lg transition-opacity hover:opacity-90"
                      >
                        {generatedWebsite.leadCapture.ctaText}
                      </button>
                    </form>
                  </div>
                </section>

                {/* 6. Footer */}
                <footer style={{ borderColor: activeTheme.borderColor, color: activeTheme.mutedColor }} className="py-8 px-6 border-t text-center text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="font-bold text-white">{generatedWebsite.companyName}</div>
                  <div>{generatedWebsite.footer.tagline}</div>
                  <div>&copy; {generatedWebsite.footer.copyrightYear} {generatedWebsite.companyName}.</div>
                </footer>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WebsiteStudio;
