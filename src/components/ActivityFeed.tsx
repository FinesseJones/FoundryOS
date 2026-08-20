"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, ClipboardList, Zap, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityItem {
    id: number;
    icon: React.ReactNode;
    title: string;
    message: string;
    timestamp: string;
    color: string; // Class string for color
}

interface ActivityFeedProps {
    items: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                    <MessageCircle className="w-5 h-5 text-indigo-600"/>
                    <span className="text-full">Activity Feed</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3 border-b pb-4 last:pb-0">
                            <div className={`flex-shrink-0 mt-1 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                    <Badge variant="outline" className='text-xs'>{item.timestamp}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <div className="p-4 bg-gray-50 border-t text-center">
                <Button variant="outline" className="w-full w-[200px] mx-auto">View All Activity</Button>
            </div>
        </Card>
    );
}

export default ActivityFeed;