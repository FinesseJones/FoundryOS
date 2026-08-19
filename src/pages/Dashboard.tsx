"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// --- Metric Cards ---
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: IconElement }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {IconElement}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// --- Recent Activity Card ---
const RecentActivityCard = () => {
  const activities = [
    { user: "Alice J.", action: "Started a new project 'Marketing Funnel'." },
    { user: "Bob K.", action: "Reviewed PR #123 for feature implementation." },
    { user: "Charlie S.", action: "Updated brand guidelines in the repository." },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start text-sm">
              <div className="w-2 h-2 mt-2 mr-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              <div>
                <p className="text-gray-700 leading-none">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">by <span className="font-medium text-blue-600">{activity.user}</span></p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};


// --- Dashboard Main Component ---
const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-lg text-gray-600">Your Brand First dashboard provides a comprehensive overview of all key operations and projects.</p>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Start Working</Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Active Projects" 
          value="7" 
          icon={/* <Folder className="w-5 h-5 rotate-12" /> */ <span>📁</span>} 
        />
        <MetricCard 
          title="Users Pending Review" 
          value="2" 
          icon={/* <Users className="w-5 h-5 rotate-12" /> */ <span>👤</span>} 
        />
        <MetricCard 
          title="Total Revenue (MTD)" 
          value="$152,300" 
          icon={/* <DollarSign className="w-5 h-5 rotate-12" /> */ <span>💲</span>} 
        />
        <MetricCard 
          title="Tasks Completed" 
          value="24/30" 
          icon={/* <CheckCircle className="w-5 h-5 rotate-12" /> */ <span>✅</span>} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview Widget */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Project Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Simulate a progress visualization */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-medium">Phase 1: Discovery</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-sm font-medium">Phase 2: Development</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-sm font-medium">Phase 3: Launch Prep</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              <div className="flex justify-end">
                <Button variant="outline">View All Projects</Button>
                <Button className="ml-2 bg-blue-600 hover:bg-blue-700">Manage Pipeline</Button>
              </div>

            </CardContent>
          </Card>
          
          {/* Placeholder for detailed charts (e.g., Analytics) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Brand Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-gray-50">
              {/* Placeholder for a chart library like Recharts */}
              <p className="text-gray-400">Chart visualization (e.g., Traffic over time) will go here.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) - Activity Feed */}
        <div className="lg:col-span-1">
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;