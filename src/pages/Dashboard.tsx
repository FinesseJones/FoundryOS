"use client";

import React from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Users, Clock, SlidersHorizontal } from "lucide-react";
import AiAssistantWidget from "@/components/AiAssistantWidget"; // <-- Import the new widget

// Interface for the user context passed down from AppRouter
interface DashboardProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

// Dashboard component receives the user context now
const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {

    // Determine if the user has high-level administrative access
    const isAdmin = currentUser.role === "ADMIN";

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {currentUser.role}</h1>
                    <Button variant="outline">View Profile</Button>
                </div>
                
                <p className="text-lg text-gray-600">
                    Welcome to your Digital Command Center. Use the AI Assistant below to draft policies, summarize data, or draft communications instantly using Ollama.
                </p>

                {/* 1. Key Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Card 1: Key Metric - Projects */}
                    <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Projects Progress</CardTitle>
                            <ClipboardList className="h-5 w-5 text-indigo-400"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">65% Complete</div>
                            <p className="text-xs text-gray-500 pt-1">Global Platform Overhaul</p>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1 text-xs font-medium">
                                    <span>Stage: Development</span>
                                    <span className="text-indigo-600">On Track</span>
                                </div>
                                <Progress value={65} className="w-full" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Card 2: Key Metric - Users */}
                    <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">User Accounts</CardTitle>
                            <Users className="h-5 w-5 text-green-400"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">4 Employees</div>
                            <p className="text-xs text-gray-500 pt-1">Active & Ready</p>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1 text-xs font-medium">
                                    <span>Active Users</span>
                                    <span className="text-green-600">2 (Support)</span>
                                </div>
                                <Progress value={2} className="w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Key Metric - Settings */}
                    <Card className="shadow-md hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">System Currency</CardTitle>
                            <SlidersHorizontal className="h-5 w-5 text-yellow-400"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{`$ ${'USD'}`}</div>
                            <p className="text-xs text-gray-500 pt-1">USD (Default)</p>
                            <div className="mt-4">
                                <button 
                                    onClick={() => console.log("Opening settings...")} 
                                    className="text-sm text-yellow-600 hover:underline text-left">
                                    Update Currency >
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. AI Assistant Widget (Intelligent Layer) */}
                <AiAssistantWidget isVisible={true} title="📄 Smart Content Generation (Ollama)" />
            </div>
        </AppLayout>
    );
}

export default Dashboard;