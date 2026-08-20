"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Zap, Search, ShieldCheck, Rocket, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useOllamaApi } from "@/hooks/useOllamaApi";

// Define types for clarity
interface BrandingProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const BrandingCenter: React.FC<BrandingProps> = ({ currentUser }) => {
    const { generateContent } = useOllamaApi();
    const [financialPain, setFinancialPain] = useState('');
    const [processGap, setProcessGap] = useState('');
    const [stakeholderGap, setStakeholderGap] = useState('');
    const [tone, setTone] = useState('Authoritative');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<Record<string, string>>({});

    // --- AI INTERACTION HANDLER (Functionality remains the same) ---
    const generateBrandAssets = async () => {
        if (!financialPain || !processGap || !stakeholderGap) {
            toast.error("⚠️ Please fill out all three opportunity pillars to generate meaningful assets.");
            return;
        }

        setIsLoading(true);
        setGeneratedOutput({});

        const promptMessage = `
            Based on the following business intelligence, generate a complete Marketing and Positioning Guide for a B2B consultancy. The tone MUST be ${tone}.

            **COMPANY DNA CORE:** We enforce Governance, Governance, and Predictability. We turn chaos into auditable certainty.
            
            **INPUT INTELLIGENCE (The Pain Points):**
            1. **Financial Pain (Money):** ${financialPain}
            2. **Process Gap (Process):** ${processGap}
            3. **Stakeholder Gap (People):** ${stakeholderGap}

            **OUTPUT REQUIREMENTS:**
            Structure the response into these sections, using professional, corporate copywriting:
            
            **[1] The Core Value Proposition:** A one-paragraph declaration of our core mission and unique selling point.
            **[2] Three Tiered Taglines:** 1. Bold/Disruptive (For press), 2. Direct/Pain-focused (For ads), 3. Abstract/Trust-focused (For corporate handouts).
            **[3] Mission Statement:** A declarative statement of our core purpose.
            **[4] Value Pillars:** A list of 5-7 powerful keywords and concepts that define our methodology, making sure to include "Predictability," "Governance," and "Auditability."
        `;

        try {
            const result = await generateContent(promptMessage + "\n\nThe response must be formatted with markdown headers and lists for readability.");
            setGeneratedOutput({
                fullText: result || "Error generating content. Please try simplifying the input.",
            });
            toast.success("✨ Brand assets generated successfully!");
        } catch (e) {
            console.error(e);
            toast.error("❌ Failed to generate assets. Check the API endpoint or try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Display component for structured output (Remains polished)
    const DisplayedOutput = generatedOutput.fullText ? (
        // CRITICAL FIX: Ensuring the div wrapper is properly closed for JSX
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-inner">
            <div dangerouslySetInnerHTML={{ __html: generatedOutput.fullText.replace(/\n\n/g, '</br><br>').replace(/\*\*/g, '<strong>') }} />
        </div>
    ) : (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            <Zap className="w-6 h-6 mx-auto mb-2"/>
            <p className="text-base">Generate assets here using the 3 Pillars above to see your professional brand positioning suite.</p>
        </div>
    );

    return (
        <AppLayout>
            <div className="space-y-12">
                <h1 className="text-4xl font-extrabold text-gray-900">Strategic Branding Center</h1>
                <p className="text-xl text-gray-600">
                    This tool synthesizes the pain points and opportunities identified across our platform's operational data to generate powerful, high-ROI marketing assets and positioning strategies.
                </p>

                <Card className="shadow-2xl">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-3xl flex items-center space-x-3">
                            <Rocket className="w-8 h-8 text-red-600"/>
                            <span className="text-gray-800">Brand Messaging Engine</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Input Column 1: Pain Points */}
                            <div className="lg:col-span-1 space-y-6">
                                <h3 className="text-xl font-bold text-indigo-800 flex items-center space-x-3"><Search className="w-6 h-6"/> Operational Intelligence Inputs</h3>
                                
                                {/* Input Field Component - Using common styling */}
                                <div className="space-y-2 border-l-4 border-red-400 pl-4 py-3 bg-red-50/50">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">1. Financial Mandate (The Wallet)</label>
                                    <textarea 
                                        placeholder="e.g., '$1.2M lost annually...' " 
                                        value={financialPain} 
                                        onChange={(e) => setFinancialPain(e.target.value)} 
                                        rows={3}
                                        className="w-full border p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-2 border-l-4 border-yellow-400 pl-4 py-3 bg-yellow-50/50">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">2. Process Gap (The Process)</label>
                                    <textarea 
                                        placeholder="e.g., 'The main website is outdated...'" 
                                        value={processGap} 
                                        onChange={(e) => setProcessGap(e.target.value)} 
                                        rows={3}
                                        className="w-full border p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-2 border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/50">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">3. Stakeholder Alignment (The People)</label>
                                    <textarea 
                                        placeholder="e.g., 'Finance VP is the Sponsor...'" 
                                        value={stakeholderGap} 
                                        onChange={(e) => setStakeholderGap(e.target.value)} 
                                        rows={3}
                                        className="w-full border p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Input Column 2: Tone & Action */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200 shadow-md">
                                    <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center space-x-2">
                                        <Zap className="w-5 h-5"/> Tone & Context Control
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tone / Authority</label>
                                            <select 
                                                value={tone} 
                                                onChange={(e) => setTone(e.target.value)} 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                <option value="Authoritative">Authoritative (The Expert)</option>
                                                <option value="Empathetic">Empathetic (The Partner)</option>
                                                <option value="Disruptive">Disruptive (The Challenger)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                            <input 
                                                type="text" 
                                                defaultValue="C-Suite Executives in Mid-Market Companies" 
                                                className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        onClick={generateBrandAssets} 
                                        disabled={isLoading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg shadow-xl shadow-red-200"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2"/> Analyzing Data...
                                            </>
                                        ) : (
                                            <>
                                                Generate Brand Positioning Suite <Rocket className="ml-2 h-5 w-5 inline transform transform-none"/>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Output Section - Visually separated */}
                        <Card className="mt-12 shadow-2xl border border-gray-100">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-2xl">Generated Brand Assets Package</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <div className="flex flex-col items-center space-y-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-red-600"/>
                                            <span>Drafting Strategic Tone...</span>
                                        </div>
                                    </div>
                                ) : (!generatedOutput.fullText && !isLoading) ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                        <Zap className="w-6 h-6 mx-auto mb-2"/>
                                        <p className="text-base">Generate assets here using the 3 Pillars above to see your professional brand positioning suite.</p>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-inner">
                                        <div dangerouslySetInnerHTML={{ __html: (generatedOutput.fullText || '').replace(/\n\n/g, '<br/><br/>').replace(/\*\*/g, '<strong>') }} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default BrandingCenter;