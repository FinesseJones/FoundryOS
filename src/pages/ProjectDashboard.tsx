"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Clock, Folder, Loader2 } from "lucide-react";
import { AiAssistantWidget } from "@/components/AiAssistantWidget"; // Import AI Widget
import { useOllamaApi } from "@/hooks/useOllamaApi"; // Import Ollama Hook

// Interface for project data
interface ProjectDetails {
    name: string;
    client: string;
    status: 'Active' | 'On Hold' | 'Completed';
    progress: number; // 0-100
    totalBudget: number;
    budgetSpent: number;
    dueDate: string;
}

// Define the initial mock data structure
interface ProjectProps {
    projectName: string;
    clientName: string;
    initialProject: ProjectDetails;
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const ProjectDashboardPage: React.FC<ProjectProps> = ({ projectName, clientName, initialProject, currentUser }) => {
    const [project, setProject] = useState<ProjectDetails>(initialProject);
    // State for modal management
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Hooks for AI interaction
    const { generateContent, isLoading: isAILoading, error: olllamaError } = useOllamaApi();

    // --- CRUD HANDLERS ---
    const handleProjectUpdate = async (formData: Partial<ProjectDetails>) => {
        // Simulate API call to update the project status
        try {
            // Update local state immediately
            setProject(prev => ({
                ...prev,
                ...formData
            }));
            setIsModalOpen(false);
            alert("✅ Project details saved successfully! (State Updated)");
        } catch (e) {
            alert("❌ Error saving project.");
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
            dueDate: project.dueDate
        });
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            let updateValue: any;

            if (type === 'range') {
                updateValue = parseInt(value);
            } else if (name === 'totalBudget' || name === 'budgetSpent') {
                updateValue = parseFloat(value) || 0;
            } else if (name === 'progress') {
                 updateValue = parseInt(value);
            } else {
                updateValue = value;
            }

            setFormState(prev => ({ ...prev, [name]: updateValue }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            
            // Basic validation/calculation before submission
            if (formState.budgetSpent > formState.totalBudget) {
                alert("❌ Error: Spent budget cannot exceed total budget.");
                return;
            }

            // We reuse the handleProjectUpdate logic from the parent component scope
            await handleProjectUpdate(formState);
        };

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg border border-indigo-200">
                <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                    {project.name}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Name/Client */}
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

                    {/* Core Metrics */}
                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                name="status" 
                                value={(formState.status || 'Active') as string} 
                                onChange={handleChange} 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="range"
                                    name="progress"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={formState.progress || 0}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                                />
                                <span className="text-sm font-semibold w-10 text-right">{formState.progress || 0}%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <Input 
                                type="date" 
                                name="dueDate" 
                                value={(formState.dueDate || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>

                    {/* Budget Tracking (Financial Inputs) */}
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
                        <div>
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


    // Calculate remaining budget for display
    const remainingBudget = useMemo(() => {
        return Math.max(0, project.totalBudget - project.budgetSpent);
    }, [project.totalBudget, project.budgetSpent]);


    return (
        <AppLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
                <p className="text-lg text-gray-600">Overview of active projects, resource allocation, and progress tracking.</p>

                {/* Main Project Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>{projectName} ({clientName})</CardTitle>
                        <p className="text-sm text-gray-500">Managed by your team. Focus on key metrics to ensure timely delivery.</p>
                    </CardHeader>
                    <CardContent>
                        {/* Metric Grid Start */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Milestone 1: Progress Card */}
                            <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Progress</CardTitle>
                                    <TrendingUp className="h-5 w-5 text-indigo-400"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
                                    <p className="text-xs text-gray-500 pt-1">Goal completion towards target.</p>
                                    <div className="mt-4">
                                        <div className="flex justify-between mb-1 text-xs font-medium">
                                            <span>Target: {project.progress}%</span>
                                            <span className={project.progress >= 60 ? "text-green-600" : "text-red-500"}>{project.progress >= 60 ? "Achievable" : "At Risk"}</span>
                                        </div>
                                        <Progress value={project.progress} className="w-full" />
                                    </div>
                                </CardContent>
                            </Card>

                             {/* Milestone 2: Budget Card */}
                            <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Budget Status</CardTitle>
                                    <Folder className="h-5 w-5 text-green-400"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">${remainingBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                                    <p className="text-xs text-gray-500 pt-1">Remaining Funds</p>
                                    <div className="mt-4 text-sm text-red-500">
                                        <button onClick={() => {/* Alert user to review spending */} } className="hover:underline">Review Spending Breakdown</button>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Milestone 3: Deadline/Timeline Card */}
                            <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Timeline</CardTitle>
                                    <Clock className="h-5 w-5 text-yellow-400"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{project.dueDate}</div>
                                    <p className="text-xs text-gray-500 pt-1">Original Deadline</p>
                                    <div className={`mt-4 text-sm ${project.progress > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                        Status: {project.progress > 80 ? "Nearing Completion" : "Needs Attention"}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        <div className="flex justify-center items-center pt-8">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-md shadow-lg transition-colors"
                            >
                                Manage & Update Project Details
                            </button>
                        </div>
                    </CardContent>
                </Card>
                
                {/* 3. AI Assistant (Intelligent Layer) */}
                <AiAssistantWidget isVisible={true} title="🤖 Project Strategy Assistant" />
            </div >
        </AppLayout>
    );
}

export default ProjectDashboardPage;