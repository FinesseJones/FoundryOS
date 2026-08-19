"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Globe, Zap } from "lucide-react";
import { toast } from "sonner"; // Using sonner for professional toast notifications
import AppLayout from "../components/AppLayout";

// State to simulate settings
interface SettingsState {
    companyName: string;
    tagline: string;
    primaryColor: string;
    defaultCurrency: string;
    timeZone: string;
}

const initialSettings: SettingsState = {
    companyName: "BrandFirst Agency",
    tagline: "Building powerful brands through data-driven design.",
    primaryColor: "#4f46e5", // Tailwind indigo-600 default
    defaultCurrency: "USD",
    timeZone: "America/Los_Angeles",
};

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SettingsState>(initialSettings);

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    // Simulated API call for saving brand settings
    const handleSave = async (section: string) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        // This is where the actual API call (e.g., api.saveSettings(settings)) would go
        toast.success(`✅ ${section} settings saved successfully!`, { 
            description: `Changes to ${section} identity are now live.` 
        });
    };

    return (
        <AppLayout>
            <div className="space-y-8 max-w-7xl mx-auto pt-6">
                <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
                <p className="text-lg text-gray-600">Manage global configurations, branding, and system-wide parameters.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Brand Configuration Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3"><SlidersHorizontal className="w-5 h-5 text-indigo-600"/><span>Brand Identity</span></CardTitle>
                            <p className="text-sm text-muted-foreground">Control the public facing assets and core message of the agency.</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input 
                                        id="companyName"
                                        name="companyName"
                                        value={settings.companyName}
                                        onChange={handleBrandChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tagline">Tagline / Motto</Label>
                                    <Input 
                                        id="tagline"
                                        name="tagline"
                                        value={settings.tagline}
                                        onChange={handleBrandChange}
                                        placeholder="Your company's concise mission statement"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="primaryColor">Primary Theme Color</Label>
                                    <Input 
                                        id="primaryColor"
                                        name="primaryColor"
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={handleBrandChange}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">This color controls the primary brand button and accents across the site.</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                 <Button onClick={() => handleSave('Brand')}>Save Branding Settings</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. System Preferences Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3"><Globe className="w-5 h-5 text-green-600"/><span>System Preferences</span></CardTitle>
                            <p className="text-sm text-muted-foreground">Define default operational parameters for the entire platform.</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                                    <Select 
                                        onValueChange={handleSystemChange} 
                                        value={settings.defaultCurrency}
                                    >
                                        <SelectTrigger id="defaultCurrency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <Label htmlFor="timeZone">Default Time Zone</Label>
                                    <Select 
                                        onValueChange={handleSystemChange} 
                                        value={settings.timeZone}
                                    >
                                        <SelectTrigger id="timeZone">
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                 <Button onClick={() => handleSave('System')}>Save System Preferences</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Integrations Card (Unchanged) */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3"><Zap className="w-5 h-5 text-orange-600"/><span>Integrations</span></CardTitle>
                            <p className="text-sm text-muted-foreground">Connect external tools like CRMs and calendars.</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 border rounded-md bg-orange-50/50">
                                <h4 className="font-semibold mb-2">CRM Sync</h4>
                                <p className="text-sm text-gray-600">Connect via Salesforce or HubSpot.</p>
                                <Button variant="outline" className="w-full mt-1">Connect CRM</Button>
                            </div>
                            <div className="p-3 border rounded-md bg-orange-50/50">
                                <h4 className="font-semibold mb-2">Calendar Events</h4>
                                <p className="text-sm text-gray-600">Sync with Google Calendar.</p>
                                <Button variant="outline" className="w-full mt-1">Connect Calendar</Button>
                            </div>
                            <Button className="w-full mt-6" onClick={() => toast('API Keys Section', { description: 'View API keys in your Neon Dashboard.' })}>
                                View API Keys
                            </Button>
                        </CardContent>
                    </Card>
                </div >
            </div>
        </AppLayout>
    );
}

export default SettingsPage;