"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Clock, Users, CheckCircle, Upload, Download, FileText, Calendar, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CurrencySwitcher from "@/components/CurrencySwitcher"; // Import the new component

// Define the structure for a KPI card
interface KPIData {
    title: string;
    value: { usd: number; local: string; currency: string };
    icon: React.ReactNode;
    change: string; 
    colorClass: string; 
    localCurrency: string; 
}

const mockKPIs: KPIData[] = [
    { title: "Total Projected Revenue", value: { usd: 1200000, local: "1,200,000", currency: "INR" }, icon: <DollarSign className="w-5 h-5" />, change: "+8.5%", colorClass: "text-green-500", localCurrency: "INR" },
    { title: "Total Spent Budget", value: { usd: 350000, local: "35,00,000", currency: "INR" }, icon: <Clock className="w-5 h-5" />, change: "+1 since last month", colorClass: "text-indigo-500", localCurrency: "INR" },
    { title: "Average Project Value", value: { usd: 65000, local: "650,000", currency: "INR" }, icon: <Users className="w-5 h-5" />, change: "Stable", colorClass: "text-yellow-500", localCurrency: "INR" },
    { title: "Completion Rate", value: { usd: 0, local: "78%", currency: "" }, icon: <CheckCircle className="w-5 h-5" />, change: "2% increase", colorClass: "text-blue-500", localCurrency: "" },
];

const ReportsContent: React.FC = () => {
    const [timeframe, setTimeframe] = useState("Last 12 Months");
    const [importFile, setImportFile] = useState<File | null>(null);

    // (Function implementations remain the same)
    // ... (handleTimeframeChange, handleFileUpload, handleImportData)
    const handleTimeframeChange = async (newTimeframe: string) => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        toast.info("Data Updated", { 
            description: `Statistics refreshed for ${newTimeframe} using converted currency.` 
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
        } else {
            setImportFile(null);
        }
    };

    const handleImportData = async () => {
        if (!importFile) {
            toast.warning("Missing File", { description: "Please select a CSV file first." });
            return;
        }
        
        toast.loading('Processing Data', { 
            description: `Analyzing ${importFile.name}... Currency conversion applied automatically.`, 
            duration: 3000 
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success("Data Import Complete!", { 
            description: `Successfully imported ${importFile.name}. 45 new records processed and converted.` 
        });
        
        (document.getElementById('csv-upload') as HTMLInputElement).value = '';
        setImportFile(null);
    };


    // Function to format and display the structured currency data (unchanged)
    const renderCurrencyKpi = (kpi: KPIData) => (
        <Card key={kpi.title} className="shadow-lg hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-full ${kpi.colorClass}/20 ${kpi.colorClass}`}>
                    {kpi.icon}
                </div >
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                    {/* Displaying both USD (base) and Local Currency */}
                    {kpi.value.usd ? (
                        <span className='text-lg text-gray-600 mr-2'>↓</span>
                        <span className='text-3xl'>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(kpi.value.usd)}
                        </span>
                    ) : (
                        <span className='text-3xl'>{kpi.value.local}</span>
                    )}
                </div>
                <p className={`text-sm font-medium ${kpi.colorClass}`}>
                    {kpi.change} vs previous period
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <ReportSquare className="w-6 h-6 text-green-600"/>
                <span className="text-xl">Analytics & Reporting</span>
            </h1>
            <p className="text-lg text-gray-600">Analyze your performance, track key metrics, and identify growth opportunities using real-time, multi-currency data.</p>

            {/* Global Currency Control Component */}
            <CurrencySwitcher />


            {/* Report Filtering, Timeframe & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeframe and Export Controls (Column 1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 border rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2"><CalendarIcon className="w-5 h-5 text-gray-700"/>Time Range</h3>
                        <div className="flex space-x-3 mb-6">
                            <Button 
                                variant={timeframe === "Last 12 Months" ? "default" : "outline"}
                                onClick={() => handleTimeframeChange("Last 12 Months")}
                            >
                                Last 12 Months
                            </Button>
                            <Button 
                                variant={timeframe === "Last Quarter" ? "default" : "outline"}
                                onClick={() => handleTimeframeChange("Last Quarter")}
                            >
                                Last Quarter
                            </Button>
                            <Button 
                                variant={timeframe === "Custom" ? "default" : "outline"}
                                onClick={() => { toast('Date Picker', { description: 'Opening advanced date range selection modal.' }); }}
                            >
                                Custom Range
                            </Button>
                        </div >
                        <button className="w-full" onClick={() => toast('Export', { description: 'Generating PDF report containing all displayed data.' })} disabled>
                            <Download className="w-4 h-4 mr-2"/> Export Report (PDF)
                        </button>
                    </div>

                    {/* Data Import Module (Column 2/3) */}
                    <Card className="p-6 border-l-4 border-indigo-600 shadow-md">
                        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2"><Upload className="w-5 h-5 text-indigo-600"/><span>Data Import</span></h3>
                        <p className="text-sm text-muted-foreground mb-4">Upload a CSV file to bulk update records (currency conversion applied automatically).</p>
                        
                        <div className='space-y-4'>
                            <label className="block text-sm font-medium text-gray-700">Select CSV File</label>
                            <input 
                                id="csv-upload" 
                                type="file" 
                                className="block w-full text-sm text-gray-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                                onChange={handleFileUpload}
                            />
                            {importFile && (
                                <p className="text-sm text-gray-600">Selected file: <span className='font-semibold'>{importFile.name}</span></p>
                            )}
                            <Button 
                                onClick={handleImportData} 
                                className={`w-full ${importFile ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'} ${!importFile ? 'cursor-not-allowed' : ''}`}
                                disabled={!importFile}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Process & Import Data
                            </Button>
                        </div >
                    </Card>
                </div>
            </div >

            {/* KPI Cards remain the same, but now benefit from the global currency control */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {mockKPIs.map((kpi) => (
                    renderCurrencyKpi(kpi)
                ))}
            </div>

            {/* Charting Area (unmodified) */}
            <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2"><TrendingUp className="w-5 h-5 text-indigo-600"/><span >Revenue Trend Overview (Graph)</span></h3>
                <div className="h-[400px] bg-gray-50 rounded-lg border flex items-center justify-center text-gray-400">
                    [DASHBOARD CHART CANVAS: Time-series graph showing monthly revenue projections (Converted to USD).]
                </div>
                <p className="text-sm text-gray-500 mt-4">Source: Consolidated Project & Invoicing Data. Base Currency: USD</p>
            </Card>
        </div>
    );
}

export default function ReportsPageWrapper() {
    return <AppLayout><ReportsContent /></AppLayout>
}