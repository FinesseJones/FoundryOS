"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import ProjectForm, { ProjectData } from "@/components/project-form";
import { Badge } from "@/components/ui/badge";

// Mock Project Data for demonstration
interface Project {
    id: number;
    name: string;
    goal: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'In Progress' | 'Complete' | 'At Risk';
    completion: number; // Percentage
}

const initialMockProjects: Project[] = [
    { id: 1, name: 'Website Redesign Q3 2024', goal: 'Optimize user journey/CTAs.', priority: 'High', status: 'In Progress', completion: 65 },
    { id: 2, name: 'Q4 Branding Assets Library', goal: 'Expand iconography and color guidelines.', priority: 'Medium', status: 'In Progress', completion: 10 },
    { id: 3, name: 'Internal Tool Migration', goal: 'Move legacy CRM data to new platform.', priority: 'High', status: 'At Risk', completion: 90 },
    { id: 4, name: 'Market Research Initiative', goal: 'Identify key untapped revenue sources.', priority: 'Low', status: 'Complete', completion: 100 },
];


const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(initialMockProjects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateClick = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  // Mock function for handling project submission
  const handleProjectSubmit = (data: ProjectData) => {
    setLoading(true);
    setTimeout(() => {
      if (editingProject) {
        // Update existing project
        setProjects(projects.map(p => 
          p.id === editingProject.id 
            ? { ...p, name: data.projectName, goal: data.projectGoal, priority: data.priority as any } 
            : p
        ));
      } else {
        // Create new project
        const newProject: Project = {
          id: Math.max(0, ...projects.map(p => p.id)) + 1,
          name: data.projectName,
          goal: data.projectGoal,
          priority: data.priority as any,
          status: 'In Progress',
          completion: 0,
        };
        setProjects(prev => [...prev, newProject]);
      }
      setLoading(false);
      setIsFormOpen(false);
      setEditingProject(null);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Project Management Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Form/Creation Sidebar */}
        {isFormOpen && (
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className='border-b'>
                  <CardTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                  <ProjectForm
                    onSubmit={handleProjectSubmit}
                    isLoading={loading}
                    initialData={editingProject ? {
                      id: editingProject.id,
                      projectName: editingProject.name,
                      projectGoal: editingProject.goal,
                      priority: editingProject.priority,
                      scopeDescription: '', // These fields are not in the mock data
                      startDate: new Date().toISOString().split('T')[0],
                      budget: ''
                    } : null}
                    onCancel={handleCancelForm}
                  />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Listing Area */}
        <div className={isFormOpen ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
           <div className="flex justify-between items-center pt-1">
             <h2 className="text-2xl font-semibold">Browse All Initiatives</h2>
             <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCreateClick}>
                    + New Project
                </Button>
                <Button>
                  Filter
                </Button>
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
                                <TableHead className="text-right">Completion</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell className="text-sm">{project.goal}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={project.priority} variant="secondary">{project.priority}</StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <StatusBadge status={project.status} variant="secondary">{project.status}</StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Badge>{project.completion}%</Badge>
                                            <progress className="w-24 h-2 rounded-full" value={project.completion} max="100"></progress>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(project)}>Edit</Button>
                                        <Button size="sm">View</Button>
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