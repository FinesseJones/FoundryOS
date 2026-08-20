"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeartHandshake, FileText, AlertTriangle, CheckCircle, Loader, Mail, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define the structure for a single notification (Remains the contract with the API)
interface Notification {
    id: number;
    title: string;
    message: string;
    icon: React.ReactNode;
    type: 'info' | 'warning' | 'success' | 'failure';
    timestamp: string;
    read: boolean;
}

// Define the props the component will accept
interface NotificationCenterProps {
    notifications: Notification[]; // **CORE CHANGE: Data now passed via props**
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
    return (
        <Card className="p-0 overflow-hidden shadow-md">
            <CardHeader className="border-b flex flex-row items-center justify-between p-6">
                <CardTitle className="flex items-center space-x-2">
                    <span className="text-xl text-indigo-600"><Mail className="w-6 h-6"/></span>
                    <span>Notification Center</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast("Inbox Sync", { description: 'Real-time sync initiated. Data will populate shortly.' })}>
                    <Loader className="w-4 h-4 mr-2 animate-spin" /> Sync
                </Button>
            </CardHeader>
            
            <CardContent className="p-0 p-6 pt-4">
                {/* **CORE CHANGE: Map over the received 'notifications' prop instead of mock data.** */}
                {notifications && notifications.length > 0 ? (
                    <div className="space-y-4">
                         {notifications.map((notification) => (
                            <div key={notification.id} className={`flex items-start space-x-3 p-3 border ${notification.read ? 'border-gray-200 bg-white' : 'border-gray-100 bg-indigo-50/50'} rounded-md`}>
                                <div className="flex-shrink-0 pt-1">
                                    {notification.icon}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-gray-900">{notification.title}</p>
                                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-60"/>
                        <p>No notifications found.</p>
                        <p className="text-sm mt-1">Check back later or trigger a manual sync.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default NotificationCenter;