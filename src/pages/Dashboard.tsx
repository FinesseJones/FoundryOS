"use client";

import React from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, ClipboardList, Users as ZapUsers, Folder, Clock, Zap, GitCode } from "lucide-react";
import { Progress } from "@/components/ui/progress"; 

// NOTE: Keeping the functional structure but applying significant stylistic improvements.
const Dashboard = ({ currentUser }: { currentUser: { role: string; permissions: { [key: string]: boolean } } }) => {

  
  return (
    <div className="space-y-10">
        {/* 1. Header Greeting */}
        <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back, {currentUser.role === 'ADMIN' ? 'Administrator' : 'Partner'}</h1>
            <p className="text-xl text-gray-600">
                Your central source of truth for pipeline governance and operational intelligence.
            </p>
            <Separator className="mt-2" />
        </div>

        {/* MAIN METRICS BLOCK - Refined Card Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Active Projects */}
            <Card className="shadow-xl border-l-4 border-indigo-600 hover:shadow-2xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-medium text-gray-600 flex items-center space-x-2"><ClipboardList className="w-5 h-5 text-indigo-500"/> Active Projects</CardTitle>
                    <ClipboardList className="w-6 h-6 text-indigo-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold text-gray-900">{`12`}</div>
                    <p className="text-sm text-gray-500 pt-1">Ongoing revenue streams requiring governance.</p>
                    <div className="mt-4">
                        <div className="flex justify-between mb-1 text-xs font-semibold text-indigo-700">
                            <span>Next Review:</span>
                            <span className="uppercase">Project Governance</span>
                        </div >
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Leads in Funnel */}
            <Card className="shadow-xl border-l-4 border-green-600 hover:shadow-2xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-medium text-gray-600 flex items-center space-x-2"><ZapUsers className="w-5 h-5 text-green-500"/> Qualified Leads</CardTitle>
                    <ZapUsers className="w-6 h-6 text-green-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold text-gray-900">{`3`}</div>
                    <p className="text-sm text-gray-500 pt-1">Potential revenue requiring immediate assessment.</p>
                    <div className="mt-4">
                        <div className="flex justify-between mb-1 text-xs font-semibold text-green-700">
                            <span>Urgency Score:</span>
                            <span className="uppercase">High</span>
                        </div >
                    </div>
                </CardContent>
            </Card>

             {/* Card 3: Estimated ARR Potential */}
            <Card className="shadow-xl border-l-4 border-yellow-600 hover:shadow-2xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-medium text-gray-600 flex items-center space-x-2"><TrendingUp className="w-5 h-5 text-yellow-500"/> Trailing Revenue Potential</CardTitle>
                    <TrendingUp className="w-6 h-6 text-yellow-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold text-gray-900">${`15.0M+`}</div>
                    <p className="text-sm text-gray-500 pt-1">Total estimated recurring revenue runway.</p>
                    <div className="mt-4">
                        <div className="flex justify-between mb-1 text-xs font-semibold text-yellow-700">
                            <span>Last Update:</span>
                            <span className="text-xs">Q2 2025 Forecast</span>
                        </div >
                    </div>
                </CardContent>
            </Card>
        </div >

        {/* NEW BLOCK: The Digital Transformation Audit Service */}
        <Card className="shadow-2xl bg-blue-50 border-l-8 border-blue-600 p-8">
            <div className="flex items-center justify-between mb-4 space-x-3">
                <h2 className="text-3xl font-bold text-blue-800 flex items-center space-x-3">
                    <GitCode className="w-10 h-10 text-blue-600"/>
                    <span class="text-xl">Service Offering: Digital Transformation Audit</span>
                </h2>
                <Button className="bg-blue-600 hover:bg-blue-700 text-base py-6 px-8">
                    Launch Audit
                </Button>
            </div>
            <p className="text-gray-800 mb-6 text-lg">
                We transform dated, siloed digital assets into modern, high-converting, and scalable web platforms built for 2026+.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105">
                    <div className="text-4xl font-extrabold text-indigo-600 mb-2">AIEO</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">AI Enhanced UX</h3>
                    <p className="text-sm text-gray-500">Augmented Intelligence Experience Optimization.</p>
                </div>
                <div className="p-6 rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105">
                    <div className="text-4xl font-extrabold text-indigo-600 mb-2">AIO/GEO</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">AI & Geolocation</h3>
                    <p className="text-sm text-gray-500">Hyper-local, smart mapping and service delivery integration.</p>
                </div>
                 <div className="p-6 rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105">
                    <div className="text-4xl font-extrabold text-indigo-600 mb-2">SEO/Search</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">Content & Authority</h3>
                    <p className="text-sm text-gray-500">Complete search engine authority capture and modern content indexing.</p>
                </div>
            </div>

             <div className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <p className="text-center text-gray-500 text-sm">
                    This dashboard seamlessly links operational data to strategic consulting opportunities.
                </p>
             </div>
        </Card>
    </div >
  );
}

export default Dashboard;