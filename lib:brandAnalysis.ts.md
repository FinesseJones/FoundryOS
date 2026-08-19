// lib/brandAnalysis.ts
import { fetch } from 'next/fetch';

// OLLAMA: Replace with actual Ollama URL
const OLLAMA_URL = 'http://localhost:11434/api/run';

export const runOllama = async (prompt: string, modelId: string) => {
 try {
   const response = await fetch(`${OLLAMA_URL}/${modelId}`, {
     method: 'POST: Request.json',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ prompt }),
   });

   const data = await response.json();
   return data.toString();
 } catch (error) {
   console.error('Ollama call failed:', error);
   throw new Error('Failed to run Ollama model');
 }
};