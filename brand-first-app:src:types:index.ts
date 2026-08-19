// ─── Core types ──────────────────────────────────────────────

export interface BrandName {
 brand: string;
}

export interface BrandAnalysis {
 brand: string;

 // Identity
 pillars: string[];

 // Voice / tone
 voice: 'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist';
 tone: 'formal' | 'casual' | 'professional' | 'warm';

 // Quality
 consistencyScore: number; // 0–100
 sentiment: 'positive' | 'neutral' | 'negative';

 // Content insights
 contentCategories: string[];
 primaryKeywords: string[];

 // Metadata
 analyzedAt: string;
 confidence: number; // 0–1
}

export interface BrandProfile {
 id: string;
 name: string;
 domain?: string;
 analysis?: BrandAnalysis;
 platformStrategies: PlatformStrategy[];
 contentPillars: string[];
 colorPalette: ColorPalette;
 fonts: {
   primary: string;
   secondary?: string;
 };
 voiceGuide: string;
 toneGuide: string;
 avatarUrl?: string;
}

export interface PlatformStrategy {
 platform: 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'facebook' | 'youtube';
 contentMix: ContentMix;
 postingCadence: PostingCadence;
 bestTimes: PostingTimes;
 contentFormats: ContentFormat[];
}

export interface ContentMix {
 educational: number; // %
 inspirational: number;
 promotional: number;
 behindTheScenes: number;
 userGenerated: number;
}

export interface PostingCadence {
 frequency: number; // posts/week
 dayOfWeek: number; // 0=Mon … 6=Sun
 bestTimeHour: number; // 0–23
}

export interface PostingTimes {
 [platform: 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'facebook' | 'youtube']: string;
}

export interface ContentFormat {
 name: 'carousel' | 'reel' | 'story' | 'post' | 'video' | 'poll' | 'article' | 'highlight';
 recommendedLength: number; // characters or seconds
 aspectRatio?: string; // '4:5', '1:1', '9:16', '16:9'
}

export interface ColorPalette {
 primary: string;
 secondary: string;
 accent: string;
 neutral: string;
 background: string;
 text: string;
}

export interface FontPair {
 primary: string;
 secondary?: string;
}

export interface BrandVoiceGuide {
 tone: string;
 keywords: string[];
 antiPatterns: string[];
 voiceProfile: VoiceProfile;
}

export type VoiceProfile = 'authoritative' | 'empathetic' | 'playful' | 'thought-leader' | 'minimalist';

export type PostTone = 'formal' | 'casual' | 'professional' | 'warm';

export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'facebook' | 'youtube';

export type PostFormat = 'carousel' | 'reel' | 'story' | 'post' | 'video' | 'poll' | 'article' | 'highlight';

// ─── Content types ───────────────────────────────────────────

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

// ─── API / auth types ────────────────────────────────────────

export interface CreateUserInput {
 email: string;
 password: string;
 name?: string;
}

export interface Session {
 id: string;
 userId: string;
 email: string;
 name?: string;
 expiresAt: string;
}

export interface LoginAttempt {
 email: string;
 password: string;
}

// ─── UI types ────────────────────────────────────────────────

export interface FormErrors {
 email?: string;
 password?: string;
 name?: string;
}

export interface AnalysisFormData {
 brandName: string;
 url?: string;
 content?: string;
}

export interface AnalysisResult {
 success: boolean;
 analysis?: BrandAnalysis;
 error?: string;
}

export interface ContentCalendarFormData {
 brandName: string;
 analysis?: BrandAnalysis;
 daysOfWeek: number[];
 postsPerWeek: number;
}

export interface PublishSettings {
 platforms: Platform[];
 dateRange: {
   startDate: string;
   endDate: string;
 };
}

export type SortOrder = 'asc' | 'desc';

export type FilterStatus = 'all' | 'draft' | 'published' | 'review';

export type Theme = 'light' | 'dark' | 'auto';

// ─── Misc ────────────────────────────────────────────────────

export interface ApiResponse<T> {
 success: boolean;
 data?: T;
 error?: string;
}

export interface Paginated<T> {
 items: T[];
 total: number;
 page: number;
 pageSize: number;
 totalPages: number;
}

export interface Toast {
 message: string;
 type: 'success' | 'error' | 'info' | 'warning';
}