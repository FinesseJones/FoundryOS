"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, UserCheck, Trash2 } from "lucide-react";
import { UserRole } from "@/types/user";

// Define the structure for a single audit entry
interface AuditEntry {
    timestamp: Date;
    user: { role: string; name: string };
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ACCESS';
    module: string;
    details: string;
    initiator: string; // Who performed the action
}

interface AuditLogProps {
    initialLogs: AuditEntry[];
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const AuditLog: React.FC<AuditLogProps> = ({ initialLogs, currentUser }) => {
    // Use the user's current role to filter what they can see
    const visibleLogs = useMemo(() => {
        // Example: Basic users can only see LOGIN/ACCESS actions by admins
        if (currentUser.role === "BASIC") {
            return initialLogs.filter(log => 
                log.action === 'LOGIN' && log.details.includes('SUCCESS')
            );
        }
        // Ad-hoc filtering logic here (e.g., Admins can see everything)
        return initialLogs;
    }, [initialLogs, currentUser.role]);


    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">System Audit Log</h1>
                <p className="text-gray-600">
                    A chronological, immutable record of all critical system actions. This log is essential for compliance and security audits.
                </p>

                {/* Permissions Guard */}
                {!currentUser.permissions.deleteCriticalRecords && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
                        <div className="flex items-center space-x-2">
                            <Info className="w-5 h-5 flex-shrink-0"/>
                            <p className="font-semibold">Access Restricted:</p>
                            <p className="text-sm">You must have the 'Delete Critical Records' permission to view detailed audit logs.</p>
                        </div>
                    </div>
                )}


                {/* Audit Log Table */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <Clock className="w-5 h-5 text-red-600"/>
                            <span >Total Entries: {visibleLogs.length}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto"> 
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="uppercase text-xs text-gray-500 tracking-wider sticky top-0">
                                        <th className="px-6 py-3 text-left whitespace-nowrap">Timestamp</th>
                                        <th className="px-6 py-3 text-left">Initiated By</th>
                                        <th className="px-6 py-3 text-left">Module</th>
                                        <th className="px-6 py-3 text-left whitespace-nowrap">Action</th>
                                        <th className="px-6 py-3 text-left">Details</th>
                                    </tr >
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {visibleLogs.slice(0, 10).map((log, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.timestamp.toLocaleTimeString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.initiator}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge className={`text-xs ${log.module === 'Users' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.module}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant={
                                                    log.action === 'DELETE' ? 'destructive' : 
                                                    log.action === 'CREATE' ? 'default' : 'secondary'
                                                } className="text-xs uppercase">{log.action}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs">{log.details}</td>
                                        </td >
                                    </tr >
                                ))}
                            </tbody>
                        </div >
                    </CardContent>
                </Card>
            </div >
        </AppLayout>
    );
};

export default AuditLog;