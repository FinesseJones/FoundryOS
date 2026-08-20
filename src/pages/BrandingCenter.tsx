"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Search, ShieldCheck, Rocket } from "lucide-react";
import { useOllamaApi } from "@/hooks/useOllamaApi";
import { toast } from "react-hot-toast";

interface BrandingProps {
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const BrandingCenter: React.FC<BrandingProps> = ({ currentUser }) => {
    // State for complex inputs that guide the AI
    const [financialPain, setFinancialPain] = useState('');
    const [processGap, setProcessGap] = useState('');
    const [stakeholderGap, setStakeholderGap] = useState('');
    const [tone, setTone] = useState('Authoritative');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<Record<string, string>>({});

    // --- AI INTERACTION HANDLER ---
    const generateBrandAssets = async () => {
        if (!financialPain || !processGap || !stakeholderGap) {
            toast.error("⚠️ Please fill out all three opportunity pillars to generate meaningful assets.");
            return;
        }

        setIsLoading(true);
        setGeneratedOutput({});

        // The SYSTEM PROMPT is the 'magic sauce'. It tells the AI exactly how to think.
        const promptMessage = `
            Based on the following business intelligence, generate a complete Marketing and Positioning Guide for a B2B consultancy. The tone MUST be ${tone}.

            **COMPANY DNA CORE:** We enforce Governance, Governability, and Predictability. We turn chaos into auditable certainty.
            
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
            const result = await generateContent(promptMessage, "The response must be formatted with markdown headers and lists for readability.");
            setGeneratedOutput({
                fullText: result || "Error generating content. Please try simplifying the input.",
            });
            toast.success("✨ Brand assets generated successfully!");
        } catch (e) {
            toast.error("❌ Failed to generate assets. Check the API endpoint or try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Display component for structured output
    const DisplayedOutput = generatedOutput.fullText ? (
        <div className="prose prose-indigo max-w-xl py-4">
            {/* Simple rendering of markdown/text */}
            <div dangerouslySetInnerHTML={{ __html: generatedOutput.fullText.replace(/\n\n/g, '</br><br>').replace(/\*/g, '<strong>') }} />
        </div>
    ) : (
        <div className="text-gray-400 p-4 border-dashed border-2 border-gray-100 rounded-md">
            Generate assets here to see your brand positioning.
        </div>
    );

    return (
        <AppLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">Strategic Branding Center</h1>
                <p className="text-lg text-gray-600">
                    This tool synthesizes the pain points and opportunities identified across our platform to generate powerful, high-ROI marketing assets and positioning strategies.
                </p>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl"><Rocket className="w-5 h-5 text-red-600"/> Brand Messaging Engine</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Input Column 1: Pain Points */}
                            <div className="lg:col-span-1 space-y-4">
                                <h3 className="text-xl font-semibold text-indigo-700 flex items-center space-x-2"><Search className="w-5 h-5"/> Discovery Input</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">1. Core Financial Pain (The Wallet)</label>
                                    <textarea 
                                        placeholder="e.g., '$1M lost annually in overhead due to complex, manual departmental reconciliation.'" 
                                        value={financialPain} 
                                        onChange={(e) => setFinancialPain(e.target.value)} 
                                        rows={3}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">2. Process Gap (The Process)</label>
                                    <textarea 
                                        placeholder="e.g., 'Hand-offs require 5 separate systems and multiple manual approvals, causing delays.'" 
                                        value={processGap} 
                                        onChange={(e) => setProcessGap(e.target.value)} 
                                        rows={3}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">3. Stakeholder Alignment (The People)</label>
                                    <textarea 
                                        placeholder="e.g., 'Finance VP is the Sponsor, but the Operations Manager is the Champion. We need to speak to both.' " 
                                        value={stakeholderGap} 
                                        onChange={(e) => setStakeholderGap(e.target.value)} 
                                        rows={3}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Input Column 2: Tone & Action */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <h3 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center space-x-2"><Zap className="w-5 h-5"/> Control Panel</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tone / Authority</label>
                                            <select 
                                                value={tone} 
                                                onChange={(e) => setTone(e.target.value)} 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Analyzing Data...</>
                                        ) : (
                                            <>Generate Brand Positioning Suite <Rocket className="ml-2 h-5 w-5 inline transform transform-none"/></>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Output Section */}
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle className="text-2xl">Generated Brand Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading && <div className="text-center py-10 text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3"/> Generating Strategic Voice...</div>}
                                {!generatedOutput.fullText && !isLoading && (
                                    <div className="text-center py-10 text-gray-500">
                                        Define the client pain points and click "Generate" to see strategic assets.
                                    </div>
                                )}
                                {displayedOutput && <></>}
                            </CardContent>
                        </Card>
                    </Card>
                </Card>
            </div>
        </AppLayout>
    );
};

export default BrandingCenter;