/**
* Content templates per platform.

* Each template has "slots" — text that gets filled based on the brand analysis.
*
* // OLLAMA: Instead of this static template system, use Ollama to generate custom templates:
*   POST http://localhost:11434/api/run
*   body: {
*     model: "llama3",
*     messages: [
*       { role: "system", content: 'Create content templates for this brand based on the analysis...' },
*       { role: "user", content: JSON.stringify({ brandName, voice, tone, pillars }) }
*     ]
*   }
*/

import { VoiceProfiles } from './voiceProfiles';

// ─── Templates ──────────────────────────────────────────────

export interface ContentTemplate {
 platform: Platform;
 name: string;
 slots: TemplateSlot[];
}

export interface TemplateSlot {
 key: string;
 type: 'text' | 'emoji' | 'link' | 'handle' | 'hashtag';
 default?: string;
 maxChars?: number;
 examples?: string[];
}

export const TEMPLATES: Record<Platform, ContentTemplate[]> = {
 instagram: [
   {
     name: 'Carousel',
     slots: [
       {
         key: 'title',
         type: 'text',
         maxChars: 40,
         examples: ['3 things I learned...', 'Why branding matters', 'Behind the scenes'],
       },
       {
         key: 'point1',
         type: 'text',
         maxChars: 120,
         examples: ['1. Research shows that...'],
       },
       {
         key: 'point2',
         type: 'text',
         maxChars: 120,
         examples: ['2. Most brands are doing...'],
       },
       {
         key: 'point3',
         type: 'text',
         maxChars: 120,
         examples: ['3. The real differentiator...'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#brand #marketing #tips'],
       },
     ],
   },
   {
     name: 'Reel',
     slots: [
       {
         key: 'hook',
         type: 'text',
         maxChars: 50,
         examples: ['Wait until you see this.', 'This changed my life.', 'No one is telling you...'],
       },
       {
         key: 'body',
         type: 'text',
         maxChars: 100,
         examples: ['This is what happened.', 'Here is what I learned.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#viral #trend'],
       },
     ],
   },
   {
     name: 'Post',
     slots: [
       {
         key: 'greeting',
         type: 'text',
         examples: ['Hey everyone!', 'Good morning!', 'What\'s up?'],
       },
       {
         key: 'message',
         type: 'text',
         maxChars: 200,
         examples: ['Here is what I wanted to share today.', 'A quick thought that\'s been on my mind...'],
       },
       {
         key: 'insight',
         type: 'text',
         maxChars: 150,
         examples: ['I\'ve been thinking about...', 'What struck me about this is...'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#brand #marketing #insight'],
       },
     ],
   },
   {
     name: 'Story',
     slots: [
       {
         key: 'line',
         type: 'text',
         maxChars: 80,
         examples: ['Day 1: Starting the journey.', 'A quick update from our team.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#today #update'],
       },
     ],
   },
 ],
 twitter: [
   {
     name: 'Thread',
     slots: [
       {
         key: 'hook',
         type: 'text',
         maxChars: 50,
         examples: ['We analyzed 100 brands.', 'Here is what happened.', 'A contrarian take on...'],
       },
       {
         key: 'point1',
         type: 'text',
         maxChars: 100,
         examples: ['1. Most brands overcomplicate.'],
       },
       {
         key: 'point2',
         type: 'text',
         maxChars: 100,
         examples: ['2. The winners are simpler.'],
       },
       {
         key: 'point3',
         type: 'text',
         maxChars: 100,
         examples: ['3. Data tells a different story.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#threads #marketing'],
       },
     ],
   },
   {
     name: 'Post',
     slots: [
       {
         key: 'insight',
         type: 'text',
         maxChars: 200,
         examples: ['What I learned from analyzing brands.', 'A quick observation about content strategy.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#marketing #insight'],
       },
     ],
   },
   {
     name: 'Poll',
     slots: [
       {
         key: 'question',
         type: 'text',
         examples: ['What is your brand strategy?', 'Which platform matters most?'],
       },
       {
         key: 'option1',
         type: 'text',
         examples: ['Option 1'],
       },
       {
         key: 'option2',
         type: 'text',
         examples: ['Option 2'],
       },
       {
         key: 'option3',
         type: 'text',
         examples: ['Option 3'],
       },
       {
         key: 'option4',
         type: 'text',
         examples: ['Option 4'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#poll #survey'],
       },
     ],
   },
 ],
 linkedin: [
   {
     name: 'Article',
     slots: [
       {
         key: 'title',
         type: 'text',
         maxChars: 50,
         examples: ['How I built a brand strategy', 'The future of content marketing'],
       },
       {
         key: 'intro',
         type: 'text',
         maxChars: 100,
         examples: ['I\'ve been thinking about...', 'Here is what I learned from...'],
       },
       {
         key: 'insight',
         type: 'text',
         maxChars: 200,
         examples: ['The key insight is...', 'What surprised me was...'],
       },
       {
         key: 'action',
         type: 'text',
         maxChars: 100,
         examples: ['Here is what I\'m doing about it.', 'Start applying this today.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#leadership #marketing'],
       },
     ],
   },
   {
     name: 'Post',
     slots: [
       {
         key: 'greeting',
         type: 'text',
         examples: ['Good morning.', 'What is on your mind today?'],
       },
       {
         key: 'insight',
         type: 'text',
         maxChars: 200,
         examples: ['Here is a lesson I learned about branding.', 'The data shows something interesting...'],
       },
       {
         key: 'question',
         type: 'text',
         examples: ['What do you think?', 'How is your team handling this?'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#leadership #marketing'],
       },
     ],
   },
 ],
 tiktok: [
   {
     name: 'Reel',
     slots: [
       {
         key: 'hook',
         type: 'text',
         maxChars: 50,
         examples: ['Wait until you see this.', 'This changed my life.', 'No one is telling you...'],
       },
       {
         key: 'body',
         type: 'text',
         maxChars: 100,
         examples: ['This is what happened.', 'Here is what I learned.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#viral #trend'],
       },
     ],
   },
   {
     name: 'Story',
     slots: [
       {
         key: 'caption',
         type: 'text',
         maxChars: 50,
         examples: ['Day 1 of this.', 'Update from the team.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#tiktok #day1'],
       },
     ],
   },
 ],
 facebook: [
   {
     name: 'Post',
     slots: [
       {
         key: 'intro',
         type: 'text',
         examples: ['Hey everyone!', 'Quick update from the team.', 'We have something to share.'],
       },
       {
         key: 'content',
         type: 'text',
         maxChars: 200,
         examples: ['Here is what we are working on.', 'A lesson I learned this week.'],
       },
       {
         key: 'cta',
         type: 'text',
         examples: ['Check it out.', 'Let me know what you think.', 'Join our community.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#community #share'],
       },
     ],
   },
   {
     name: 'Story',
     slots: [
       {
         key: 'line',
         type: 'text',
         maxChars: 50,
         examples: ['What we learned.', 'A quick update.'],
       },
       {
         key: 'hashtag',
         type: 'hashtag',
         examples: ['#today #update'],
       },
     ],
   },
 ],
 youtube: [
   {
     name: 'Video',
     slots: [
       {
         key: 'title',
         type: 'text',
         maxChars: 50,
         examples: ['How to build a brand strategy', 'The secret to content marketing'],
       },
       {
         key: 'description',
         type: 'text',
         maxChars: 200,
         examples: ['In this video, I share...', 'Here is what I learned from...'],
       },
       {
         key: 'tags',
         type: 'hashtag',
         examples: ['#youtube #tutorial'],
       },
     ],
   },
 ],
};

// ─── Format adapters ────────────────────────────────────────

export interface ContentFormat {
 name: string;
 recommendedLength: number;
 aspectRatio?: string;
}

export const POST_FORMATS: Record<Platform, ContentFormat[]> = {
 instagram: [
   { name: 'carousel', recommendedLength: 220, aspectRatio: '4:5' },
   { name: 'story', recommendedLength: 150, aspectRatio: '9:16' },
   { name: 'post', recommendedLength: 280 },
 ],
 twitter: [{ name: 'post', recommendedLength: 280 }],
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
 youtube: [{ name: 'video', recommendedLength: 180 }],
};

// ─── Template builders ──────────────────────────────────────

export function buildTemplates(voice: string, pillars: string[]): ContentTemplate[] {
 const baseTextTemplates: { name: string; slots: TemplateSlot[] }[] = [
   {
     name: 'Story Opening',
     slots: [
       { key: 'greeting', type: 'text', examples: ['Hello world!', 'Hey team', 'Good morning'] },
       { key: 'hook', type: 'text', maxChars: 100, examples: ['Here is what happened today', 'A quick thought'] },
       { key: 'value', type: 'text', maxChars: 200, examples: ['Our recent analysis shows...', 'Here is what we learned'] },
       { key: 'cta', type: 'text', examples: ['Save this for later', 'Drop your thoughts below'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#brand #marketing #tips'] },
     ],
   },
   {
     name: 'Tip Carousel',
     slots: [
       { key: 'title', type: 'text', maxChars: 50, examples: ['3 tips for better branding'] },
       { key: 'tip1', type: 'text', maxChars: 120, examples: ['1. Research shows...'] },
       { key: 'tip2', type: 'text', maxChars: 120, examples: ['2. Most brands...'] },
       { key: 'tip3', type: 'text', maxChars: 120, examples: ['3. The real differentiator...'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#tips #branding #marketing'] },
     ],
   },
   {
     name: 'Industry Insight',
     slots: [
       { key: 'observation', type: 'text', maxChars: 150, examples: ['Something interesting is happening in the industry.'] },
       { key: 'insight', type: 'text', maxChars: 200, examples: ['The key insight is...', 'Here is what I learned.'] },
       { key: 'action', type: 'text', maxChars: 150, examples: ['Start applying this today.', 'The plan ahead is clear.'] },
       { key: 'hashtags', type: 'hashtag', examples: ['#industry #insight #leadership'] },
     ],
   },
   {
     name: 'Behind the Scenes',
     slots: [
       { key: 'intro', type: 'text', examples: ['A quick look at what we are building.'] },
       { key: 'process', type: 'text', maxChars: 200, examples: ['Here is how we approach content strategy.'] },
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
       { key: 'highlight', type: 'text', maxChars: 200, examples: ['Here is what we learned this week.'] },
       { key: 'next', type: 'text', maxChars: 150, examples: ['What we are tackling next week.'] },
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

// ─── Voice-aware template selection ─────────────────────────

/**
* Select the best templates for a given brand voice.
*
* // OLLAMA: Use Ollama to select the best templates dynamically:
*   POST http://localhost:11434/api/run
*   body: {
*     model: "llama3",
*     messages: [
*       { role: "system", content: "Select the best content templates for this brand voice and return the top 5 template names" },
*       { role: "user", content: voice }
*     ]
*   }
*/
export function selectTemplatesForVoice(voice: VoiceProfile, count = 5): string[] {
 const profile = VoiceProfiles[voice] || VoiceProfiles.authoritative;

 const allTemplates: { name: string; relevance: number }[] = [
   ...profile.contentAngles.map((angle) => ({
     name: angle,
     relevance: 1,
   })),
   ...profile.openingLines.map((l) => ({
     name: 'Opening Pattern',
     relevance: 0.8,
   })),
   ...profile.closingLines.map((l) => ({
     name: 'Closing Pattern',
     relevance: 0.7,
   })),
 ];

 return [...allTemplates]
   .sort((a, b) => b.relevance - a.relevance)
   .slice(0, count)
   .map((t) => t.name);
}