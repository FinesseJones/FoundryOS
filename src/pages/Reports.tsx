"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, DollarSign, Users } from "lucide-react";
import AppLayout from "@/components/AppLayout"; // The alias should work here

// Helper component (moved up for better readability)
interface KpiCardProps {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color: "text-indigo-600" | "text-green-600" | "text-red-600";
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, color }) => (
    <Card className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-15`}>
                {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm ${color} font-semibold`}>{change}</p>
        </div>
    </Card>
);

export default function ReportsPage() {
    return (
        <AppLayout>
            <div className="space-y-8 max-w-7xl mx-auto pt-6">
                <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-lg text-gray-600">Get a full overview of your agency's performance, finances, and project progress.</p>
                
                {/* KPI Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard 
                        title="Total Revenue" 
                        value="$1.2M" 
                        change="+12.5%" 
                        icon={<DollarSign className="w-6 h-6" />}
                        color="text-green-600"
                    />
                    <KpiCard 
                        title="Active Projects" 
                        value="14" 
                        change="+2 from last month" 
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="text-indigo-600"
                    />
                    <KpiCard 
                        title="Client Satisfaction" 
                        value="4.8/5" 
                        change="+0.1 points" 
                        icon={<Users className="w-6 h-6" />}
                        color="text-green-600"
                    />
                    <KpiCard 
                        title="Team Utilization" 
                        value="85%" 
                        change="-1% (Goal: 90%)" 
                        icon={<Users className="w-6 h-6" />}
                        color="text-red-600"
                    />
                </div >

                {/* Chart/Visualization Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Revenue Trend Chart (Mock) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle class="flex items-center space-x-3"><TrendingUp className="w-5 h-5 text-indigo-600"/><span>Revenue Trend (Last 12 Months)</span></CardTitle>
                        </CardHeader>
                        <CardContent className="h-72 flex items-center justify-center">
                            <div className="text-muted-foreground text-center">
                                [Revenue Trend Graph Placeholder: Visualizing monthly revenue growth.]
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Status Pie Chart (Mock) */}
                    <Card>
                        <CardHeader>
                            <CardTitle class="flex items-center space-x-3"><Users className="w-5 h-5 text-green-600"/><span>Project Status Breakdown</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center h-48 flex items-center justify-center">
                                [Pie Chart Placeholder: Showing active vs. completed projects.]
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-gray-700">Active: 6 (Blue)</p>
                                <p className="font-medium text-gray-700">Review: 3 (Orange)</p>
                                <p className="font-medium text-gray-700">Completed: 5 (Green)</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}