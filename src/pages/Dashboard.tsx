"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Folder, Users, DollarSign, CheckCircle, AlertTriangle, Zap, Cpu, FileText, DollarSign as DollarSignIcon } from "lucide-react";

// Mock data sources for the dashboard widgets
const mockDashboardData = {
    activeProjects: 7,
    highPriorityLeads: 3,
    overdueTasks: 5,
    totalBudgetUtilization: 85, // Percentage
    activeUsers: 124,
    availablebudget: "$12,000",
};

// --- Metric Card ---
interface MetricCardProps {
  icon: React.ReactElement;
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: IconElement, title, value, color }) => {
    let colorClasses = '';
    switch(color) {
        case 'blue':
            colorClasses = 'text-blue-600';
            break;
        case 'green':
            colorClasses = 'text-green-600';
            break;
        case 'yellow':
            colorClasses = 'text-yellow-600';
            break;
        default:
            colorClasses = 'text-gray-500';
    }

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {IconElement}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${colorClasses}`}>{value}</div >
            </CardContent>
        </Card>
    );
};

// --- Action Items Widget ---
const ActionItemsWidget = () => {
    // Combine critical items from Leads, Projects, and Users
    const actions = [
        { type: 'lead', text: 'Follow up on Enterprise Corp lead (HIGH)', priority: 'High', icon: <Zap className="w-5 h-5 text-red-500" /> },
        { type: 'project', text: 'Review overdue milestone for Q4 Branding.', priority: 'Medium', icon: <AlertTriangle className="w-5 h-5 text-yellow-500" /> },
        { type: 'user', text: 'Onboard new team member: Alex Smith', priority: 'High', icon: <Users className="w-5 h-5 text-blue-500"/> },
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>🛎️ Action Items</CardTitle>
                <p className="text-sm text-gray-500">Urgent tasks mixed from all operational modules.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {actions.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 pt-2 border-b last:border-b-0">
                        <div className={`flex-shrink-0 pt-1 ${item.icon.props} ${item.icon}`}></div>
                        <div className="flex-grow pt-1">
                            <p className="text-sm text-gray-800 leading-snug">{item.text}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700 text-xs'}`}>{item.priority}</Badge>
                                <Button variant="outline" size="sm">Go</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

// --- AI Assistant Widget ---
const AIAssistantWidget: React.FC = () => {
    return (
        <Card className="shadow-xl border-l-4 border-indigo-500 ring-2 ring-indigo-100">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <Cpu className="w-7 h-7 text-indigo-600" />
                    <CardTitle>🔍 AI Assistant Guidance</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-gray-700 italic">
                    Based on Project Status and Leads, the system recommends finalizing the core brand strategy using the <span className="font-bold text-indigo-600">Brand Identity Generator</span> before allocating resources to new projects.
                </p>
                
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b pb-3">
                        <span className="font-medium text-gray-700">✨ Recommended Workflow:</span>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => window.location.href = '/brand-generator'}>
                            Start Brand Generation <Zap className="w-4 h-4 ml-1 inline" />
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500 pt-2">*Always verify AI suggestions against current Settings configurations.</div>
                </div >
            </CardContent>
        </Card>
    );
}

// --- Pipeline Widget ---
const PipelineWidget = () => {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Project Health Pipeline</CardTitle>
                <p className="text-sm text-gray-500">Visualize the lifecycle of all current brand initiatives.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700">Discovery</span>
                            <div className="w-28 h-2 bg-gray-200 rounded-full mt-1"><div className="h-2 bg-blue-500 rounded-full" style={{ width: '70%' }}></div></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700">Design</span>
                            <div className="w-28 h-2 bg-gray-200 rounded-full mt-1"><div className="h-2 bg-yellow-500 rounded-full" style={{ width: '45%' }}></div></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700">Launch</span>
                            <div className="w-28 h-2 bg-gray-200 rounded-full mt-1"><div className="h-2 bg-green-500 rounded-full" style={{ width: '15%' }}></div></div>
                        </div>
                    </div>
                </div>
                <Button className="w-full mt-6">Manage Project Pipeline</Button>
            </CardContent>
        </Card>
    );
}


// --- Dashboard Main Component ---
const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Operational Command Center</h1>
        <p className="text-lg text-gray-600">Your centralized overview, summarizing key metrics, outstanding leads, and next critical actions.</p>
        <div className="mt-4 flex space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700">Analyze Deep Reports</Button>
            <Button variant="outline">Review System Settings</Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={<DollarSignIcon className="w-5 h-5" /> } 
          title="Total Revenue MTD" 
          value="$152K" 
          color="green"
        />
        <MetricCard 
          icon={<Folder className="w-5 h-5" /> } 
          title="Active Projects" 
          value={mockDashboardData.activeProjects} 
          color="blue"
        />
        <MetricCard 
          icon={<Zap className="w-5 h-5" /> } 
          title="High Priority Leads" 
          value={mockDashboardData.highPriorityLeads} 
          color="yellow"
        />
        <MetricCard 
          icon={<Users className="w-5 h-5" /> } 
          title="Active Team Members" 
          value=mockDashboardData.activeUsers} 
          color="blue"
        />
      </div >

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
             {/* AI Guidance Widget */}
            <AIAssistantWidget />
            {/* Project/Pipeline Widget */}
            <PipelineWidget />
        </div >

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <ActionItemsWidget />
          {/* Quick Links widget moved here */}
          <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button variant="secondary" onClick={() => window.location.href = "/leads"} className="w-full">🚀 Lead Funnel</Button>
                <Button variant="secondary" onClick={() => window.location.href = "/projects"} className="w-full">📂 Projects</Button>
                <Button variant="secondary" onClick={() => window.location.href = "/users"} className="w-full">👥 Users</Button>
            </CardContent>
          </Card>
        </div >
      </div>
    </div>
  );
};

export default Dashboard;