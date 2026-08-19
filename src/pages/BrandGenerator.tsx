"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Zap, Palette, BookOpen, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define the structure for the generated brand guidelines
interface BrandGuidelines {
    missionStatement: string;
    targetAudience: string;
    toneOfVoice: string;
    colorPalette: { primary: string; secondary: string; tertiary: string; hexCodes: string[] };
    keyMessaging: string;
}

// Helper function to simulate AI generation
const generateGuidelines = (prompt: string): BrandGuidelines | null => {
    if (prompt.length < 50) {
        return null; // Return null if the prompt is too short to generate meaningful data
    }
    
    // --- SIMULATION LOGIC ---
    // In a real scenario, this would be an API call to OpenAI or another AI service.
    // We use the prompt length/content to generate plausible, structured data.
    
    const mission = prompt.includes("sustainability") ? 
        "To empower businesses by connecting ethical consumerism with scalable technology, guiding positive change." :
        "To redefine industry standards through innovative, human-centered design and operational excellence.";
    
    const audience = prompt.includes("enterprise") ? 
        "Mid-to-large enterprise companies seeking digital transformation and operational efficiency improvements." :
        "Modern, digitally native consumers aged 25-45 who value authenticity and design.";

    const tone = prompt.includes("tech") ? 
        "Authoritative, Clear, and Forward-Thinking. Use precise but inspiring language." :
        "Warm, Empathetic, and Approachable. Build trust through storytelling.";
    
    const colors = {
        primary: '#2563eb', // Blue-600
        secondary: '#f59e0b', // Amber-500
        tertiary: '#10b981', // Emerald-500
        hexCodes: ["#1e3a8a", "#2563eb", "#fcd34d", "#05966c"]
    };

    return {
        missionStatement: mission,
        targetAudience: audience,
        toneOfVoice: tone,
        colorPalette: colors,
        keyMessaging: prompt.includes("sustainability") ? "Ethical Growth Starts Here." : "Design Your Tomorrow, Today.",
    };
};


const BrandGuidelinesDisplay: React.FC<{ guidelines: BrandGuidelines }> = ({ guidelines }) => (
    <div className="space-y-8">
        
        {/* 1. Mission Card */}
        <Card className="shadow-xl border-t-4 border-blue-600">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <Zap className="w-8 h-8 text-blue-600" />
                    <CardTitle>AI Generated Brand Guidelines</CardTitle>
                </div>
            </CardHeader>
            <CardContent className='space-y-6'>
                
                {/* Mission Statement */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 flex items-center space-x-2"><BookOpen className="w-4 h-4 text-blue-500"/> Mission Statement:</h4>
                    <p className="text-xl italic text-gray-800">{guidelines.missionStatement}</p>
                </div>

                {/* Key Messaging */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 flex items-center space-x-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Core Key Messaging:</h4>
                    <p className="text-lg font-semibold text-blue-800">{guidelines.keyMessaging}</p>
                </div>
            </CardContent>
        </Card>

        {/* 2. Color Palette */}
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <Palette className="w-8 h-8 text-indigo-600" />
                    <CardTitle>Brand Color Palette</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    {Object.keys(guidelines.colorPalette).map((key) => (
                        <div key={key} className="flex-1 flex flex-col items-center space-y-1">
                            <div className="w-full h-10 rounded-md shadow-inner" style={{ backgroundColor: guidelines.colorPalette.hexCodes[0] + 'AA' }}></div>
                            <div className="w-full h-8 rounded-md shadow-lg shadow-md" style={{ backgroundColor: guidelines.colorPalette.hexCodes[0] }}></div>
                            <span className="text-xs font-mono text-gray-700">{key.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* 3. Other Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Audience Profile</CardTitle></CardHeader>
                <CardContent><p className="text-gray-700">{guidelines.targetAudience}</p></CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Brand Tone of Voice</CardTitle></CardHeader>
                <CardContent><p className="text-gray-700">{guidelines.toneOfVoice}</p></CardContent>
            </Card>
        </div>

    </div>
);


const BrandGenerator: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [generatedGuidelines, setGeneratedGuidelines] = useState<BrandGuidelines | null>(null);
  const { toast } = useToast();
  
  const handleGenerate = () => {
    if (inputPrompt.trim()) {
      // Reset state and show loading/processing state
      setGeneratedGuidelines(null); 
      
      toast({
        title: "Generating Brand...",
        description: "The AI is crafting your brand guidelines. Please wait.",
      });

      // Simulate API latency
      setTimeout(() => {
        const guidelines = generateGuidelines(inputPrompt);
        if (guidelines) {
            setGeneratedGuidelines(guidelines);
            toast({
              title: "Success!",
              description: "Your brand guidelines have been generated.",
            });
        } else {
            toast({
              variant: "destructive",
              title: "Prompt Too Short",
              description: "Please provide a more detailed prompt (at least 50 characters).",
            });
        }
      }, 1500);

    } else {
        toast({
          variant: "destructive",
          title: "Input Required",
          description: "Please enter a brand concept before generating.",
        });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800">Brand Identity Generator</h1>
      <p className="text-lg text-gray-600">Input your core business concept and let the AI generate comprehensive branding guidelines.</p>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Input Your Brand Concept</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <Label htmlFor="prompt">Core Concept & Industry Details (Minimum 50 characters)</Label>
                <Textarea 
                    id="prompt" 
                    value={inputPrompt} 
                    onChange={(e) => setInputPrompt(e.target.value)} 
                    placeholder="Describe your company's mission, target audience, unique selling proposition, and existing color preferences..."
                    rows={8}
                />
                <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                    onClick={handleGenerate}
                >
                    Generate Brand Guidelines
                </Button>
            </div >
        </CardContent>
    </Card>

    {generatedGuidelines && <BrandGuidelinesDisplay guidelines={generatedGuidelines} />}
     
    {!generatedGuidelines && inputPrompt && (
         <Card className="shadow-xl min-h-[300px] border-dashed border-2 border-gray-300">
            <CardContent className="flex items-center justify-center h-full text-gray-500">
                Click 'Generate Brand Guidelines' above to see the structured results.
            </CardContent>
        </Card>
    )}
    
    {!generatedGuidelines && !inputPrompt && (
         <Card className="shadow-xl min-h-[300px] border-dashed border-2 border-gray-300">
            <CardContent className="flex items-center justify-center h-full text-gray-400">
                Enter details above and hit generate to begin.
            </CardContent>
        </Card>
    )}
    
    
    </div >
  );
};

export default BrandGenerator;