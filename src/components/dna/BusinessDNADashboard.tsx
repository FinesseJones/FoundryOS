import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  Target, 
  Compass, 
  Palette, 
  Edit3, 
  Download, 
  RefreshCw, 
  Check, 
  ChevronRight,
  ExternalLink,
  BookOpen,
  X
} from 'lucide-react';
import { StoredBusinessDNA, AccountManager, UserSession } from '../../core/saas/auth';

interface BusinessDNADashboardProps {
  dna: StoredBusinessDNA;
  session: UserSession;
  onDnaUpdated?: (updated: StoredBusinessDNA) => void;
}

export const BusinessDNADashboard: React.FC<BusinessDNADashboardProps> = ({
  dna,
  session,
  onDnaUpdated
}) => {
  const accountManager = AccountManager.getInstance();
  const [currentDna, setCurrentDna] = useState<StoredBusinessDNA>(dna);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Edit Form State
  const [editMission, setEditMission] = useState(currentDna.companyIdentity.mission);
  const [editUvp, setEditUvp] = useState(currentDna.companyIdentity.uniqueValueProposition);
  const [editFinancialPain, setEditFinancialPain] = useState(currentDna.opportunityPillars.financialPain);
  const [editProcessGap, setEditProcessGap] = useState(currentDna.opportunityPillars.processGap);
  const [editTone, setEditTone] = useState(currentDna.brandVoice.primaryTone);

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.organizationId) return;

    try {
      const updated = accountManager.updateBusinessDNA(session.token, session.organizationId, {
        companyIdentity: {
          ...currentDna.companyIdentity,
          mission: editMission.trim(),
          uniqueValueProposition: editUvp.trim(),
        },
        opportunityPillars: {
          ...currentDna.opportunityPillars,
          financialPain: editFinancialPain.trim(),
          processGap: editProcessGap.trim(),
        },
        brandVoice: {
          ...currentDna.brandVoice,
          primaryTone: editTone.trim(),
        },
      });

      setCurrentDna(updated);
      setIsEditing(false);
      if (onDnaUpdated) onDnaUpdated(updated);
    } catch (err: any) {
      console.error('Failed to update Business DNA:', err);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(currentDna, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDna.companyIdentity.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-business-dna.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyBusinessId = () => {
    navigator.clipboard.writeText(currentDna.businessId);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── Hero Overview Header ────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-white/[0.1] p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Authoritative Business DNA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Confidence: {Math.round(currentDna.confidenceScore * 100)}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                Schema v{currentDna.schemaVersion}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentDna.companyIdentity.companyName}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>Business ID:</span>
                <button
                  onClick={handleCopyBusinessId}
                  className="text-indigo-300 hover:text-white underline cursor-pointer"
                >
                  {currentDna.businessId}
                </button>
                {copiedNotification && <span className="text-emerald-400 text-[10px]">Copied!</span>}
              </span>
              <span>•</span>
              <a
                href={currentDna.websiteAnalysis.primaryUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-300 flex items-center gap-1"
              >
                <span>{currentDna.websiteAnalysis.primaryUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Refine / Edit DNA</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 13-Node Knowledge Graph Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node 1: Core Identity & UVP */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">1. Company Identity & Core Value Proposition</h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              {currentDna.companyIdentity.industry.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Mission Statement</p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-950/60 p-3.5 rounded-xl border border-white/[0.05]">
                "{currentDna.companyIdentity.mission}"
              </p>
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Unique Value Proposition (UVP)</p>
              <p className="text-sm text-indigo-300 leading-relaxed font-semibold bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">
                {currentDna.companyIdentity.uniqueValueProposition}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Core Values</p>
              <div className="flex flex-wrap gap-2">
                {currentDna.companyIdentity.coreValues.map((val, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-300 font-medium">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Node 2: Opportunity Pillars */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">2. 3 Opportunity Pillars</h2>
          </div>

          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-red-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Financial Pain</span>
              </div>
              <p className="text-xs text-slate-200">{currentDna.opportunityPillars.financialPain}</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Process Gap</span>
              </div>
              <p className="text-xs text-slate-200">{currentDna.opportunityPillars.processGap}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Sponsor</span>
              </div>
              <p className="text-xs text-slate-200">{currentDna.opportunityPillars.stakeholderAlignment}</p>
            </div>
          </div>
        </div>

        {/* Node 3: Brand Voice & Guardrails */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-600/10 text-purple-400 border border-purple-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">3. Brand Voice & Tone</h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
              {currentDna.brandVoice.primaryTone}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-2">Approved Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {currentDna.brandVoice.wordsToUse.map((w, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                    +{w}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-mono text-red-400 uppercase tracking-wider mb-2">Guardrail Disallowed Words</p>
              <div className="flex flex-wrap gap-1.5">
                {currentDna.brandVoice.wordsToAvoid.map((w, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-500/30 text-xs font-mono">
                    ✕ {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Node 4: Ideal Customer Profile & Personas */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">4. Customer Profile & Personas</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Audience</p>
              <p className="text-xs text-slate-300">{currentDna.customerProfile.targetAudience}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Buyer Personas</p>
              {currentDna.customerProfile.buyerPersonas.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05] space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[10px] font-mono text-indigo-400">{p.role}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.challenges.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node 5: Visual Palette & Competitive Positioning */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <div className="p-2 rounded-lg bg-pink-600/10 text-pink-400 border border-pink-500/20">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">5. Visual Palette & Brand Signals</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Ingested Color Swatches</p>
              <div className="flex items-center gap-2">
                {currentDna.websiteAnalysis.colors.map((hex, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div 
                      className="w-8 h-8 rounded-lg border border-white/20 shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                    <span className="text-[9px] font-mono text-slate-500">{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Market Positioning</p>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/[0.05]">
                {currentDna.competitivePositioning.marketPosition}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Refine DNA Modal ────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#0c1017] shadow-2xl text-slate-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveEdits} className="p-8 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Refine Business DNA</h2>
                <p className="text-xs text-slate-400">Updates are immediately saved permanently to your tenant repository.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Mission Statement</label>
                <textarea
                  rows={2}
                  required
                  value={editMission}
                  onChange={(e) => setEditMission(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Unique Value Proposition</label>
                <textarea
                  rows={2}
                  required
                  value={editUvp}
                  onChange={(e) => setEditUvp(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Financial Pain</label>
                  <input
                    type="text"
                    required
                    value={editFinancialPain}
                    onChange={(e) => setEditFinancialPain(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Process Gap</label>
                  <input
                    type="text"
                    required
                    value={editProcessGap}
                    onChange={(e) => setEditProcessGap(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Primary Tone</label>
                <select
                  value={editTone}
                  onChange={(e) => setEditTone(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="authoritative">Authoritative & Visionary</option>
                  <option value="technical">Technical & Precise</option>
                  <option value="collaborative">Collaborative & Supportive</option>
                  <option value="disruptive">Disruptive & Energetic</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
