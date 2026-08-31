"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
} from "@/core/website-builder/website-generator";
import { type Lead } from "./Leads";
import { AccountManager, StoredBusinessDNA } from "@/core/saas/auth";

interface WebsiteStudioProps {
  initialLead?: Lead | null;
  allLeads?: Lead[];
}

const WebsiteStudio: React.FC<WebsiteStudioProps> = ({ initialLead, allLeads = [] }) => {
  const accountManager = AccountManager.getInstance();
  const currentSession = useMemo(() => accountManager.getCurrentSession(), [accountManager]);

  // Retrieve Authoritative Business DNA (Zero duplicate data entry)
  const authoritativeDna = useMemo<StoredBusinessDNA | null>(() => {
    if (currentSession && currentSession.organizationId) {
      return accountManager.getBusinessDNA(currentSession.token, currentSession.organizationId);
    }
    return null;
  }, [currentSession, accountManager]);

  // Input parameters: Defaults to Authoritative DNA if available
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    initialLead ? `lead_${initialLead.id}` : authoritativeDna ? 'authoritative_dna' : 'custom'
  );

  const [customCompanyName, setCustomCompanyName] = useState<string>(
    initialLead?.companyName || authoritativeDna?.companyIdentity.companyName || 'Environment Masters, Inc. (Jackson, MS)'
  );

  const [customIndustry, setCustomIndustry] = useState<string>(
    initialLead?.industry || authoritativeDna?.companyIdentity.industry || 'hvac_plumbing_electrical'
  );

  const [financialPain, setFinancialPain] = useState<string>(
    initialLead?.pillarFinancialPain || authoritativeDna?.opportunityPillars.financialPain || '$180k/yr excess commercial HVAC cooling costs in MS humidity'
  );

  const [processGap, setProcessGap] = useState<string>(
    initialLead?.pillarProcessGap || authoritativeDna?.opportunityPillars.processGap || 'Lacks 24/7 DDC building telemetry and sub-15s missed-call auto-text'
  );

  const [selectedThemeId, setSelectedThemeId] = useState<string>('indigo');

  // Studio UI state
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewTab, setViewTab] = useState<'preview' | 'code'>('preview');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync state if authoritative DNA loads
  useEffect(() => {
    if (authoritativeDna && !initialLead && selectedSourceId === 'authoritative_dna') {
      setCustomCompanyName(authoritativeDna.companyIdentity.companyName);
      setCustomIndustry(authoritativeDna.companyIdentity.industry);
      setFinancialPain(authoritativeDna.opportunityPillars.financialPain);
      setProcessGap(authoritativeDna.opportunityPillars.processGap);
    }
  }, [authoritativeDna, initialLead, selectedSourceId]);

  // When selected source changes
  const handleSourceSelect = (sourceIdStr: string) => {
    setSelectedSourceId(sourceIdStr);

    if (sourceIdStr === 'authoritative_dna' && authoritativeDna) {
      setCustomCompanyName(authoritativeDna.companyIdentity.companyName);
      setCustomIndustry(authoritativeDna.companyIdentity.industry);
      setFinancialPain(authoritativeDna.opportunityPillars.financialPain);
      setProcessGap(authoritativeDna.opportunityPillars.processGap);
      toast.success(`✨ Synced inputs from Authoritative DNA: ${authoritativeDna.companyIdentity.companyName}`);
    } else if (sourceIdStr === 'custom') {
      setCustomCompanyName('Environment Masters, Inc. (Jackson, MS)');
      setCustomIndustry('hvac_plumbing_electrical');
      setFinancialPain('$180k/yr excess commercial chiller cooling costs');
      setProcessGap('Lacks sub-15s missed call auto-text dispatch');
    } else if (sourceIdStr.startsWith('lead_')) {
      const leadIdNum = Number(sourceIdStr.replace('lead_', ''));
      const found = allLeads.find(l => l.id === leadIdNum);
      if (found) {
        setCustomCompanyName(found.companyName);
        setCustomIndustry(found.industry || 'saas');
        setFinancialPain(found.pillarFinancialPain || '');
        setProcessGap(found.pillarProcessGap || '');
        toast.success(`✨ Loaded Lead: ${found.companyName}`);
      }
    }
  };

  // Generate website model using authoritative DNA data
  const generatedWebsite: GeneratedWebsite = useMemo(() => {
    return generateClientWebsite({
      companyName: customCompanyName,
      industry: customIndustry,
      processGap,
      financialPain,
      themeId: selectedThemeId,
    });
  }, [customCompanyName, customIndustry, processGap, financialPain, selectedThemeId]);

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

  // Viewport width styling
  const viewportWidthClass = useMemo(() => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[390px] shadow-2xl border-x-4 border-slate-700 rounded-3xl overflow-hidden';
      case 'tablet':
        return 'max-w-[768px] shadow-2xl border-x-2 border-slate-700 rounded-2xl overflow-hidden';
      case 'desktop':
      default:
        return 'w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700';
    }
  }, [viewportMode]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Authoritative DNA Active Banner */}
        {authoritativeDna && (
          <div className="rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">Authoritative Business DNA Connected</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Auto-Compiled
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Building site for <strong className="text-white font-bold">{authoritativeDna.companyIdentity.companyName}</strong> using UVP: <em>"{authoritativeDna.companyIdentity.uniqueValueProposition}"</em>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSourceSelect('authoritative_dna')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync from Authoritative DNA</span>
            </button>
          </div>
        )}

        {/* Studio Header HUD */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Autonomous Website Compilation Studio</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                AI Website Builder & Client Staging Sandbox
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Autonomously compiles multi-section, responsive client websites from your Authoritative Business DNA with zero manual design friction.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-xs font-semibold text-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Content</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-xs font-semibold text-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                <span>{copied ? 'Copied' : 'Copy HTML'}</span>
              </Button>

              <Button
                size="sm"
                onClick={handleDownloadHtml}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>Download HTML Package</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Studio Control Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl text-xs">
          {/* Client / DNA Source Selector */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Intelligence Data Source</label>
            <select
              value={selectedSourceId}
              onChange={(e) => handleSourceSelect(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              {authoritativeDna && (
                <option value="authoritative_dna">★ My Authoritative DNA: {authoritativeDna.companyIdentity.companyName}</option>
              )}
              <optgroup label="CRM Prospects & Leads">
                {allLeads.map(l => (
                  <option key={l.id} value={`lead_${l.id}`}>
                    {l.companyName} ({l.currentStage})
                  </option>
                ))}
              </optgroup>
              <option value="custom">Custom Parameters (Manual Entry)</option>
            </select>
          </div>

          {/* Company Name */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Target Company</label>
            <Input
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="h-9 bg-slate-800 border-slate-700 text-white text-xs rounded-xl"
            />
          </div>

          {/* Industry Niche */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Industry Architecture</label>
            <select
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="technology_saas">B2B SaaS / Enterprise AI</option>
              <option value="saas">Cloud & SaaS Platform</option>
              <option value="legal">Legal Counsel & Compliance</option>
              <option value="healthcare">Healthcare & Clinical Network</option>
              <option value="hvac">HVAC & Field Operations</option>
              <option value="consulting">Management & Strategy Consulting</option>
            </select>
          </div>

          {/* Theme Selector */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Visual Theme</label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
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
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setViewTab('preview')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${viewTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewTab('code')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${viewTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Code2 className="w-3 h-3" />
                <span>Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Canvas Viewport */}
        <div className="min-h-[700px] flex justify-center items-start bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shadow-2xl">
          {viewTab === 'preview' ? (
            <div className={`transition-all duration-300 ${viewportWidthClass} bg-slate-900`}>
              <iframe
                title="Website Live Preview"
                srcDoc={standaloneHtml}
                className="w-full h-[760px] border-none bg-slate-900"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full rounded-xl bg-slate-900 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[760px]">
              <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-800 text-slate-400">
                <span>standalone-index.html ({Math.round(standaloneHtml.length / 1024)} KB)</span>
                <Button size="sm" variant="ghost" onClick={handleCopyCode} className="text-xs text-indigo-400 hover:text-indigo-300">
                  <Copy className="w-3 h-3 mr-1" /> Copy Full HTML
                </Button>
              </div>
              <pre className="text-indigo-300 whitespace-pre-wrap">{standaloneHtml}</pre>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WebsiteStudio;
