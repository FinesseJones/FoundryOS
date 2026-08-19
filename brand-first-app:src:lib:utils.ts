/**
* Shared utilities — helpers, generators, formatters
*/

// ─── ID generation ─────────────────────────────────────────

export function generateId(): string {
 return Math.random().toString(36).substring(2, 12);
}

// ─── Date helpers ───────────────────────────────────────────

export function today(): string {
 return new Date().toISOString().split('T')[0];
}

export function addDays(date: string, days: number): string {
 const d = new Date(date);
 d.setDate(d.getDate() + days);
 return d.toISOString().split('T')[0];
}

export function formatDate(value: string): string {
 const d = new Date(value);
 return d.toLocaleDateString('en-US', {
   month: 'short',
   day: 'numeric',
   year: 'numeric',
 });
}

export function formatTimestamp(value: string): string {
 const d = new Date(value);
 return d.toLocaleString('en-US', {
   year: 'numeric',
   month: 'short',
   day: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
   hour12: true,
 });
}

// ─── String helpers ─────────────────────────────────────────

export function slugify(text: string): string {
 return text
   .toLowerCase()
   .replace(/[^\w\s-]/g, '')
   .replace(/\s+/g, '-')
   .replace(/-+/g, '-')
   .replace(/^-|-$/g, '');
}

export function truncate(str: string, maxChars: number): string {
 return str.length > maxChars ? str.substring(0, maxChars) + '…' : str;
}

export function capitalize(str: string): string {
 return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Array helpers ──────────────────────────────────────────

export function unique<T>(arr: T[]): T[] {
 return [...new Set(arr)];
}

export function shuffle<T>(arr: T[]): T[] {
 const copy = [...arr];
 for (let i = copy.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [copy[i], copy[j]] = [copy[j], copy[i]];
 }
 return copy;
}

export function chunk<T>(arr: T[], size: number): T[][] {
 const chunks: T[][] = [];
 for (let i = 0; i < arr.length; i += size) {
   chunks.push(arr.slice(i, i + size));
 }
 return chunks;
}

// ─── Analysis scoring ───────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
 return Math.max(min, Math.min(max, value));
}

export function calculateConsistencyScore(
 pillars: string[],
 keywords: string[],
 confidence: number
): number {
 const pillarWeight = Math.min(pillars.length / 4, 1) * 0.4;
 const keywordWeight = Math.min(keywords.length / 6, 1) * 0.3;
 const confidenceWeight = confidence * 0.3;
 return Math.round((pillarWeight + keywordWeight + confidenceWeight) * 100);
}

export function predictVoice(
 text: string
): 'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist' {
 const lower = text.toLowerCase();

 const authoritativeScore = [
   'strategy', 'data', 'analysis', 'results', 'performance',
   'metrics', 'framework', 'approach', 'optimization',
 ].filter(k => lower.includes(k)).length * 2;

 const empatheticScore = [
   'support', 'community', 'together', 'feel', 'help',
   'care', 'listen', 'we\'re here', 'you\'re not alone',
 ].filter(k => lower.includes(k)).length * 2;

 const playfulScore = [
   'fun', 'play', 'funny', 'witty', 'challenge',
   'meme', 'trend', 'gaming', 'vibe',
 ].filter(k => lower.includes(k)).length * 2;

 const thoughtLeaderScore = [
   'future', 'innovation', 'paradigm', 'revolution',
   'breakthrough', 'thought', 'insight', 'vision',
   'disrupt', 'transform',
 ].filter(k => lower.includes(k)).length * 2;

 const minimalistScore = [
   'simple', 'clean', 'essence', 'minimal', 'no noise',
   'fewer', 'less is more', 'silence', 'quiet',
 ].filter(k => lower.includes(k)).length * 2;

 const scores: Record<string, number> = {
   authoritative,
   empathetic,
   playful,
   'thought-leader': thoughtLeaderScore,
   minimalist,
 };

 return Object.entries(scores)
   .sort((a, b) => b[1] - a[1])[0][0] as
     'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist';
}

// ─── Content generation helpers ─────────────────────────────

export function generatePostCopy(
 brandName: string,
 platform: string,
 voice: string,
 pillars: string[],
 tone: string
): string {
 const pillar = pillars[Math.floor(Math.random() * pillars.length)] || 'brand';

 const templates: Record<string, string[]> = {
   authoritative: [
     `The truth about ${pillar} is rarely what you think. Research shows that brands leveraging ${pillar} strategically see 3x higher engagement. Here is what the data tells us →`,
     `${brandName} believes that ${pillar} is the differentiator. Every post, every interaction, every moment is designed to reflect that. The results speak for themselves.`,
     `📊 The numbers are clear: ${pillar} drives growth. ${brandName} has built everything around that principle.`,
   ],
   empathetic: [
     `We know ${pillar} can feel overwhelming. That is okay. We are here to help you figure it out — one step at a time. 💙`,
     `Your ${pillar} journey matters. At ${brandName}, we see how hard you work every day. We build tools to make it easier.`,
     `You\'re not alone in this. ${brandName} is building alongside you. Every step counts.`,
   ],
   playful: [
     `Fun fact: your ${pillar} could be your biggest superpower. 🎯 Here\'s why → @${brandName}`,
     `${brandName} = the brand that knows how to make ${pillar} actually fun. 🎨 Don\'t take it from us.`,
     `Okay, here\'s the tea: ${pillar} is the secret weapon. ${brandName} knows this. 👀`,
   ],
   'thought-leader': [
     `What if ${pillar} was the wrong question? The brands winning in 2025 have stopped treating ${pillar} as an afterthought. They treat it as strategy. ${brandName} is leading that conversation.`,
     `The ${pillar} paradigm is broken. Most brands still treat it as a checklist. ${brandName} has rebuilt it from the ground up.`,
     `Here is what nobody is saying about ${pillar}: it is the only metric that actually matters. ${brandName} built our entire process around that insight.`,
   ],
   minimalist: [
     `${brandName}. ${pillar}. Simple.`,
     `${brandName} — ${pillar} distilled.`,
     `Less noise. More ${pillar}. ${brandName}.`,
   ],
 };

 const toneModifiers: Record<string, string[]> = {
   formal: [
     '',
     '.',
     ' Based on research and results.',
     ' See the full analysis.',
   ],
   casual: [
     '',
     ' ',
     ' That\'s the thing.',
     ' Here\'s why →',
   ],
   professional: [
     '',
     ' ',
     ' The results speak for themselves.',
     ' Based on proven frameworks.',
   ],
   warm: [
     '',
     ' 💙',
     ' We\'re here to help.',
     ' Every step counts.',
   ],
 };

 const voiceTemplates = templates[voice] || templates.authoritative;
 const toneModifiersList = toneModifiers[tone] || toneModifiers.formal;

 const template = voiceTemplates[Math.floor(Math.random() * voiceTemplates.length)];
 const modifier = toneModifiersList[Math.floor(Math.random() * toneModifiersList.length)];

 return `${template}${modifier}`;
}

export function generateHashtags(
 keywords: string[],
 pillars: string[],
 platform: string,
 max: number = 8
): string[] {
 const pool = unique([...keywords, ...pillars])
   .map(k => k.replace(/\s+/g, '_'))
   .map(k => `#${k}`);

 const platformDefaults: Record<string, string[]> = {
   instagram: ['#brand', '#marketing', '#business', '#growth', '#strategy', '#ideas'],
   twitter: ['#business', '#marketing', '#leadership', '#tech', '#ideas'],
   linkedin: ['#leadership', '#strategy', '#growth', '#business', '#innovation'],
   tiktok: ['#viral', '#trending', '#brand', '#content', '#growth'],
   facebook: ['#brand', '#community', '#share', '#discover', '#ideas'],
   youtube: ['#video', '#content', '#learning', '#brand', '#tips'],
 };

 const platformTags = platformDefaults[platform] || [];
 const mixed = [...pool, ...platformTags];
 return unique(mixed).slice(0, max);
}

// ─── Content calendar generation ───────────────────────────

export function generateContentCalendar(
 brandName: string,
 analysis: Record<string, unknown>,
 daysOfWeek: number[],
 postsPerWeek: number
): ContentCalendar {
 const pillars = (analysis?.pillars as string[]) || ['brand', 'identity'];
 const voice = (analysis?.voice as 'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist') || 'authoritative';
 const tone = (analysis?.tone as 'formal' | 'casual' | 'professional' | 'warm') || 'professional';

 const calendars: Record<
   Platform,
   {
     formats: ContentFormat[];
     templates: {
       text: string[];
       emoji: boolean;
       style: 'short' | 'long';
     };
   }
 > = {
   instagram: {
     formats: [{ name: 'carousel', recommendedLength: 220 }, { name: 'story', recommendedLength: 150 }, { name: 'post', recommendedLength: 280 }],
     templates: { text: [], emoji: true, style: 'medium' },
   },
   twitter: {
     formats: [{ name: 'post', recommendedLength: 280 }],
     templates: { text: [], emoji: true, style: 'short' },
   },
   linkedin: {
     formats: [{ name: 'article', recommendedLength: 300 }, { name: 'post', recommendedLength: 250 }],
     templates: { text: [], emoji: false, style: 'medium' },
   },
   tiktok: {
     formats: [{ name: 'reel', recommendedLength: 60 }, { name: 'story', recommendedLength: 100 }],
     templates: { text: [], emoji: true, style: 'medium' },
   },
   facebook: {
     formats: [{ name: 'post', recommendedLength: 300 }, { name: 'story', recommendedLength: 150 }],
     templates: { text: [], emoji: true, style: 'medium' },
   },
   youtube: {
     formats: [{ name: 'video', recommendedLength: 180 }],
     templates: { text: [], emoji: false, style: 'long' },
   },
 };

 const posts: ContentPost[] = [];
 const totalPosts = daysOfWeek.length * postsPerWeek;

 for (let i = 0; i < totalPosts; i++) {
   const dayOfWeek = daysOfWeek[Math.floor(i / postsPerWeek) % daysOfWeek.length];
   const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
   const platformKey = ['instagram', 'twitter', 'linkedin', 'tiktok', 'facebook'][Math.floor(i / totalPosts) % 5] as Platform;
   const date = addDays(today(), Math.floor(i / postsPerWeek) * 7 + dayOfWeek);
   const format = calendars[platformKey].formats[Math.floor(i / 3) % calendars[platformKey].formats.length] as PostFormat;

   posts.push({
     id: generateId(),
     platform: platformKey,
     copy: generatePostCopy(brandName, platformKey, voice, pillars, tone),
     hashtag: generateHashtags(
       (analysis?.primaryKeywords as string[]) || ['brand'],
       pillars,
       platformKey,
       5
     ),
     format,
     scheduledAt: `${date}T12:00:00Z`,
     status: 'draft',
     analysisRef: generateId(),
   });
 }

 return {
   brandName,
   posts,
   generatedAt: new Date().toISOString(),
   analysis,
 };
}

// ─── Platform adapters ───────────────────────────────────────

export const PLATFORMS = [
 { key: 'instagram', name: 'Instagram' },
 { key: 'twitter', name: 'Twitter' },
 { key: 'linkedin', name: 'LinkedIn' },
 { key: 'tiktok', name: 'TikTok' },
 { key: 'facebook', name: 'Facebook' },
 { key: 'youtube', name: 'YouTube' },
] as const;

export const POST_FORMATS: Record<Platform, ContentFormat[]> = {
 instagram: [
   { name: 'carousel', recommendedLength: 220, aspectRatio: '4:5' },
   { name: 'story', recommendedLength: 150, aspectRatio: '9:16' },
   { name: 'post', recommendedLength: 280 },
 ],
 twitter: [
   { name: 'post', recommendedLength: 280 },
 ],
 linkedin: [
   { name: 'article', recommendedLength: 300 },
   { name: 'post', recommendedLength: 250 },
 ],
 tiktok: [
   { name: 'reel', recommendedLength: 60, aspectRatio: '9:16' },
   { name: 'story', recommendedLength: 100, aspectRatio: '9:16' },
 ],
 facebook: [
   { name: 'post', recommendedLength: 300 },
   { name: 'story', recommendedLength: 150, aspectRatio: '9:16' },
 ],
 youtube: [
   { name: 'video', recommendedLength: 180 },
 ],
};

// ─── Template builders ──────────────────────────────────────

export function buildTemplates(
 voice: string,
 pillars: string[]
): ContentTemplate[] {
 const baseTemplates: ContentTemplate[] = [];

 const baseTextTemplates: { name: string; slots: TemplateSlot[] }[] = [
   {
     name: 'Story Opening',
     slots: [
       { key: 'greeting', type: 'text', examples: ['Hello world!', 'Hey team', 'Good morning'] },
       { key: 'hook', type: 'text', maxChars: 100, examples: ['Here is what happened today', 'We noticed something interesting', 'Big update for the community'] },
       { key: 'value', type: 'text', maxChars: 200, examples: ['Our recent analysis shows...', 'Here is what we learned', 'The data tells us something important'] },
       { key: 'cta', type: 'text', examples: ['Save this for later', 'Drop your thoughts below', 'What do you think?'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#brand #marketing #growth'] },
     ],
   },
   {
     name: 'Tip Carousel',
     slots: [
       { key: 'title', type: 'text', examples: ['3 tips for better branding', 'How to fix your content strategy', 'The missing piece in your marketing'] },
       { key: 'tip1', type: 'text', maxChars: 120 },
       { key: 'tip2', type: 'text', maxChars: 120 },
       { key: 'tip3', type: 'text', maxChars: 120 },
       { key: 'hashtags', type: 'hashtag', examples: ['#tips #branding #marketing'] },
     ],
   },
   {
     name: 'Industry Insight',
     slots: [
       { key: 'observation', type: 'text', maxChars: 150, examples: ['Something interesting is happening in the industry.', 'The data doesn\'t lie.'] },
       { key: 'insight', type: 'text', maxChars: 200, examples: ['Here is what it means for your brand.', 'This changes everything.'] },
       { key: 'action', type: 'text', maxChars: 150, examples: ['Start applying this today.', 'This is your new strategy.'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#industry #insight #leadership'] },
     ],
   },
   {
     name: 'Behind the Scenes',
     slots: [
       { key: 'intro', type: 'text', examples: ['A quick look at what we\'re building.', 'Peeling back the curtain.'] },
       { key: 'process', type: 'text', maxChars: 200, examples: ['Here is how we approach content strategy.', 'This is our workflow.'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#behindthescenes #transparent #building'] },
     ],
   },
   {
     name: 'Motivation',
     slots: [
       { key: 'quote', type: 'text', maxChars: 150, examples: ['What keeps us going.'] },
       { key: 'message', type: 'text', maxChars: 250, examples: ['Remember what matters.'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#motivation #inspiration #mindset'] },
     ],
   },
   {
     name: 'Weekly Recap',
     slots: [
       { key: 'title', type: 'text', examples: ['Our weekly wrap-up'] },
       { key: 'highlight', type: 'text', maxChars: 200, examples: ['Here is what we learned this week.', 'One thing that changed our thinking.'] },
       { key: 'next', type: 'text', maxChars: 150, examples: ['What we\'re tackling next week.', 'The plan ahead.'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#recap #weekly #team'] },
     ],
   },
 ];

 for (const template of baseTextTemplates) {
   baseTemplates.push({
     platform: 'twitter' as Platform,
     name: template.name,
     slots: template.slots,
   });

   baseTemplates.push({
     platform: 'linkedin' as Platform,
     name: template.name,
     slots: [...template.slots, { key: 'voice', type: 'text', default: 'authoritative' }],
   });
 }

 return baseTemplates;
}

// ─── Voice analysis ─────────────────────────────────────────

export type VoiceAnalysis = {
 voice: VoiceProfile;
 confidence: number;
 confidence: number;
 evidence: { key: string; score: number }[];
};

export function analyzeVoiceFromText(text: string): VoiceAnalysis {
 const keywords = text.toLowerCase().split(/[\s,.!?]+/).filter(Boolean);

 const indicators: Record<VoiceProfile, { patterns: string[]; weight: number }[]> = {
   authoritative: [
     { patterns: ['strategy', 'analysis', 'research', 'data', 'results', 'metrics', 'framework'], weight: 1.5 },
     { patterns: ['professional', 'approach', 'optimization', 'performance'], weight: 1.2 },
   ],
   empathetic: [
     { patterns: ['support', 'community', 'together', 'help', 'care', 'listen'], weight: 1.5 },
     { patterns: ['we\'re here', 'you\'re not alone', 'walk alongside'], weight: 1.8 },
   ],
   playful: [
     { patterns: ['fun', 'play', 'funny', 'witty', 'challenge'], weight: 1.5 },
     { patterns: ['meme', 'trend', 'gaming', 'vibe', 'squad'], weight: 1.2 },
   ],
   'thought-leader': [
     { patterns: ['future', 'innovation', 'paradigm', 'revolution'], weight: 1.5 },
     { patterns: ['thought', 'insight', 'vision', 'disrupt', 'transform'], weight: 1.8 },
   ],
   minimalist: [
     { patterns: ['simple', 'clean', 'essence', 'minimal', 'noise'], weight: 1.5 },
     { patterns: ['fewer', 'less is more', 'silence', 'quiet'], weight: 1.8 },
   ],
 };

 const scores: Record<VoiceProfile, number> = {
   authoritative: 0,
   empathetic: 0,
   playful: 0,
   'thought-leader': 0,
   minimalist: 0,
 };

 const evidence: { key: string; score: number }[] = [];

 for (const [profile, indicators] of Object.entries(indicators)) {
   for (const indicator of indicators) {
     for (const pattern of indicator.patterns) {
       if (keywords.includes(pattern)) {
         scores[profile as VoiceProfile] += indicator.weight;
         evidence.push({ key: profile as VoiceProfile, score: indicator.weight });
       }
     }
   }
 }

 // Normalize to 0–1
 const maxScore = Math.max(...Object.values(scores), 0.1);
 const normalized: { key: VoiceProfile; score: number }[] = Object.entries(scores).map(([profile, score]) => ({
   key: profile as VoiceProfile,
   score: score / maxScore,
 }));

 const winner = normalized.sort((a, b) => b.score - a.score)[0]!;

 return {
   voice: winner.key,
   confidence: winner.score,
   evidence,
 };
}

// ─── Voice classification profiles ───────────────────────────

export const VoiceProfiles: Record<VoiceProfile, {
 description: string;
 tone: 'formal' | 'casual' | 'professional' | 'warm';
 sentenceStyle: 'direct' | 'conversational' | 'elaborate' | 'sparse';
 emojiDensity: 'none' | 'low' | 'medium' | 'high';
 hashtagStyle: 'strategic' | 'creative' | 'none';
 openingLines: string[];
 closingLines: string[];
 antiPatterns: string[];
 sampleTone: string;
 voiceKeywords: string[];
 contentAngles: string[];
}> = {
 authoritative: {
   description: 'Authoritative brands speak with confidence and clarity.',
   tone: 'professional',
   sentenceStyle: 'direct',
   emojiDensity: 'low',
   hashtagStyle: 'strategic',
   openingLines: [
     'Here is what matters.',
     'The facts are clear.',
     'Let us look at the data.',
     'Based on research and results.',
   ],
   closingLines: [
     'The path forward is clear.',
     'We trust the work.',
     'Results speak for themselves.',
     'See you next time.',
   ],
   antiPatterns: [
     'Avoid overly casual language like "hey there!"',
     'Do not use excessive punctuation like "!!!"',
     'Avoid hyperbolic claims without backing data',
     'Do not use slang or internet language',
   ],
   sampleTone: "We believe in data-driven decisions. Our analysis of the market shows consistent growth across all key metrics. The results are clear: our approach works. We recommend the following strategy based on proven frameworks.",
   voiceKeywords: ['expertise', 'results', 'facts', 'strategy', 'performance', 'insight'],
   contentAngles: [
     'Industry analysis',
     'Best practices',
     'Data-driven insights',
     'Process breakdowns',
     'Case studies',
   ],
 },
 empathetic: {
   description: 'Empathetic brands connect through understanding and warmth.',
   tone: 'warm',
   sentenceStyle: 'conversational',
   emojiDensity: 'medium',
   hashtagStyle: 'creative',
   openingLines: [
     'We know how it feels.',
     'You are not alone.',
     'Let\'s talk about this together.',
     'Here\'s what we noticed.',
   ],
   closingLines: [
     'We\'re here for you.',
     'Keep going — it\'s going to be okay.',
     'Thanks for being here.',
     'Together, we\'re building something better.',
   ],
   antiPatterns: [
     'Avoid cold, detached language like "per our analysis"',
     'Do not use purely statistical language without emotional context',
     'Avoid impersonal phrases like "one must"',
     'Do not sound robotic or automated',
   ],
   sampleTone: "We know starting out can feel overwhelming. That\'s okay. We\'ve been there too. The good news is that we\'re building tools to make it easier. Every small step counts, and we\'re here to walk alongside you.",
   voiceKeywords: ['community', 'support', 'care', 'listening', 'growth', 'together'],
   contentAngles: [
     'Customer stories',
     'How-to guides',
     'Behind-the-scenes',
     'Community highlights',
     'Support and help',
   ],
 },
 playful: {
   description: 'Playful brands are fun, bold, and unafraid to stand out.',
   tone: 'casual',
   sentenceStyle: 'conversational',
   emojiDensity: 'high',
   hashtagStyle: 'creative',
   openingLines: [
     'Buckle up!',
     'Ready for this?',
     'Guess what?',
     'Let\'s make it fun.',
   ],
   closingLines: [
     'What\'s next? 🎯',
     'Drop a comment below!',
     'Tag us when you see this!',
     'Keep it wild 👇',
   ],
   antiPatterns: [
     'Avoid corporate-speak like "leveraging synergies"',
     'Do not use formal language — keep it light',
     'Avoid dry, textbook-style explanations',
     'Do not sound like a corporate press release',
   ],
   sampleTone: "Fun fact: most people overthink their personal brand. We don\'t. 🎨 We believe in being real, being bold, and having a good time doing it. So what\'s your vibe? We\'re reading.",
   voiceKeywords: ['fun', 'bold', 'creative', 'witty', 'energetic', 'unique'],
   contentAngles: [
     'Trend commentary',
     'Challenge participation',
     'Behind-the-scenes',
     'Memes and humor',
     'Creative projects',
   ],
 },
 'thought-leader': {
   description: 'Thought leaders inspire with deep insight and vision.',
   tone: 'professional',
   sentenceStyle: 'elaborate',
   emojiDensity: 'none',
   hashtagStyle: 'strategic',
   openingLines: [
     'What if I told you…',
     'The old rules don\'t apply anymore.',
     'Let\'s challenge how we think about this.',
     'Here\'s what most people get wrong.',
   ],
   closingLines: [
     'The future belongs to those who think differently.',
     'What\'s your take?',
     'The conversation continues.',
     'Think about it.',
   ],
   antiPatterns: [
     'Avoid simple explanations — add depth and nuance',
     'Do not reduce complex ideas to soundbites',
     'Avoid clichés and overused business phrases',
     'Do not sound like other thought leaders',
   ],
   sampleTone: "The digital landscape has fundamentally shifted. No longer is it about producing content — it is about curating insight. Organizations that thrive understand that authenticity and strategy are no longer competing priorities. They are the same priority.",
   voiceKeywords: ['vision', 'insight', 'strategy', 'innovation', 'leadership', 'future'],
   contentAngles: [
     'Industry predictions',
     'Contrarian takes',
     'Framework breakdowns',
     'Deep dives',
     'Trend analysis',
   ],
 },
 minimalist: {
   description: 'Minimalist brands speak with elegance and economy of words.',
   tone: 'formal',
   sentenceStyle: 'sparse',
   emojiDensity: 'none',
   hashtagStyle: 'none',
   openingLines: [
     'There is more to say.',
     'Here is the essence.',
     'Less noise, more signal.',
     'The details speak.',
   ],
   closingLines: [
     'Understood.',
     'See you.',
     'More to come.',
     'End.',
   ],
   antiPatterns: [
     'Avoid emotional language — stay restrained',
     'Do not use exclamation marks',
     'Avoid flowery language or decorative words',
     'Do not sound overly enthusiastic or promotional',
   ],
   sampleTone: "Our process is simple. We study what works. We remove what does not. The result is something that simply is. There is nothing more to say.",
   voiceKeywords: ['precision', 'elegance', 'clarity', 'simplicity', 'subtlety', 'intention'],
   contentAngles: [
     'Essential insights',
     'Process clarity',
     'Quality over quantity',
     'Design thinking',
     'Quiet authority',
   ],
 },
};