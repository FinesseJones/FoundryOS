import React, { useState } from 'react';
import { ViewTab } from '../Navbar';
import { DNAProgressScreen } from './DNAProgressScreen';
import { DNABeautifiedReport } from './DNABeautifiedReport';
import { BusinessDNA, createDefaultBusinessDNA } from '../../core/knowledge';

interface DNAAnalysisExperienceProps {
  dna: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
  onDNAUpdated: (newDNA: BusinessDNA) => void;
}

export const DNAAnalysisExperience: React.FC<DNAAnalysisExperienceProps> = ({
  dna,
  setActiveTab,
  onDNAUpdated,
}) => {
  const [phase, setPhase] = useState<'input' | 'analyzing' | 'report'>('input');
  const [websiteUrl, setWebsiteUrl] = useState('https://hyperdrive-ai.com');
  const [companyName, setCompanyName] = useState('HyperDrive AI Systems');
  const [activeDNA, setActiveDNA] = useState<BusinessDNA>(dna);

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('analyzing');
  };

  const handleProgressComplete = () => {
    const generatedDNA = createDefaultBusinessDNA(`biz_${Date.now()}`, {
      companyIdentity: {
        companyName: { value: companyName },
        industry: { value: 'saas' },
        stage: { value: 'growth' },
        mission: { value: 'Accelerating AI workflow latency by 10x with zero infrastructure overhead.' },
        uniqueValueProposition: { value: 'The fastest, most reliable self-learning AI Knowledge Engine on the market.' },
        coreValues: { value: ['Ultra Latency', 'Zero Latency Drift', 'Enterprise Integrity'] },
      },
      brandVoice: {
        primaryTone: { value: 'authoritative' },
        secondaryTones: { value: ['technical', 'confident'] },
        wordsToUse: { value: ['ultra-fast', 'deterministic', 'seamless', 'scale'] },
        wordsToAvoid: { value: ['cheap', 'synergy', 'disruptive'] },
      },
      customerProfile: {
        targetAudience: { value: 'Senior AI System Architects & VP of Marketing Leaders' },
        primaryPainPoints: { value: ['AI model hallucinations', 'Slow execution latency'] },
      },
      websiteAnalysis: {
        primaryUrl: { value: websiteUrl },
      },
    });

    setActiveDNA(generatedDNA);
    onDNAUpdated(generatedDNA);
    setPhase('report');
  };

  if (phase === 'analyzing') {
    return <DNAProgressScreen websiteUrl={websiteUrl} onComplete={handleProgressComplete} />;
  }

  if (phase === 'report') {
    return <DNABeautifiedReport dna={activeDNA} setActiveTab={setActiveTab} onReset={() => setPhase('input')} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-12">
      {/* Experience Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
          <span>⚡ Phase Two Business DNA Experience</span>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-100 sm:text-5xl">
          Upload Your Digital Footprint & <span className="text-gradient">Extract Business DNA</span>
        </h1>

        <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-400 leading-relaxed">
          First Impression Intelligence Engine. Submit your website URL to trigger real-time signal crawling, tone distribution profiling, and confidence extraction.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-card p-8 space-y-6 border-indigo-500/30">
        <form onSubmit={handleStartAnalysis} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold text-slate-200 text-sm block">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3.5 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-200 text-sm block">Primary Website URL to Crawl</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3.5 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="https://yourcompany.com"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-semibold">Or try sample digital footprint:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompanyName('HyperDrive AI Systems');
                  setWebsiteUrl('https://hyperdrive-ai.com');
                }}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-slate-300 border border-white/10 font-mono"
              >
                https://hyperdrive-ai.com
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompanyName('Acme Technologies');
                  setWebsiteUrl('https://acme-tech.com');
                }}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-slate-300 border border-white/10 font-mono"
              >
                https://acme-tech.com
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-4 font-extrabold text-sm text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.01] transition-all"
          >
            Start Real-Time DNA Extraction & Signal Crawl ⚡
          </button>
        </form>
      </div>
    </div>
  );
};
