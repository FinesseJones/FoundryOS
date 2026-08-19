// lib/contentGenerator.ts
import { fetch } from 'next/fetch';

const OLLAMA_URL = 'http://localhost:11434/api/run';

export interface ContentItem {
 id: string;
 platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'thread';
 content: string;
 mediaHint: string;
 tags: string[];
 scheduledFor: string;
 status: 'draft' | 'published';
}

export type VoiceProfile = {
 voiceId: string;
 name: string;
 tone: string;
 personality: string;
};

export async function generateContent(
 brandName: string,
 voiceProfile: VoiceProfile,
 weekStart: string,
 platforms: ('instagram' | 'twitter' | 'linkedin' | 'facebook' | 'thread')[]
): Promise<ContentItem[]> {
 const items: ContentItem[] = [];

 const allPrompts = [
   {
     platform: 'instagram',
     prompt: `You are a content strategist for ${brandName}. Their voice is ${voiceProfile.tone} and their personality is ${voiceProfile.personality}. Write a single Instagram caption. Focus on storytelling with a clear CTA. Keep it under 220 characters. Return ONLY the caption text, nothing else.

Platform: Instagram
Brand: ${brandName}
Tone: ${voiceProfile.tone}
Personality: ${voiceProfile.personality}`
   },
   {
     platform: 'twitter',
     prompt: `You are a content strategist for ${brandName}. Their voice is ${voiceProfile.tone} and their personality is ${voiceProfile.personality}. Write a single short, punchy Twitter/X post. One thought, one angle. Under 280 characters. Return ONLY the post text, nothing else.

Platform: Twitter
Brand: ${brandName}
Tone: ${voiceProfile.tone}
Personality: ${voiceProfile.personality}`
   },
   {
     platform: 'linkedin',
     prompt: `You are a content strategist for ${brandName}. Their voice is ${voiceProfile.tone} and their personality is ${voiceProfile.personality}. Write a LinkedIn post about a relevant industry insight. 3-5 sentences. Professional but human. End with a thought-provoking question. Return ONLY the post text, nothing else.

Platform: LinkedIn
Brand: ${brandName}
Tone: ${voiceProfile.tone}
Personality: ${voiceProfile.personality}`
   },
   {
     platform: 'facebook',
     prompt: `You are a content strategist for ${brandName}. Their voice is ${voiceProfile.tone} and their personality is ${voiceProfile.personality}. Write a Facebook post that builds community. 3-4 sentences. Friendly, conversational. End with a call to share or comment. Return ONLY the post text, nothing else.

Platform: Facebook
Brand: ${brandName}
Tone: ${voiceProfile.tone}
Personality: ${voiceProfile.personality}`
   },
   {
     platform: 'thread',
     prompt: `You are a content strategist for ${brandName}. Their voice is ${voiceProfile.tone} and their personality is ${voiceProfile.personality}. Write a Threads post that gives a hot take or controversial (but reasonable) opinion. 2-4 sentences. Bold and thought-provoking. Return ONLY the post text, nothing else.

Platform: Threads
Brand: ${brandName}
Tone: ${voiceProfile.tone}
Personality: ${voiceProfile.personality}`
   },
 ];

 const contentPrompts: { content: string; mediaHint: string; tags: string[]; id: string }[] = [];

 for (const p of allPrompts) {
   const response = await fetch(`${OLLAMA_URL}/llama3`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ prompt: p.prompt }),
   });
   const data = await response.json();

   const content = data.toString().trim();
   contentPrompts.push({
     id: p.platform,
     platform: p.platform,
     content,
     mediaHint: p.mediaHint,
     tags: [],
   });
 }

 const days = generateDays(weekStart, 7);

 for (let i = 0; i < contentPrompts.length; i++) {
   const item: ContentItem = {
     ...contentPrompts[i],
     scheduledFor: days[i % days.length] || days[0],
     status: 'draft',
   };

   const tags = generateTags(item.content, item.platform);
   item.tags = tags;

   items.push(item);
 }

 return items;
}

function generateDays(start: string, count: number): string[] {
 const days: string[] = [];
 const current = new Date(start);
 for (let i = 0; i < count; i++) {
   const formatted = current.toISOString().split('T')[0];
   days.push(formatted);
   current.setDate(current.getDate() + 1);
 }
 return days;
}

function generateTags(content: string, platform: string): string[] {
 const keywords = content.toLowerCase().split(/\s+/);
 const relevant = keywords.filter(w => w.length > 4);

 const platformTags: string[] = {
   instagram: ['#instagr' + relevant[0]?.split('')[0] || '#brand', '#visual'],
   twitter: ['#twit' + relevant[1]?.split('')[0] || '#trending'],
   linkedin: ['#li' + relevant[2]?.split('')[0] || '#career', '#networking'],
   facebook: ['#fb' + relevant[0]?.split('')[0] || '#community'],
   thread: ['#thread' + relevant[3]?.split('')[0] || '#hottakes'],
 };

 return [...platformTags[platform], ...relevant.slice(0, 3)];
}