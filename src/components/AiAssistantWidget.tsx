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
        setPrompt('');

        try {
            const generatedText = await generateContent(prompt);
            setResponse(generatedText);
        } catch (e) {
            // Catch the error simulated in the hook
            setResponse(`🚨 Error: ${e instanceof Error ? e.message : 'Could not connect to the AI model.'}`);
        }
    };

    return (
        <div className="p-6 bg-white border border-indigo-100 rounded-xl shadow-lg mt-4">
            <h3 className="text-xl font-bold mb-4 text-indigo-700">{title}</h3>
            
            <div className="space-y-6">
                {/* 1. Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Label htmlFor="ai-prompt">What do you need help with?</Label>
                    <Textarea
                        id="ai-prompt"
                        placeholder="E.g., 'Draft a new policy on remote work based on our company mission.'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="resize-none min-h-[100px]"
                        required
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !prompt}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing with Ollama...
                            </>
                        ) : (
                            "Generate Content with AI"
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