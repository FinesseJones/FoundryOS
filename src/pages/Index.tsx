"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectCard from "@/components/ProjectCard";
import ProjectDashboardContent from "@/components/ProjectDashboardContent"; 
import { Users } from "./Users";
import { Settings } from "./Settings";
import { TrendingUp } from "lucide-react";
import { ReportSquare } from "lucide-react"; // Keeping ReportSquare here for consistency

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
    // For demonstration, we'll pre-select the first project for the detail view
    const selectedProject = mockProjects[0];

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section>

            {/* Project Deep Dive Preview (New Section) */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">Project Deep Dive Preview</h2>
                <p className="text-gray-600">Clicking on any project card above would open a detailed view like this one:</p>
                {selectedProject && (
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <ProjectDashboardContent 
                            projectName={selectedProject.name} 
                            clientName={selectedProject.client} 
                        />
                    </div>
                )}
            </div>

            {/* Quick Links for Other Modules */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/users/*"}>
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
                {/* Reporting Module Link */}
                 <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/reports/*"}>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3 text-green-600"><ReportSquare className="w-5 h-5"/><span>Reports & Analytics</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">View performance metrics and financial reports.</p>
                        <Button className="mt-2">View Reports</Button>
                    </CardContent>
                </Card>
                {/* Placeholder for future module */}
                 <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3 text-gray-500"><TrendingUp className="w-5 h-5"/></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Reporting function coming soon.</p>
                        <Button className="mt-2" disabled>Coming Soon</Button>
                    </CardContent>
                </Card>
            </div >
        </div>
    );
}