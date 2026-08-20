"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Settings, Zap, ClipboardList, BarChart2 } from 'lucide-react'; // Added BarChart2 icon
import { Button } from '@/components/ui/button'; // Assuming Button component is available for AppLayout

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
    roles?: ('SuperAdmin' | 'Manager')[]; // Optional: roles that can see this item
}

const primaryNavigation: NavItem[] = [
    { icon: <BookOpen className="w-5 h-5" />, label: "Dashboard", path: "/" },
    { icon: <Users className="w-5 h-5" />, label: "Teams", path: "/users" },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Projects", path: "/projects" },
    { icon: <BarChart2 className="w-5 h-5" />, label: "Reports", path: "/reports" }, // Updated/Added link
    { icon: <Zap className="w-5 h-5" />, label: "Automation", path: "/automation" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/settings" },
];

// Helper function to check if the current user role has access (simulated)
function hasPermission(role: string): boolean {
    const rolesList: Array<'SuperAdmin' | 'Manager' | 'Client'>[] = [
        ['SuperAdmin', 'Manager', 'Client', 'Basic'] 
    ];
    return rolesList.includes(role);
}

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    
    // In a real app, this would be retrieved from the Auth Context
    const currentUserRole: 'SuperAdmin' | 'Manager' | 'Client' | 'Basic' = 'SuperAdmin'; 

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar / Navigation */}
            <div className="w-64 bg-white border-r p-6 flex flex-col shadow-lg sticky top-0">
                <div className="text-2xl font-bold text-indigo-800 mb-10">
                    BrandFirst <span className="text-gray-500">AI</span>
                </div>
                <nav className="space-y-2">
                    {primaryNavigation.map((item) => {
                        // Check permission before rendering the link
                        if (!hasPermission(currentUserRole)) return null;

                        // Determine the active link state
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <Link 
                                key={item.label} 
                                to={item.path} 
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-indigo-100 text-indigo-800/90 shadow-sm' : 'text-gray-600 hover:bg-gray-100'} ${item.path === '/automation' ? 'text-orange-600' : ''}`}
                            >
                                <div className={`mr-3 ${item.path === '/automation' ? 'text-orange-600' : ''}`}>{item.icon}</div>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className='mt-auto border-t pt-4'>
                    {/* User Profile Placeholder */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-indigo-600 text-xl">AD</div>
                        <div>
                            <p className="font-semibold">Administrator</p>
                            <p className="text-sm text-gray-500">SuperAdmin</p>
                        </div>
                    </div>
                </div>
            </div >
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    {/* Title will be derived from route */}
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline">Logout</Button>
                    </div >
                </header>
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div >
        </div>
    );
}

export default AppLayout;