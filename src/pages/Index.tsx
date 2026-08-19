"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectCard from "@/components/ProjectCard";
import { Users } from "./Users";
import { Settings } from "./Settings";

// Mock Project Data Structure
interface Project {
    id: string;
    name: string;
    client: string;
    status: 'Planning' | 'Active' | 'Review' | 'Completed';
    progress: number; // 0-100
    totalBudget: number;
    budgetSpent: number;
    dueDate: string;
}

const mockProjects: Project[] = [
    { id: 'p1', name: 'Quantum Leap Branding', client: 'Enterprise Global', status: 'Active', progress: 65, totalBudget: 50000, budgetSpent: 35000, dueDate: '2024-12-31' },
    { id: 'p2', name: 'Mobile App Relaunch', client: 'Startup Inc.', status: 'Review', progress: 90, totalBudget: 120000, budgetSpent: 115000, dueDate: '2024-10-15' },
    { id: 'p3', name: 'Internal System Audit', client: 'Internal', status: 'Planning', progress: 10, totalBudget: 15000, budgetSpent: 1000, dueDate: '2025-01-20' },
];

export default function IndexPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto pt-6">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome back! Here is an overview of your key projects, users, and system settings.</p>
            
            {/* Projects Overview */}
            <section>
                <div className="flex justify-between items-center pt-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Current Projects</h2>
                    <Button>+ New Project</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section>

            {/* Quick Links for Other Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/users/*">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3 text-indigo-600"><Users className="w-5 h-5"/><span>Users & Teams</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Manage team members, assign roles, and invite new accounts.</p>
                        <Button className="mt-2">Go to Users</Button>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/settings/*"}>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3 text-orange-600"><Settings className="w-5 h-5"/><span>Settings</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Configure global parameters, branding, and integrations.</p>
                        <Button className="mt-2">Go to Settings</Button>
                    </CardContent>
                </Card>
                {/* Placeholder for future module */}
                 <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/reports/*"}>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3 text-green-600"><TrendingUp className="w-5 h-5"/><span>Reports & Analytics</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Generate reports and visualize team performance over time.</p>
                        <Button className="mt-2" disabled>Coming Soon</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}