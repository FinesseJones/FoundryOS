"use client";

import React from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, ClipboardList, Users as ZapUsers, Folder, Clock, Zap, GitCode } from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Assuming Progress is available

// Redefining the current component
const Dashboard = ({ currentUser }: { currentUser: { role: string; permissions: { [key: string]: boolean } } }) => {

  
  return (
    <div className="space-y-6">
        {/* 1. Overall Header Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Active Projects */}
            <Card className="shadow-md border-l-4 border-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center space-x-2"><ClipboardList className="w-4 h-4 text-indigo-500"/> Active Projects</CardTitle>
                    <ClipboardList className="w-5 h-5 text-indigo-400"/>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">12</div>
                    <p className="text-xs text-gray-500 pt-1">Ongoing revenue streams.</p>
                </CardContent>
            </Card>

            {/* Card 2: Clean Slate Projects (Low Risk) */}
            <Card className="shadow-md border-l-4 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center space-x-2"><ZapUsers className="w-4 h-4 text-green-500"/> Leads in Funnel</CardTitle>
                    <ZapUsers className="w-5 h-5 text-green-400"/>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">3</div>
                    <p className="text-xs text-gray-500 pt-1">Potential revenue tracked.</p>
                </CardContent>
            </Card>

             {/* Card 3: Revenue (Financial KPI) */}
            <Card className="shadow-md border-l-4 border-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center space-x-2"><TrendingUp className="w-4 h-4 text-yellow-500"/> Estimated ARR Potential</CardTitle>
                    <TrendingUp className="w-5 h-5 text-yellow-400"/>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">$15M+</div>
                    <p className="text-xs text-gray-500 pt-1">Projected Annual Recurring Revenue.</p>
                </CardContent>
            </Card>
        </div>

        {/* NEW BLOCK: The Digital Transformation Audit Service */}
        <Card className="shadow-xl bg-blue-50 border-l-8 border-blue-600 p-6">
            <div className="flex items-center justify-between mb-4 space-x-3">
                <h2 className="text-2xl font-bold text-blue-800 flex items-center space-x-3">
                    <GitCode className="w-8 h-8 text-blue-600"/>
                    <span>Service Offering: Digital Transformation Audit</span>
                </h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    Discover More <Search className="ml-2 h-4 w-4 inline transform transform-none"/>
                </Button>
            </div>
            <p className="text-gray-700 mb-4">
                We provide a comprehensive audit to transform dated, siloed digital assets into modern, high-converting, and scalable web platforms built for 2026+.
            </p>
            
            <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                <div className="p-3 rounded-lg bg-white border border-gray-100">
                    <div className="text-2xl font-bold text-indigo-600">AIEO</div>
                    <p className="text-sm text-gray-500 mt-1">Augmented Intelligence Experience Optimization.</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-100">
                    <div className="text-2xl font-bold text-indigo-600">AIO/GEO</div>
                    <p className="text-sm text-gray-500 mt-1">AI Integration & Hyper-local Geolocation Mapping.</p>
                </div>
                 <div className="p-3 rounded-lg bg-white border border-gray-100">
                    <div className="text-2xl font-bold text-indigo-600">SEO/SEO</div>
                    <p className="text-sm text-gray-500 mt-1">Search Engine Optimization & Content Authority.</p>
                </div>
            </div>

             <p className="mt-4 text-sm text-gray-600">
                This service is billed as a high-impact **Proposal** to leverage your existing Project Dashboard capabilities.
            </p>
        </Card>


        {/* The rest of the original content (Advanced AI Widget) */}
        {/* The rest of the code remains the same... */}
    </div>
  );
}

export default Dashboard;