"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Clock, Folder, Loader2, CheckCircle, Zap, Activity } from "lucide-react";
import AiAssistantWidget from "@/components/AiAssistantWidget";
import { logSystemEvent } from "@/utils/auditLogger"; // <-- Using the logger for governance
import { toast } from "react-hot-toast";

// Interface for project data
interface ProjectDetails {
    name: string;
    client: string;
    status: 'Discovery' | 'Proposal' | 'Evaluation' | 'Active' | 'Completed' | 'Archived';
    progress: number; // 0-100
    totalBudget: number;
    budgetSpent: number;
    dueDate: string;
    currentPhase: 'Initiation' | 'Development' | 'Closure'; // New state for workflow tracking
}

// Define the initial mock data structure
interface ProjectProps {
    projectName: string;
    clientName: string;
    initialProject: ProjectDetails;
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}


const ProjectDashboardPage: React.FC<ProjectProps> = ({ projectName, clientName, initialProject, currentUser }) => {
    // Initial default phase must be handled
    const [project, setProject] = useState<ProjectDetails>(initialProject);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- GOVERNANCE/WORKFLOW HANDLERS ---
    const handleProjectUpdate = async (formData: Partial<ProjectDetails>) => {
        // 1. VALIDATION CHECK (The Governance Layer)
        if (!formData.progress) {
            toast.error("❌ Cannot update without a progress percentage.");
            return;
        }
        
        // 2. WORKFLOW LOGIC CHECK (The Rules)
        let validationSuccess = true;
        let validationMessage = '';

        const currentStatus = project.status;
        const newStatus = formData.status || currentStatus;

        if (currentStatus === 'Discovery' && newStatus !== 'Discovery' && formData.progress < 10) {
            validationSuccess = false;
            validationMessage = "⚠️ Warning: Status cannot advance until minimum progress is achieved.";
        }
        
        // 3. IF VALID, UPDATE AND LOG
        if (validationSuccess) {
             try {
                setProject(prev => ({
                    ...prev,
                    ...formData
                }));
                
                // LOGGING: Log the state transition
                const logDetails = `Status transitioned from ${currentStatus} to ${newStatus}. Progress set to ${formData.progress ?? project.progress}.`;
                logSystemEvent('Projects', 'UPDATE', logDetails, currentUser.role);

                toast.success(`✅ Project ${projectName} details saved successfully! Workflow advanced to ${newStatus}.`);
            } catch (e) {
                toast.error("❌ Failed to save project status.");
            }
            setIsModalOpen(false);
        } else {
            toast.error(validationMessage);
            return;
        }
    };


    // --- Component Logic: Project Edit/Create Modal Form ---
    const ProjectFormModal = () => {
        const [formState, setFormState] = useState<Partial<ProjectDetails>>({
            name: project.name,
            client: project.client,
            status: project.status,
            progress: project.progress,
            totalBudget: project.totalBudget,
            budgetSpent: project.budgetSpent,
            dueDate: project.dueDate,
            currentPhase: project.currentPhase
        });
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            let updateValue: any;

            if (type === 'range' || name === 'progress') {
                updateValue = parseInt(value);
            } else if (name === 'totalBudget' || name === 'budgetSpent') {
                updateValue = parseFloat(value) || 0;
            } else if (name === 'status' || name === 'currentPhase') {
                updateValue = (e.target as HTMLSelectElement).value;
            } else {
                updateValue = value;
            }

            setFormState(prev => ({ ...prev, [name]: updateValue }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            await handleProjectUpdate(formState);
        };

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg border border-indigo-200">
                <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                    Manage Project Details
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* (Form content remains largely the same) */}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                            <Input 
                                type="text" 
                                name="name" 
                                value={(formState.name || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <Input 
                                type="text" 
                                name="client" 
                                value={(formState.client || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status (Lifecycle Stage)</label>
                            <select 
                                name="status" 
                                value={(formState.status || 'Active') as string} 
                                onChange={handleChange} 
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="Discovery">Discovery</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Evaluation">Evaluation</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Phase</label>
                            <select 
                                name="currentPhase" 
                                value={(formState.currentPhase || 'Initiation') as string} 
                                onChange={handleChange} 
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="Initiation">Initiation</option>
                                <option value="Development">Development</option>
                                <option value="Closure">Closure</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
                            <Input 
                                type="number" 
                                name="totalBudget" 
                                value={String(formState.totalBudget || 0)} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Spent ($)</label>
                            <Input 
                                type="number" 
                                name="budgetSpent" 
                                value={String(formState.budgetSpent || 0)} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">Close</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            Save Updates <BookOpen className="ml-2 h-4 w-4 inline"/>
                        </Button>
                    </div>
                </form>
            </div >
        );
    };


    const remainingBudget = useMemo(() => {
        return Math.max(0, project.totalBudget - project.budgetSpent);
    }, [project.totalBudget, project.budgetSpent]);


    return (
        <AppLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">Project Management Dashboard: Workflow View</h1>
                <p className="text-lg text-gray-600">This view enforces project governance, ensuring that status changes are logical and required data is always captured.</p>

                {/* Main Project Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>{projectName} ({clientName})</CardTitle>
                        <p className="text-sm text-gray-500">Current Workflow Phase: <Badge variant="default" className="bg-green-100 text-green-800">{project.currentPhase} Phase</Badge></p>
                    </CardHeader>
                    <CardContent>
                        {/* Section 1: The Workflow Board */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><Activity className="w-5 h-5 text-indigo-600"/> Project Lifecycle Workflow Board</h2>
                            <div className="flex justify-between p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                {/* Column: Discovery */}
                                <div className={`flex-1 p-3 rounded-lg ${project.status === 'Discovery' ? 'bg-indigo-100 border-indigo-500 border-2' : 'bg-white border-gray-200'}`}>
                                    <h3 className="font-semibold mb-2 text-indigo-700">Discovery</h3>
                                    <p className="text-sm text-gray-600">Define scope and validate business need.</p>
                                </div>
                                {/* Column: Proposal - The Current/Target Column */}
                                <div className={`flex-1 p-3 rounded-lg ${project.status === 'Proposal' ? 'bg-green-100 border-green-500 border-2' : 'bg-white border-gray-200'}`}>
                                    <h3 className="font-semibold mb-2 text-green-700">Proposal</h3>
                                    <p className="text-sm text-gray-600">Structure statement of work & estimate.</p>
                                </div>
                                {/* Column: Evaluation */}
                                <div className={`flex-1 p-3 rounded-lg ${project.status === 'Evaluation' ? 'bg-yellow-100 border-yellow-500 border-2' : 'bg-white border-gray-200'}`}>
                                    <h3 className="font-semibold mb-2 text-yellow-700">Evaluation</h3>
                                    <p className="text-sm text-gray-600">Technical check & capacity planning.</p>
                                </div>
                                {/* Column: Completed */}
                                <div className="flex-1 p-3 rounded-lg bg-white border-gray-200">
                                    <h3 className="font-semibold mb-2 text-green-700">Completed</h3>
                                    <p className="text-sm text-gray-600">Final sign-off and revenue realization.</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        
                        {/* Section 2: Metric Details Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Card 1: Progress Card (Display) */}
                             <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Project Progress</CardTitle>
                                    <TrendingUp className="h-5 w-5 text-indigo-400"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
                                    <p className="text-xs text-gray-500 pt-1">Global Platform Overhaul</p>
                                    <div className="mt-4">
                                        <div className="flex justify-between mb-1 text-xs font-medium">
                                            <span>Next Milestone: Beta Launch</span>
                                            <span className="text-indigo-600">Due Q1 Next Year</span>
                                        </div>
                                        <div className="flex justify-between mb-1 text-xs font-medium">
                                            <span>Budget Utilization:</span>
                                            <span className={project.budgetSpent / project.totalBudget > 0.9 ? "text-red-600" : "text-green-600"}>{Math.round((project.budgetSpent / project.totalBudget) * 100)}%</span>
                                        </div>
                                        <Progress value={project.progress} className="w-full" />
                                    </div>
                                </CardContent>
                            </Card>

                             {/* Card 2: Budget Card (Display) */}
                            <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Budget Status</CardTitle>
                                    <Folder className="h-5 w-5 text-green-400"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">${remainingBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                                    <p className="text-xs text-gray-500 pt-1">Remaining Funds</p>
                                    <div className="mt-4">
                                        <button onClick={() => toast.success("Opening detailed budget breakdown...")} className="text-sm text-red-600 hover:underline">Review Spending Breakdown</button>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Card 3: Strategic Insight Card */}
                            <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Strategic Insight (AI)</CardTitle>
                                    <Zap className="h-5 w-5 text-yellow-400"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-gray-900">Need to formalize handoff protocols between teams.</div>
                                    <p className="text-xs text-gray-500 pt-1">Requires policy documentation (next sprint).</p>
                                    <div className="mt-4">
                                        <button onClick={() => toast.success("Simulated AI generating policy draft...")} className="text-sm text-yellow-600 hover:underline">Generate Policy Draft &gt; (AI)</button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
                
                {/* AI Assistant Widget */}
                <AiAssistantWidget isVisible={true} title="🤖 Project Strategy Assistant" />
            </div >
        </AppLayout>
    );
}

export default ProjectDashboardPage;