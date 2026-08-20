"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, TrendingUp, Users, Zap, ClipboardList, CheckCircle, Loader, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter"; // CHANGED: Using named import

// Component simulating a single KPI card (unchanged)
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

const Dashboard = () => {
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
        {/* ... (Content unchanged) ... */}
      </div>


      {/* KPI Summary */}
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
      </div >

      <Separater />

      {/* Main Content Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Notification Center (The new focus) */}
        <Card className="lg:col-span-2 p-0 shadow-xl">
            <NotificationCenter />
        </Card>
        
        {/* Column 2: Summary Alerts & Quick Actions */}
        <Card className="lg:col-span-1 p-6 shadow-md">
            {/* ... (Alerts content remains the same) ... */}
            <div className="flex justify-between items-end">
                <p className="font-semibold text-gray-900">Project Status Updated: ABC Client</p>
                <span className="text-sm text-gray-400">5 minutes ago</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">The project status was moved to 'Review' by Bob Developer, triggering necessary notifications.</p>
            <Badge className="ml-2 bg-blue-100 text-blue-800">Project Update</Badge>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;