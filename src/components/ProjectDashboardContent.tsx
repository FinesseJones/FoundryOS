"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, FolderOpen, ListChecks, MessageCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const ProjectDashboardContent: React.FC<ProjectDashboardContentProps> = ({ projectName, clientName, initialProject }) => {
    const [project, setProject] = useState<Project>(initialProject);
    
    // Mock Data for demonstration
    const initialTasks: Task[] = [
        { id: 1, description: "Draft initial branding guidelines document.", dueDate: "2024-09-20", isComplete: false },
        { id: 2, description: "Initial Kickoff Call Summary & Action Items.", dueDate: "2024-09-12", isComplete: true },
        { id: 3, description: "Review and finalize color palette for v2.", dueDate: "2024-10-05", isComplete: false },
    ];

    const initialMilestones: Milestone[] = [
        { name: "Discovery Phase Completion", due: "2024-09-15", completed: true },
        { name: "Wireframe Approval", due: "2024-10-15", completed: false },
        { name: "Final Delivery", due: "2024-12-31", completed: false },
    ];
    
    const [tasks] = useState<Task[]>(initialTasks);
    const [milestones] = useState<Milestone[]>(initialMilestones);

    const handleStatusTransition = (nextStatus: 'Active' | 'Review' | 'Completed') => {
        const currentStatus = project.status;
        if (currentStatus === nextStatus) return;

        // Simulate complex backend logic
        setProject(prev => ({ ...prev, status: nextStatus }));
        alert(`✅ Project Status Transitioned: ${currentStatus} -> ${nextStatus}! \n\n(In a real application, this would trigger updates to tasks, milestones, and notifications.)`);
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

    return (
        <div className="space-y-8">
            {/* Project Header and Status Workflow */}
            <Card className="p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold text-gray-900">{projectName}</h2>
                        <div className="flex items-center space-x-2 mt-2 text-lg text-gray-600">
                            <MessageCircle className="w-5 h-5"/>
                            <span >Client: {clientName}</span>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3 flex-wrap gap-2">
                        {/* Status Buttons */}
                        <div className="flex space-x-3">
                            <Button 
                                variant="outline" 
                                onClick={() => alert('Opening task creation modal.')}
                            >
                                + Task
                            </Button>
                             <Button 
                                variant="outline" 
                                onClick={() => alert('Opening file upload modal.')}
                            >
                                + Asset
                            </Button>
                        </div>
                        
                        <div className="flex space-x-2">
                            <Button 
                                onClick={() => handleStatusTransition('Active')} 
                                disabled={project.status === 'Active'}
                                className={`transition-all ${project.status === 'Planning' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                                Active
                            </Button>
                            <Button 
                                onClick={() => handleStatusTransition('Review')} 
                                disabled={project.status === 'Review' || project.status === 'Completed'}
                                className={`transition-all ${project.status === 'Active' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                                Review
                            </Button>
                            <Button 
                                onClick={() => handleStatusTransition('Completed')} 
                                disabled={project.status === 'Completed'}
                                className={`transition-all ${project.status === 'Review' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column 1: Tasks & To-Dos (largely unchanged) */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <ListChecks className="w-5 h-5 text-blue-600"/>
                                <span>Tasks & To-Dos</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-500">Tasks due this week (3/5)</p>
                                <Button variant="outline" className="text-sm">View All Tasks</Button>
                            </div>
                            <div className="space-y-3">
                                {tasks.map(task => (
                                    <div key={task.id} className={`flex items-start space-x-3 p-3 rounded-md border ${task.isComplete ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
                                        <button 
                                            onClick={() => alert(`Toggle task ${task.id}`)}
                                            className={`pt-1 ${task.isComplete ? 'text-green-500' : 'text-gray-400'}`}
                                        >
                                            {task.isComplete ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </button>
                                        <div className="flex-grow">
                                            <p className={`font-medium ${task.isComplete ? 'text-gray-600 line-through' : 'text-gray-800'}`}>{task.description}</p>
                                            <div className="flex items-center space-x-3 text-xs text-gray-500 pt-1">
                                                <span>Due: {task.dueDate}</span>
                                                <span className={task.isComplete ? 'text-green-600' : ''}>Priority: High</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => alert('Opening task creation modal.')}>
                                + Add New Task
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Milestones & Assets (largely unchanged) */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <Clock className="w-5 h-5 text-red-600"/>
                                <span>Milestones & Timeline</span>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {milestones.map((m, index) => (
                                    <div key={index} className={`flex items-start space-x-3 ${m.completed ? 'text-green-600' : 'text-gray-800'}`}>
                                        <CheckCircle className={`w-6 h-6 flex-shrink-0 ${m.completed ? 'text-green-500' : 'text-gray-300'}`} />
                                        <div >
                                            <p className="font-medium">{m.name}</p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <span >Due: {m.due}</span >
                                                <Badge variant={m.completed ? "success" : "default"}>{m.completed ? 'Done' : 'Upcoming'}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => alert("Timeline editor opened.")}>
                                Adjust Timeline
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Assets (largely unchanged) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <FolderOpen className="w-5 h-5 text-orange-600"/>
                                <span>Assets & Files</span>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Latest files: Logos, wireframes, moodboards.</p>
                                <Button variant="outline" onClick={() => alert('File upload opened.')}>+ Upload File</Button>
                            </div>
                            <div className="space-y-2">
                                {/* Mock files listing */}
                                <div className="flex items-center justify-between p-2 border-b hover:bg-gray-50 rounded-md cursor-pointer">
                                    <span className="truncate">Final Logo Pack v3.svg</span>
                                    <Badge>Image</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 border-b hover:bg-gray-50 rounded-md cursor-pointer">
                                    <span className="truncate">Strategy Deck.pdf</span>
                                    <Badge>Document</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 border-b hover:bg-gray-50 rounded-md cursor-pointer">
                                    <span className="truncate">Client Moodboard.png</span>
                                    <Badge>Image</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ProjectDashboardContent;