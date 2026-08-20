"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectCard from "@/components/ProjectCard";
import ProjectDashboardContent from "@/components/ProjectDashboardContent"; 
import { Users } from "./Users";
import { Settings } from "./Settings";
import { TrendingUp } from "lucide-react";
import { ReportSquare } from "lucide-react";
import ActivityFeed from "@/components/ActivityFeed"; // Import new component

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

// Mock Activity Item Structure
interface ActivityItem {
    id: number;
    icon: React.ReactNode;
    title: string;
    message: string;
    timestamp: string;
    color: string; // Class string for color
}

// Mock Activity Fetching Function (Simulating API Call)
const fetchActivityFeed = async (): Promise<ActivityItem[]> => {
    console.log("Fetching activity feed from the database...");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300)); 
    
    return [
        { 
            id: 101, 
            icon: <Users className="w-6 h-6" />, 
            title: "New User Registered", 
            message: "John Doe joined the team and was assigned 'Admin' role.", 
            timestamp: "Just now", 
            color: "text-indigo-600 bg-opacity-15" 
        },
        { 
            id: 102, 
            icon: <ClipboardList className="w-6 h-6" />, 
            title: "Project Milestone Achieved", 
            message: "Mobile App Relaunch reached 'Wireframe Approval' milestone.", 
            timestamp: "2 hours ago", 
            color: "text-blue-600 bg-opacity-15" 
        },
        { 
            id: 103, 
            icon: <Zap className="w-6 h-6" />, 
            title: "Website Revamp Started", 
            message: "Project 'Acme Website Revamp' moved to Active status.", 
            timestamp: "Yesterday", 
            color: "text-green-600 bg-opacity-15" 
        }
    ];
};


export default function IndexPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load Projects
                const projectData = await fetchProjects();
                setProjects(projectData);
                
                // Set the first project as the default selected preview
                setSelectedProject(projectData[0]);

                // Load Activity Feed
                const feedData = await fetchActivityFeed();
                setActivityFeed(feedData);

            } catch (e) {
                console.error("Failed to load dashboard data:", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pt-6">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome back! Here is an overview of your key projects, users, and system settings.</p>
            
            {/* Projects Overview */}
            <section>
                <div className="flex justify-between items-center pt-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Current Projects</h2>
                    <Button>+ New Project</Button>
                </div >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {loading ? (
                        <Card className="col-span-4">Loading projects...</Card>
                    ) : (
                        projects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    )}
                </div >
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                
                {/* Main Content Area (Project Detail Preview) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Project Deep Dive Preview</h2>
                    <p className="text-gray-600">Clicking on any project card above would open a detailed view like this one:</p>
                    {selectedProject && (
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                            <ProjectDashboardContent 
                                projectName={selectedProject.name} 
                                clientName={selectedProject.client} 
                                initialProject={selectedProject}
                            />
                        </div>
                    )}
                </div>

                {/* Activity Feed Column */}
                <div className="lg:col-span-1">
                    <ActivityFeed items={activityFeed} />
                </div>
            </div>


            {/* Quick Links for Other Modules */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* ... (Quick Links remain unchanged but are now positioned below the new layout) ... */}
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