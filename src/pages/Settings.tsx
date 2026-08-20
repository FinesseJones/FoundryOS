"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Globe, Zap, DollarSign, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Global state definition for configuration (Mock internal state structure)
interface Config {
    baseCurrency: string;
    currencySymbol: string;
    timeZone: string;
    defaultReportPeriod: 'Month' | 'Quarter' | 'Year';
}

// Initial placeholder state - This needs to be fetched from the actual settings API endpoint
const initialConfig: Config = {
    baseCurrency: "USD",
    currencySymbol: "$",
    timeZone: "UTC",
    defaultReportPeriod: "Month"
};

const SettingsPage: React.FC = () => {
    const [config, setConfig] = useState<Config>(initialConfig);
    const [isLoading, setIsLoading] = useState(false);

    // Handlers simulating API interaction
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCurrency = e.target.value;
        setConfig(prev => ({ ...prev, baseCurrency: newCurrency, currencySymbol: newCurrency === 'EUR' ? '€' : prev.currencySymbol }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        
        // *** Critical section: Simulate API call ***
        // In a real app: await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(config) });
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        // Success feedback
        setIsLoading(false);
        toast("Settings Saved!", { description: "The global system configuration has been safely updated.", action: <Button onClick={() => window.location.reload()}>OK</Button> });
    }

    return (
        <AppLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">Global System Settings</h1>
                <p className="text-gray-600">Manage the global controls and core configuration parameters for the entire application.</p>

                <Card className="p-8 shadow-xl">
                    <div className="flex justify-between items-center border-b pb-6 mb-6">
                         <h2 className="text-xl font-semibold flex items-center space-x-2 text-indigo-700">
                            <SlidersHorizontal className="w-5 h-5"/>
                            <span>General Configuration</span>
                        </h2>
                        <button onClick={handleSave} disabled={isLoading} className="flex items-center space-x-2">
                            <Zap className="w-5 h-5" />
                            <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Currency Control Section (Most critical function) */}
                        <div className="border p-6 rounded-lg bg-indigo-50/50 border-indigo-200">
                            <h3 className="text-lg font-semibold flex items-center space-x-2 text-indigo-800">
                                <DollarSign className="w-5 h-5"/>
                                <span>Global Currency Control</span>
                            </h3>
                            <p className="text-sm text-indigo-600 mb-4">Setting the base currency standard ensures all modules (Reports, Budgets, etc.) calculate rates consistently.</p>
                            
                            <div className="grid grid-cols-2 gap-5 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Currency</label>
                                    <select 
                                        value={config.baseCurrency} 
                                        onChange={handleCurrencyChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        <option value="USD">$ - US Dollar</option>
                                        <option value="EUR">€ - Euro</option>
                                        <option value="GBP">£ - British Pound</option>
                                        <option value="JPY">¥ - Japanese Yen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                                    <Input 
                                        type="text" 
                                        value={config.currencySymbol} 
                                        onChange={(e) => setConfig({...config, currencySymbol: e.target.value})}
                                        disabled={true}
                                        className="cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-indigo-500 mt-3">Note: Changing the base currency requires administrator approval.</p>
                        </div>

                        {/* Time Zone and Report Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center space-x-2 text-gray-800">
                                <Clock className="w-5 h-5"/>
                                <span>Time & Reporting Defaults</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                                    <select 
                                        disabled={true}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-not-allowed"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="EST">Eastern Standard Time</option>
                                        {/* ... more options ... */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Report Period</label>
                                    <select 
                                        value={config.defaultReportPeriod} 
                                        onChange={(e) => setConfig({...config, defaultReportPeriod: e.target.value as 'Month' | 'Quarter' | 'Year'})}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                    >
                                        <option value="Month">Month</option>
                                        <option value="Quarter">Quarter</option>
                                        <option value="Year">Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}

export default SettingsPage;