"use client";

import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Zap, Search, ShieldCheck, Rocket, Loader2, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useOllamaApi } from "@/hooks/useOllamaApi";
import { AccountManager, StoredBusinessDNA } from "@/core/saas/auth";

interface BrandingProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const BrandingCenter: React.FC<BrandingProps> = ({ currentUser }) => {
    const { generateContent } = useOllamaApi();
    const accountManager = AccountManager.getInstance();
    const currentSession = useMemo(() => accountManager.getCurrentSession(), [accountManager]);

    // Authoritative Business DNA retrieval
    const authoritativeDna = useMemo<StoredBusinessDNA | null>(() => {
        if (currentSession && currentSession.organizationId) {
            return accountManager.getBusinessDNA(currentSession.token, currentSession.organizationId);
        }
        return null;
    }, [currentSession, accountManager]);

    // Initial state initialized from Authoritative Business DNA (Zero duplicate entry)
    const [companyName, setCompanyName] = useState(authoritativeDna?.companyIdentity.companyName || 'TACF Autonomous Enterprise');
    const [industry, setIndustry] = useState(authoritativeDna?.companyIdentity.industry || 'technology_saas');
    const [mission, setMission] = useState(authoritativeDna?.companyIdentity.mission || '');
    const [uvp, setUvp] = useState(authoritativeDna?.companyIdentity.uniqueValueProposition || '');
    const [financialPain, setFinancialPain] = useState(authoritativeDna?.opportunityPillars.financialPain || '');
    const [processGap, setProcessGap] = useState(authoritativeDna?.opportunityPillars.processGap || '');
    const [stakeholderGap, setStakeholderGap] = useState(authoritativeDna?.opportunityPillars.stakeholderAlignment || '');
    const [tone, setTone] = useState(authoritativeDna?.brandVoice.primaryTone || 'Authoritative');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<Record<string, string>>({});

    // Keep fields synchronized when DNA loads or updates
    useEffect(() => {
        if (authoritativeDna) {
            setCompanyName(authoritativeDna.companyIdentity.companyName);
            setIndustry(authoritativeDna.companyIdentity.industry);
            setMission(authoritativeDna.companyIdentity.mission);
            setUvp(authoritativeDna.companyIdentity.uniqueValueProposition);
            setFinancialPain(authoritativeDna.opportunityPillars.financialPain);
            setProcessGap(authoritativeDna.opportunityPillars.processGap);
            setStakeholderGap(authoritativeDna.opportunityPillars.stakeholderAlignment);
            setTone(authoritativeDna.brandVoice.primaryTone);
        }
    }, [authoritativeDna]);

    const handleResyncDna = () => {
        if (authoritativeDna) {
            setCompanyName(authoritativeDna.companyIdentity.companyName);
            setIndustry(authoritativeDna.companyIdentity.industry);
            setMission(authoritativeDna.companyIdentity.mission);
            setUvp(authoritativeDna.companyIdentity.uniqueValueProposition);
            setFinancialPain(authoritativeDna.opportunityPillars.financialPain);
            setProcessGap(authoritativeDna.opportunityPillars.processGap);
            setStakeholderGap(authoritativeDna.opportunityPillars.stakeholderAlignment);
            setTone(authoritativeDna.brandVoice.primaryTone);
            toast.success("✨ Resynced inputs from Authoritative Business DNA!");
        }
    };

    // --- AI INTERACTION HANDLER ---
    const generateBrandAssets = async () => {
        if (!financialPain || !processGap || !stakeholderGap) {
            toast.error("⚠️ Please fill out or sync all three opportunity pillars to generate assets.");
            return;
        }

        setIsLoading(true);
        setGeneratedOutput({});

        const promptMessage = `
            Based on the following authoritative business intelligence, generate a complete Strategic Marketing and Positioning Guide for ${companyName}.
            
            **COMPANY DNA CORE:**
            - Company Name: ${companyName}
            - Industry: ${industry.replace('_', ' ')}
            - Core Mission: ${mission || 'Empower modern businesses through automated operational intelligence.'}
            - Unique Value Proposition (UVP): ${uvp || 'Deterministic AI workflows and automated client execution.'}
            - Brand Tone: ${tone}
            ${authoritativeDna?.brandVoice.wordsToUse ? `- Words to Emphasize: ${authoritativeDna.brandVoice.wordsToUse.join(', ')}` : ''}
            ${authoritativeDna?.brandVoice.wordsToAvoid ? `- Words to Avoid: ${authoritativeDna.brandVoice.wordsToAvoid.join(', ')}` : ''}
            ${authoritativeDna?.customerProfile.targetAudience ? `- Target Audience: ${authoritativeDna.customerProfile.targetAudience}` : ''}
            
            **3 OPPORTUNITY PILLARS (The Pain Points):**
            1. **Financial Pain (Money):** ${financialPain}
            2. **Process Gap (Process):** ${processGap}
            3. **Stakeholder Alignment (People):** ${stakeholderGap}

            **OUTPUT REQUIREMENTS:**
            Structure the response into these clear sections using executive, high-converting copywriting:
            
            **[1] The Core Value Proposition:** A bold declaration of ${companyName}'s core mission and unique market advantage.
            **[2] Three Tiered Taglines:** 
               1. Bold & Disruptive (For press and main hero)
               2. Direct & Pain-Focused (For digital ad campaigns)
               3. Trust & Enterprise-Focused (For board decks and handouts)
            **[3] Mission Statement:** A declarative statement of core organizational purpose.
            **[4] Value Pillars & Approved Vocabulary:** 5-7 powerful keywords and concepts aligned with our Business DNA.
        `;

        try {
            const result = await generateContent(promptMessage + "\n\nThe response must be formatted with markdown headers and lists for readability.");
            setGeneratedOutput({
                fullText: result || "Error generating content. Please try simplifying the input.",
            });
            toast.success("✨ Brand assets generated successfully from Business DNA!");
        } catch (e) {
            console.error(e);
            toast.error("❌ Failed to generate assets. Check the API endpoint or try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Display component for structured output
    const DisplayedOutput = generatedOutput.fullText ? (
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl shadow-inner text-slate-100 space-y-4">
            <div dangerouslySetInnerHTML={{ __html: generatedOutput.fullText.replace(/\n\n/g, '<br/><br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>') }} />
        </div>
    ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-400 bg-slate-950/40">
            <Zap className="w-8 h-8 mx-auto mb-2 text-indigo-400 opacity-60"/>
            <p className="text-sm font-medium text-slate-300">Click "Generate Brand Positioning Guide" to synthesize your branding suite from your Business DNA.</p>
            <p className="text-xs text-slate-500 mt-1">Zero duplicate data entry · Automatically pulls your UVP, mission, and 3 pillars.</p>
        </div>
    );

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* Authoritative DNA Connection Banner */}
                {authoritativeDna && (
                    <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">Authoritative Business DNA Active</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                                        <CheckCircle2 className="w-3 h-3" /> Auto-Synced
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-white mt-0.5">
                                    {authoritativeDna.companyIdentity.companyName} <span className="text-xs text-slate-400 font-normal font-mono">({authoritativeDna.companyIdentity.industry.replace('_', ' ')})</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleResyncDna}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-sync from DNA</span>
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Strategic Branding Center</h1>
                    <p className="text-sm text-slate-400 max-w-3xl">
                        Synthesize your company's authoritative Business DNA and 3 Opportunity Pillars into ready-to-use executive messaging, taglines, and marketing positioning.
                    </p>
                </div>

                <Card className="border-slate-800 bg-slate-900/80 shadow-2xl">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle className="text-xl flex items-center space-x-3 text-white">
                            <Rocket className="w-6 h-6 text-indigo-400"/>
                            <span>Brand Messaging Engine</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Input Column 1: Pre-filled from Authoritative DNA */}
                            <div className="lg:col-span-1 space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Company Name</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Financial Pain (Opportunity Pillar 1)</label>
                                    <textarea
                                        rows={2}
                                        value={financialPain}
                                        onChange={(e) => setFinancialPain(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                                        placeholder="e.g. $1.2M in annual overhead lost to execution friction"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Process Gap (Opportunity Pillar 2)</label>
                                    <textarea
                                        rows={2}
                                        value={processGap}
                                        onChange={(e) => setProcessGap(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                                        placeholder="e.g. Manual departmental handoffs and fragmented tools"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Stakeholder Alignment (Opportunity Pillar 3)</label>
                                    <input
                                        type="text"
                                        value={stakeholderGap}
                                        onChange={(e) => setStakeholderGap(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="e.g. VP of Operations (Direct Sponsor)"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">Desired Brand Voice</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        <option value="Authoritative">Authoritative & Visionary</option>
                                        <option value="Technical">Technical & Precise</option>
                                        <option value="Direct">Direct & High-Impact</option>
                                        <option value="Supportive">Supportive & Trust-Focused</option>
                                    </select>
                                </div>

                                <Button
                                    onClick={generateBrandAssets}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Synthesizing from Business DNA...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Generate Brand Positioning Guide</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Output Column 2: Result Canvas */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Synthesized Brand Positioning Suite</span>
                                </h3>
                                {DisplayedOutput}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default BrandingCenter;