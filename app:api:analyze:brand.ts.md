// app/api/analyze/brand.ts
import { runOllama } from '@/lib/brandAnalysis';

export async function POST(req: Request) {
 const { prompt } = await req.json();

 // Simulate brand analysis
 const analysis = await runOllama(prompt, 'llama3');

 return new Response(JSON.stringify({ analysis }), {
   status: 200,
   headers: { 'Content-Type': 'application/json' },
 });
}