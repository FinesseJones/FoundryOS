"use client"

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/status-badge';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Target, Edit, MessageSquare, CheckSquare } from 'lucide-react';

// In a real app, this data would be fetched from an API.
// I've expanded the mock data to include more details for this view.
const mockProjectsData = [
    { id: 1, name: 'Website Redesign Q3 2024', goal: 'Optimize user journey/CTAs.', priority: 'High', status: 'In Progress', completion: 65, scope: 'Full redesign of the marketing website, including new landing pages, a revised user flow for sign-ups, and updated brand assets. Excludes backend API changes.', budget: 50000, startDate: '2024-07-01', endDate: '2024-09-30' },
    { id: 2, name: 'Q4 Branding Assets Library', goal: 'Expand iconography and color guidelines.', priority: 'Medium', status: 'In Progress', completion: 10, scope: 'Creation of 50 new icons, a secondary color palette, and updated typography guidelines for use in all Q4 marketing materials.', budget: 15000, startDate: '2024-10-01', endDate: '2024-11-30' },
    { id: 3, name: 'Internal Tool Migration', goal: 'Move legacy CRM data to new platform.', priority: 'High', status: 'At Risk', completion: 90, scope: 'Migrate all customer data from the old CRM to the new Salesforce instance. Includes data cleaning, mapping, and validation.', budget: 75000, startDate: '2024-06-15', endDate: '2024-08-15' },
    { id: 4, name: 'Market Research Initiative', goal: 'Identify key untapped revenue sources.', priority: 'Low', status: 'Complete', completion: 100, scope: 'Conduct surveys and focus groups to identify potential new market segments for our flagship product. Deliver a final report with recommendations.', budget: 20000, startDate: '2024-05-01', endDate: '2024-06-30' },
];

const mockTasks = [
    { id: 1, text: 'Finalize wireframes for landing page', completed: true },
    { id: 2, text: 'Develop primary button component', completed: true },
    { id: 3, text: 'Set up analytics tracking for user flow', completed: false },
    { id: 4, text: 'Draft copy for the "About Us" page', completed: false },
];

const mockComments = [
    { user: 'Alice', text: 'The new wireframes look great! Approved.', timestamp: '2 days ago' },
    { user: 'Bob', text: 'Can we get an update on the analytics setup? This is a blocker for the marketing team.', timestamp: '1 day ago' },
    { user: 'Charlie', text: '@Bob I\'m on it, should be done by EOD tomorrow.', timestamp: '1 day ago' },
];

const ProjectDetail = () => {
    const { projectId } = useParams();
    const project = mockProjectsData.find(p => p.id.toString() === projectId);

    if (!project) {
        return (
            <div className="text-center p-10">
                <h1 className="text-3xl font-bold text-destructive">Project Not Found</h1>
                <p className="text-gray-600 mt-2">The project you are looking for does not exist or has been moved.</p>
                <Link to="/projects">
                    <Button className="mt-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Projects
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link to="/projects" className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <StatusBadge status={project.status}>{project.status}</StatusBadge>
                            <StatusBadge status={project.priority}>{project.priority} Priority</StatusBadge>
                        </div>
                    </div>
                    <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Project
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Project Scope & Goal</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-gray-700">{project.scope}</p>
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="font-semibold flex items-center"><Target className="w-4 h-4 mr-2 text-blue-600" /> Primary Goal</h4>
                                <p className="text-gray-600 italic mt-1">{project.goal}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Tasks & Progress</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {mockTasks.map(task => (
                                    <li key={task.id} className="flex items-center">
                                        <CheckSquare className={`w-5 h-5 mr-3 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Key Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-3 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Budget</p>
                                    <p className="font-semibold">${project.budget.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Timeline</p>
                                    <p className="font-semibold">{project.startDate} to {project.endDate}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Completion</p>
                                <Progress value={project.completion} className="h-3" />
                                <p className="text-right text-sm font-bold mt-1">{project.completion}%</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {mockComments.map((comment, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">{comment.user.charAt(0)}</div>
                                        <div>
                                            <p className="text-sm text-gray-800"><span className="font-semibold">{comment.user}</span>: {comment.text}</p>
                                            <p className="text-xs text-gray-500">{comment.timestamp}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;