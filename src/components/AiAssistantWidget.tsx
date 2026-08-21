"use client";

import React, { useState } from 'react';
import { useOllamaApi } from '@/hooks/useOllamaApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AiAssistantWidgetProps {
    // Allows the parent component to conditionally show/hide the widget
    isVisible: boolean; 
    // Allows the parent to pass a title if needed
    title?: string;
}

const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({ isVisible, title = "AI Content Assistant" }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const { generateContent, isLoading, error } = useOllamaApi();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setResponse(null);

        try {
            const generatedText = await generateContent(prompt);
            setResponse(generatedText);
            setPrompt('');
        } catch (e) {
            // Catch error and preserve user's prompt
            setResponse(null);
        }
    };

    return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg mt-4 text-slate-100">
            <h3 className="text-lg font-bold mb-3 text-indigo-400">{title}</h3>
            
            <div className="space-y-4">
                {/* 1. Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Label htmlFor="ai-prompt" className="text-slate-300 text-xs font-mono">What do you need assistance with?</Label>
                    <Textarea
                        id="ai-prompt"
                        placeholder="E.g., 'Formulate an enterprise value narrative based on our Business DNA.'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="resize-none min-h-[100px] bg-slate-950 border-slate-800 text-slate-100"
                        required
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                        disabled={isLoading || !prompt}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing with NVIDIA AI...
                            </>
                        ) : (
                            "Generate with NVIDIA AI"
                        )}
                    </Button>
                </form>

                {/* 2. Output Display */}
                {response && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-md shadow-inner">
                        <h4 className="font-semibold text-indigo-800 mb-2">AI Response:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
                    </div>
                )}

                {/* 3. Error Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-800" role="alert">
                        <p className="font-semibold">🔴 API Error:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiAssistantWidget;