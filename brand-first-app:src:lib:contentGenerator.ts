/**
* Content generator — creates posts, calendars, and strategy
* from brand analysis output.

* Ollama integration points marked with // OLLAMA:
*/

// ─── Types ─────────────────────────────────────────────────

export interface ContentPost {
 id: string;
 platform: Platform;
 copy: string;
 hashtag: string[];
 format: PostFormat;
 scheduledAt: string;
 status: 'draft' | 'published' | 'review';
 analysisRef?: string;
}

export interface ContentCalendar {
 brandName: string;
 posts: ContentPost[];
 generatedAt: string;
 analysis?: BrandAnalysis;
}

export interface PlatformStrategy {
 platform: Platform;
 contentMix: ContentMix;
 postingCadence: PostingCadence;
 bestTimes: PostingTimes;
 contentFormats: ContentFormat[];
}

export interface PlatformStrategyGeneratorInput {
 brandName: string;
 analysis: BrandAnalysis;
}

export interface BrandStrategy {
 brandName: string;
 platforms: PlatformStrategy[];
 pillars: string[];
 voice: VoiceProfile;
 tone: 'formal' | 'casual' | 'professional' | 'warm';
 voiceGuide: string;
 toneGuide: string;
}

export interface PostGenerationOptions {
 brandName: string;
 analysis: BrandAnalysis;
 platforms: Platform[];
 daysOfWeek: number[];
 postsPerWeek: number;
}

// ─── Content generation ──────────────────────────────────────

/**
* Generate posts for a brand across platforms.
*
* Uses the brand analysis to create platform-specific content.
* Ollama can be used for richer generation.
*
* OLLAMA: Replace the template generation with:
*   fetch(`${ollamaUrl}/api/run`, {
*     method: 'POST',
*     body: JSON.stringify({
*       model: 'llama3',
*       messages: [
*         { role: 'system', content: voiceSystemPrompt },
*         { role: 'user', content: generatePrompt(pillars, keywords) },
*       ],
*     }),
*   })
*/
export function generatePosts(
 options: PostGenerationOptions
): ContentPost[] {
 const { brandName, analysis, platforms, daysOfWeek, postsPerWeek } = options;
 const voice = analysis.voice;
 const tone = analysis.tone;
 const pillars = analysis.pillars;
 const keywords = analysis.primaryKeywords;

 const posts: ContentPost[] = [];
 const totalPosts = daysOfWeek.length * postsPerWeek;

 for (let i = 0; i < totalPosts; i++) {
   const dayOfWeek = daysOfWeek[Math.floor(i / postsPerWeek) % daysOfWeek.length];
   const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
   const platform = platforms[Math.floor(i / totalPosts) % platforms.length];
   const date = addDays(today(), Math.floor(i / postsPerWeek) * 7 + dayOfWeek);
   const format = getRecommendedFormat(platform, i) as PostFormat;

   posts.push({
     id: generateId(),
     platform,
     copy: generatePostCopy(brandName, platform, voice, pillars, tone),
     hashtag: generateHashtags(keywords, pillars, platform, 5),
     format,
     scheduledAt: `${date}T12:00:00Z`,
     status: 'draft',
     analysisRef: generateId(),
   });
 }

 return posts;
}

/**
* Generate content calendar from brand analysis.
*
* Uses Ollama for richer content generation.
*
* OLLAMA: Instead of this pure logic generator, call Ollama with:
*   POST http://localhost:11434/api/run
*   body: {
*     model: 'llama3',
*     messages: [
*       { role: 'system', content: 'Generate a 4-week content calendar for a brand with these analysis results...' },
*       { role: 'user', content: JSON.stringify({ brand, analysis }) }
*     ]
*   }
*/
export async function generateContentCalendar(
 brandName: string,
 analysis: BrandAnalysis,
 options: {
   daysOfWeek?: number[];
   postsPerWeek?: number;
   platforms?: Platform[];
 }
): Promise<ContentCalendar> {
 const daysOfWeek = options.daysOfWeek || [0, 1, 2, 3, 4];
 const postsPerWeek = options.postsPerWeek || 1;
 const platforms = options.platforms || ['instagram', 'twitter', 'linkedin'] as Platform[];

 const posts = generatePosts({
   brandName,
   analysis,
   platforms,
   daysOfWeek,
   postsPerWeek,
 });

 return {
   brandName,
   posts,
   generatedAt: new Date().toISOString(),
   analysis,
 };
}

/**
* Generate a platform-specific strategy for a brand.
*
* OLLAMA: Call Ollama with:
*   POST http://localhost:11434/api/run
*   body: {
*     model: 'llama3',
*     messages: [
*       { role: 'system', content: 'You are a content strategist. Generate a platform strategy for this brand...' },
*       { role: 'user', content: JSON.stringify(strategyPrompt(input)) }
*     ]
*   }
*/
export function generatePlatformStrategy(
 input: PlatformStrategyGeneratorInput
): PlatformStrategy[] {
 const { brandName, analysis } = input;

 // Strategy generation based on brand analysis
 const strategies: PlatformStrategy[] = [];

 const platforms = [
   'instagram' as Platform,
   'twitter' as Platform,
   'linkedin' as Platform,
   'tiktok' as Platform,
   'facebook' as Platform,
   'youtube' as Platform,
 ];

 for (const platform of platforms) {
   const strategy = buildPlatformStrategy(platform, analysis);
   strategies.push(strategy);
 }

 return strategies;
}

/**
* Generate brand strategy doc.
*
* OLLAMA: Call Ollama with:
*   POST http://localhost:11434/api/run
*   body: {
*     model: 'llama3',
*     messages: [
*       { role: 'system', content: 'You are a brand strategist. Generate a brand strategy document...' },
*       { role: 'user', content: strategyDocInput }
*     ]
*   }
*/
export function generateBrandStrategy(
 input: PlatformStrategyGeneratorInput
): BrandStrategy {
 const { brandName, analysis } = input;
 const strategies = generatePlatformStrategy(input);

 return {
   brandName,
   platforms: strategies,
   pillars: analysis.pillars,
   voice: analysis.voice,
   tone: analysis.tone,
   voiceGuide: buildVoiceGuide(analysis.voice),
   toneGuide: buildToneGuide(analysis.tone),
 };
}

// ─── Platform strategy builders ─────────────────────────────

function buildPlatformStrategy(platform: Platform, analysis: BrandAnalysis): PlatformStrategy {
 const base: PlatformStrategy = {
   platform,
   contentMix: {
     educational: 30,
     inspirational: 20,
     promotional: 20,
     behindTheScenes: 15,
     userGenerated: 15,
   },
   postingCadence: {
     frequency: 3,
     dayOfWeek: 0,
     bestTimeHour: 10,
   },
   bestTimes: {
     instagram: '10:00 AM - 11:00 AM',
     twitter: '8:00 AM - 9:00 AM',
     linkedin: '9:00 AM - 10:00 AM',
     tiktok: '6:00 PM - 7:00 PM',
     facebook: '2:00 PM - 3:00 PM',
     youtube: '5:00 PM - 6:00 PM',
   },
   contentFormats: [],
 };

 // Adjust strategy based on brand voice
 if (analysis.voice === 'authoritative') {
   base.contentMix.promotional = 25;
   base.contentMix.educational = 35;
 } else if (analysis.voice === 'empathetic') {
   base.contentMix.userGenerated = 20;
   base.contentMix.inspirational = 25;
 } else if (analysis.voice === 'playful') {
   base.contentMix.userGenerated = 25;
   base.contentMix.inspirational = 15;
 } else if (analysis.voice === 'thought-leader') {
   base.contentMix.educational = 35;
   base.contentMix.inspirational = 20;
 } else { // minimalist
   base.contentMix.educational = 30;
   base.contentMix.inspirational = 20;
 }

 // Set format list
 base.contentFormats = POST_FORMATS[platform] || POST_FORMATS.instagram;

 return base;
}

function buildVoiceGuide(voice: VoiceProfile): string {
 const profile = VoiceProfiles[voice];
 if (!profile) return 'Default brand voice guide.';

 return `
# Voice Guide: ${capitalize(voice)}

Your brand speaks with ${profile.description.toLowerCase()}.

**Tone**: ${profile.tone}
**Sentence style**: ${profile.sentenceStyle}
**Emoji density**: ${profile.emojiDensity}
**Hashtag style**: ${profile.hashtagStyle}

## Opening lines
${profile.openingLines.map(l => `- "${l}"`).join('\n')}

## Closing lines
${profile.closingLines.map(l => `- "${l}"`).join('\n')}

## Anti-patterns (DO NOT DO)
${profile.antiPatterns.map(p => `- ${