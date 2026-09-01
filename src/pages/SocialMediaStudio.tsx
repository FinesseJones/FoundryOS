"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Calendar,
  Sparkles,
  Clock,
  Send,
  Plus,
  CheckCircle2,
  Layers,
  MessageSquare,
  Globe,
  Star,
  Flame,
  Zap,
  TrendingUp,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AccountManager, StoredBusinessDNA } from "@/core/saas/auth";

export interface ScheduledSocialPost {
  id: string;
  platforms: ('linkedin' | 'twitter' | 'instagram' | 'facebook' | 'gmb')[];
  category: 'Thought Leadership' | 'Case Study' | 'Promo Offer' | '5-Star Review' | 'Industry Tip';
  title: string;
  content: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: 'SCHEDULED' | 'PUBLISHED' | 'DRAFT';
  mediaUrl?: string;
  authorName: string;
  characterCount: number;
}

const SocialMediaStudio: React.FC = () => {
  const accountManager = AccountManager.getInstance();
  const currentSession = useMemo(() => accountManager.getCurrentSession(), [accountManager]);

  const authoritativeDna = useMemo<StoredBusinessDNA | null>(() => {
    if (currentSession && currentSession.organizationId) {
      return accountManager.getBusinessDNA(currentSession.token, currentSession.organizationId);
    }
    return null;
  }, [currentSession, accountManager]);

  const companyName = authoritativeDna?.companyIdentity.companyName || 'AirSouth Cooling, Heating, Plumbing & Electrical';
  const industry = authoritativeDna?.companyIdentity.industry || 'HVAC & Commercial Facility Services';
  const uvp = authoritativeDna?.companyIdentity.uniqueValueProposition || 'Guaranteed same-day service, licensed master engineers, and 100% upfront flat-rate pricing.';
  const financialPain = authoritativeDna?.opportunityPillars.financialPain || 'Emergency downtime and utility spikes in extreme heat';
  const processGap = authoritativeDna?.opportunityPillars.processGap || 'Manual dispatch queues causing delayed response times';

  // Active Studio Tabs
  const [activeTab, setActiveTab] = useState<'calendar' | 'provisioning' | 'preview'>('calendar');
  const [previewPlatform, setPreviewPlatform] = useState<'linkedin' | 'twitter' | 'instagram' | 'gmb'>('linkedin');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // Initial 4-Week Social Calendar State
  const [posts, setPosts] = useState<ScheduledSocialPost[]>([
    {
      id: 'post_1',
      platforms: ['linkedin', 'twitter', 'facebook'],
      category: 'Thought Leadership',
      title: 'Commercial HVAC Efficiency & Humidity Control',
      content: `In Central Mississippi, unmanaged building humidity doesn't just impact comfort—it drives up commercial utility overhead by up to 28% annually.\n\nAt ${companyName}, our licensed mechanical engineers install automated DDC controls and predictive sensor monitoring to eliminate ${financialPain.toLowerCase()}.\n\nIs your facility operating at peak efficiency? Schedule an on-site audit today.`,
      scheduledDate: '2026-09-02',
      scheduledTime: '09:00 AM',
      status: 'SCHEDULED',
      authorName: `${companyName} Executive Team`,
      characterCount: 395
    },
    {
      id: 'post_2',
      platforms: ['instagram', 'facebook', 'gmb'],
      category: '5-Star Review',
      title: 'Emergency Hospital Chiller Restoration',
      content: `⭐ "When our main facility chiller failed at 2:00 AM, ${companyName} had a master technician on-site in under 20 minutes. Total lifesavers!" — Commercial Operations Director, Jackson MS.\n\nWe provide 24/7 priority emergency dispatch with zero overtime fees across the entire metro area. Tap below to save our direct dispatch line.`,
      scheduledDate: '2026-09-04',
      scheduledTime: '11:30 AM',
      status: 'SCHEDULED',
      authorName: `${companyName} Dispatch`,
      characterCount: 342
    },
    {
      id: 'post_3',
      platforms: ['linkedin', 'twitter', 'facebook', 'gmb'],
      category: 'Promo Offer',
      title: 'Fall Commercial System Tune-Up Retainer',
      content: `🚨 Pre-Season Protection Drop: Prevent unexpected compressor freeze-ups and costly pipe failures before winter arrives.\n\nLock in our Priority One™ Maintenance Retainer this week to receive complimentary indoor air quality testing and 1-tap SMS priority scheduling.\n\n👉 Text (601) 353-4681 or visit our website to secure your priority spot.`,
      scheduledDate: '2026-09-08',
      scheduledTime: '10:00 AM',
      status: 'SCHEDULED',
      authorName: `${companyName} Service Lead`,
      characterCount: 378
    },
    {
      id: 'post_4',
      platforms: ['linkedin', 'instagram'],
      category: 'Industry Tip',
      title: 'Zero-Dig Hydrojet Plumbing Insights',
      content: `Facility Managers: Replacing aging commercial sewer lines no longer requires tearing up parking lots or pausing business operations.\n\nUsing high-pressure structural hydro-jetting and trenchless epoxy relining, we restore heavy-duty commercial plumbing in hours, not weeks.\n\n#CommercialPlumbing #FacilityManagement #MississippiBusiness #Infrastructure`,
      scheduledDate: '2026-09-12',
      scheduledTime: '02:00 PM',
      status: 'SCHEDULED',
      authorName: `${companyName} Master Plumber`,
      characterCount: 360
    }
  ]);

  // Selected Post for Preview
  const [selectedPostId, setSelectedPostId] = useState<string>('post_1');
  const activePost = useMemo(() => posts.find(p => p.id === selectedPostId) || posts[0], [posts, selectedPostId]);

  // Modal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ScheduledSocialPost['category']>('Thought Leadership');
  const [newPlatforms, setNewPlatforms] = useState<ScheduledSocialPost['platforms']>(['linkedin', 'twitter']);
  const [newDate, setNewDate] = useState('2026-09-15');
  const [newTime, setNewTime] = useState('09:30 AM');

  // Generate 30-Day Batch
  const handleAutoGenerateBatch = async () => {
    setIsGeneratingBatch(true);
    await new Promise(r => setTimeout(r, 800));

    const batchGenerated: ScheduledSocialPost[] = [
      {
        id: `post_batch_${Date.now()}_1`,
        platforms: ['linkedin', 'twitter'],
        category: 'Thought Leadership',
        title: 'Modernizing Legacy Facility Operations',
        content: `Legacy facilities lose an estimated $12,000 per quarter due to ${processGap.toLowerCase()}.\n\nAt ${companyName}, we replace slow manual tickets with sub-15s dispatch and instant transparent invoicing. Operational precision isn't optional—it's your bottom line.`,
        scheduledDate: '2026-09-16',
        scheduledTime: '09:00 AM',
        status: 'SCHEDULED',
        authorName: companyName,
        characterCount: 280
      },
      {
        id: `post_batch_${Date.now()}_2`,
        platforms: ['instagram', 'facebook', 'gmb'],
        category: 'Case Study',
        title: 'Zero-Downtime Data Center Cooling Overhaul',
        content: `Case Study: Central Mississippi Technology Center\n\nChallenge: 40-ton backup condenser overheating under peak summer loads.\nSolution: Rapid 4-hour coil replacement and smart DDC sensor recalibration by ${companyName}.\nResult: Zero data center downtime & 18% power savings.`,
        scheduledDate: '2026-09-20',
        scheduledTime: '01:15 PM',
        status: 'SCHEDULED',
        authorName: companyName,
        characterCount: 310
      },
      {
        id: `post_batch_${Date.now()}_3`,
        platforms: ['linkedin', 'facebook', 'gmb'],
        category: 'Promo Offer',
        title: 'Weekend Emergency Electrical Priority Pass',
        content: `Power outage or generator transfer switch failure? Don't let downtime stall your operations.\n\n${companyName}'s licensed master electricians are on standby 24/7 across Jackson, Brandon, and Madison MS.\n\nSave our emergency dispatch number: (601) 353-4681.`,
        scheduledDate: '2026-09-24',
        scheduledTime: '08:45 AM',
        status: 'SCHEDULED',
        authorName: companyName,
        characterCount: 290
      }
    ];

    setPosts(prev => [...prev, ...batchGenerated]);
    setIsGeneratingBatch(false);
    toast.success(`✨ Auto-generated 30-day AI social marketing calendar for ${companyName}!`);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      toast.error('Post content cannot be empty.');
      return;
    }

    const newPost: ScheduledSocialPost = {
      id: `post_${Date.now()}`,
      platforms: newPlatforms,
      category: newCategory,
      title: newTitle.trim() || 'Scheduled Social Update',
      content: newContent.trim(),
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'SCHEDULED',
      authorName: companyName,
      characterCount: newContent.trim().length
    };

    setPosts(prev => [newPost, ...prev]);
    setSelectedPostId(newPost.id);
    setShowScheduleModal(false);
    setNewContent('');
    setNewTitle('');
    toast.success('🚀 Post scheduled and synced to content calendar!');
  };

  const handlePublishNow = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'PUBLISHED' } : p));
    toast.success('🎉 Broadcasted live across selected social channels!');
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('🗑️ Post removed from schedule.');
  };

  const filteredPosts = useMemo(() => {
    if (filterPlatform === 'all') return posts;
    return posts.filter(p => p.platforms.includes(filterPlatform as any));
  }, [posts, filterPlatform]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* HUD Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Autonomous Social Media & Brand Voice Multiplier</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Social Growth Studio & Content Scheduler
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl">
                Autonomously provisions multi-platform social profiles, generates weekly high-converting brand voice marketing, and schedules verified social broadcasts for <strong className="text-white">{companyName}</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={handleAutoGenerateBatch}
                disabled={isGeneratingBatch}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingBatch ? 'animate-spin' : ''}`} />
                <span>Generate 30-Day Calendar</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(true)}
                className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Schedule Post</span>
              </Button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">Scheduled Broadcasts</p>
              <p className="text-lg font-bold text-white mt-0.5">{posts.filter(p => p.status === 'SCHEDULED').length} Posts</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">Connected Channels</p>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">5 Major Networks</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">Retainer Add-On Tier</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">$997/mo Active</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">Brand Voice Alignment</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">99.8% Grounded</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Content Calendar & Queue ({posts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Social Feed Previews</span>
            </button>
            <button
              onClick={() => setActiveTab('provisioning')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'provisioning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Account Provisioning Kit</span>
            </button>
          </div>

          {activeTab === 'calendar' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Channel:</span>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Channels</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">X (Twitter)</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="gmb">Google Business</option>
              </select>
            </div>
          )}
        </div>

        {/* ─── TAB 1: CALENDAR & QUEUE ─── */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Post Queue Column */}
            <div className="lg:col-span-8 space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedPostId === post.id ? 'bg-slate-900/90 border-indigo-500/60 shadow-xl shadow-indigo-950/30 ring-1 ring-indigo-500/30' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {post.platforms.map(p => (
                            <span key={p} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize border border-slate-700">
                              {p === 'gmb' ? 'Google Business' : p}
                            </span>
                          ))}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                          {post.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-1">{post.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>

                    <div className="text-right space-y-2 shrink-0">
                      <div className="text-[11px] font-mono text-slate-400">
                        <div className="flex items-center justify-end gap-1 text-indigo-300 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>{post.scheduledDate}</span>
                        </div>
                        <span>{post.scheduledTime}</span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        {post.status !== 'PUBLISHED' && (
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handlePublishNow(post.id); }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white px-2.5 py-1 h-7"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            <span>Publish</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/40 text-[11px] px-2 h-7"
                        >
                          Archive
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Sidebar Quick Inspector */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick Post Inspector</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Active Selected Post:</span>
                    <h4 className="text-sm font-bold text-white">{activePost.title}</h4>
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line">
                      {activePost.content}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    <div>
                      <span>Scheduled:</span>
                      <p className="text-white font-bold">{activePost.scheduledDate} ({activePost.scheduledTime})</p>
                    </div>
                    <div>
                      <span>Character Count:</span>
                      <p className="text-indigo-400 font-bold">{activePost.characterCount} chars</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(activePost.content);
                      toast.success('📋 Post copy copied to clipboard!');
                    }}
                    variant="outline"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    <span>Copy Full Post Copy</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ─── TAB 2: LIVE SOCIAL FEED PREVIEWS ─── */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPreviewPlatform('linkedin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewPlatform === 'linkedin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
              >
                💼 LinkedIn Feed Card
              </button>
              <button
                onClick={() => setPreviewPlatform('twitter')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewPlatform === 'twitter' ? 'bg-slate-800 text-white border border-slate-600 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
              >
                𝕏 Post (Twitter)
              </button>
              <button
                onClick={() => setPreviewPlatform('instagram')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewPlatform === 'instagram' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
              >
                📸 Instagram Photo Card
              </button>
              <button
                onClick={() => setPreviewPlatform('gmb')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewPlatform === 'gmb' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
              >
                📍 Google Business Profile
              </button>
            </div>

            <div className="flex justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 min-h-[480px]">
              {/* LinkedIn Preview Card */}
              {previewPlatform === 'linkedin' && (
                <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{companyName}</h4>
                      <p className="text-[11px] text-slate-400">{industry} · Jackson, MS Metro</p>
                      <p className="text-[10px] text-slate-500">Promoted · 24/7 Verified Dispatch</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {activePost.content}
                  </p>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">Emergency Services & Maintenance Retainer</span>
                      <p className="text-[11px] text-slate-400">Licensed Master Contractors · Jackson, MS</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 text-xs font-bold">Learn More</Button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 font-semibold">
                    <span>👍 48 Likes</span>
                    <span>💬 14 Comments</span>
                    <span>🔁 6 Reposts</span>
                  </div>
                </div>
              )}

              {/* X (Twitter) Preview Card */}
              {previewPlatform === 'twitter' && (
                <div className="max-w-md w-full bg-black border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{companyName}</span>
                        <span className="text-[10px] text-blue-400 font-bold">✓</span>
                      </div>
                      <p className="text-[10px] text-slate-500">@{companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {activePost.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-500">
                    <span>💬 12</span>
                    <span>🔁 24</span>
                    <span>❤️ 89</span>
                    <span>📊 2.4k Views</span>
                  </div>
                </div>
              )}

              {/* Instagram Preview Card */}
              {previewPlatform === 'instagram' && (
                <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-3 pb-4">
                  <div className="flex items-center gap-2.5 p-3.5 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {companyName.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">{companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}</span>
                  </div>

                  <div className="h-56 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">Mississippi Metro Services</span>
                    <h3 className="text-base font-black text-white">{activePost.title}</h3>
                    <p className="text-[11px] text-slate-300 mt-2">24/7 Rapid Emergency Dispatch</p>
                  </div>

                  <div className="px-4 space-y-1">
                    <p className="text-xs text-slate-200">
                      <strong className="text-white mr-1.5">{companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}</strong>
                      {activePost.content}
                    </p>
                    <p className="text-[10px] text-indigo-400 font-mono">#MississippiHVAC #JacksonMS #FacilityMaintenance #ZeroDowntime</p>
                  </div>
                </div>
              )}

              {/* Google Business Preview Card */}
              {previewPlatform === 'gmb' && (
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-white">{companyName}</span>
                      <p className="text-[11px] text-amber-400">★★★★★ (450+ Google Reviews)</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      Google Verified
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      SPECIAL UPDATE
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{activePost.content}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Direct Dispatch: (601) 353-4681</span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white">Call Now</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: ACCOUNT PROVISIONING KIT ─── */}
        {activeTab === 'provisioning' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <span>💼 LinkedIn & Facebook Business Profile Setup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Authoritative Company Bio:</span>
                  <p className="text-white bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1 leading-relaxed">
                    {companyName} is Central Mississippi's premier commercial and residential contractor specializing in 24/7 emergency HVAC, zero-dig structural plumbing, and licensed commercial electrical systems. Serving Jackson, Brandon, and Madison since 1957.
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Primary SEO Keyword Cluster:</span>
                  <p className="text-indigo-400 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1 text-[11px]">
                    Commercial HVAC Jackson MS, Emergency Plumbing Brandon MS, Licensed Electrician Madison MS, DDC Building Automation, Hospital Chiller Repair
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📸 Instagram & 𝕏 (Twitter) Bio Setup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Optimized Bio (Under 150 Chars):</span>
                  <p className="text-white bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1 leading-relaxed">
                    ⚡ Central MS Multi-Trade Leader | 24/7 Emergency AC, Plumbing & Electrical | 4.8★ Rated | Same-Day Priority Dispatch 👇
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Recommended Posting Frequency:</span>
                  <p className="text-emerald-400 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1 text-[11px]">
                    3x Weekly (Tue, Thu, Sat at 9:00 AM CST) · Auto-Scheduled via FoundryOS
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── SCHEDULE POST MODAL ─── */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Schedule Social Broadcast</span>
                </h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Post Title / Campaign Concept</label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Mississippi Humidity & Chiller Defense"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Post Content Copy</label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write or refine the high-converting social post copy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Scheduled Date</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Posting Time</label>
                    <Input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="bg-slate-950 border-slate-800 text-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button variant="secondary" type="button" onClick={() => setShowScheduleModal(false)} className="bg-slate-800 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white">
                    Schedule Broadcast
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SocialMediaStudio;
