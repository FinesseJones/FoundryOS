"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Define the structure for a KPI card
interface KPIData {
    title: string;
    value: string;
    icon: React.ReactNode;
    change: string; // e.g., "+12% vs last month"
    colorClass: string; // Tailwind class for color
}

const mockKPIs: KPIData[] = [
    { title: "Total Projected Revenue", value: "$1.2M", icon: <DollarSign className="w-5 h-5" />, change: "+8.5%", colorClass: "text-green-500" },
    { title: "Active Projects", value: "14", icon: <Clock className="w-5 h-5" />, change: "+1 since last month", colorClass: "text-indigo-500" },
    { title: "Average Project Value", value: "$65,000", icon: <Users className="w-5 h-5" />, change: "Stable", colorClass: "text-yellow-500" },
    { title: "Completion Rate", value: "78%", icon: <CheckCircle className="w-5 h-5" />, change: "2% increase", colorClass: "text-blue-500" },
];


const ReportsContent: React.FC = () => {
    const [timeframe, setTimeframe] = useState("Last 12 Months");

    // Simulate fetching the data
    const handleTimeframeChange = async (newTimeframe: string) => {
        // Simulate network fetch delay
        await new Promise(resolve => setTimeout(resolve, 500)); 
        toast.info("Data Updated", { 
            description: `Statistics refreshed for ${newTimeframe}.` 
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <ReportSquare className="w-6 h-6 text-green-600"/>
                <span className="text-xl">Analytics & Reporting</span>
            </h1>
            <p className="text-lg text-gray-600">Analyze your performance, track key metrics, and identify growth opportunities.</p>

            {/* Report Filtering and Timeframe */}
            <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-3">
                    <Button 
                        variant={timeframe === "Last 12 Months" ? "default" : "outline"}
                        onClick={() => handleTimeframeChange("Last 12 Months")}
                    >
                        Last 12 Months
                    </Button>
                    <Button 
                        variant={timeframe === "Last Quarter" ? "default" : "outline"}
                        onClick={() => handleTimeframeChange("Last Quarter")}
                    >
                        Last Quarter
                    </Button>
                    <Button 
                        variant={timeframe === "Custom" ? "default" : "outline"}
                        onClick={() => { toast('Date Picker', { description: 'Opening advanced date range selection modal.' }); }}
                    >
                        Custom Range
                    </Button>
                </div>
                <Button onClick={() => toast('Export', { description: 'Generating PDF report containing all displayed data.' })}>
                    Export Report
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {mockKPIs.map((kpi) => (
                    <Card key={kpi.title} className="shadow-lg hover:scale-[1.02] transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
                            <div className={`p-2 rounded-full ${kpi.colorClass}/20 ${kpi.colorClass}`}>
                                {kpi.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                            <p className={`text-sm font-medium ${kpi.colorClass}`}>{kpi.change} vs previous period</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charting and Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Revenue Trend Chart (Primary Chart) */}
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2"><TrendingUp className="w-5 h-5 text-indigo-600"/><span>Revenue Trend Overview</span></h3>
                    <div className="h-[400px] bg-gray-50 rounded-lg border flex items-center justify-center text-gray-400">
                        [DASHBOARD CHART CANVAS: Time-series graph showing monthly revenue projections.]
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Source: Consolidated Project & Invoicing Data.</p>
                </Card>

                {/* Column 2: Status Breakdown (Secondary Chart/List) */}
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2"><Users className="w-5 h-5 text-green-600"/><span>Project Status Breakdown</span></h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="flex items-center space-x-2"><Badge variant="outline" className="text-blue-600 bg-blue-50/80">{<Clock className="w-4 h-4"/>} <span>Active</span></Badge></span>
                            <span className="font-bold text-gray-900">14</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="flex items-center space-x-2"><Badge variant="outline" className="text-amber-600 bg-amber-50/80">{<Pencil className="w-4 h-4"/>} <span>Planning</span></Badge></span>
                            <span className="font-bold text-gray-900">3</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="flex items-center space-x-2"><Badge variant="outline" className="text-blue-600 bg-blue-50/80">{<CheckCircle className="w-4 h-4"/>} <span>Review</span></Badge></span>
                            <span className="font-bold text-gray-900">1</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="flex items-center space-x-2"><Badge variant="outline" className="text-green-600 bg-green-50/80">{<CheckCircle className="w-4 h-4"/>} <span>Completed</span></Badge></span>
                            <span className="font-bold text-gray-900">10</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function ReportsPageWrapper() {
    return <AppLayout><ReportsContent /></AppLayout>
}