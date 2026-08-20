"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import ProjectDashboardContent from '@/components/ProjectDashboardContent';

// Define the container component that handles state/context (Placeholder for API integration)
interface ProjectDashboardPageProps {
    projectName: string;
    clientName: string;
    initialProject: {
        name: string;
        client: string;
        status: 'Planning' | 'Active' | 'Review' | 'Completed';
        progress: number;
        totalBudget: number;
        budgetSpent: number;
        dueDate: string;
    };
}

// Placeholder Component: This will act as the single source of truth for project data, 
// and will be fully updated to fetch data from a real API.
const ProjectDashboardPage: React.FC<ProjectDashboardPageProps> = ({ projectName, clientName, initialProject }) => {
    // The ProjectDashboardContent component is now the single source of truth for the UI, 
    // it receives mandatory data via props.
    return (
        <AppLayout>
             <div className="container mx-auto p-4">
                <ProjectDashboardContent 
                    projectName={projectName}
                    clientName={clientName}
                    initialProject={initialProject}
                />
            </div>
        </AppLayout>
    );
};

// Export default for routing purposes
export default ProjectDashboardPage;