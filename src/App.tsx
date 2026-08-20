"use client";

import React, { Suspense, useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import ProjectDashboardPage from './pages/ProjectDashboard';
import { UserRole } from "@/types/user";

// =============================================================
// SIMULATED AUTHENTICATED USER STATE
// In a real application, this data would come from a session or Auth hook.
// We will default to an ADMIN user for best demonstration.
const MOCK_CURRENT_USER: { role: UserRole; permissions: Record<string, boolean> } = {
    role: "ADMIN",
    permissions: {
        userManagement: true, // Admin can manage users
        settingsManagement: true, // Admin can change global settings
        ollamaAccess: true, // Admin can access AI models
        deleteCriticalRecords: true, // Admin can delete critical records
    }
};
// =============================================================
// MOCK DATA (No changes needed here)
const mockUsers = useMemo(() => ([
    { id: 1, name: 'Alice Smith', email: 'alice@corp.com', role: 'ADMIN', department: 'Executive', status: true },
    { id: 2, name: 'Bob Johnson', email: 'bob@corp.com', role: 'SUPPORT', department: 'Support', status: true },
    { id: 3, name: 'Charlie Brown', email: 'charlie@corp.com', role: 'BASIC', department: 'Marketing', status: false },
    { id: 4, name: 'Diana Prince', email: 'diana@corp.com', role: 'ADMIN_PRO', department: 'Finance', status: true },
]), []);

const mockSettings = {
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
        status: 'Active',
        progress: 65,
        totalBudget: 500000,
        budgetSpent: 325000,
        dueDate: '2024-12-31',
    }
}


// --- Main App Router and Wrapper Component ---
const AppRouter = () => {
    const [selectedPage, setSelectedPage] = useState('dashboard');

    return (
        <div className="flex">
            {/* Sidebar (Navigation) */}
            <aside className="w-64 bg-white min-h-screen shadow-lg p-6 sticky top-0">
                <div className="text-2xl font-bold text-indigo-700 mb-6">Dyad CMS</div>
                
                {/* Current User Display */}
                <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Logged In As:</p>
                    <p className="font-bold text-lg text-indigo-800">{MOCK_CURRENT_USER.role}</p>
                    <p className="text-sm text-indigo-600 mt-1">Permissions: {Object.keys(MOCK_CURRENT_USER.permissions).filter(key => MOCK_CURRENT_USER.permissions[key]).join(', ').toUpperCase()}</p>
                </div>

                <nav className="space-y-2">
                    {[
                        { name: 'Dashboard', page: 'dashboard', icon: 'LayoutDashboard' },
                        { name: 'Users', page: 'users', icon: 'Users' },
                        { name: 'Projects', page: 'projects', icon: 'ClipboardList' },
                        { name: 'Settings', page: 'settings', icon: 'SlidersHorizontal' },
                    ].map((item) => (
                        <button
                            key={item.page}
                            onClick={() => {
                                setSelectedPage(item.page);
                                window.scrollTo(0, 0); // Scroll to top on page change
                            }}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${selectedPage === item.page ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow max-w-full">
                <div className="pt-4 pb-20"> 
                    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
                        {/* Pass the current user state object to all pages */}
                        {selectedPage === 'dashboard' && <Dashboard currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'users' && <Users initialUsers={mockUsers} currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'settings' && <Settings currentUser={MOCK_CURRENT_USER} />}
                        {selectedPage === 'projects' && <ProjectDashboardPage 
                            projectName={'Global Platform Overhaul'} 
                            clientName={'TechCorp Global'} 
                            initialProject={mockProjectProps.initialProject} 
                            currentUser={MOCK_CURRENT_USER} // Passed down
                        />}
                    </Suspense>
                </div >
            </main>
        </div >
    );
};

export default AppRouter;