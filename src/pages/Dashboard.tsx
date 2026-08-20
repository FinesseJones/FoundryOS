"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    LayoutDashboard, 
    ClipboardList, 
    Users as ZapUsers, 
    Zap, 
    Code2, 
    TrendingUp, 
    ArrowUpRight, 
    Sparkles, 
    ShieldCheck, 
    Layers, 
    Search, 
    Globe, 
    Rocket
} from "lucide-react";

interface DashboardProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
    onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  return (
    <div className="space-y-8">
        {/* 1. TOP FEATURED SERVICES HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-900/50 border border-indigo-500/30 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-indigo-800/40">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Executive Strategic Offering</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Code2 className="w-8 h-8 text-indigo-400 shrink-0" />
                            <span>Digital Transformation & AI Audit Suite</span>
                        </h2>
                        <p className="text-slate-300 text-sm lg:text-base max-w-2xl">
                            Transform legacy, siloed enterprise digital assets into modern, high-converting, and scalable web platforms engineered for 2026+.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button 
                            onClick={() => onNavigate?.('branding')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm"
                        >
                            <Rocket className="w-4 h-4" />
                            <span>Launch AI Audit</span>
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => onNavigate?.('services')}
                            className="border-indigo-700/60 bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/60 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
                        >
                            <span>Explore Catalog</span>
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>

                {/* 3 Core Pillar Tiles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-black text-indigo-400 tracking-wider">AIEO</span>
                            <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-300 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">AI-Enhanced UX</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Augmented Intelligence Experience Optimization with automated behavioral adaptivity.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all group shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-black text-cyan-400 tracking-wider">AIO / GEO</span>
                            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-300 group-hover:scale-110 transition-transform">
                                <Globe className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">AI & Geolocation</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Hyper-local spatial intelligence and real-time distributed service routing.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-black text-emerald-400 tracking-wider">SEO & Authority</span>
                            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-300 group-hover:scale-110 transition-transform">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Search Capture</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Complete generative search authority capture and modern vector content indexing.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. OPERATIONAL METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Active Projects */}
            <Card className="bg-slate-900/90 border-slate-800 shadow-xl hover:border-slate-700 transition-all rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-indigo-400"/>
                        Active Projects
                    </CardTitle>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                        12 Live
                    </span>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-3xl font-black text-white">12</div>
                    <p className="text-xs text-slate-400">Ongoing client accounts requiring pipeline governance.</p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Next Review:</span>
                        <span className="text-indigo-400 uppercase font-semibold">Governance Phase</span>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Qualified Leads */}
            <Card className="bg-slate-900/90 border-slate-800 shadow-xl hover:border-slate-700 transition-all rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                        <ZapUsers className="w-4 h-4 text-emerald-400"/>
                        Qualified Leads
                    </CardTitle>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        High Priority
                    </span>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-3xl font-black text-white">3</div>
                    <p className="text-xs text-slate-400">High-intent enterprise pipeline opportunities.</p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Pipeline Velocity:</span>
                        <span className="text-emerald-400 uppercase font-semibold">Accelerated</span>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Trailing ARR */}
            <Card className="bg-slate-900/90 border-slate-800 shadow-xl hover:border-slate-700 transition-all rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400"/>
                        Pipeline Valuation
                    </CardTitle>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                        +24% YoY
                    </span>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-3xl font-black text-white">$15.0M+</div>
                    <p className="text-xs text-slate-400">Total estimated recurring revenue capacity.</p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Forecast Baseline:</span>
                        <span className="text-amber-400 font-semibold">Q2 2026</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* 3. QUICK NAVIGATION SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
                onClick={() => onNavigate?.('leads')}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all text-left flex items-center justify-between group"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Manage Pipeline</p>
                        <p className="text-sm font-bold text-white">Leads CRM</p>
                    </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button 
                onClick={() => onNavigate?.('projects')}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all text-left flex items-center justify-between group"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Track Governance</p>
                        <p className="text-sm font-bold text-white">Project Deep Dive</p>
                    </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button 
                onClick={() => onNavigate?.('analytics')}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all text-left flex items-center justify-between group"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">View Capacity</p>
                        <p className="text-sm font-bold text-white">Operations KPIs</p>
                    </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button 
                onClick={() => onNavigate?.('audit')}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all text-left flex items-center justify-between group"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Security Log</p>
                        <p className="text-sm font-bold text-white">Audit Trail</p>
                    </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </button>
        </div>
    </div>
  );
};

export default Dashboard;