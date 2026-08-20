"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, FolderOpen, ListChecks, MessageCircle, ArrowRight, Grid, FileText, DollarSign, Globe, Loader, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

/* ... (Interface definitions and utility functions omitted for brevity, assuming they remain the same as previous version) ... */

const ProjectDashboardContent: React.FC<{
    projectName: string;
    clientName: string;
    initialProject: Project;
}> = ({ projectName, clientName, initialProject }) => {
    const [project, setProject] = useState<Project>(initialProject);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    // ... (All mock data/state initialization remains the same) ...

    const handleStatusTransition = async (nextStatus: 'Active' | 'Review' | 'Completed') => {
        const currentStatus = project.status;

        if (currentStatus === nextStatus) {
            toast("No change needed.", { description: `The project is already ${nextStatus}.` });
            return;
        }

        // --- Validation Check ---
        if (currentStatus === 'Planning' && nextStatus === 'Review') {
             toast.warning("Validation Error", { description: "Cannot skip 'Active' status. Please finalize work and move project to 'Active' first." });
             return; // Prevent invalid workflow jump
        }


        setIsUpdating(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1200)); // Extended loading time for better UX

            const updatedProject = { 
                ...project, 
                status: nextStatus, 
                progress: nextStatus === 'Active' ? Math.min(100, project.progress + 10) : project.progress
            };
            setProject(updatedProject);
            
            // --- Centralized Notification & User Feedback ---
            let notificationTitle: string;
            let notificationMessage: string;

            if (nextStatus === 'Review') {
                notificationTitle = "Project Review Needed";
                notificationMessage = `The '${projectName}' project is ready for review. Sending internal notification to stakeholders.`;
            } else if (nextStatus === 'Completed') {
                notificationTitle = "Project Complete!";
                notificationMessage = `Congratulations! ${projectName} has been marked as completed. Triggering close-out client survey.`
            } else {
                notificationTitle = "Project Milestone Reached";
                notificationMessage = `Status successfully updated. Next milestone: Wireframe Approval.`;
            }

            // Global toast for immediate feedback
            toast(notificationTitle, { 
                description: notificationMessage, 
                action: <Button variant="default" onClick={() => toast("View Inbox", { description: 'Detailed records are available in the Notification Center.' })}>View Inbox</Button>,
                actionOpen: true,
                duration: 7000
            });

        } catch (error) {
            // Improved error messaging is non-functional for mock, but structure is better
            toast.error("Update Failed", { description: `An unexpected error occurred. Check console for details.` });
        } finally {
            setIsUpdating(false);
        }
    };

    // ... (rest of component remains the same) ...
    // I have cleaned up the function body while maintaining all existing logic and structure.

    return (
        <div className="space-y-8">
            {/* Project Header and Status Workflow */}
            <Card className="p-6 shadow-xl">
                {/* ... (Structure remains the same) ... */}
            </Card>

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
                             {/* Content remains the same */}
                        </CardContent>
                    </Card>
                </div >

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <Clock className="w-5 h-5 text-red-600"/>
                                <span style={{fontSize: '1.125rem'}}>Milestones & Timeline</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Content remains the same */}
                        </CardContent>
                    </Card>
                </div >
            </div >
        </div>
    );
}

export default ProjectDashboardContent;