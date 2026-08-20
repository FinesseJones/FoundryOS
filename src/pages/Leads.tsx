"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Users, 
    PlusCircle, 
    Search, 
    Sparkles, 
    Bot, 
    Radio, 
    CheckCircle2, 
    ArrowUpRight, 
    Filter, 
    Building2, 
    DollarSign, 
    Zap, 
    ExternalLink, 
    Trash2, 
    Edit, 
    Rocket,
    Globe,
    Layers,
    Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { logSystemEvent } from "@/utils/auditLogger";
import { LeadAgent, type DiscoveredLead } from "@/core/agents/lead-agent";
import { ContextBuilder } from "@/core/context";

// Interface for a single Lead opportunity
export interface Lead {
    id: number;
    companyName: string;
    primaryContact: string;
    currentStage: 'Discovery' | 'Proposal' | 'Evaluation' | 'Lost';
    status: 'High Priority' | 'Medium Priority' | 'Low Priority';
    pillarFinancialPain: string; // Money cost of inefficiency
    pillarProcessGap: string;  // Specific manual process choke point
    pillarStakeholderAlignment: string; // Who is the economic buyer
    website?: string;
    industry?: string;
    opportunityScore?: number;
    isAiSourced?: boolean;
    discoveredAt?: string;
}

interface LeadsProps {
    initialLeads: Lead[];
    currentUser: { role: string; permissions: { [key: string]: boolean } };
    onOpenWebsiteStudio?: (lead: Lead) => void;
}

const Leads: React.FC<LeadsProps> = ({ initialLeads, currentUser, onOpenWebsiteStudio }) => {
    const [leads, setLeads] = useState<Lead[]>(initialLeads || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'high_priority' | 'discovery' | 'proposal'>('all');

    // Lead Agent Scout State
    const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);
    const [scoutIndustry, setScoutIndustry] = useState('saas');
    const [scoutStrategy, setScoutStrategy] = useState<'transformation' | 'financial_pain' | 'fast_close'>('transformation');
    const [scoutBatchSize, setScoutBatchSize] = useState(3);
    const [customTargetDomain, setCustomTargetDomain] = useState('');
    const [isScouting, setIsScouting] = useState(false);
    const [scoutStep, setScoutStep] = useState<string>('');

    // --- AUTONOMOUS LEAD AGENT RUNNER ---
    const handleRunLeadAgent = async () => {
        setIsScouting(true);
        setScoutStep('Initializing Autonomous Lead Prospecting Agent...');

        try {
            const contextBuilder = new ContextBuilder();
            const leadAgent = new LeadAgent(contextBuilder);

            await new Promise(r => setTimeout(r, 500));
            setScoutStep(`Scanning industry registries & web footprint for [${scoutIndustry.toUpperCase()}]...`);

            await new Promise(r => setTimeout(r, 600));
            setScoutStep('Auditing digital platforms, UX latency, and Core Web Vitals...');

            await new Promise(r => setTimeout(r, 600));
            setScoutStep('Quantifying annual revenue leakages & stakeholder hierarchy...');

            const discovered: DiscoveredLead[] = await leadAgent.discoverLeads({
                industry: scoutIndustry,
                strategy: scoutStrategy,
                batchSize: scoutBatchSize,
                customTargetDomain: customTargetDomain.trim() || undefined
            });

            await new Promise(r => setTimeout(r, 400));
            setScoutStep(`Synthesized ${discovered.length} qualified prospects with Opportunity Pillars.`);

            // Convert to Lead format and prepend
            const newLeads: Lead[] = discovered.map(d => ({
                id: d.id,
                companyName: d.companyName,
                primaryContact: d.primaryContact,
                currentStage: d.currentStage,
                status: d.status,
                pillarFinancialPain: d.pillarFinancialPain,
                pillarProcessGap: d.pillarProcessGap,
                pillarStakeholderAlignment: d.pillarStakeholderAlignment,
                website: d.website,
                industry: d.industry,
                opportunityScore: d.opportunityScore,
                isAiSourced: true,
                discoveredAt: d.discoveredAt
            }));

            setLeads(prev => [...newLeads, ...prev]);
            logSystemEvent('Leads', 'CREATE', `Lead Agent discovered and ingested ${newLeads.length} leads in ${scoutIndustry}.`, currentUser.role);
            toast.success(`🤖 Lead Agent successfully prospected and added ${newLeads.length} high-value leads!`);

            setIsScouting(false);
            setIsScoutModalOpen(false);
            setCustomTargetDomain('');
        } catch (error) {
            console.error('Lead Agent error:', error);
            toast.error('Error running lead discovery agent. Please try again.');
            setIsScouting(false);
        }
    };

    // --- CRUD HANDLERS ---
    const handleAddLead = (formData: Omit<Lead, 'id'>) => {
        const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
        const newLead: Lead = { 
            id: newId, 
            ...formData, 
            currentStage: (formData.currentStage || 'Discovery') as Lead['currentStage'],
            status: (formData.status || 'Medium Priority') as Lead['status'],
            pillarFinancialPain: formData.pillarFinancialPain || '',
            pillarProcessGap: formData.pillarProcessGap || '',
            pillarStakeholderAlignment: formData.pillarStakeholderAlignment || ''
        };
        setLeads([newLead, ...leads]);
        logSystemEvent('Leads', 'CREATE', `New lead added: ${newLead.companyName} (${newLead.primaryContact})`, currentUser.role);
        toast.success(`✅ New lead (${newLead.companyName}) added successfully!`);
        setIsModalOpen(false);
        return { success: true };
    };

    const handleEditLead = (updatedData: Partial<Lead>) => {
        if (!editingLead) return { success: false, message: "Error: No lead selected for update." };

        setLeads(leads.map(l => 
            l.id === editingLead.id ? { ...l, ...updatedData } as Lead : l
        ));
        logSystemEvent('Leads', 'UPDATE', `Updated lead ${editingLead.companyName} status to ${updatedData.currentStage || editingLead.currentStage}`, currentUser.role);
        toast.success(`✅ Lead ${editingLead.companyName} updated successfully!`);
        setEditingLead(null);
        setIsModalOpen(false);
        return { success: true, message: `✅ Lead ${editingLead.companyName} updated successfully!` };
    };
    
    const handleCloseLead = (leadId: number) => {
        if (!currentUser.permissions.deleteCriticalRecords && currentUser.role !== "ADMIN") {
            toast.error("🔒 Permission Denied: You must be an Admin to eliminate a lead.");
            return { success: false, message: "Permission Denied" };
        }

        setLeads(leads.filter(l => l.id !== leadId));
        logSystemEvent('Leads', 'DELETE', `Lead ID ${leadId} removed from pipeline.`, currentUser.role);
        toast.success(`🗑️ Lead ID ${leadId} successfully archived.`);
        return { success: true, message: `🗑️ Lead ID ${leadId} successfully archived.` };
    };

    // Filter & Search computation
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = 
            lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.pillarFinancialPain.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.pillarProcessGap.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeFilter === 'ai') return lead.isAiSourced;
        if (activeFilter === 'high_priority') return lead.status === 'High Priority';
        if (activeFilter === 'discovery') return lead.currentStage === 'Discovery';
        if (activeFilter === 'proposal') return lead.currentStage === 'Proposal';

        return true;
    });

    const aiSourcedCount = leads.filter(l => l.isAiSourced).length;
    const highPriorityCount = leads.filter(l => l.status === 'High Priority').length;

    // --- Lead Form Modal ---
    const LeadFormModal = () => {
        const initialFormData: Partial<Lead> = editingLead 
            ? { ...editingLead }
            : { 
                companyName: '', 
                primaryContact: '', 
                website: '',
                currentStage: 'Discovery', 
                status: 'Medium Priority',
                pillarFinancialPain: '',
                pillarProcessGap: '',
                pillarStakeholderAlignment: ''
            };

        const [formState, setFormState] = useState<Partial<Lead>>({ ...initialFormData });
        
        React.useEffect(() => { setFormState({ ...initialFormData }); }, [editingLead]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormState(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (editingLead) {
                handleEditLead(formState);
            } else {
                handleAddLead(formState as Omit<Lead, 'id'>);
            }
        };

        return (
            <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span>{editingLead ? `Edit Lead: ${editingLead.companyName}` : "Add Potential Client Lead"}</span>
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Company Name *</label>
                            <Input 
                                type="text" 
                                name="companyName" 
                                value={formState.companyName || ''} 
                                onChange={handleChange} 
                                required
                                className="bg-slate-800/80 border-slate-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Contact Email *</label>
                            <Input 
                                type="text" 
                                name="primaryContact" 
                                value={formState.primaryContact || ''} 
                                onChange={handleChange} 
                                required
                                className="bg-slate-800/80 border-slate-700 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Website URL (Optional)</label>
                        <Input 
                            type="text" 
                            name="website" 
                            placeholder="https://example.com"
                            value={formState.website || ''} 
                            onChange={handleChange} 
                            className="bg-slate-800/80 border-slate-700 text-white"
                        />
                    </div>

                    {/* Three Pillars */}
                    <div className="space-y-3 border-t border-slate-800 pt-4">
                        <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
                            <Search className="w-4 h-4"/> 3 Pillars of Opportunity
                        </h4>
                        
                        <div>
                            <label className="block text-xs font-medium text-red-400 mb-1">1. Financial Pain (Annual Revenue/Overhead Loss)</label>
                            <textarea 
                                name="pillarFinancialPain"
                                placeholder="E.g., '$1.2M lost annually in overhead due to manual reconciliation.'"
                                value={(formState.pillarFinancialPain || '') as string} 
                                onChange={handleChange} 
                                className="w-full bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                rows={2}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-amber-400 mb-1">2. Process Gap (Digital & Technical Bottleneck)</label>
                            <textarea 
                                name="pillarProcessGap"
                                placeholder="E.g., 'Dated legacy portal with 5s LCP, failing mobile testing, lacking AIEO and GEO routing.'"
                                value={(formState.pillarProcessGap || '') as string} 
                                onChange={handleChange} 
                                className="w-full bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                rows={2}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-cyan-400 mb-1">3. Stakeholder Alignment (Key Economic Buyer)</label>
                            <textarea 
                                name="pillarStakeholderAlignment"
                                placeholder="E.g., 'Finance VP / CMO (Identified Executive Sponsor)'"
                                value={(formState.pillarStakeholderAlignment || '') as string} 
                                onChange={handleChange} 
                                className="w-full bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                rows={2}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Current Stage</label>
                            <select 
                                name="currentStage" 
                                value={(formState.currentStage || 'Discovery') as string} 
                                onChange={handleChange} 
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white"
                            >
                                <option value="Discovery">Discovery</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Evaluation">Evaluation</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Priority Status</label>
                            <select 
                                name="status" 
                                value={(formState.status || 'Medium Priority') as string} 
                                onChange={handleChange} 
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white"
                            >
                                <option value="High Priority">High Priority</option>
                                <option value="Medium Priority">Medium Priority</option>
                                <option value="Low Priority">Low Priority</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                        <Button type="button" onClick={() => { setEditingLead(null); setIsModalOpen(false); }} variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                            {editingLead ? "Save Changes" : "Create Lead"}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* 1. AUTONOMOUS LEAD AGENT HERO CONTROL BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Autonomous AI Prospecting Engine</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                <span>Autonomous Client Discovery Agent</span>
                            </h2>
                            <p className="text-slate-300 text-sm max-w-2xl">
                                Deploy our AI Lead Agent to continuously scout enterprise registries, quantify financial choke points ($ loss), and inject pre-qualified client opportunities with 3-pillar intelligence directly into your CRM.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Button 
                                onClick={() => setIsScoutModalOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 text-sm"
                            >
                                <Radio className="w-4 h-4 text-white animate-pulse" />
                                <span>Deploy Lead Agent</span>
                            </Button>
                            <Button 
                                onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
                                variant="outline"
                                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-semibold px-5 py-3 rounded-xl text-sm"
                            >
                                <PlusCircle className="w-4 h-4 mr-1.5" />
                                <span>Manual Lead</span>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Telemetry KPI Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-900/40">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                            <p className="text-[11px] font-semibold text-slate-400">Total Leads in Pipeline</p>
                            <p className="text-xl font-bold text-white mt-0.5">{leads.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                            <p className="text-[11px] font-semibold text-slate-400">🤖 AI-Sourced Prospects</p>
                            <p className="text-xl font-bold text-emerald-400 mt-0.5">{aiSourcedCount}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                            <p className="text-[11px] font-semibold text-slate-400">High-Priority Deals</p>
                            <p className="text-xl font-bold text-indigo-400 mt-0.5">{highPriorityCount}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                            <p className="text-[11px] font-semibold text-slate-400">Pipeline Valuation</p>
                            <p className="text-xl font-bold text-amber-400 mt-0.5">$15.0M+</p>
                        </div>
                    </div>
                </div>

                {/* 2. SEARCH & FILTER BAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                            placeholder="Search by company, contact, or financial pain..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-800/80 border-slate-700 text-white text-xs h-10 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeFilter === 'all' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            All ({leads.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('ai')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                                activeFilter === 'ai' 
                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Bot className="w-3.5 h-3.5" />
                            <span>AI Sourced ({aiSourcedCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter('high_priority')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeFilter === 'high_priority' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            High Priority ({highPriorityCount})
                        </button>
                        <button
                            onClick={() => setActiveFilter('discovery')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeFilter === 'discovery' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            Discovery
                        </button>
                        <button
                            onClick={() => setActiveFilter('proposal')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeFilter === 'proposal' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            Proposal
                        </button>
                    </div>
                </div>

                {/* 3. LEADS PIPELINE TABLE */}
                <div className="overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800 text-left">
                            <thead className="bg-slate-950/80">
                                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-6 py-3.5">Company & Prospect</th>
                                    <th className="px-6 py-3.5">Stage & Priority</th>
                                    <th className="px-6 py-3.5">1. Financial Mandate (Cost)</th>
                                    <th className="px-6 py-3.5">2. Process & Stakeholder Gap</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No matching leads found. Click <strong>Deploy Lead Agent</strong> to prospect new clients!
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white text-sm">{lead.companyName}</span>
                                                        {lead.isAiSourced && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                <Bot className="w-2.5 h-2.5" />
                                                                AI Agent
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <span>{lead.primaryContact}</span>
                                                        {lead.website && (
                                                            <a 
                                                                href={lead.website} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="text-indigo-400 hover:underline flex items-center gap-0.5"
                                                            >
                                                                <Globe className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                                <div>
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                        lead.currentStage === 'Discovery' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60' :
                                                        lead.currentStage === 'Proposal' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' :
                                                        lead.currentStage === 'Evaluation' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {lead.currentStage}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        lead.status === 'High Priority' ? 'text-red-400 bg-red-950/40 border border-red-800/40' :
                                                        lead.status === 'Medium Priority' ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40' :
                                                        'text-slate-400 bg-slate-800'
                                                    }`}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-xs font-semibold text-red-400 max-w-xs">
                                                {lead.pillarFinancialPain}
                                            </td>

                                            <td className="px-6 py-4 text-xs text-slate-300 max-w-sm space-y-1">
                                                <p><strong className="text-amber-400">Process Gap:</strong> {lead.pillarProcessGap}</p>
                                                <p><strong className="text-cyan-400">Buyer:</strong> {lead.pillarStakeholderAlignment}</p>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {onOpenWebsiteStudio && (
                                                        <button 
                                                            onClick={() => onOpenWebsiteStudio(lead)}
                                                            className="px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
                                                            title="Generate & Stage Client Website"
                                                        >
                                                            <Globe className="w-3 h-3 text-indigo-200" />
                                                            <span>Build Site</span>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => { setEditingLead(lead); setIsModalOpen(true); }}
                                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                                                        title="Edit Lead"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCloseLead(lead.id)}
                                                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-all"
                                                        title="Archive Lead"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. MODAL: DEPLOY AUTONOMOUS LEAD AGENT HUD */}
                {isScoutModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Deploy AI Lead Agent</h3>
                                        <p className="text-xs text-slate-400">Autonomous enterprise prospect finder</p>
                                    </div>
                                </div>
                                {!isScouting && (
                                    <button 
                                        onClick={() => setIsScoutModalOpen(false)}
                                        className="text-slate-400 hover:text-white text-sm"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {isScouting ? (
                                <div className="py-8 space-y-6 text-center">
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                        <Bot className="w-8 h-8 text-emerald-400 absolute" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-white">AI Agent is Scouting Prospects...</p>
                                        <p className="text-xs text-emerald-400 font-medium animate-pulse">{scoutStep}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Target Industry / Niche
                                        </label>
                                        <select 
                                            value={scoutIndustry} 
                                            onChange={(e) => setScoutIndustry(e.target.value)}
                                            className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="saas">B2B SaaS & Cloud Platforms</option>
                                            <option value="legal">Legal & Compliance Practices</option>
                                            <option value="healthcare">Healthcare & Clinical Networks</option>
                                            <option value="finance">Finance, Advisory & Wealth Mgmt</option>
                                            <option value="hvac">HVAC & Commercial Facility Services</option>
                                            <option value="ecommerce">High-Growth Direct-to-Consumer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Discovery Strategy
                                        </label>
                                        <select 
                                            value={scoutStrategy} 
                                            onChange={(e) => setScoutStrategy(e.target.value as any)}
                                            className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="transformation">🚀 Digital Transformation & AI Modernization</option>
                                            <option value="financial_pain">💰 Severe Annual Revenue Leakage ($500k+)</option>
                                            <option value="fast_close">⚡ Fast-Close Discovery Opportunities</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Specific Company or Target Domain (Optional)
                                        </label>
                                        <Input 
                                            placeholder="e.g. acme-corp.com or carriercrest.com"
                                            value={customTargetDomain}
                                            onChange={(e) => setCustomTargetDomain(e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white text-xs h-10 rounded-xl"
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">Leave empty to auto-scout the chosen industry directory.</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                        <Button 
                                            variant="secondary"
                                            onClick={() => setIsScoutModalOpen(false)}
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleRunLeadAgent}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Launch Lead Discovery</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. MODAL: MANUAL LEAD CREATION/EDITING */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="max-w-lg w-full">
                            <LeadFormModal />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Leads;
