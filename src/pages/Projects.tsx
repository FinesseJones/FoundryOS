"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import ProjectForm from "@/components/project-form";

// Mock Project Data for demonstration
interface Project {
    id: number;
    name: string;
    goal: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'In Progress' | 'Complete' | 'At Risk';
    completion: number; // Percentage
}

const mockProjects: Project[] = [
    { id: 1, name: 'Website Redesign Q3 2024', goal: 'Optimize user journey/CTAs.', priority: 'High', status: 'In Progress', completion: 65 },
    { id: 2, name: 'Q4 Branding Assets Library', goal: 'Expand iconography and color guidelines.', priority: 'Medium', status: 'In Progress', completion: 10 },
    { id: 3, name: 'Internal Tool Migration', goal: 'Move legacy CRM data to new platform.', priority: 'High', status: 'At Risk', completion: 90 },
    { id: 4, name: 'Market Research Initiative', goal: 'Identify key untapped revenue sources.', priority: 'Low', status: 'Complete', completion: 100 },
];


const Projects = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock function for handling project submission
  const handleProjectSubmit = (data: any) => {
    setLoading(true);
    // Logic to call an API endpoint to create/update the project goes here
    setTimeout(() => {
        setLoading(false);
        setIsCreating(false);
        alert(`Project "${data.projectName}" submitted! (Check console for data)`);
        console.log("Submitted Project Data:", data);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Project Management Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Form/Creation Sidebar */}
        <div className={`lg:col-span-1 ${isCreating ? '' : 'hidden'}`}>
           <Card className="h-full">
             <CardHeader className='border-b'>
                <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
                <ProjectForm onSubmit={handleProjectSubmit} isLoading={loading} />
            </CardContent>
          </Card>
        </div>

        {/* Project Listing Area */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-center pt-1">
             <h2 className="text-2xl font-semibold">Browse All Initiatives</h2>
             <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsCreating(true)}>
                    + New Project
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Filter
                </button>
             </div>
           </div>

            <Card className="shadow-sm">
                <CardHeader>List of Active Projects</CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Goal</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                                <TableHead className="text-right">Completion/head>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockProjects.map((project) => (
                                <TableRow key={project.id} className="hover:bg-gray-50 cursor-pointer">
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell className="text-sm">{project.goal}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={project.priority} variant="secondary">{project.priority}</StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <StatusBadge status={project.status} variant="secondary">{project.status}</StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center space-x-2">
                                            <Badge className="text-lg font-bold text-blue-600">{project.completion}%</Badge>
                                            <progress className="w-24 h-2 rounded-full" value={project.completion} max="100"></progress>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                                        <Button variant="default" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Projects;