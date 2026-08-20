"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeartHandshake, FileText, AlertTriangle, CheckCircle, Loader, Mail, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define the structure for a single notification
interface Notification {
    id: number;
    title: string;
    message: string;
    icon: React.ReactNode;
    type: 'info' | 'warning' | 'success' | 'failure';
    timestamp: string;
    read: boolean;
}

// Mock/Simulated list of notifications
const mockNotifications: Notification[] = [
    // ... (Data remains the same) ...
    { 
        id: 1, 
        title: "Project Review Required", 
        message: "The 'AlphaCorp Revamp' project is ready for your review. Please check the asset library and provide feedback.", 
        icon: <HeartHandshake className="w-5 h-5"/>, 
        type: 'warning', 
        timestamp: "5 minutes ago", 
        read: false 
    },
    { 
        id: 2, 
        title: "System Update", 
        message: "The base currency was successfully set to USD for all financial reports. Please verify affected reports.", 
        icon: <CheckCircle className="w-5 h-5"/>, 
        type: 'info', 
        timestamp: "2 hours ago", 
        read: true 
    },
    { 
        id: 3, 
        title: "Milestone Passed", 
        message: "Project 'Apollo' reached the 'Discovery Phase Completion' milestone, paving the way for wireframing.", 
        icon: <FileText className="w-5 h-5"/>, 
        type: 'success', 
        timestamp: "Yesterday", 
        read: true 
    },
    { 
        id: 4, 
        title: "Invoices Overdue", 
        message: "Payment reminder for Charlie Client is due. Please address this to keep the project on track.", 
        icon: <AlertTriangle className="w-5 h-5"/>, 
        type: 'failure', 
        timestamp: "3 days ago", 
        read: false 
    }
];

const NotificationCenter: React.FC = () => {
    return (
        <Card className="p-0 overflow-hidden shadow-md">
            <CardHeader className="border-b flex flex-row items-center justify-between p-6">
                <CardTitle className="flex items-center space-x-2">
                    <span className="text-xl text-indigo-600"><Mail className="w-6 h-6"/></span>
                    <span>Notification Center</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast("Inbox Sync", { description: 'Syncing latest notifications from all project and system activities.' })}>
                    <Loader className="w-4 h-4 mr-2 animate-spin" /> Sync
                </Button>
            </CardHeader>
            
            <CardContent className="p-0 p-6 pt-4">
                <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar">
                    {/* ... (Mapping the notifications remains the same) ... */}
                </div>
            </CardContent>
        </Card>
    );
}

export { NotificationCenter };