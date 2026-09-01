"use client";

import React, { Suspense, useState, useEffect } from 'react';
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
    Globe, 
    LogOut, 
    Building2, 
    Layers,
    MessageSquare,
    Star,
    CreditCard,
    Flame,
    PhoneCall,
    ShieldAlert,
    Share2
} from 'lucide-react';

// Import all pages and views
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
import SocialMediaStudio from './pages/SocialMediaStudio';
import Reports from './pages/Reports';
import CustomerIntelligence from './pages/CustomerIntelligence';
import { UnifiedInboxPage } from './pages/UnifiedInboxPage';
import { ReputationReviewsPage } from './pages/ReputationReviewsPage';
import { InstantPaymentsPage } from './pages/InstantPaymentsPage';
import { SmsCampaignsPage } from './pages/SmsCampaignsPage';
import { VirtualPhonesPage } from './pages/VirtualPhonesPage';
import { AdminPortalView } from './components/saas/AdminPortalView';
import { FloatingWebChatWidget } from './components/conversational/FloatingWebChatWidget';
import { BespokeLandingView } from './components/auth/BespokeLandingView';
import { AccountManager, UserSession } from './core/saas/auth';
import { toast } from 'react-hot-toast';

// =============================================================
// REAL CLIENT SEED DATA — Environment Masters, Inc. (Jackson, MS)
// =============================================================
const mockUsers = [
    { id: 1, name: 'Ray Buckley', email: 'ray.buckley@environmentmastersms.com', role: 'ADMIN' as const, department: 'Executive (License #MS-HVAC-1957)', status: true },
    { id: 2, name: 'Sarah Vance', email: 'sarah.vance@environmentmastersms.com', role: 'SUPPORT' as const, department: 'Dispatch & Operations', status: true },
    { id: 3, name: 'Marcus Holloway', email: 'marcus.holloway@environmentmastersms.com', role: 'BASIC' as const, department: 'Commercial Electrical Division', status: true },
    { id: 4, name: 'Elena Rodriguez', email: 'elena.rodriguez@environmentmastersms.com', role: 'ADMIN_PRO' as const, department: 'Commercial Accounts & Invoicing', status: true },
];

const mockLeads = [
    { id: 1, companyName: 'Jackson Medical Mall Complex (Jackson, MS)', primaryContact: 'Dr. Walter Evans (Chief of Facilities)', currentStage: 'Evaluation' as const, status: 'High Priority' as const, pillarFinancialPain: '$180k/yr excess cooling run-times across 12 air handling units in Jackson MS summer humidity.', pillarProcessGap: 'Requires sub-15s emergency mechanical dispatch and BACnet smart building automation telemetry.', pillarStakeholderAlignment: 'Chief of Facility Engineering & Hospital Board (Identified Sponsor).' },
    { id: 2, companyName: 'Highland Colony Office Park (Ridgeland, MS)', primaryContact: 'Brenda Montgomery (Property Director)', currentStage: 'Discovery' as const, status: 'High Priority' as const, pillarFinancialPain: '$94,000 peak electrical surge charges and unmonitored commercial HVAC failures.', pillarProcessGap: 'Aging 480V 3-phase panels require thermal imaging audits and high-efficiency VRF retrofits.', pillarStakeholderAlignment: 'Commercial Property Management Executive VP (Champion).' },
    { id: 3, companyName: 'Madison Station Historic Plaza (Madison, MS)', primaryContact: 'Arthur Pendelton (Public Works Lead)', currentStage: 'Won' as const, status: 'High Priority' as const, pillarFinancialPain: 'Water main pressure drops and outdated cast-iron plumbing valves.', pillarProcessGap: 'Trenchless hydro-jetting and automated SMS client review invites scheduled post-service.', pillarStakeholderAlignment: 'Madison County Infrastructure Planning Board.' },
];

const mockProjectProps = {
    projectName: "Jackson Metro Commercial Chiller & VRF Retrofit",
    clientName: "Environment Masters, Inc. (Jackson, MS)",
    initialProject: {
        name: "Jackson Metro Commercial Chiller & VRF Retrofit",
        client: "Environment Masters, Inc.",
        status: 'Discovery' as const,
        progress: 35,
        totalBudget: 285000,
        budgetSpent: 94500,
        dueDate: '2026-11-15',
        currentPhase: 'Initiation' as const,
    }
};

// =============================================================
// NAVIGATION STRUCTURE
// =============================================================
interface NavItemConfig {
    name: string;
    page: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    section: 'master' | 'core' | 'tools' | 'admin';
    superAdminOnly?: boolean;
}

const navItems: NavItemConfig[] = [
    // Master Admin Section (Visible only to SUPER_ADMIN)
    { name: 'Master Tenant Roster', page: 'master_admin', icon: ShieldAlert, badge: 'ROOT', section: 'master', superAdminOnly: true },

    // Core Tenant Intelligence
    { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard, section: 'core' },
    { name: 'Unified Inbox', page: 'inbox', icon: MessageSquare, badge: 'Live SMS', section: 'core' },
    { name: 'Reputation & Reviews', page: 'reviews', icon: Star, badge: 'Google 5★', section: 'core' },
    { name: 'Text-to-Pay', page: 'payments', icon: CreditCard, badge: 'Stripe', section: 'core' },
    { name: 'Business DNA OS', page: 'customer_intelligence', icon: Sparkles, badge: 'AI OS', section: 'core' },
    { name: 'Services Catalog', page: 'services', icon: Tag, badge: 'New', section: 'core' },
    { name: 'Branding Center', page: 'branding', icon: Rocket, badge: 'AI', section: 'core' },
    { name: 'SMS Campaigns', page: 'campaigns', icon: Flame, badge: '98% Open', section: 'tools' },
    { name: 'Phones & Missed Calls', page: 'phones', icon: PhoneCall, badge: 'Auto-Text', section: 'tools' },
    { name: 'Website Studio', page: 'studio', icon: Globe, badge: 'Deck Ingest', section: 'tools' },
    { name: 'Social Media Studio', page: 'social', icon: Share2, badge: 'AI Multiplier', section: 'tools' },
    { name: 'Projects', page: 'projects', icon: ClipboardList, section: 'tools' },
    { name: 'Leads CRM', page: 'leads', icon: Zap, section: 'tools' },
    { name: 'Analytics & KPIs', page: 'analytics', icon: TrendingUp, section: 'tools' },
    { name: 'Reports & Revenue', page: 'reports', icon: FileText, section: 'tools' },
    { name: 'Users & Teams', page: 'users', icon: UsersIcon, section: 'admin' },
    { name: 'Audit Trail', page: 'audit', icon: Shield, section: 'admin' },
    { name: 'Settings', page: 'settings', icon: SlidersHorizontal, section: 'admin' }
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    master_admin: { title: "Master Multi-Tenant Control Plane", subtitle: "Global tenant roster, cross-organization quotas, API keys, and platform billing." },
    dashboard: { title: "Executive Dashboard", subtitle: "Real-time governance, revenue forecasting, and strategic consulting services." },
    inbox: { title: "Unified Omnichannel Inbox", subtitle: "2-Way SMS, WebChat-to-Text, Google Business, and Inbound Lead Channels." },
    reviews: { title: "Reputation & Review Multiplier", subtitle: "Automate 1-Tap Google Review Requests and AI Brand Voice Responses." },
    payments: { title: "Text-to-Pay & Fast Invoicing", subtitle: "Collect client retainers and project invoices via 1-click SMS payment links." },
    campaigns: { title: "Targeted SMS Marketing Broadcasts", subtitle: "Launch high-converting promotional text blasts with 98% open rates." },
    phones: { title: "Virtual Phones & Missed-Call Auto-Text", subtitle: "Never lose a customer call; automatically text callers back in seconds." },
    customer_intelligence: { title: "Business DNA & Customer Intelligence OS", subtitle: "Live multi-domain intelligence across Marketing, Sales, Operations, and Zero-Trust Security." },
    services: { title: "Services Catalog & Offerings", subtitle: "Strategic transformation blueprints, digital audits, and deliverables." },
    branding: { title: "AI Branding & Positioning Center", subtitle: "Generate automated market positioning, taglines, and value proposition guides." },
    studio: { title: "AI Website Studio & Staging Sandbox", subtitle: "Autonomously compile client websites from Google Presentation decks, local presence, or DNA." },
    social: { title: "Autonomous Social Media & Brand Voice Studio", subtitle: "Weekly AI brand voice marketing, multi-channel scheduling calendar, and profile provisioning." },
    projects: { title: "Project Governance & Deep Dive", subtitle: "Track milestones, budget burn, risk ratings, and delivery phases." },
    leads: { title: "Client Pipeline & Opportunity CRM", subtitle: "Analyze economic feasibility, process gaps, and key executive sponsors." },
    analytics: { title: "Operations Analytics & Capacity", subtitle: "Departmental workload forecasting, lead time bottlenecks, and recommendations." },
    reports: { title: "Financial & Operational Reports", subtitle: "Multi-currency financial forecasting, spent budget analysis, and delivery reports." },
    users: { title: "User & Team Directory", subtitle: "Manage enterprise accounts, RBAC permissions, and team assignments." },
    audit: { title: "System Audit Logs", subtitle: "Immutable chronological trail of security, data updates, and governance events." },
    settings: { title: "Global System Settings", subtitle: "Configure multi-currency baselines, time zones, and reporting defaults." }
};

export default function App() {
    const accountManager = AccountManager.getInstance();
    const [session, setSession] = useState<UserSession | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const [selectedPage, setSelectedPage] = useState<string>('dashboard');
    const [activeStudioLead, setActiveStudioLead] = useState<Lead | null>(null);

    // Restore active session from server httpOnly cookie on mount
    useEffect(() => {
        let mounted = true;
        accountManager.restoreSessionFromServer().then(active => {
            if (mounted) {
                if (active) {
                    setSession(active);
                }
                setIsInitializing(false);
            }
        }).catch(() => {
            if (mounted) {
                setIsInitializing(false);
            }
        });
        return () => { mounted = false; };
    }, []);

    const handleLogout = () => {
        if (session) {
            accountManager.logout(session.token);
            setSession(null);
            setSelectedPage('dashboard');
        }
    };

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 font-mono text-xs">
                <span>Initializing FoundryOS Runtime...</span>
            </div>
        );
    }

    // ──────────────── Unauthenticated View: Bespoke Landing & Entry ─────────
    if (!session) {
        return (
            <ToasterProvider>
                <BespokeLandingView onAuthenticated={(newSession) => setSession(newSession)} />
            </ToasterProvider>
        );
    }

    const isDemoMode = session.role === 'DEMO_VIEWER';
    const isSuperAdmin = (session.role as string) === 'SUPER_ADMIN';

    const currentUserContext = {
        role: session.role || 'ADMIN',
        permissions: {
            userManagement: !isDemoMode && (session.role === 'ADMIN' || session.role === 'EXECUTIVE' || isSuperAdmin),
            settingsManagement: !isDemoMode && (session.role === 'ADMIN' || isSuperAdmin),
            ollamaAccess: true,
            deleteCriticalRecords: !isDemoMode && (session.role === 'ADMIN' || isSuperAdmin),
            viewAuditLogs: !isDemoMode,
        }
    };

    const currentMeta = pageTitles[selectedPage] || { title: "FoundryOS", subtitle: "Autonomous Business & Revenue Operating System" };

    return (
        <ToasterProvider>
            <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
                {/* Modern Enterprise Sidebar */}
                <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Application Logo & Protocol Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 text-white font-black text-xl font-serif">
                                F
                            </div>
                            <div className="overflow-hidden">
                                <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 font-serif">
                                    Foundry<span className="text-indigo-400">OS</span>
                                    <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                                        v1.0
                                    </span>
                                </h1>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {session.organizationName || 'Autonomous Enterprise'}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Section Scroller */}
                        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                            {/* Section: Master Admin Control Plane (SUPER_ADMIN ONLY) */}
                            {isSuperAdmin && (
                                <div className="p-2.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-1 px-2 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                                        <span>Master Control Plane</span>
                                    </p>
                                    {navItems.filter(i => i.section === 'master').map((item) => {
                                        const isActive = selectedPage === item.page;
                                        return (
                                            <button
                                                key={item.page}
                                                onClick={() => {
                                                    setSelectedPage(item.page);
                                                    window.scrollTo(0, 0);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                                                    isActive 
                                                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-bold' 
                                                        : 'text-amber-200/80 hover:bg-amber-900/40 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2.5">
                                                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{item.name}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Section: Core Intelligence */}
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
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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



                            {/* Section: Execution & Pipeline */}
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
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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

                            {/* Section: Admin & Governance */}
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
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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

                    {/* Bottom User Profile Card with Logout */}
                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center space-x-3 min-w-0">
                                <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold text-indigo-300 shrink-0">
                                    {session.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{session.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400 uppercase">{session.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Viewport */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                    {/* Isolated Demo Sandbox Persistent Banner */}
                    {isDemoMode && (
                        <div className="bg-emerald-950/90 border-b border-emerald-500/30 px-6 py-2 flex items-center justify-between text-xs font-mono text-emerald-300 shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span><strong>Isolated Demo Sandbox</strong> · Simulated data only · Zero administrative access to production systems.</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="underline hover:text-white cursor-pointer font-bold"
                            >
                                Exit Sandbox & Sign Up ➔
                            </button>
                        </div>
                    )}

                    {/* Top Unified Header Bar */}
                    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-3.5 flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-0.5">
                                <span>Platform</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                                <span className="text-indigo-400 font-medium capitalize">{selectedPage.replace('_', ' ')}</span>
                            </div>
                            <h2 className="text-lg font-bold text-white tracking-tight">{currentMeta.title}</h2>
                        </div>

                        {/* Top Context Pills & Quick Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Active Org & Workspace Pill */}
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-mono text-slate-300">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-white font-semibold">{session.organizationName || 'Default Org'}</span>
                                </div>
                                <span className="text-slate-600">/</span>
                                <div className="flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-300">{session.workspaceName || 'Primary Workspace'}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedPage('services')}
                                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-xs font-semibold text-indigo-300 hover:bg-indigo-900 hover:text-white transition-all shadow-sm cursor-pointer"
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Services</span>
                            </button>

                            <button 
                                onClick={() => setSelectedPage('branding')}
                                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                            >
                                <Rocket className="w-3.5 h-3.5" />
                                <span>AI Branding</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-300 border border-white/10 hover:border-red-500/40 text-xs font-mono text-slate-300 transition-all cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </header>

                    {/* Page Canvas View */}
                    <main className="flex-1 p-8 max-w-7xl mx-auto w-full overflow-y-auto">
                        <Suspense fallback={<div className="text-center py-20 text-slate-400 font-mono text-xs">Loading module workspace...</div>}>
                            {selectedPage === 'master_admin' && (
                                isSuperAdmin ? (
                                    <AdminPortalView
                                        organizationName={session.organizationName}
                                        setActiveTab={(tab: any) => setSelectedPage(tab)}
                                        onSelectWorkspace={(wsId) => {
                                            toast.success(`Switched tenant workspace context to ${wsId}`);
                                        }}
                                    />
                                ) : (
                                    <div className="p-12 text-center text-rose-400 font-mono text-xs bg-rose-950/20 border border-rose-500/30 rounded-2xl">
                                        ⛔ Access Denied: This area is restricted strictly to Master Platform Administrators.
                                    </div>
                                )
                            )}
                            {selectedPage === 'dashboard' && <Dashboard currentUser={currentUserContext} onNavigate={setSelectedPage} />}
                            {selectedPage === 'inbox' && <UnifiedInboxPage />}
                            {selectedPage === 'reviews' && <ReputationReviewsPage />}
                            {selectedPage === 'payments' && <InstantPaymentsPage />}
                            {selectedPage === 'campaigns' && <SmsCampaignsPage />}
                            {selectedPage === 'phones' && <VirtualPhonesPage />}
                            {selectedPage === 'customer_intelligence' && <CustomerIntelligence />}
                            {selectedPage === 'services' && <ServicesCatalog />}
                            {selectedPage === 'branding' && <BrandingCenter currentUser={currentUserContext} />}
                            {selectedPage === 'studio' && <WebsiteStudio initialLead={activeStudioLead} allLeads={mockLeads} />}
                            {selectedPage === 'social' && <SocialMediaStudio />}
                            {selectedPage === 'projects' && <ProjectDashboardPage 
                                projectName={'Global Platform Overhaul'} 
                                clientName={'TechCorp Global'} 
                                initialProject={mockProjectProps.initialProject} 
                                currentUser={currentUserContext}
                            />}
                            {selectedPage === 'leads' && <Leads 
                                initialLeads={mockLeads} 
                                currentUser={currentUserContext} 
                                onOpenWebsiteStudio={(lead) => {
                                    setActiveStudioLead(lead);
                                    setSelectedPage('studio');
                                    window.scrollTo(0, 0);
                                }}
                            />}
                            {selectedPage === 'analytics' && <Analytics currentUser={currentUserContext} />}
                            {selectedPage === 'reports' && <Reports />}
                            {selectedPage === 'users' && <Users initialUsers={mockUsers} currentUser={currentUserContext} />}
                            {selectedPage === 'audit' && <AuditLog initialLogs={[]} currentUser={currentUserContext} />}
                            {selectedPage === 'settings' && <Settings currentUser={currentUserContext} />}
                        </Suspense>
                    </main>

                    {/* Floating WebChat-to-SMS Widget (Global) */}
                    <FloatingWebChatWidget />
                </div>
            </div>
        </ToasterProvider>
    );
}