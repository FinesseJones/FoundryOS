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

// Environment Masters, Inc. (Jackson, MS) — Commercial Project Operations
const mockProjectsData = [
    { id: 1, name: 'Jackson Medical Mall 200-Ton Chiller Overhaul (Jackson, MS)', goal: 'Replace aging rooftop chillers with high-efficiency variable-speed Carrier units.', priority: 'High', status: 'In Progress', completion: 65, scope: 'Crane hoist of 200-ton chiller assembly, BACnet DDC controller integration, and emergency hospital wing cooling failover testing.', budget: 145000, startDate: '2026-06-01', endDate: '2026-10-30' },
    { id: 2, name: 'Madison Station Historic Plaza Plumbing Retrofit (Madison, MS)', goal: 'Trenchless epoxy pipe lining and commercial backflow prevention certification.', priority: 'High', status: 'In Progress', completion: 85, scope: 'High-pressure hydrojetting of 1,200ft main sewer lateral and zero-dig NuFlow epoxy lining under historic brick walkways.', budget: 68000, startDate: '2026-07-15', endDate: '2026-09-30' },
    { id: 3, name: 'Highland Colony 480V Commercial Panel & Surge Upgrade (Ridgeland, MS)', goal: 'Infrared thermal audit, 3-phase surge protection, and circuit breaker telemetry.', priority: 'Medium', status: 'In Progress', completion: 40, scope: 'Schneider Electric Square D 480V/277V switchgear upgrade and IoT load-balancing sensors for commercial office tenants.', budget: 52000, startDate: '2026-08-01', endDate: '2026-11-15' },
    { id: 4, name: 'Pearl Metro Depot Smart HVAC Auto-Diagnostics (Pearl, MS)', goal: 'IoT thermostat telemetry and sub-15s emergency dispatch integration.', priority: 'Low', status: 'Complete', completion: 100, scope: 'Installation of 32 Honeywell commercial smart thermostats with FoundryOS SMS dispatch webhook integration.', budget: 20000, startDate: '2026-05-01', endDate: '2026-06-30' },
];

const mockTasks = [
    { id: 1, text: 'Complete structural crane rigging permit with City of Jackson Engineering Dept', completed: true },
    { id: 2, text: 'Install vibration isolators and 6-inch chilled water supply/return lines', completed: true },
    { id: 3, text: 'Calibrate BACnet temperature sensor offsets across Zone 3 and Zone 4', completed: false },
    { id: 4, text: 'Dispatch 1-Tap Google Review invite SMS to Medical Mall Facility Director', completed: false },
];

const mockComments = [
    { user: 'Ray Buckley (President)', text: 'Chiller delivery arrived at Jackson Medical Mall on schedule. Crane lift approved.', timestamp: '2 days ago' },
    { user: 'Sarah Vance (Dispatch)', text: 'Hospital facility managers confirmed no cooling interruptions in surgical wings during zone switchover.', timestamp: '1 day ago' },
    { user: 'Marcus Holloway (Master Electrician)', text: '480V disconnect wired and passed City of Jackson electrical inspection with zero citations.', timestamp: '4 hours ago' },
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