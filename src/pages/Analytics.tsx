"use client";

import React, { useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, TrendingUp, Clock, Search, Zap, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";


interface AnalyticsProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const Analytics: React.FC<AnalyticsProps> = ({ currentUser }) => {
    // To properly simulate dashboard data, we use all data from previous modules
    const dataContext = {
        // Mock data retrieval based on the system's current state
        userCapacity: { totalAvailable: 200, utilized: 160, bottleneckDepartment: 'Finance' },
        avgLeadTimeDays: 75,
        highRiskProjectsCount: 2,
        strategicRecommendation: "Focus on formalizing the handoff protocol between departments to unlock faster project movement and reduce overhead costs.",
    };

    // Data aggregation logic
    const { utilized, totalAvailable, bottleneckDepartment, avgLeadTimeDays, highRiskProjectsCount, strategicRecommendation } = dataContext;

    // Calculate remaining capacity and risk metric
    const remainingCapacity = totalAvailable - utilized;
    const capacityUtilizationPercentage = Math.round((utilized / totalAvailable) * 100);

    return (
        <AppLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">Business Intelligence & Reporting</h1>
                <p className="text-lg text-gray-600">
                    A comprehensive dashboard that synthesizes data from your users, projects, and leads to identify bottlenecks and suggest strategic initiatives.
                </p>

                {/* CORE METRICS DASHBOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Metric 1: Capacity */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Employee Capacity</CardTitle>
                            <Users className="h-5 w-5 text-indigo-400"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{`${remainingCapacity} hours`}</div>
                            <p className="text-xs text-gray-500 pt-1">Remaining Available Capacity this quarter.</p>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1 text-xs font-medium">
                                    <span>Total Capacity Utilized:</span>
                                    <span className={capacityUtilizationPercentage >= 80 ? "text-red-600" : "text-green-600"}>{capacityUtilizationPercentage}%</span>
                                </div >
                                <Progress value={capacityUtilizationPercentage} className="w-full" />
                            </div >
                        </CardContent>
                    </Card>

                    {/* Metric 2: Sales Pipeline Health */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Average Deal Time (Lead to Close)</CardTitle>
                            <Zap className="h-5 w-5 text-green-400"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{avgLeadTimeDays} days</div>
                            <p className="text-xs text-gray-500 pt-1">Time investment required for typical deal closure.</p>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">Goal: Reduce average time by consolidating discovery data.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metric 3: Project Risk */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Operational Risk Score</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-400"/>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold text-gray-900 ${highRiskProjectsCount > 0 ? 'text-red-600' : 'text-green-600'}'}>
                                {highRiskProjectsCount} High-Risk Projects
                            </div >
                            <p className="text-xs text-gray-500 pt-1">Projects flagged for budget or timeline deviation.</p>
                            <div className="mt-4 text-sm">
                                <button onClick={() => toast.success("Navigating to Project Dashboard for risk remediation.")} className="text-sm text-yellow-600 hover:underline">Review Projects &rarr;</button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Strategic Insights Card */}
                 <Card className="shadow-lg border border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <Zap className="w-5 h-5 text-blue-600"/>
                            <span >Strategic Recommendation Engine</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                            <p className="font-semibold text-lg text-blue-800 mb-2">Insight:</p>
                            <p className="text-gray-700 italic">{strategicRecommendation}</p>
                        </div>
                        <Button variant="outline" className="mt-4">Export Full Report (PDF)</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Analytics;