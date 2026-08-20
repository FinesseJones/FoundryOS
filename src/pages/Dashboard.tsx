"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, TrendingUp, Users, Zap, ClipboardList, CheckCircle, Loader, FileText, AlertTriangle } from "lucide-react";
import Link from 'next/link'; // Using generic Link for file structure
import { Badge } from "@/components/ui/badge";

// Component simulating a single KPI card
const DashboardKpiCard = ({ title, value, icon: Icon, change, colorClass }: { title: string, value: string, icon: React.ReactNode, change: string, colorClass: string }) => (
    <Card className="shadow-lg hover:scale-[1.02] transition-transform border-l-4 border-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <div className={`p-2 rounded-full ${colorClass}/20 ${colorClass}`}>
                {/* Using a placeholder div for the icon to maintain the structure */}
                <div className="w-5 h-5">{Icon}</div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <p className={`text-sm font-medium ${colorClass}`}>{change}</p>
        </CardContent>
    </Card>
);

const Dashboard = () => {
  // Mock Data points used for the summary
  const kpis = [
    { title: "Total Revenue (YTD)", value: "$1.2M+", icon: <DollarSign className="w-5 h-5" />, change: "Up 8.5%", colorClass: "text-green-500" },
    { title: "Open Tasks", value: "12", icon: <ClipboardList className="w-5 h-5" />, change: "3 Overdue", colorClass: "text-red-500" },
    { title: "Active Projects", value: "14", icon: <Clock className="w-5 h-5" />, change: "1 New Project", colorClass: "text-indigo-500" },
    { title: "Automation Rules", value: "5/5", icon: <Zap className="w-5 h-5" />, change: "All Operational", colorClass: "text-blue-500" },
  ];

  return (
    <div className="space-y-10">
      
      {/* Banner/Welcome Area */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-8 rounded-xl shadow-xl text-white">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-extrabold">Welcome Back, Administrator!</h1>
                <p className="text-indigo-200 mt-1">Your strategic performance summary for today's readiness.</p>
            </div>
            <button className="bg-white text-indigo-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold shadow-md">
                View Full System Settings <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
        </div>
      </div>


      {/* Real-Time KPI Summary (The Core of the Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
            <DashboardKpiCard 
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                change={kpi.change}
                colorClass={kpi.colorClass}
            />
        ))}
      </div>

      <Separator />

      {/* Main Content Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Urgent Alerts & To-Dos */}
        <Card className="lg:col-span-1 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center space-x-2 text-red-600"><AlertTriangle className="w-5 h-5"/><span>Urgent Alerts</span></h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">A summary of items needing immediate attention across all projects.</p>
            
            <div className="space-y-4">
                {/* Alert 1 */}
                <div className="flex items-start space-x-3 p-3 border border-red-200 bg-red-50 rounded-md">
                    <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-red-500"/>
                    <div>
                        <p className="font-medium text-red-800">Client Payments Delayed</p>
                        <p className="text-sm text-red-700">3 clients (Bob, David, AlphaCorp) have invoices over 30 days old.</p>
                    </div>
                </div>
                 {/* Alert 2 */}
                <div className="flex items-start space-x-3 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <Loader className="w-5 h-5 mt-1 flex-shrink-0 text-yellow-500"/>
                    <div>
                        <p className="font-medium text-amber-800">Review Required</p>
                        <p className="text-sm text-amber-700">Project 'AlphaCorp Revamp' needs your sign-off before proceeding.</p>
                    </div>
                </div>
                 {/* Alert 3 */}
                <div className="flex items-start space-x-3 p-3 border border-indigo-200 bg-indigo-50 rounded-md">
                    <FolderOpen className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-500"/>
                    <div>
                        <p className="font-medium text-indigo-800">Milestone Due Tomorrow</p>
                        <p className="text-sm text-indigo-700">Wireframe Approval for 'Beta Launch' project is due tomorrow.</p>
                    </div>
                </div>
            </div>

            <Button className="w-full mt-6" variant="outline" onClick={() => toast("View Alerts", { description: 'Opening the full task and alert management center.' })}>
                View All Alerts & Tasks
            </Button>
        </Card>

        {/* Column 2: Projects & Activity Feed (Combined) */}
        <Card className="lg:col-span-2 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center space-x-2 text-indigo-600"><ClipboardList className="w-5 h-5"/><span>Latest Activity Feed</span></h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">A chronological log of every critical action taken across the board.</p>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {/* Activity Item 1 */}
                <div className="border-b pb-3">
                    <div className="flex justify-between items-end">
                        <p className="font-semibold text-gray-900">Project Status Updated: ABC Client</p>
                        <span className="text-sm text-gray-400">5 minutes ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">The project status was moved to 'Review' by Bob Developer, triggering necessary notifications.</p>
                    <Badge className="ml-2 bg-blue-100 text-blue-800">Project Update</Badge>
                </div>
                {/* Activity Item 2 */}
                <div className="border-b pb-3">
                    <div className="flex justify-between items-end">
                        <p className="font-semibold text-gray-900">Settings Saved</p>
                        <span className="text-sm text-gray-400">1 hour ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">System base currency was updated to USD via Admin Settings.</p>
                    <Badge className="ml-2 bg-green-100 text-green-800">System Settings</Badge>
                </div>
                 {/* Activity Item 3 */}
                <div className="border-b pb-3">
                    <div className="flex justify-between items-end">
                        <p className="font-semibold text-gray-900">New Template Imported</p>
                        <span className="text-sm text-gray-400">Yesterday</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">The 'Team Onboarding Kit' template was successfully backed up and made available.</p>
                    <Badge className="ml-2 bg-purple-100 text-purple-800">Templates</Badge>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;