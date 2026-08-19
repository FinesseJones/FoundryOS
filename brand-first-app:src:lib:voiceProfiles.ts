/**
* Voice classification profiles — maps brand personalities to
* concrete writing styles and tone guidance.
*/

export const voiceProfiles: Record<
 'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist',
 {
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
 }
> = {
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
   sampleTone: "We know starting out can feel overwhelming. That\'s okay. We\'ve been there too. The good news is that we\'re building tools to make it easier. Every small step counts, and we\'re here to walk alongside you. You\'re not alone on this journey.",
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
 thoughtLeader: {
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
   sampleTone: "The digital landscape has fundamentally shifted. No longer is it about producing content — it is about curating insight. Organizations that thrive understand that authenticity and strategy are no longer competing priorities. They are the same priority. The brands winning in 2025 are not the ones with the biggest budgets, but those with the clearest thinking.",
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