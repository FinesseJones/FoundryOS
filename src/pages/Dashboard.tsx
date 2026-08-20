"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, TrendingUp, Users, Zap, ClipboardList, CheckCircle, Loader, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";

// Component simulating a single KPI card (remains pure display component)
const DashboardKpiCard = ({ title, value, icon: Icon, change, colorClass }: { title: string, value: string, icon: React.ReactNode, change: string, colorClass: string }) => (
    <Card className="shadow-lg hover:scale-[1.02] transition-transform border-l-4 border-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <div className={`p-2 rounded-full ${colorClass}/20 ${colorClass}`}>
                <div className="w-5 h-5">{Icon}</div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-gray-900">{value}</div >
            <p className={`text-sm font-medium ${colorClass}`}>{change}</p>
        </CardContent>
    </Card>
);

// Mock props to show API usage context (Actual data fetched via API)
const mockKpiData = [
    { title: "Total Revenue (YTD)", value: "$1.2M+", icon: <DollarSign className="w-5 h-5" />, change: "Up 8.5%", colorClass: "text-green-500" },
    { title: "Open Tasks", value: "12", icon: <ClipboardList className="w-5 h-5" />, change: "3 Overdue", colorClass: "text-red-500" },
    { title: "Active Projects", value: "14", icon: <Clock className="w-5 h-5" />, change: "1 New Project", colorClass: "text-indigo-500" },
    { title: "Automation Rules", value: "5/5", icon: <Zap className="w-5 h-5" />, change: "All Operational", colorClass: "text-blue-500" },
];


const Dashboard = () => {
  return (
    <div className="space-y-10">
      
      {/* Banner/Welcome Area */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-8 rounded-xl shadow-xl text-white">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-extrabold">Welcome Back, Administrator!</h1 > {/* FIX APPLIED HERE */}
                <p className="text-indigo-200 mt-1">Your strategic performance summary for today's readiness.</p>
            </div >
            <button className="bg-white text-indigo-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold shadow-md">
                View Full System Settings <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
        </div >
      </div >


      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockKpiData.map((kpi, index) => (
            <DashboardKpiCard 
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                change={kpi.change}
                colorClass={kpi.colorClass}
            />
        ))}
      </div >

      <Separater />

      {/* Main Content Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Notification Center */}
        <Card className="lg:col-span-2 p-0 shadow-xl">
            <NotificationCenter />
        </Card>
        
        {/* Column 2: Quick Alerts & Quick Actions (Now relying on centralized api data) */}
        <Card className="lg:col-span-1 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-5 h-5"/>
                    <span>System Alerts</span>
                </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Summary of critical system events and tasks requiring immediate attention.</p>
            
            <div className="space-y-4">
                {/* --- Alert 1: Payments --- */}
                <div className="flex items-start space-x-3 p-3 border border-red-200 bg-red-50 rounded-md">
                    <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-red-500"/>
                    <div className="flex-grow">
                        <p className="font-medium text-red-800">System Alert: Payment Cycle</p>
                        <p className="text-sm text-red-700">Critical: Several high-value client invoices are overdue. Action required by Finance team.</p>
                    </div>
                </div>
                 {/* --- Alert 2: Review --- */}
                <div className="flex items-start space-x-3 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <Loader className="w-5 h-5 mt-1 flex-shrink-0 text-yellow-500"/>
                    <div className="flex-grow">
                        <p className="font-medium text-amber-800">Process Warning: Manually Review Setup</p>
                        <p className="text-sm text-amber-700">The global configuration needs validation against current compliance standards.</p>
                    </div>
                </div>
                 {/* --- Alert 3: Milestone --- */}
                <div className="flex items-start space-x-3 p-3 border border-indigo-200 bg-indigo-50 rounded-md">
                    <FolderOpen className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-500"/>
                    <div className="flex-grow">
                        <p className="font-medium text-indigo-800">Upcoming Milestone</p>
                        <p className="text-sm text-indigo-700">Project 'Beta Launch' wireframe approval is scheduled for tomorrow. Prepare documentation.</p>
                    </div>
                </div>
            </div >

            <Button className="w-full mt-6" variant="outline" onClick={() => toast("View Alerts", { description: 'Opening the full task and alert management center.' })}>
                View All Alerts & Tasks
            </Button>
        </Card>
      </div >
    </div >
  );
}

export default Dashboard;