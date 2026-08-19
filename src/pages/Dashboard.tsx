"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Folder, Users, DollarSign, CheckCircle, AlertTriangle, Zap } from "lucide-react";

// Mock data sources for the dashboard widgets
const mockDashboardData = {
    activeProjects: 7,
    highPriorityLeads: 3,
    overdueTasks: 5,
    totalBudgetUtilization: 85, // Percentage
    activeUsers: 124,
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
                <div className={`text-2xl font-bold ${colorClasses}`}>{value}</div>
            </CardContent>
        </Card>
    );
};

// --- Action Items Widget ---
const ActionItemsWidget = () => {
    const actions = [
        { type: 'lead', text: 'Follow up on Enterprise Corp lead.', priority: 'High', icon: <Zap className="w-5 h-5 text-red-500"/> },
        { type: 'project', text: 'Review overdue milestone for Q4 Branding.', priority: 'Medium', icon: <AlertTriangle className="w-5 h-5 text-yellow-500"/> },
        { type: 'user', text: 'Onboard new team member: Alex Smith', priority: 'High', icon: <Users className="w-5 h-5 text-blue-500"/> },
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <p className="text-sm text-gray-500">Urgent tasks mixed from Leads, Projects, and Users modules.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {actions.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 pt-2 border-b last:border-b-0">
                        <div className={`flex-shrink-0 pt-1 ${item.icon.props} ${item.icon}`}></div>
                        <div className="flex-grow pt-1">
                            <p className="text-sm text-gray-800 leading-snug">{item.text}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700 text-xs'}`}>{item.priority}</Badge>
                                <Button variant="outline" size="sm">View Task</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

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
                            <div className="w-28 h-2 bg-gray-200 rounded-full mt-1"><div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700">Design</span>
                            <div className="w-28 h-2 bg-gray-200 rounded-full mt-1"><div className="h-full bg-yellow-500 rounded-full" style={{ width: '45%' }}></div></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700">Launch</span>
                            <div className="w-28 h-2 bg-gray-200 rounded-full mt-1"><div className="h-full bg-green-500 rounded-full" style={{ width: '15%' }}></div></div>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Operational Dashboard</h1>
        <p className="text-lg text-gray-600">Your centralized overview, summarizing key metrics and immediate action items across all departments.</p>
        <div className="mt-4 flex space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700">Explore Reports</Button>
            <Button variant="outline">View System Logs</Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={<DollarSign className="w-5 h-5" /> } 
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
          value={mockDashboardData.activeUsers} 
          color="blue"
        />
      </div >

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
             {/* Project/Pipeline Widget */}
            <PipelineWidget />
            
             {/* Remaining space for new charts/reports */}
             <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Financial Health Summary</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400">KPI charts (Budget Spend vs. Forecast) will appear here.</p>
                </CardContent>
            </Card>
        </div >

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <ActionItemsWidget />
          <PipelineWidget /> {/* Reusing widget for consistency, could be changed */}
          {/* Placeholder for a Quick Link/To Do list */}
          <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full">🚀 Lead Funnel</Button>
                <Button variant="secondary" className="w-full">🛠 Settings</Button>
                <Button variant="secondary" className="w-full">🎨 Brand Generator</Button>
            </CardContent>
          </Card>
        </div >
      </div>
    </div>
  );
};

export default Dashboard;