"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProjectForm from "@/components/project-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


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
           {/* This area will dynamically show the form if isCreating is true */}
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

            {/* Project Table */}
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
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Example Project Row 1 */}
                            <TableRow className="hover:bg-gray-50 cursor-pointer">
                                <TableCell className="font-medium">Website Redesign Q3 2024</TableCell>
                                <TableCell>Optimize user journey/CTAs.</TableCell>
                                <TableCell>High</TableCell>
                                <TableCell className="text-green-600 font-semibold">65% Complete</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="mr-2">View</Button>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                            {/* Example Project Row 2 */}
                            <TableRow className="hover:bg-gray-50 cursor-pointer">
                                <TableCell className="font-medium">Q4 Branding Assets Library</TableCell>
                                <TableCell>Expand iconography and color guidelines.</TableCell>
                                <TableCell>Medium</TableCell>
                                <TableCell className="text-yellow-600 font-semibold">10% Complete</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="mr-2">View</Button>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                            {/* Example Project Row 3 */}
                            <TableRow className="hover:bg-gray-50 cursor-pointer">
                                <TableCell className="font-medium">Internal Tool Migration</TableCell>
                                <TableCell>Move legacy CRM data to new platform.</TableCell>
                                <TableCell>High</TableCell>
                                <TableCell className="text-blue-600 font-semibold">Upcoming</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="mr-2">View</Button>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* To make the form usable on click in the list style */}
      <div className="flex justify-center pt-8">
        <Button onClick={() => setIsCreating(true)}>
            + Start New Project Workflow
        </Button>
      </div>
    </div>
  );
};

export default Projects;