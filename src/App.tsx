"use client";

import React, { Suspense, useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import ProjectDashboardPage from './pages/ProjectDashboard';
// Assuming you have the other pages imported here later...

// --- MOCK DATA SIMULATION HOOK ---
// This component simulates fetching data from an API and passes it down as props, 
// allowing the rest of the application to function as if it were connected.
const AppRouter = () => {
    const [currentPage, setCurrentPage] = useState('dashboard'); // Used for active link highlighting

    // Mock API data for simulation purposes
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
    };

    // State for Page Context (For real implementation)
    const [selectedPage, setSelectedPage] = useState('dashboard');

    return (
        <div className="flex">
            {/* Sidebar (Navigation) */}
            <aside className="w-64 bg-white h-screen shadow-lg p-6 sticky top-0">
                <div className="text-2xl font-bold text-indigo-700 mb-8">Dyad CMS</div>
                <nav className="space-y-2">
                    {[
                        { name: 'Dashboard', page: 'dashboard', icon: 'LayoutDashboard' },
                        { name: 'Users', page: 'users', icon: 'Users' },
                        { name: 'Projects', page: 'projects', icon: 'ClipboardList' },
                        { name: 'Settings', page: 'settings', icon: 'SlidersHorizontal' },
                        // Add more links here later
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
            <main className="flex-grow">
                {/* We use client-side routing simulation */}
                <div className="pt-4 pb-20"> 
                    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
                        {/* Render the page based on the simulated selection */}
                        {selectedPage === 'dashboard' && <Dashboard />}
                        {selectedPage === 'users' && <Users initialUsers={mockUsers} />}
                        {selectedPage === 'settings' && <Settings />}
                        {selectedPage === 'projects' && <ProjectDashboardPage 
                            projectName={'Global Platform Overhaul'} 
                            clientName={'TechCorp Global'} 
                            initialProject={mockProjectProps.initialProject} 
                        />}
                        {/* Add fallback for unrecognized pages */}
                        {selectedPage !== 'dashboard' && selectedPage !== 'users' && selectedPage !== 'settings' && selectedPage !== 'projects' && (
                            <div className="p-10 text-center text-gray-500">This page is under construction.</div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default AppRouter;