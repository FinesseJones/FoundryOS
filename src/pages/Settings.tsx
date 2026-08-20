"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, SlidersHorizontal, BookOpen, Clock, Loader2 } from "lucide-react";

// Defines the structure for all global settings
interface GlobalSettings {
    baseCurrency: string;
    currencySymbol: string;
    timeZone: string;
    defaultReportPeriod: string;
}

interface SettingsProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
    // State for the global settings (Mock Data Source)
    const [settings, setSettings] = useState<GlobalSettings>({
        baseCurrency: "USD",
        currencySymbol: "$",
        timeZone: "UTC",
        defaultReportPeriod: "Month"
    });
    
    // State for form management
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null, text: string } | null>(null);

    // Authorization Check
    const canModifySettings = currentUser.permissions.settingsManagement || currentUser.role === "ADMIN";

    // Handler for submitting the form
    const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canModifySettings) {
            setMessage({ type: 'error', text: "❌ Permission Denied: You do not have the required rights to modify global system settings." });
            return;
        }

        setIsSaving(true);
        setMessage({ type: null, text: "Saving changes..." });

        const form = e.currentTarget;
        const baseCurrency = (form.elements.namedItem('baseCurrency') as HTMLInputElement)?.value || settings.baseCurrency;
        const currencySymbol = (form.elements.namedItem('currencySymbol') as HTMLInputElement)?.value || settings.currencySymbol;
        const timeZone = (form.elements.namedItem('timeZone') as HTMLSelectElement)?.value || settings.timeZone;
        const defaultReportPeriod = (form.elements.namedItem('defaultReportPeriod') as HTMLSelectElement)?.value || settings.defaultReportPeriod;

        // Simulate API delay
        setTimeout(() => {
            setSettings({
                baseCurrency,
                currencySymbol,
                timeZone,
                defaultReportPeriod
            });
            setMessage({ type: 'success', text: "✅ Global settings updated successfully. Changes are now live across the system." });
            setIsSaving(false);
        }, 1500);
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">System Configuration & Settings</h1>
                <p className="text-gray-600">
                    Manage global parameters for the entire platform, including currency, time zones, and default report periods.
                </p>

                {/* Global Settings Management Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <SlidersHorizontal className="w-5 h-5 text-indigo-600"/>
                            <span >Global Business Settings</span>
                        </CardTitle>
                        <p className="text-sm text-gray-500">These settings affect all reporting and user experiences across the application.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                {/* Messaging Display */}
                                {message && (
                                    message.type === 'success' ? (
                                        <Alert className="bg-green-50 border-green-200">
                                            <CheckCircle className="h-4 w-4 text-green-500"/>
                                            <AlertTitle>Success</AlertTitle>
                                            <AlertDescription>{message.text}</AlertDescription>
                                        </Alert>
                                    ) : message.type === 'error' ? (
                                        <Alert className="bg-red-50 border-red-200">
                                            <AlertCircle className="h-4 w-4 text-red-500"/>
                                            <AlertTitle>Permission Required</AlertTitle>
                                            <AlertDescription>{message.text}</AlertDescription>
                                        </Alert>
                                    ) : null
                                )}


                                {/* Settings Grid Container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 1. Currency */}
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2"><BookOpen className="w-5 h-5 text-red-500"/> Currency Management</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                                                <Input type="text" id="currencySymbol" name="currencySymbol" value={settings.currencySymbol} required />
                                            </div>
                            
                                            <div className="space-y-2">
                                                <Label htmlFor="baseCurrency">Base Currency Code (e.g., USD, EUR)</Label>
                                                <Input type="text" id="baseCurrency" name="baseCurrency" value={settings.baseCurrency} required />
                                            </div>
                                        </div>
                                    </div>


                                    {/* 2. Timezone & Reporting */}
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2"><Clock className="w-5 h-5 text-blue-500"/> Time & Reporting</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="timeZone">System Time Zone</Label>
                                                <select id="timeZone" name="timeZone" required 
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York">America/New_York</option>
                                                    <option value="Europe/London">Europe/London</option>
                                                </select>
                                            </div>
                            
                                            <div className="space-y-2">
                                                <Label htmlFor="defaultReportPeriod">Default Report Period</Label>
                                                <select id="defaultReportPeriod" name="defaultReportPeriod" required 
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                    <option value="Month">Month</option>
                                                    <option value="Quarter">Quarter</option>
                                                    <option value="Year">Year</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Button */}
                                <div className="flex justify-end">
                                    <Button 
                                        type="submit" 
                                        className="w-auto"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Global Settings'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div >
        </AppLayout>
    );
};

export default Settings;