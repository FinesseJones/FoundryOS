"use client";

import React, { Suspense, useState } from 'react';
import { ToasterProvider } from './components/ToastProvider';
import { 
    LayoutDashboard, 
    Users as UsersIcon, 
    ClipboardList, 
    Zap, 
    Tag, 
    SlidersHorizontal, 
    TrendingUp, 
    Rocket,
    Shield,
    Activity,
    ChevronRight,
    Sparkles,
    FileText,
    Globe
} from 'lucide-react';

// Import all pages and the new log page
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import ProjectDashboardPage from './pages/ProjectDashboard';
import Leads, { type Lead } from './pages/Leads';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import BrandingCenter from './pages/BrandingCenter';
import ServicesCatalog from './pages/ServicesCatalog';
import WebsiteStudio from './pages/WebsiteStudio';
import Reports from './pages/Reports';
import CustomerIntelligence from './pages/CustomerIntelligence';

// =============================================================
// MOCK AUTHENTICATED USER STATE
// =============================================================
const MOCK_CURRENT_USER: { role: string; permissions: { [key: string]: boolean } } = {
    role: "ADMIN",
    permissions: {
        userManagement: true,
        settingsManagement: true,
        ollamaAccess: true,
        deleteCriticalRecords: true,
        viewAuditLogs: true,
    }
};

// =============================================================
// MOCK DATA
// =============================================================
const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@corp.com', role: 'ADMIN' as const, department: 'Executive', status: true },
    { id: 2, name: 'Bob Johnson', email: 'bob@corp.com', role: 'SUPPORT' as const, department: 'Support', status: true },
    { id: 3, name: 'Charlie Brown', email: 'charlie@corp.com', role: 'BASIC' as const, department: 'Marketing', status: false },
    { id: 4, name: 'Diana Prince', email: 'diana@corp.com', role: 'ADMIN_PRO' as const, department: 'Finance', status: true },
];

const mockLeads = [
    { id: 1, companyName: 'Innovate Corp', primaryContact: 'Jane Doe', currentStage: 'Evaluation' as const, status: 'High Priority' as const, pillarFinancialPain: '$1.2M lost annually in overhead.', pillarProcessGap: 'Manual reconciliation between departments.', pillarStakeholderAlignment: 'Finance VP (Identified Sponsor).' },
    { id: 2, companyName: 'Zenith Retail', primaryContact: 'Mark Lee', currentStage: 'Discovery' as const, status: 'Medium Priority' as const, pillarFinancialPain: 'Slow checkout conversion rate.', pillarProcessGap: 'The main website is outdated and fails mobile testing.', pillarStakeholderAlignment: 'Operations Manager (Champion).' },
    { id: 3, companyName: 'Global Energy', primaryContact: 'Alex Kim', currentStage: 'Lost' as const, status: 'Low Priority' as const, pillarFinancialPain: 'Unknown.', pillarProcessGap: 'Unknown.', pillarStakeholderAlignment: 'None (Initial conversation only).' },
];

const mockProjectProps = {
    projectName: "Global Platform Overhaul",
    clientName: "TechCorp Global",
    initialProject: {
        name: "Global Platform Overhaul",
        client: "TechCorp Global",
        status: 'Discovery' as const,
        progress: 10,
        totalBudget: 500000,
        budgetSpent: 0,
        dueDate: '2025-06-30',
        currentPhase: 'Initiation' as const,
    }
};

interface NavItemConfig {
    name: string;
    page: string;
    icon: React.ElementType;
    badge?: string;
    section: 'core' | 'tools' | 'admin';
}

const navItems: NavItemConfig[] = [
    { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard, section: 'core' },
    { name: 'Business DNA OS', page: 'customer_intelligence', icon: Sparkles, badge: 'AI OS', section: 'core' },
    { name: 'Services Catalog', page: 'services', icon: Tag, badge: 'New', section: 'core' },
    { name: 'Branding Center', page: 'branding', icon: Rocket, badge: 'AI', section: 'core' },
    { name: 'Website Studio', page: 'studio', icon: Globe, badge: 'New', section: 'tools' },
    { name: 'Projects', page: 'projects', icon: ClipboardList, section: 'tools' },
    { name: 'Leads CRM', page: 'leads', icon: Zap, section: 'tools' },
    { name: 'Analytics & KPIs', page: 'analytics', icon: TrendingUp, section: 'tools' },
    { name: 'Reports & Revenue', page: 'reports', icon: FileText, section: 'tools' },
    { name: 'Users & Teams', page: 'users', icon: UsersIcon, section: 'admin' },
    { name: 'Audit Trail', page: 'audit', icon: Shield, section: 'admin' },
    { name: 'Settings', page: 'settings', icon: SlidersHorizontal, section: 'admin' }
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: "Executive Dashboard", subtitle: "Real-time governance, revenue forecasting, and strategic consulting services." },
    customer_intelligence: { title: "Business DNA & Customer Intelligence OS", subtitle: "Live multi-domain intelligence across Marketing, Sales, Operations, and Zero-Trust Security." },
    services: { title: "Services Catalog & Offerings", subtitle: "Strategic transformation blueprints, digital audits, and deliverables." },
    branding: { title: "AI Branding & Positioning Center", subtitle: "Generate automated market positioning, taglines, and value proposition guides." },
    studio: { title: "AI Website Studio & Staging Sandbox", subtitle: "Autonomously generate, preview, customize, and export client websites." },
    projects: { title: "Project Governance & Deep Dive", subtitle: "Track milestones, budget burn, risk ratings, and delivery phases." },
    leads: { title: "Client Pipeline & Opportunity CRM", subtitle: "Analyze economic feasibility, process gaps, and key executive sponsors." },
    analytics: { title: "Operations Analytics & Capacity", subtitle: "Departmental workload forecasting, lead time bottlenecks, and recommendations." },
    reports: { title: "Financial & Operational Reports", subtitle: "Multi-currency financial forecasting, spent budget analysis, and delivery reports." },
    users: { title: "User & Team Directory", subtitle: "Manage enterprise accounts, RBAC permissions, and team assignments." },
    audit: { title: "System Audit Logs", subtitle: "Immutable chronological trail of security, data updates, and governance events." },
    settings: { title: "Global System Settings", subtitle: "Configure multi-currency baselines, time zones, and reporting defaults." }
};

// --- Main App Router and Wrapper Component ---
const AppRouter = () => {
    const [selectedPage, setSelectedPage] = useState('dashboard');
    const [activeStudioLead, setActiveStudioLead] = useState<Lead | null>(null);
    const currentMeta = pageTitles[selectedPage] || { title: "Dyad CMS", subtitle: "Business Intelligence Platform" };

    return (
        <ToasterProvider>
            <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
                {/* Unified Modern Sidebar */}
                <aside className="w-72 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between shadow-2xl h-screen sticky top-0 shrink-0">
                    <div className="p-6">
                        {/* Brand Logo Header */}
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                                    BrandFirst <span className="text-indigo-400 font-semibold text-sm">AI</span>
                                </h1>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                                    Enterprise OS
                                </span>
                            </div>
                        </div>

                        {/* Navigation Groups */}
                        <nav className="space-y-6">
                            {/* Section: Core */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                                    Core Intelligence
                                </p>
                                <div className="space-y-1">
                                    {navItems.filter(i => i.section === 'core').map((item) => {
                                        const isActive = selectedPage === item.page;
                                        return (
                                            <button
                                                key={item.page}
                                                onClick={() => {
                                                    setSelectedPage(item.page);
                                                    window.scrollTo(0, 0);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    isActive 
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' 
                                                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                    <span>{item.name}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section: Tools */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                                    Execution & Pipeline
                                </p>
                                <div className="space-y-1">
                                    {navItems.filter(i => i.section === 'tools').map((item) => {
                                        const isActive = selectedPage === item.page;
                                        return (
                                            <button
                                                key={item.page}
                                                onClick={() => {
                                                    setSelectedPage(item.page);
                                                    window.scrollTo(0, 0);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    isActive 
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' 
                                                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                    <span>{item.name}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section: Admin */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                                    Governance & Admin
                                </p>
                                <div className="space-y-1">
                                    {navItems.filter(i => i.section === 'admin').map((item) => {
                                        const isActive = selectedPage === item.page;
                                        return (
                                            <button
                                                key={item.page}
                                                onClick={() => {
                                                    setSelectedPage(item.page);
                                                    window.scrollTo(0, 0);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    isActive 
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' 
                                                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                    <span>{item.name}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* Bottom User Profile Section */}
                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
                                        AD
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">Administrator</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                        SuperAdmin
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                                Pro
                            </span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                    {/* Top Unified Header Bar */}
                    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                                <span>Platform</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                                <span className="text-indigo-400 font-medium capitalize">{selectedPage}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{currentMeta.title}</h2>
                        </div>

                        {/* Top Quick Actions */}
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => setSelectedPage('services')}
                                className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-xs font-semibold text-indigo-300 hover:bg-indigo-900 hover:text-white transition-all shadow-sm"
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Services Catalog</span>
                            </button>

                            <button 
                                onClick={() => setSelectedPage('branding')}
                                className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20"
                            >
                                <Rocket className="w-3.5 h-3.5" />
                                <span>AI Brand Generator</span>
                            </button>

                            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    System Active
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Page Canvas View */}
                    <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                        <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading module workspace...</div>}>
                            {selectedPage === 'dashboard' && <Dashboard currentUser={MOCK_CURRENT_USER} onNavigate={setSelectedPage} />}
                            {selectedPage === 'customer_intelligence' && <CustomerIntelligence />}
                            {selectedPage === 'services' && <ServicesCatalog />}
                            {selectedPage === 'branding' && <BrandingCenter currentUser={MOCK_CURRENT_USER} />}
                            {selectedPage === 'studio' && <WebsiteStudio initialLead={activeStudioLead} allLeads={mockLeads} />}
                            {selectedPage === 'projects' && <ProjectDashboardPage 
                                projectName={'Global Platform Overhaul'} 
                                clientName={'TechCorp Global'} 
                                initialProject={mockProjectProps.initialProject} 
                                currentUser={MOCK_CURRENT_USER}
                            />}
                            {selectedPage === 'leads' && <Leads 
                                initialLeads={mockLeads} 
                                currentUser={MOCK_CURRENT_USER} 
                                onOpenWebsiteStudio={(lead) => {
                                    setActiveStudioLead(lead);
                                    setSelectedPage('studio');
                                    window.scrollTo(0, 0);
                                }}
                            />}
                            {selectedPage === 'analytics' && <Analytics currentUser={MOCK_CURRENT_USER} />}
                            {selectedPage === 'reports' && <Reports />}
                            {selectedPage === 'users' && <Users initialUsers={mockUsers} currentUser={MOCK_CURRENT_USER} />}
                            {selectedPage === 'audit' && <AuditLog initialLogs={[]} currentUser={MOCK_CURRENT_USER} />}
                            {selectedPage === 'settings' && <Settings currentUser={MOCK_CURRENT_USER} />}
                        </Suspense>
                    </main>
                </div>
            </div>
        </ToasterProvider>
    );
};

export default AppRouter;