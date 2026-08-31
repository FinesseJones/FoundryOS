"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const FloatingWebChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please fill in your name, phone number, and question.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
      toast.success('📱 Message sent! Check your phone for an instant text response.', { icon: '💬' });
    }, 900);
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Circular Trigger Badge */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-300/30 transition-all hover:scale-105 cursor-pointer"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
          </div>
          <span className="hidden sm:inline">Text Us with Any Question</span>
          <span className="sm:hidden">Chat</span>
        </button>
      )}

      {/* Floating Chat Window Card */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] rounded-3xl bg-[#090e1a] border border-indigo-500/40 shadow-2xl shadow-indigo-950/80 overflow-hidden flex flex-col font-sans transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-4 border-b border-indigo-500/30 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md border border-indigo-400/30">
                T
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm">TACF Assistant</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-mono text-indigo-300">⚡ Instant WebChat-to-SMS</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar text-xs">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-slate-200 leading-relaxed">
                  👋 Have a question or looking for a project quote? Enter your number below and our AI team will text you back in seconds.
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">How can we help?</label>
                  <textarea
                    required
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your project or inquiry..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Connecting SMS...' : 'Send Text to My Phone'}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500 pt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>100% Privacy Protected • Standard SMS rates apply</span>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-white text-sm">We Just Sent You a Text!</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Check your mobile phone at <strong>{phone}</strong> to continue this conversation on the go.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
