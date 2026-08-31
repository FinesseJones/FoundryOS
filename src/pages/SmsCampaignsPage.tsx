"use client";

import React, { useState } from 'react';
import {
  Flame,
  Send,
  Sparkles,
  Users,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  Smartphone,
  Tag,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CampaignItem {
  id: string;
  title: string;
  recipientsCount: number;
  openRate: string;
  clickRate: string;
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
  scheduledDate: string;
  messageText: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    title: 'Jackson MS Summer Heatwave AC & Chiller Alert',
    recipientsCount: 1850,
    openRate: '98.4%',
    clickRate: '41.2%',
    status: 'SENT',
    scheduledDate: 'Sent Yesterday at 2:00 PM',
    messageText: '☀️ Jackson MS Heat Index >98°F Alert: Prevent AC compressor burnout before peak humid heat. Environment Masters Priority One members get priority same-day dispatch: https://environmentmasters.com/tuneup',
  },
  {
    id: 'camp-2',
    title: 'Commercial Facility Preventative Hydrojetting',
    recipientsCount: 420,
    openRate: '97.5%',
    clickRate: '32.8%',
    status: 'SENT',
    scheduledDate: 'Sent 3 days ago',
    messageText: '🔧 Commercial Property Notice: Schedule zero-dig trenchless sewer camera diagnostics and 4,000 PSI hydrojetting with Environment Masters Jackson MS: https://environmentmasters.com/commercial',
  },
];

export const SmsCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [audienceSegment, setAudienceSegment] = useState<string>('All Active Clients (1,240 Contacts)');
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setTimeout(() => {
      const newCamp: CampaignItem = {
        id: `camp-${Date.now().toString().slice(-4)}`,
        title,
        recipientsCount: 1240,
        openRate: '98.0%',
        clickRate: '31.2%',
        status: 'SENT',
        scheduledDate: 'Sent Just now',
        messageText: message,
      };

      setCampaigns((prev) => [newCamp, ...prev]);
      setIsSending(false);
      setTitle('');
      setMessage('');
      toast.success(`📢 SMS Broadcast "${title}" dispatched to 1,240 contacts!`, { icon: '🔥' });
    }, 800);
  };

  const handleGenerateCopy = () => {
    setMessage(`✨ Special Announcement from TACF: We are opening 5 exclusive slots for our new 4K virtual production & AI brand setup. Reply YES to claim your priority consultation link!`);
    toast.success('🤖 AI Drafted high-converting SMS copy!', { icon: '✨' });
  };

  return (
    <div className="h-full flex flex-col font-sans bg-[#080c16] text-slate-100 p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-serif">Targeted SMS Marketing Broadcasts</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/40">
              SMS BROADCASTS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Launch high-converting promotional text blasts with 98% open rates and 10DLC carrier compliance
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average SMS Open Rate</span>
          <p className="text-2xl font-black text-rose-400">98.4%</p>
          <p className="text-[10px] text-slate-400 font-mono">Compared to 18% for email newsletters</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Click-Through Rate</span>
          <p className="text-2xl font-black text-indigo-400">31.8%</p>
          <p className="text-[10px] text-emerald-400 font-mono">High direct engagement</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Subscribed Contacts</span>
          <p className="text-2xl font-black text-emerald-400">1,240</p>
          <p className="text-[10px] text-emerald-300 font-mono">● 100% Opt-In Verified</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose SMS Broadcast (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#090d16] border border-rose-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-white font-serif">Compose New SMS Campaign</h3>
          </div>
          <p className="text-xs text-slate-300">
            Draft your marketing announcement, pick your customer segment, and send immediately.
          </p>

          <form onSubmit={handleCreateCampaign} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Campaign Title (Internal)</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End of Summer Soundstage Promo"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Audience Segment</label>
              <select
                value={audienceSegment}
                onChange={(e) => setAudienceSegment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
              >
                <option>All Active Clients (1,240 Contacts)</option>
                <option>VIP Commercial Producers (340 Contacts)</option>
                <option>Recent Lead Inquiries (180 Contacts)</option>
                <option>Past Completed Clients (720 Contacts)</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-slate-400 uppercase">SMS Text Body</label>
                <button
                  type="button"
                  onClick={handleGenerateCopy}
                  className="flex items-center gap-1 text-[10px] font-mono text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Copywriter</span>
                </button>
              </div>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your text message announcement..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400 resize-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>{message.length}/160 characters (1 SMS segment)</span>
                <span>Includes automatic STOP opt-out</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Broadcasting...' : 'Launch SMS Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* Right: Past Campaigns (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white font-serif">Recent SMS Broadcasts</h3>
            <span className="text-[10px] font-mono text-slate-400">Carrier Delivery Reports</span>
          </div>

          <div className="space-y-3">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-white">{camp.title}</h4>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
                      {camp.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{camp.scheduledDate}</span>
                </div>

                <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                  {camp.messageText}
                </p>

                <div className="flex items-center gap-6 text-[10px] font-mono pt-1 text-slate-300">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" />
                    <strong>{camp.recipientsCount.toLocaleString()}</strong> Sent
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <strong>{camp.openRate}</strong> Open Rate
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-amber-400" />
                    <strong>{camp.clickRate}</strong> Clicks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
