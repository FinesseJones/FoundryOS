/**
* Brand analysis engine
*
* Pure logic — analyzes brand personality from:
* - website URL (scrapes page content)
* - text content (voice, tone, keyword analysis)
* - brand name (pattern recognition)
*
* Results: voice, tone, pillars, consistency score, keywords, sentiment
*/

import { VoiceProfiles } from './voiceProfiles';
import { analyzeVoiceFromText } from './utils';

export interface AnalysisInput {
 brandName: string;
 url?: string;
 content?: string;
}

export interface AnalysisResult {
 brand: string;
 voice: 'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist';
 tone: 'formal' | 'casual' | 'professional' | 'warm';
 pillars: string[];
 keywords: string[];
 consistencyScore: number;
 sentiment: 'positive' | 'neutral' | 'negative';
 analyzedAt: string;
 confidence: number;
 evidence: { key: string; score: number }[];
}

// ─── Core analysis ──────────────────────────────────────────

export async function analyzeBrand(input: AnalysisInput): Promise<AnalysisResult> {
 const { brandName, url, content } = input;

 // 1. Extract text content
 let text = content || '';

 // 2. Analyze voice from text
 const voiceAnalysis = analyzeVoiceFromText(text);

 // 3. Extract pillars from voice profile
 const profile = VoiceProfiles[voiceAnalysis.voice];
 const pillars = extractPillars(profile, brandName, text);

 // 4. Extract keywords
 const keywords = extractKeywords(text, brandName);

 // 5. Calculate consistency score
 const consistencyScore = calculateConsistencyScore(
   pillars,
   keywords,
   voiceAnalysis.confidence
 );

 // 6. Determine sentiment
 const sentiment = analyzeSentiment(text);

 // 7. Build result
 return {
   brand: brandName,
   voice: voiceAnalysis.voice,
   tone: profile?.tone || 'professional',
   pillars: pillars,
   keywords: keywords,
   consistencyScore,
   sentiment,
   analyzedAt: new Date().toISOString(),
   confidence: voiceAnalysis.confidence,
   evidence: voiceAnalysis.evidence,
 };
}

// ─── Pillar extraction ──────────────────────────────────────

/**
* Extracts brand pillars from voice profile and brand name analysis.
*/
function extractPillars(
 profile: typeof VoiceProfiles,
 brandName: string,
 text: string
): string[] {
 // Start with voice profile's content angles
 let pillars = [...profile.contentAngles].slice(0, 4);

 // Override with brand name if name suggests something specific
 const nameKeywords = brandName.toLowerCase().split(/\s+/);
 const domainPillars: Record<string, string[]> = {
   tech: ['Technology', 'Innovation', 'Digital', 'Software'],
   ai: ['Artificial Intelligence', 'Machine Learning', 'Neural Networks'],
   health: ['Health', 'Wellness', 'Healing', 'Self-Care'],
   fitness: ['Fitness', 'Training', 'Performance', 'Strength'],
   fashion: ['Fashion', 'Style', 'Design', 'Aesthetics'],
   food: ['Food', 'Cuisine', 'Flavor', 'Cooking'],
   finance: ['Finance', 'Investing', 'Wealth', 'Investment'],
   real: ['Real Estate', 'Housing', 'Properties', 'Living'],
   auto: ['Automotive', ' Vehicles', 'Driving', 'Performance'],
   travel: ['Travel', 'Adventure', 'Journey', 'Destination'],
 };

 for (const [domain, domainPillars] of Object.entries(domainPillars)) {
   if (nameKeywords.some(n => n.toLowerCase().includes(domain))) {
     pillars = [...domainPillars, ...pillars];
     break;
   }
 }

 // Override if text mentions specific pillars
 const textPillars = [];
 const pillarKeywords = [
   'community', 'customers', 'team', 'team', 'community', 'customers', 'team', 'team', 'team', 'team',
   'community', 'customers', 'team', 'team', 'community', 'customers', 'team', 'team', 'team',
 ];
 for (const keyword of pillarKeywords) {
   if (text.toLowerCase().includes(keyword)) {
     textPillars.push(capitalize(keyword));
   }
 }

 return unique([...pillars, ...textPillars]).slice(0, 6);
}

// ─── Keyword extraction ─────────────────────────────────────

/**
* Extracts top keywords from brand text content.
*/
function extractKeywords(text: string, brandName: string): string[] {
 const stopWords = new Set([
   'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
   'of', 'with', 'by', 'is', 'it', 'this', 'that', 'these', 'those', 'are',
   'was', 'were', 'be', 'been', 'being', 'has', 'have', 'had', 'will', 'would',
   'could', 'should', 'may', 'might', 'can', 'do', 'does', 'did', 'doing', 'done',
   'about', 'into', 'over', 'after', 'above', 'below', 'between', 'through',
   'during', 'before', 'under', 'again', 'further', 'then', 'once', 'here',
   'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
   'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
   'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'if', 'while',
   'than', 'also', 'very', 'just', 'because', 'also', 'not', 'nor', 'so', 'than', 'too',
   'about', 'into', 'over', 'after', 'above', 'below', 'between', 'through', 'during',
 ]);

 const words = text.toLowerCase().split(/\W+/).filter(Boolean);
 const uniqueWords = [...new Set(words)].filter(w => !stopWords.has(w)).sort((a, b) => b.length - a.length);

 return uniqueWords.slice(0, 10).filter(w => w.length > 3);
}

// ─── Consistency score ─────────────────────────────────────

/**
* Calculates brand consistency score (0–100) based on:
* - pillar coverage (40%)
* - keyword richness (30%)
* - analysis confidence (30%)
*/
function calculateConsistencyScore(
 pillars: string[],
 keywords: string[],
 confidence: number
): number {
 const pillarWeight = Math.min(pillars.length / 4, 1) * 40;
 const keywordWeight = Math.min(keywords.length / 6, 1) * 30;
 const confidenceWeight = confidence * 30;

 const score = pillarWeight + keywordWeight + confidenceWeight;
 return clamp(score, 0, 100);
}

// ─── Sentiment analysis ─────────────────────────────────────

/**
* Simple sentiment analysis based on word patterns.
* For production, use a real NLP library or Ollama.
*/
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
 const words = text.toLowerCase().split(/\W+/).filter(Boolean);

 const positiveWords = new Set([
   'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'awesome',
   'best', 'fantastic', 'outstanding', 'wonderful', 'positive', 'love', 'happy',
   'exciting', 'wonderful', 'great', 'good', 'love', 'awesome', 'great', 'love',
   'amazing', 'wonderful', 'positive', 'happy', 'exciting', 'love', 'great', 'good',
   'love', 'great', 'love', 'great', 'love',
 ]);

 const negativeWords = new Set([
   'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor',
   'weak', 'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'weak',
   'poor', 'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'weak',
   'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'weak',
 ]);

 let positiveCount = words.filter(w => positiveWords.has(w)).length;
 let negativeCount = words.filter(w => negativeWords.has(w)).length;

 if (positiveCount > negativeCount) return 'positive';
 if (negativeCount > positiveCount) return 'negative';
 return 'neutral';
}

// ─── Helpers ────────────────────────────────────────────────

function unique<T>(arr: T[]): T[] {
 return [...new Set(arr)];
}

function capitalize(str: string): string {
 return str.charAt(0).toUpperCase() + str.slice(1);
}

function clamp(value: number, min: number, max: number): number {
 return Math.max(min, Math.min(max, value));
}

// ─── URL analysis (placeholder — scrape content) ────────────

/**
* Placeholder: In production, use a scraping library or Ollama to analyze URL content.
*/
async function analyzeUrlContent(url: string): Promise<string> {
 // TODO: Replace with real scraping (puppeteer, cheerio, or Ollama)
 console.log(`Analyzing URL: ${url}`);
 return `Website: ${url}`;
}

// ─── Complete analysis with Ollama (optional) ───────────────

/**
* Production version: uses Ollama for deep analysis.
*
* Ollama API call: POST http://localhost:11434/api/run
* Request body: { model: "llama3", messages: [{ role: "user", content: "..." }] }
*/
export async function analyzeBrandWithOllama(
 input: AnalysisInput,
 ollamaUrl: string = 'http://localhost:11434'
): Promise<AnalysisResult> {
 const urlContent = input.url ? await analyzeUrlContent(input.url) : '';
 const fullText = `${urlContent}\n${input.content || ''}`;

 const response = await fetch(`${ollamaUrl}/api/run`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
     model: 'llama3',
     messages: [
       {
         role: 'system',
         content: `You are a brand analyst. Analyze the brand and return your analysis in this format:

Voice: [authoritative|empathetic|playful|thought-leader|minimalist]
Tone: [formal|casual|professional|warm]
Pillars: [comma-separated list of 3-5 brand pillars]
Keywords: [comma-separated list of 10 keywords]
Consistency Score: [number 0-100]
Sentiment: [positive|neutral|negative]
Confidence: [number 0-1]

Respond with ONLY the values in order, no extra text.`,
       },
       {
         role: 'user',
         content: input.brandName,
         content: fullText,
       },
     ],
     stream: false,
   }),
 });

 if (!response.ok) {
   throw new Error(`Ollama error: ${response.status}`);
 }

 const result: Record<string, unknown> = await response.json();
 const data = result.message?.trim() ?? '';

 // Parse Ollama response
 const voiceMatch = /Voice:\s*(\w+)/.exec(data);
 const toneMatch = /Tone:\s*(\w+)/.exec(data);
 const pillarsMatch = /Pillars:\s*([^\n]+)/.exec(data);
 const keywordsMatch = /Keywords:\s*([^\n]+)/.exec(data);
 const scoreMatch = /Consistency Score:\s*(\d+)/.exec(data);
 const sentimentMatch = /Sentiment:\s*(\w+)/.exec(data);
 const confidenceMatch = /Confidence:\s*([\d.]+)/.exec(data);

 return {
   brand: input.brandName,
   voice: (voiceMatch?.[1] as any) || 'authoritative',
   tone: (toneMatch?.[1] as any) || 'professional',
   pillars: pillarsMatch?.[1]?.split(',').map(s => s.trim()) || ['brand', 'identity'],
   keywords: keywordsMatch?.[1]?.split(',').map(s => s.trim()) || ['brand', 'identity', 'marketing'],
   consistencyScore: scoreMatch ? parseInt(scoreMatch[1]) || 50 : 50,
   sentiment: (sentimentMatch?.[1] as any) || 'neutral',
   analyzedAt: new Date().toISOString(),
   confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) || 0.5 : 0.5,
   evidence: [],
 };
}