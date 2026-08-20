"use client";

import React, { Suspense, useState, useMemo } from 'react';
import { ToasterProvider } from './components/ToastProvider';
import { Routes, Route } from 'react-router-dom';

// Import all pages and the new log page
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import ProjectDashboardPage from './pages/ProjectDashboard';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import BrandingCenter from './pages/BrandingCenter';
import ServicesCatalog from './pages/ServicesCatalog'; // <-- Ensure this is imported

// =============================================================
// MOCK AUTHENTICATED USER STATE (Unchanged)
// =============================================================
const MOCK_CURRENT_USER: { role: string; permissions: { [key: string]: boolean } } = {
    role: "ADMIN",
    permissions: {
        userManagement: true,
        settingsManagement: true,
        ollamaAccess: true,
        deleteCriticalRecords: true,
        viewAuditLogs: true,
        userManagement: true,
    }
};
// =============================================================
// MOCK DATA (Unchanged)
const mockUsers = useMemo(() => ([
    { id: 1, name: 'Alice Smith', email: 'alice@corp.com', role: 'ADMIN', department: 'Executive', status: true },
    { id: 2, name: 'Bob Johnson', email: 'bob@corp.com', role: 'SUPPORT', department: 'Support', status: true },
    { id: 3, name: 'Charlie Brown', email: 'charlie@corp.com', role: 'BASIC', department: 'Marketing', status: false },
    { id: 4, name: 'Diana Prince', email: 'diana@corp.com', role: 'ADMIN_PRO', department: 'Finance', status: true },
]), []);

const mockSettingsKeys = {
    baseCurrency: "USD",
    currencySymbol: "$",
    timeZone: "UTC",
    defaultReportPeriod: "Month"
};

const mockProjectProps = {
    projectName: "Global Platform Overhaul",
    clientName: "TechCorp Global",
    initialProject: {
        name: "Global Platform Overhaul",
        client: "TechCorp Global",
        status: 'Discovery',
        progress: 10,
        totalBudget: 500000,
        budgetSpent: 0,
        dueDate: '2025-06-30',
        currentPhase: 'Initiation',
    }
}


// --- Main App Router and Wrapper Component ---
const AppRouter = () => {
    const [selectedPage, setSelectedPage] = useState('dashboard');

    return (
        <div className="flex min-h-screen">
            {/* Sidebar (Navigation) - Refined UI */}
            <aside className="w-64 bg-white border-r shadow-lg sticky top-0 pt-8 pb-8">
                <div className="text-3xl font-extrabold text-indigo-800 mb-8 px-4">
                    Dyad <span className="text-gray-500 text-xl font-normal">CMS</span>
                </div >
                
                {/* Current User Display */}
                <div className="mb-10 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Logged In As:</p>
                    <p className="font-bold text-lg text-gray-800">{MOCK_CURRENT_USER.role}</p>
                    <p className="text-sm text-gray-500 mt-1">Permissions: {Object.keys(MOCK_CURRENT_USER.permissions).filter(key => MOCK_CURRENT_USER.permissions[key]).join(', ').toUpperCase()}</p>
                </div >

                <nav className="space-y-2">
                    {[
                        { name: 'Dashboard', page: 'dashboard', icon: 'LayoutDashboard' },
                        { name: 'Users', page: 'users', icon: 'Users' },
                        { name: 'Projects', page: 'projects', icon: 'ClipboardList' },
                        { name: 'Leads CRM', page: 'leads', icon: 'ZapUsers' },
                        { name: 'Services Catalog', page: 'services', icon: 'Tag' },
                        { name: 'Settings', page: 'settings', icon: 'SlidersHorizontal' },
                        { name: 'Analytics', page: 'analytics', icon: 'TrendingUp' },
                        { name: 'Branding Center', page: 'branding', icon: 'Rocket' }
                    ].map((item) => (
                        <button
                            key={item.page}
                            onClick={() => {
                                setSelectedPage(item.page);
                                window.scrollTo(0, 0);
                            }}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${selectedPage === item.page ? 'bg-indigo-50 text-indigo-800 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-700'}`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow max-w-full bg-gray-50">
                <div className="p-12"> 
                    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div >}>
                        {/* Router logic remains functionally the same */}
                        {selectedPage === 'dashboard' && <Dashboard currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'users' && <Users initialUsers={mockUsers} currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'settings' && <Settings currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'projects' && <ProjectDashboardPage 
                            projectName={'Global Platform Overhaul'} 
                            clientName={'TechCorp Global'} 
                            initialProject={mockProjectProps.initialProject} 
                            currentUser={MOCK_CURRENT_USER}
                        />}
                        {selectedPage === 'leads' && <Leads initialLeads={mockUsers} currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'audit' && <AuditLog initialLogs={[]} currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'analytics' && <Analytics currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'services' && <ServicesCatalog />}
                        {selectedPage === 'branding' && <BrandingCenter currentUser={MOCK_CURRENT_USER} />}
                    </Suspense>
                </div >
            </main>
        </div>
    );
};

export default AppRouter;