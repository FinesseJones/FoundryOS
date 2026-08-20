"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, FolderOpen, ListChecks, MessageCircle, ArrowRight, Grid, FileText, DollarSign, Globe, Loader, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Still using sonner for immediate alerts

// Mock Data Structures (kept for context)
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

// --- Global Utilities (Kept from previous step) ---
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = 'USD'): number => {
    if (fromCurrency === toCurrency) return amount;
    const rates: { [key: string]: number } = { 
        'LOCAL': 1, 
        'USD': 1, 
        'EUR': 1.08, 
        'GBP': 1.25 
    };
    return Math.round((amount / rates[fromCurrency]! ) * rates[toCurrency]!) * 100) / 100;
};

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

// --- Component Core ---
const ProjectDashboardContent: React.FC<ProjectDashboardContentProps> = ({ projectName, clientName, initialProject }) => {
    const [project, setProject] = useState<Project>(initialProject);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const initialTasks: Task[] = [
        { id: 1, description: "Draft initial branding guidelines document.", dueDate: "2024-09-20", isComplete: false },
        // ...
    ];
    const initialMilestones: Milestone[] = [
        { name: "Discovery Phase Completion", due: "2024-09-15", completed: true },
        // ...
    ];
    const [tasks] = useState<Task[]>(initialTasks);
    const [milestones] = useState<Milestone[]>(initialMilestones);

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
            
            // --- CENTRALIZED NOTIFICATION LOGIC ---
            let notificationTitle: string;
            let notificationMessage: string;

            if (nextStatus === 'Review') {
                notificationTitle = "Project Review Needed";
                notificationMessage = `The '${projectName}' project is ready for review. Triggering reminder emails and internal alerts.`;
                
                // This action now targets the Notification Center
                toast.warning(notificationTitle, { 
                    description: `Sending notification to the team: ${notificationMessage}`,
                    action: <Button variant="default" onClick={() => toast("View Inbox", { description: 'The new notification is now filed in the Notification Center.' })}>View Inbox</Button>,
                    actionOpen: true
                });
            } else if (nextStatus === 'Completed') {
                notificationTitle = "Project Complete!";
                notificationMessage = `Congratulations! ${projectName} has been marked as completed. Initiating close-out client survey.`
            } else {
                notificationTitle = "Project Milestone Reached";
                notificationMessage = `Status successfully updated. Next milestone: Wireframe Approval.`;
            }

            // Global toast remains for immediate user feedback regardless of notification center
            toast(notificationTitle, { 
                description: notificationMessage, 
                action: <Button variant="default" onClick={() => toast("View Inbox", { description: 'Detailed records are available in the Notification Center.' })}>View Inbox</Button>,
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
        toast.success("Template Loaded!", { 
            description: `Project '${projectName}' has been initialized with the '${template.name}' template. Tasks and Milestones automatically generated.` 
        });
    }


    return (
        <div className="space-y-8">
            <Card className="p-6 shadow-xl">
                {/* The visual structure remains the same */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold text-gray-900">{projectName}</h2>
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
                        
                        {/* Status Buttons (unmodified) */}
                        <div className="flex space-x-2">
                            {/* ... status buttons ... */}
                        </div>
                    </div >
                </div>
            </Card>
            {/* Separator and Content (unchanged) */}
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <ListChecks className="w-5 h-5 text-blue-600"/>
                                <span style={{fontSize: '1.125rem'}}>Tasks & To-Dos</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Content is static, omitting the task list */}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <Clock className="w-5 h-5 text-red-600"/>
                                <span style={{fontSize: '1.125rem'}}>Milestones & Timeline</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Content is static, omitting the milestone list */}
                        </CardContent>
                    </Card>
                </div >
            </div>
        </div>
    );
}

export default ProjectDashboardContent;