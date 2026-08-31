"use client";

import React, { useState } from 'react';
import {
  Star,
  Send,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Share2,
  Search,
  MessageSquare,
  ThumbsUp,
  Award,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  source: 'Google' | 'Trustpilot' | 'Facebook';
  text: string;
  status: 'REPLIED' | 'NEEDS_REPLY';
  replyText?: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    author: 'Sarah Jenkins',
    rating: 5,
    date: 'Yesterday',
    source: 'Google',
    text: 'TACF’s virtual production suite completely changed our commercial workflow. The 3D stage and instant Blackmagic sync saved our team 3 full shoot days.',
    status: 'NEEDS_REPLY',
  },
  {
    id: 'r2',
    author: 'Michael Chang',
    rating: 5,
    date: '3 days ago',
    source: 'Google',
    text: 'The Business DNA onboarding was crazy fast. Within 10 minutes it had our brand voice dialed in and started answering client texts automatically.',
    status: 'REPLIED',
    replyText: 'Thank you Michael! Glad to hear your team is scaling client communication effortlessly.',
  },
  {
    id: 'r3',
    author: 'David Kowalski',
    rating: 5,
    date: '1 week ago',
    source: 'Trustpilot',
    text: 'Best SMS and review capture system we have ever used. Our Google rating went from 4.2 to 4.9 in under 60 days.',
    status: 'REPLIED',
    replyText: 'We appreciate the partnership, David! Cheers to more 5-star milestones.',
  },
];

export const ReputationReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientPhone) return;

    setIsSendingInvite(true);
    setTimeout(() => {
      setIsSendingInvite(false);
      setRecipientName('');
      setRecipientPhone('');
      toast.success(`⭐ 5-Star Review Invite sent to ${recipientPhone}!`, { icon: '🌟' });
    }, 700);
  };

  const handleGenerateAIReply = (review: ReviewItem) => {
    const aiReply = `Thank you so much, ${review.author.split(' ')[0]}! We take huge pride in delivering excellence for your team. Looking forward to our next project together!`;
    setReplyInputs((prev) => ({ ...prev, [review.id]: aiReply }));
    toast.success('✨ AI Drafted response using your authentic Brand Voice!', { icon: '🤖' });
  };

  const handlePublishReply = (reviewId: string) => {
    const text = replyInputs[reviewId];
    if (!text?.trim()) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'REPLIED', replyText: text } : r))
    );

    setReplyInputs((prev) => {
      const next = { ...prev };
      delete next[reviewId];
      return next;
    });

    toast.success('✅ Reply published to Google Reviews!', { icon: '🌟' });
  };

  return (
    <div className="h-full flex flex-col font-sans bg-[#080c16] text-slate-100 p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-serif">Reputation & Review Multiplier</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
              REPUTATION ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automate 1-Tap Google Review Requests & AI Brand Voice Responses
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average Rating</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-amber-400">4.9</span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">Top 1% in your industry</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Reviews</span>
          <p className="text-2xl font-black text-white">148</p>
          <p className="text-[10px] text-emerald-400 font-mono">+18 this month</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">SMS Invite Conversion</span>
          <p className="text-2xl font-black text-indigo-400">68.4%</p>
          <p className="text-[10px] text-slate-400 font-mono">Industry avg: 12%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Google SEO Boost</span>
          <p className="text-2xl font-black text-emerald-400">+340%</p>
          <p className="text-[10px] text-emerald-300 font-mono">Organic local discovery</p>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Send Instant SMS Review Invite (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#090d16] border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white font-serif">Send 1-Tap SMS Review Invite</h3>
          </div>
          <p className="text-xs text-slate-300">
            Send an instant review invitation directly to your customer's smartphone right after completing a project.
          </p>

          <form onSubmit={handleSendInvite} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Client Name</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Client Mobile Phone</label>
              <input
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Live Preview Box */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <span className="text-[9px] font-mono text-indigo-300 uppercase">Live SMS Preview:</span>
              <p className="italic">
                "Hi {recipientName || '[Name]'}, thank you for trusting TACF with your project! Could you take 30 seconds to drop us a quick Google review? https://g.page/r/tacf-review"
              </p>
            </div>

            <button
              type="submit"
              disabled={isSendingInvite}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{isSendingInvite ? 'Sending SMS...' : 'Dispatch Review Request'}</span>
            </button>
          </form>
        </div>

        {/* Right: Live Reviews Feed & AI Response Generator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white font-serif">Recent Customer Reviews</h3>
            <span className="text-[10px] font-mono text-slate-400">Live Google & Platform Sync</span>
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{review.author}</h4>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                        <span>{review.source}</span>
                        <span>•</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{review.text}</p>

                {/* Published Reply */}
                {review.replyText && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Response from Business</span>
                    </div>
                    <p className="text-slate-300">{review.replyText}</p>
                  </div>
                )}

                {/* Response Composer for unreplied reviews */}
                {review.status === 'NEEDS_REPLY' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">Draft Response:</span>
                      <button
                        type="button"
                        onClick={() => handleGenerateAIReply(review)}
                        className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Brand Voice Reply</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyInputs[review.id] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [review.id]: e.target.value }))
                        }
                        placeholder="Write or AI-generate a reply..."
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => handlePublishReply(review.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
