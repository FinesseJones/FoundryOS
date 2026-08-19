"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

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

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const budgetUsedPercentage = Math.min(100, (project.budgetSpent / project.totalBudget) * 100).toFixed(0);

    const getStatusClasses = (status: Project['status']) => {
        switch (status) {
            case 'Planning':
                return "border-amber-500 text-amber-700 bg-amber-50/80";
            case 'Active':
                return "border-indigo-500 text-indigo-700 bg-indigo-50/80";
            case 'Review':
                return "border-blue-500 text-blue-700 bg-blue-50/80";
            case 'Completed':
                return "border-green-500 text-green-700 bg-green-50/80";
        }
    };

    return (
        <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                    <Badge className={`${getStatusClasses(project.status)}`}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</Badge>
                </div>
                <p className="text-sm text-gray-500">{project.client}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress */}
                <div className="namespace-progress">
                    <div className="flex items-center justify-between text-sm font-medium mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="w-full h-2" />
                </div>

                {/* Financials */}
                <div className="flex justify-between text-sm text-muted-foreground border-t pt-3">
                    <div className="flex items-center space-x-2">
                         <DollarSign className="w-4 h-4" />
                        <span>Budget Used: ${(project.budgetSpent / 1000).toFixed(1)}k / ${(project.totalBudget / 1000).toFixed(1)}k</span>
                         <progress value={parseFloat(budgetUsedPercentage)} max="100" className="w-20 h-2 ml-2" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {project.dueDate}</span>
                    </div>
                </div>
            </CardContent>
            <div className="mt-4">
                <Button className="w-full" onClick={() => alert(`Viewing details for ${project.name}`)}>
                    View Project
                </Button>
            </div>
        </Card>
    );
};

export default ProjectCard;