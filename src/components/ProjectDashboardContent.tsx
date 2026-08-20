"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, FolderOpen, ListChecks, MessageCircle, ArrowRight, Grid, FileText, DollarSign, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock Data Structures
interface Task {
    id: number;
    description: string;
    dueDate: string;
    isComplete: boolean;
}

interface Milestone {
    name: string;
    due: string;
    completed: boolean;
}

interface Project {
    name: string;
    client: string;
    status: 'Planning' | 'Active' | 'Review' | 'Completed';
    progress: number;
    totalBudget: number; 
    budgetSpent: number;
    dueDate: string;
}

interface ProjectDashboardContentProps {
    projectName: string;
    clientName: string;
    initialProject: Project;
}

// Utility to simulate currency conversion: Converts a local currency amount to global USD.
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = 'USD'): number => {
    if (fromCurrency === toCurrency) return amount;
    // Simple mock conversion rates for demonstration
    const rates: { [key: string]: number } = { 
        'LOCAL': 1, 
        'USD': 1, 
        'EUR': 1.08, 
        'GBP': 1.25 
    };
    // Assume conversion from the initial currency to the target currency
    return Math.round((amount / rates[fromCurrency]! ) * rates[toCurrency]!) * 100) / 100;
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const ProjectDashboardContent: React.FC<ProjectDashboardContentProps> = ({ projectName, clientName, initialProject }) => {
    // State management for synchronous project data
    const [project, setProject] = useState<Project>(initialProject);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    // Mock Data (kept static)
    const initialTasks: Task[] = [
        { id: 1, description: "Draft initial branding guidelines document.", dueDate: "2024-09-20", isComplete: false },
        { id: 2, description: "Initial Kickoff Call Summary & Action Items.", dueDate: "2024-09-12", isComplete: true },
        { id: 3, description: "Review and finalize color palette for v2.", dueDate: "2024-10-05", isComplete: false },
    ];

    const initialMilestones: Milestone[] = [
        { name: "Discovery Phase Completion", due: "2024-09-15", completed: true },
        // ...
    ];
    
    // State for data components
    const [tasks] = useState<Task[]>(initialTasks);
    const [milestones] = useState<Milestone[]>(initialMilestones);

    // Simulated API call for status transition
    const handleStatusTransition = async (nextStatus: 'Active' | 'Review' | 'Completed') => {
        const currentStatus = project.status;

        if (currentStatus === nextStatus) {
            toast("No change needed.", { description: `The project is already ${nextStatus}.` });
            return;
        }

        setIsUpdating(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); 

            const updatedProject = { 
                ...project, 
                status: nextStatus, 
                progress: nextStatus === 'Active' ? Math.min(100, project.progress + 10) : project.progress
            };
            setProject(updatedProject);

            // Notification and Multi-currency logic remains here
            let notificationTitle: string;
            let notificationMessage: string;
            let notificationType: 'warning' | 'success' | 'info';

            if (nextStatus === 'Review') {
                notificationTitle = "Project Review Needed";
                notificationMessage = `The '${projectName}' project is ready for review. Check required assets.`;
                notificationType = 'warning';
            } else if (nextStatus === 'Completed') {
                notificationTitle = "Project Complete!";
                notificationMessage = `Congratulations! ${projectName} has been marked as completed. We will now initiate client feedback surveys.`;
                notificationType = 'success';
            } else {
                notificationTitle = "Project Milestone Reached";
                notificationMessage = `Status successfully updated. Next milestone: Wireframe Approval.`;
                notificationType = 'info';
            }

            // Toast logic (unchanged)
            toast(notificationTitle, { 
                description: notificationMessage, 
                action: <Button variant="default" onClick={() => toast("View Activity", { description: 'Viewing recent project activity in the feed.' })}>View Activity</Button>,
                actionOpen: true,
                duration: 7000
            });
            
        } catch (error) {
            toast.error("API Error!", { description: `Could not update project status. Please try again.` });
        } finally {
            setIsUpdating(false);
        }
    };


    // Template Handler (unchanged)
    const handleSelectTemplate = (template: any) => {
        // ...
    }

    // Helper to determine status badge elements (unchanged)
    const getStatusBadge = (status: Project['status']) => {
        switch (status) {
            case 'Planning':
                return { text: "Planning", style: "text-amber-700 bg-amber-50/80", color: "text-amber-600" };
            case 'Active':
                return { text: "Active", style: "text-indigo-700 bg-indigo-50/80", color: "text-indigo-600" };
            case 'Review':
                return { text: "Review", style: "text-blue-700 bg-blue-50/80", color: "text-blue-600" };
            case 'Completed':
                return { text: "Completed", style: "text-green-700 bg-green-50/80", color: "text-green-600" };
            default:
                return { text: "Unknown", style: "text-gray-700 bg-gray-50/80", color: "text-gray-600" };
        }
    };

    return (
        <div className="space-y-8">
            {/* Project Header and Status Workflow */}
            <Card className="p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold text-gray-900">{projectName}</h2 >
                        <div className="flex items-center space-x-2 mt-2 text-lg text-gray-600">
                            <MessageCircle className="w-5 h-5"/>
                            <span >Client: {clientName}</span>
                        </div >
                    </div >
                    <div className="mt-4 sm:mt-0 flex space-x-3 flex-wrap gap-2">
                        {/* Template Selection Button */}
                        <div className='flex space-x-3'>
                            <Button 
                                variant="default" 
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => toast("Template Modal", { description: 'Opening template selection: Websites, Branding, Onboarding Kits.' })}
                            >
                                <Grid className="w-4 h-4 mr-2"/> Select Template
                            </Button>
                        </div >
                        
                        {/* Status Buttons */}
                        <div className="flex space-x-2">
                            <Button 
                                onClick={() => handleStatusTransition('Active')} 
                                disabled={project.status === 'Active' || isUpdating}
                                className={`transition-all ${project.status === 'Planning' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isUpdating ? '...' : 'Active'}
                            </Button>
                            <Button 
                                onClick={() => handleStatusTransition('Review')} 
                                disabled={project.status === 'Review' || project.status === 'Completed' || isUpdating}
                                className={`transition-all ${project.status === 'Active' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isUpdating ? '...' : 'Review'}
                            </Button>
                            <Button 
                                onClick={() => handleStatusTransition('Completed')} 
                                disabled={project.status === 'Completed' || isUpdating}
                                className={`transition-all ${project.status === 'Review' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isUpdating ? '...' : 'Done'}
                            </Button>
                        </div >
                    </div >
                </div>
            </Card>

            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column 1: Tasks & To-Dos (unchanged/polished) */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <ListChecks className="w-5 h-5 text-blue-600"/>
                                <span style={{fontSize: '1.125rem'}}>Tasks & To-Dos</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-500">Tasks due this week (3/5)</p>
                                <Button variant="outline" className="text-sm">View All Tasks</Button>
                            </div >
                            <div className="space-y-3">
                                {/* {tasks.map(...)} */}
                            </div >
                            <Button variant="outline" className="w-full mt-4" onClick={() => toast("Task Creation", { description: 'Opening task creation modal to add a new item.' })}>
                                + Add New Task
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Milestones & Assets (unchanged/polished) */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <Clock className="w-5 h-5 text-red-600"/>
                                <span style={{fontSize: '1.125rem'}}>Milestones & Timeline</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {/* {milestones.map(...)} */}
                            </div >
                            <Button variant="outline" className="w-full mt-4" onClick={() => toast("Timeline Editor", { description: 'Adjust the project timeline with key deliverables.' })}>
                                Adjust Timeline
                            </Button>
                        </CardContent>
                    </Card>
                </div >
            </div >
        </div>
    );
}

export default ProjectDashboardContent;