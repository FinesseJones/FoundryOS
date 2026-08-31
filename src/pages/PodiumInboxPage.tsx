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
    name: 'Marcus Vance',
    phone: '(310) 849-2041',
    channel: 'sms',
    lastMessage: 'Sounds great! Can you send over the $2,500 retainer link so we can lock in the studio dates?',
    lastTime: '2m ago',
    unread: true,
    status: 'QUOTED',
    messages: [
      { id: 'm1', sender: 'customer', text: 'Hi, I saw your virtual production portfolio. Do you have stage availability next Thursday for a commercial shoot?', timestamp: '10:14 AM' },
      { id: 'm2', sender: 'ai', text: 'Hello Marcus! Yes, Stage 1 (4K Anamorphic Soundstage) is open next Thursday. Our day rate is $2,500 including lighting package.', timestamp: '10:14 AM' },
      { id: 'm3', sender: 'customer', text: 'Sounds great! Can you send over the $2,500 retainer link so we can lock in the studio dates?', timestamp: '10:18 AM' },
    ]
  },
  {
    id: 'conv-2',
    name: 'Elena Rostova',
    phone: '(415) 620-8819',
    channel: 'webchat',
    lastMessage: 'Thanks! I will review the proposal with my partner today.',
    lastTime: '15m ago',
    unread: false,
    status: 'IN_PROGRESS',
    messages: [
      { id: 'm4', sender: 'customer', text: 'Looking for a complete brand redesign and automated CRM setup.', timestamp: '9:30 AM' },
      { id: 'm5', sender: 'business', text: 'Hi Elena! We have our Brand-First AI suite pre-configured for that. Sending you the scope deck now.', timestamp: '9:45 AM' },
      { id: 'm6', sender: 'customer', text: 'Thanks! I will review the proposal with my partner today.', timestamp: '9:50 AM' },
    ]
  },
  {
    id: 'conv-3',
    name: 'David Sterling',
    phone: '(212) 509-3128',
    channel: 'google',
    lastMessage: 'Just left a 5-star review on your Google page. Thanks for the quick turnaround!',
    lastTime: '1h ago',
    unread: false,
    status: 'PAID_CLIENT',
    messages: [
      { id: 'm7', sender: 'business', text: 'Hi David, thanks for choosing TACF! If you had a great experience, could you drop us a quick review?', timestamp: '8:00 AM', isReview: true },
      { id: 'm8', sender: 'customer', text: 'Just left a 5-star review on your Google page. Thanks for the quick turnaround!', timestamp: '8:45 AM' },
    ]
  },
];

export const PodiumInboxPage: React.FC = () => {
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
      text: `💳 Secure Text-to-Pay Link: Please tap below to complete your payment of $2,500.00: https://pay.tacf.ai/inv_9842`,
      timestamp: 'Just now',
      isPayment: true,
      paymentAmount: '$2,500.00',
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
      text: `⭐ Hi ${activeConv.name.split(' ')[0]}! Could you take 30 seconds to leave us a quick review on Google? https://g.page/r/tacf-review`,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-serif">Unified Omnichannel Inbox</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/40">
              PODIUM SYNC
            </span>
          </div>
          <p className="text-xs text-slate-400">
            2-Way SMS, WebChat-to-Text, Google Business, and Inbound Lead Messaging
          </p>
        </div>

        {/* AI Auto-Reply Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300">DNA Auto-Reply</span>
            <button
              type="button"
              onClick={() => setAiAutoReplyEnabled(!aiAutoReplyEnabled)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition cursor-pointer ${
                aiAutoReplyEnabled ? 'bg-indigo-600' : 'bg-slate-700'
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
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Conversation List (4 cols) */}
        <div className="md:col-span-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col overflow-hidden">
          {/* Search & Channel Filter */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
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
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 uppercase">
                        {conv.channel}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{conv.phone}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate leading-relaxed">{conv.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Thread (8 cols) */}
        <div className="md:col-span-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
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
                  <span className="uppercase">{activeConv.channel} Live Stream</span>
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
                    className={`max-w-[75%] p-3.5 rounded-2xl space-y-1.5 shadow-md ${
                      isBusiness
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[9px] font-mono opacity-70">
                      <span>{msg.sender === 'ai' ? '🤖 Business DNA AI' : isBusiness ? 'You' : activeConv.name}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {msg.isPayment && (
                      <div className="p-2 rounded-xl bg-black/30 border border-white/20 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">Amount: {msg.paymentAmount}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-400 text-black font-extrabold text-[10px]">
                          READY TO PAY
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
              <span>Forwarding via Twilio / 10DLC Verified Gateway</span>
              <span className="text-emerald-400">● Carrier Route Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
