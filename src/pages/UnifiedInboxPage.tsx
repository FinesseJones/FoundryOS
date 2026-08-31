"use client";

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  CreditCard,
  Star,
  Phone,
  Search,
  User,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  Smartphone,
  Tag,
  Paperclip,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'customer' | 'business' | 'ai';
  text: string;
  timestamp: string;
  isPayment?: boolean;
  paymentAmount?: string;
  isReview?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  phone: string;
  channel: 'sms' | 'webchat' | 'google' | 'email';
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  status: 'NEW_LEAD' | 'IN_PROGRESS' | 'QUOTED' | 'PAID_CLIENT';
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Dr. Walter Evans',
    phone: '(601) 982-8400',
    channel: 'sms',
    lastMessage: 'Sounds great! Please send over the $4,850 commercial repair invoice link via text so I can approve it now.',
    lastTime: '2m ago',
    unread: true,
    status: 'QUOTED',
    messages: [
      { id: 'm1', sender: 'customer', text: 'Hi Environment Masters team, our 200-ton rooftop chiller unit #2 is throwing a high-pressure alarm in the west clinic wing. Can you dispatch someone to Jackson Medical Mall today?', timestamp: '10:14 AM' },
      { id: 'm2', sender: 'ai', text: 'Hello Dr. Evans! Environment Masters has Master Technician Marcus Holloway dispatched to 168 E Porter / Jackson Medical Mall with an ETA of 18 minutes under your Priority One Commercial agreement.\n\n🛡️ [SOP #EM-HVAC-04 Verified: 24/7 Hospital Priority Dispatch • Flat-rate sensor & compressor diagnostics applied]', timestamp: '10:14 AM' },
      { id: 'm3', sender: 'customer', text: 'Sounds great! Please send over the $4,850 commercial repair invoice link via text so I can approve it now.', timestamp: '10:18 AM' },
    ]
  },
  {
    id: 'conv-2',
    name: 'Arthur Pendelton',
    phone: '(601) 856-7116',
    channel: 'webchat',
    lastMessage: 'The trenchless hydrojetting proposal looks solid. Let us schedule the crew for Tuesday morning.',
    lastTime: '15m ago',
    unread: false,
    status: 'IN_PROGRESS',
    messages: [
      { id: 'm4', sender: 'customer', text: 'We have recurring water pressure drops in the Madison Station historic building. Do you offer trenchless sewer inspections?', timestamp: '9:30 AM' },
      { id: 'm5', sender: 'business', text: 'Hi Arthur! Yes, Environment Masters provides high-definition fiber optic camera inspections and zero-dig NuFlow epoxy lining throughout Madison County.\n\n🛡️ [SOP #EM-PLUMB-09 Verified: Zero-Dig Structural Relining • Mississippi Historic District Compliance]', timestamp: '9:45 AM' },
      { id: 'm6', sender: 'customer', text: 'The trenchless hydrojetting proposal looks solid. Let us schedule the crew for Tuesday morning.', timestamp: '9:50 AM' },
    ]
  },
  {
    id: 'conv-3',
    name: 'Brenda Montgomery',
    phone: '(601) 957-2200',
    channel: 'google',
    lastMessage: 'Just left Environment Masters a 5-star Google review! Your electrician arrived in 15 minutes during the storm.',
    lastTime: '1h ago',
    unread: false,
    status: 'PAID_CLIENT',
    messages: [
      { id: 'm7', sender: 'business', text: 'Hi Brenda, thank you for trusting Environment Masters with the Highland Colony 480V panel upgrade! Could you share a quick Google review?', timestamp: '8:00 AM', isReview: true },
      { id: 'm8', sender: 'customer', text: 'Just left Environment Masters a 5-star Google review! Your electrician arrived in 15 minutes during the storm.', timestamp: '8:45 AM' },
    ]
  },
];

export const UnifiedInboxPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>('conv-1');
  const [replyText, setReplyText] = useState<string>('');
  const [aiAutoReplyEnabled, setAiAutoReplyEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'webchat' | 'google'>('all');

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  const handleSendMessage = () => {
    if (!replyText.trim()) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'business',
      text: replyText,
      timestamp: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: replyText,
            lastTime: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setReplyText('');
    toast.success('📱 SMS Sent directly to client phone!', { icon: '💬' });
  };

  const handleSendPaymentLink = () => {
    const paymentMsg: Message = {
      id: `pay_${Date.now()}`,
      sender: 'business',
      text: `💳 Secure Text-to-Pay Link from Environment Masters: Please tap below to approve & pay $4,850.00 for Chiller Compressor Overhaul: https://pay.environmentmasters.com/inv_9842`,
      timestamp: 'Just now',
      isPayment: true,
      paymentAmount: '$4,850.00',
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, messages: [...c.messages, paymentMsg] } : c))
    );

    toast.success('💳 Text-to-Pay link dispatched to client via SMS!', { icon: '💸' });
  };

  const handleSendReviewInvite = () => {
    const reviewMsg: Message = {
      id: `rev_${Date.now()}`,
      sender: 'business',
      text: `⭐ Hi ${activeConv.name.split(' ')[0]}! Thank you for choosing Environment Masters (Jackson, MS). Could you share a quick 5-star Google review? https://g.page/r/environment-masters-review`,
      timestamp: 'Just now',
      isReview: true,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, messages: [...c.messages, reviewMsg] } : c))
    );

    toast.success('⭐ 1-Tap Google Review SMS sent to client!', { icon: '🌟' });
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="h-full flex flex-col font-sans bg-[#080c16] text-slate-100 p-4 lg:p-6 overflow-hidden space-y-4">
      {/* Top Header with Verified Mississippi Business Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              EM
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-white font-serif">Environment Masters, Inc.</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  JACKSON, MS • HEADQUARTERS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Dedicated Commercial Dispatch Line: (601) 353-4681 • MS License #MS-HVAC-1957
              </p>
            </div>
          </div>
        </div>

        {/* AI SOP Grounding Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200 font-bold">Living Business DNA & SOP Grounding</span>
            <button
              type="button"
              onClick={() => setAiAutoReplyEnabled(!aiAutoReplyEnabled)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition cursor-pointer ${
                aiAutoReplyEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${
                  aiAutoReplyEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Conversation List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col overflow-hidden">
          {/* Search & Channel Filter */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Jackson MS leads by name or phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto text-[11px] font-mono">
              {(['all', 'sms', 'webchat', 'google'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition cursor-pointer ${
                    channelFilter === ch
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv.id;
              const subLabel = conv.id === 'conv-1' 
                ? 'Jackson Medical Mall Complex' 
                : conv.id === 'conv-2' 
                ? 'Madison Station Plaza' 
                : 'Highland Colony Office Park';

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-3.5 text-left transition flex items-start gap-3 cursor-pointer ${
                    isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                    {conv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{conv.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{conv.lastTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 uppercase">
                        {conv.channel}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold truncate">{subLabel}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate leading-relaxed">{conv.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Thread (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center font-bold text-sm text-white">
                {activeConv.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{activeConv.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
                    {activeConv.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>{activeConv.phone}</span>
                  <span>•</span>
                  <span className="uppercase text-emerald-400 font-bold">2-Way Verified SMS</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendPaymentLink}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-[11px] font-mono font-bold transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Text-to-Pay</span>
              </button>
              <button
                type="button"
                onClick={handleSendReviewInvite}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900 text-amber-300 text-[11px] font-mono font-bold transition cursor-pointer"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Review Invite</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3.5 text-xs">
            {activeConv.messages.map((msg) => {
              const isBusiness = msg.sender === 'business' || msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex ${isBusiness ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl space-y-1.5 shadow-md ${
                      isBusiness
                        ? 'bg-gradient-to-r from-indigo-900 to-indigo-800 border border-indigo-500/40 text-white rounded-tr-none'
                        : 'bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[9px] font-mono opacity-70">
                      <span>{msg.sender === 'ai' ? '🤖 Environment Masters DNA AI' : isBusiness ? 'Environment Masters Dispatch' : activeConv.name}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {msg.isPayment && (
                      <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/40 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">Invoice: {msg.paymentAmount}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-400 text-black font-black text-[10px]">
                          1-TAP STRIPE PAY
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Composer */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Type a text message to ${activeConv.name}...`}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS</span>
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
              <span>Grounding: Environment Masters Business DNA (v2.4)</span>
              <span className="text-emerald-400">● 100% SOP Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Customer DNA & Active SOP Drawer (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Client & SOP Telemetry
            </span>
            <h4 className="text-sm font-bold text-white mt-1">
              {activeConv.id === 'conv-1' ? 'Jackson Medical Mall Complex' : activeConv.id === 'conv-2' ? 'Madison Station Plaza' : 'Highland Colony Commercial'}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              {activeConv.id === 'conv-1' ? '350 W Woodrow Wilson Ave, Jackson, MS 39213' : activeConv.id === 'conv-2' ? 'Madison, MS 39110' : 'Ridgeland, MS 39157'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active Equipment on Site</span>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1 font-mono">
              <p className="text-white font-bold">
                {activeConv.id === 'conv-1' ? 'Trane 200-Ton Rooftop Chiller Unit #2' : activeConv.id === 'conv-2' ? '6-Inch Cast Iron Commercial Main Line' : '480V 3-Phase Square D Switchgear'}
              </p>
              <p className="text-emerald-400 text-[10px]">
                Contract: Priority One™ Commercial Retainer #MS-EM-882
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active SOP Rule Engaged</span>
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-[11px] space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>SOP-HVAC-04: Emergency Chiller Protocol</span>
              </div>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                Guaranteed sub-20 minute dispatch to Jackson Medical surgical suites during heat index &gt;95°F.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Quick SOP Action Dispatch</span>
            <button
              type="button"
              onClick={() => toast.success('🚨 Master Tech Marcus Holloway dispatched with ETA 14 mins!', { icon: '🚚' })}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>🚚 Dispatch Lead Tech</span>
            </button>
            <button
              type="button"
              onClick={handleSendPaymentLink}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-200 text-[11px] font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Send $4,850 Invoice SMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

