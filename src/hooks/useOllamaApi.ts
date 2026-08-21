import { useState, useCallback } from 'react';

export interface AiGenerationResult {
  content: string;
  provider: string;
  model: string;
}

/**
 * Enterprise AI Generation Hook for TACF OS.
 * Primary Provider: NVIDIA NIM Models (meta/llama-3.1-70b-instruct).
 * Fallback: Ollama local instance (if configured).
 * 
 * NEVER falls back to fake/static heuristics (e.g. remote-work policies).
 * On provider unavailability, preserves user input and provides retry capabilities.
 */
export const useOllamaApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Sends a prompt to the authoritative LLM proxy (/api/chat).
     * Throws an explicit error if the AI provider is unavailable or unconfigured.
     */
    const generateContent = useCallback(async (
        prompt: string, 
        systemInstruction?: string,
        model = 'meta/llama-3.1-70b-instruct'
    ): Promise<string> => {
        if (!prompt.trim()) {
            throw new Error("Prompt cannot be empty.");
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const messages = [];
            if (systemInstruction) {
                messages.push({ role: 'system', content: systemInstruction });
            }
            messages.push({ role: 'user', content: prompt });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.6,
                    max_tokens: 1500,
                })
            });

            if (!response.ok) {
                let errorDetails = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorJson = await response.json();
                    if (errorJson.error) {
                        errorDetails = errorJson.error;
                    }
                } catch {
                    // response is not JSON
                }

                const friendlyError = errorDetails.includes("NVIDIA_API_KEY") || errorDetails.includes("500") || errorDetails.includes("503")
                    ? "AI provider temporarily unavailable. Your Business DNA remains intact. Retry generation or check your configured AI provider."
                    : `AI Generation Error: ${errorDetails}`;

                setError(friendlyError);
                throw new Error(friendlyError);
            }

            const data = await response.json();
            const generatedText = data.choices?.[0]?.message?.content || data.response || '';

            if (!generatedText) {
                const emptyErr = "AI provider returned an empty response. Please retry.";
                setError(emptyErr);
                throw new Error(emptyErr);
            }

            return generatedText;
        } catch (err: any) {
            const finalMessage = err.message || "AI provider temporarily unavailable. Your Business DNA remains intact. Retry generation or check your configured AI provider.";
            setError(finalMessage);
            throw new Error(finalMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { generateContent, isLoading, error, setError };
};