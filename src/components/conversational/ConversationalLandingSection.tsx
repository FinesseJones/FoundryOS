"use client";

import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Star,
  CreditCard,
  Send,
  PhoneCall,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Smartphone,
  BarChart3,
  Globe,
  Bell,
  Clock,
  Layers,
  Flame,
  Search
} from 'lucide-react';

interface ConversationalLandingSectionProps {
  onStartOnboarding: () => void;
}

export const ConversationalLandingSection: React.FC<ConversationalLandingSectionProps> = ({ onStartOnboarding }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'leads' | 'reviews' | 'payments' | 'campaigns' | 'phones'>('inbox');
  const [selectedNiche, setSelectedNiche] = useState<number>(0);
  const [demoPhone, setDemoPhone] = useState<string>('(555) 389-2041');
  const [demoMessage, setDemoMessage] = useState<string>('Hi, do you have availability for a new client project next week?');
  const [isDemoSent, setIsDemoSent] = useState<boolean>(false);
  const [isSimulatingAI, setIsSimulatingAI] = useState<boolean>(false);
  const [scanUrl, setScanUrl] = useState<string>('https://');

  const niches = [
    {
      title: 'Virtual Production & 3D Studios',
      icon: '🎬',
      tagline: 'Book 3D soundstages, quote camera packages & capture high-ticket director inquiries via SMS.',
      metric: '3.4x Faster Quote Closes',
    },
    {
      title: 'AI Content & Creator Agencies',
      icon: '🎨',
      tagline: 'Convert inbound brand deals into paid retainers with instant DNA-aligned text replies.',
      metric: '92% SMS Open Rate',
    },
    {
      title: 'High-Ticket Consultancies & Legal',
      icon: '💼',
      tagline: 'Automate intake qualification, schedule strategy calls & collect retainers with Text-to-Pay.',
      metric: '$48k Avg Retainer Captured',
    },
    {
      title: 'Specialized Design-Build & Contractors',
      icon: '🏗️',
      tagline: 'Never lose a project lead. Instant missed-call auto-text back and automated 5-star Google review invites.',
      metric: '4.9★ Average Rating',
    },
  ];

  const handleSendDemo = () => {
    if (!demoMessage.trim()) return;
    setIsDemoSent(true);
    setIsSimulatingAI(true);
    setTimeout(() => {
      setIsSimulatingAI(false);
    }, 1200);
  };

  return (
    <div className="space-y-24 py-12">
      {/* 🌟 1. CORE HERO SHOWCASE */}
      <section className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-b from-[#0f172a]/90 via-[#090d16]/90 to-[#05070c]/90 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/40 px-3.5 py-1 text-xs font-mono text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>AUTONOMOUS LEAD TO REVENUE ENGINE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-serif">
              Turn Inbound Clicks into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                Paid Client Retainers
              </span>{' '}
              via Text.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Combine multi-channel conversational lead conversion (WebChat-to-Text, 2-Way SMS, Review Requests, Text-to-Pay) with the depth of your <strong>TACF Business DNA</strong>.
            </p>

            {/* Quick Feature Checklist */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>WebChat-to-SMS Conversion</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Automated 5-Star Reviews</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant SMS Text-to-Pay</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Missed-Call Auto-Text</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onStartOnboarding}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Your Lead Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Live WebChat-to-SMS Simulator Phone */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] rounded-[38px] p-3 bg-gradient-to-b from-slate-700 to-slate-950 border-4 border-slate-700 shadow-2xl shadow-indigo-950/60 font-sans">
              <div className="rounded-[30px] bg-[#0c101d] overflow-hidden border border-slate-800 flex flex-col h-[460px]">
                {/* Phone Top Notch */}
                <div className="bg-slate-900/90 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-white font-bold">TACF Live Assistant</span>
                  </div>
                  <span className="text-[9px] text-indigo-300">⚡ SMS Gateway</span>
                </div>

                {/* Simulated Conversation Feed */}
                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar text-xs">
                  {/* Automated Greeting */}
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      T
                    </div>
                    <div className="p-2.5 rounded-2xl rounded-tl-none bg-indigo-950/80 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
                      👋 Hi there! Thanks for reaching out. What services are you looking to quote today?
                    </div>
                  </div>

                  {/* Customer Sent Message */}
                  {isDemoSent && (
                    <div className="flex justify-end">
                      <div className="p-2.5 rounded-2xl rounded-tr-none bg-indigo-600 text-white leading-relaxed max-w-[85%] shadow-md">
                        {demoMessage}
                      </div>
                    </div>
                  )}

                  {/* AI Generating Feedback */}
                  {isSimulatingAI && (
                    <div className="flex gap-2 items-center text-[10px] font-mono text-indigo-300 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Business DNA AI drafting instant response...</span>
                    </div>
                  )}

                  {/* Instant AI DNA Response */}
                  {isDemoSent && !isSimulatingAI && (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          T
                        </div>
                        <div className="p-2.5 rounded-2xl rounded-tl-none bg-indigo-950/80 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
                          ✨ Yes! We have 2 slots open next Tuesday. I can send you our instant project onboarding link via SMS right now:
                        </div>
                      </div>

                      {/* Text-to-Pay / Book Action Card */}
                      <div className="ml-8 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Project Deposit Link</p>
                          <p className="text-[9px] text-emerald-300/80">Secured with Stripe & SMS</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-emerald-500 text-black font-extrabold text-[10px]">
                          $250.00
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input Box */}
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={demoMessage}
                      onChange={(e) => setDemoMessage(e.target.value)}
                      placeholder="Type a customer message..."
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendDemo}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 px-1">
                    <span>Forwarding to: {demoPhone}</span>
                    <span className="text-emerald-400">● 99.4% Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🧭 2. COMPLETE CONVERSATIONAL SUITE */}
      <section className="space-y-8 text-center">
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            THE ALL-IN-ONE COMMUNICATIONS SUITE
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
            The Complete Conversational Suite, Powered by Business DNA
          </h3>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Switch between the tools your business uses every day to capture leads, text clients, collect payments, and multiply reviews.
          </p>
        </div>

        {/* Product Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-4xl mx-auto">
          {[
            { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare },
            { id: 'leads', label: 'AI Lead Capture', icon: Zap },
            { id: 'reviews', label: 'Reputation & Reviews', icon: Star },
            { id: 'payments', label: 'Text-to-Pay', icon: CreditCard },
            { id: 'campaigns', label: 'SMS Marketing', icon: Flame },
            { id: 'phones', label: 'Phones & Missed Calls', icon: PhoneCall },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pillar Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-4">
          {activeTab === 'inbox' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">One Unified Inbox</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Combine 2-Way SMS, WebChat inquiries, Google Business chats, and emails into a single live stream.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">WebChat-to-Text Handoff</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When a visitor starts a chat on your site, conversations instantly transition to their mobile SMS so you never lose the lead.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">DNA-Trained Auto-Reply</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI suggestions are pre-filled using your verified Brand Voice and custom service pricing.
                </p>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Star className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Automated SMS Review Invites</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trigger automated review requests right after project completion with direct 1-tap Google Review links.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Google SEO Ranking Multiplier</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Businesses with steady 5-star review velocity climb to the top of Google local search results.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">AI Review Response Generator</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instantly craft polite, professional responses to customer reviews in your authentic brand tone.
                </p>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Text-to-Pay in 1 Click</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Send secure payment links via SMS text. Clients pay instantly using Apple Pay, Google Pay, or card.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">85% Faster Collections</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Avoid 30-day invoice delays. Most text payment requests are settled within minutes of delivery.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Automatic Ledger Reconciliation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Payments are logged directly against the client profile and synced into your billing dashboard.
                </p>
              </div>
            </>
          )}

          {activeTab === 'leads' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Sub-60-Second Lead Response</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  78% of customers buy from the first business that responds. Our AI texts leads within seconds of submission.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Automated Intake Qualification</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Collect project budget, timeline, and requirements before your team even jumps on the phone.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Calendar Self-Booking</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Qualified prospects are given immediate links to lock in a consultation on your team calendar.
                </p>
              </div>
            </>
          )}

          {activeTab === 'campaigns' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Targeted SMS Broadcasts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Send high-converting promotional text blasts, seasonal discounts, and VIP announcements to customer segments.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">98% Open Rate Analytics</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track link clicks, response conversions, and unsubscribes in real-time with full 10DLC compliance.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">AI Campaign Copywriter</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate compelling, punchy SMS copy that avoids spam triggers and drives high click-through rates.
                </p>
              </div>
            </>
          )}

          {activeTab === 'phones' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Missed-Call Auto-Text Back</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  62% of calls to businesses go unanswered. When you miss a call, the system automatically texts the caller back immediately.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Voicemail AI Transcripts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Convert voicemails into clear text transcripts and route urgent client action items to your team.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Dedicated Business Number</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Separate your personal and business communications with a unified phone and texting line.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 🏢 3. NICHE SELECTOR CAROUSEL */}
      <section className="rounded-3xl p-8 bg-slate-950/70 border border-slate-800 space-y-6 text-left max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold">CUSTOM TAILORED WORKFLOWS</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">Engineered for Your Specific Industry Niche</h3>
          </div>
          <div className="flex gap-2">
            {niches.map((n, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedNiche(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                  selectedNiche === idx
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {n.icon} {n.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1322] to-[#070b14] border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{niches[selectedNiche].icon}</span>
              <h4 className="text-lg font-extrabold text-white">{niches[selectedNiche].title}</h4>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {niches[selectedNiche].tagline}
            </p>
          </div>
          <div className="px-5 py-3 rounded-xl bg-indigo-950/80 border border-indigo-400/40 text-center flex-shrink-0">
            <p className="text-[10px] font-mono text-indigo-300 uppercase">Impact Metric</p>
            <p className="text-lg font-black text-emerald-400">{niches[selectedNiche].metric}</p>
          </div>
        </div>
      </section>

      {/* 🚀 4. INSTANT BUSINESS DNA SCANNER CTA */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/60 border border-indigo-500/40 text-center space-y-5 max-w-4xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
          Ready to Automate Your Business Lead Engine?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Enter your company website to generate a free Business DNA scan and see your automated WebChat & SMS pipeline in action.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="url"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            placeholder="https://yourcompany.com"
            className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
          />
          <button
            type="button"
            onClick={onStartOnboarding}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Scan Business DNA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
