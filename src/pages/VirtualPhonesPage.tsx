"use client";

import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  MessageSquare,
  Sparkles,
  Play,
  Volume2,
  Clock,
  CheckCircle2,
  Bell,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CallRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  type: 'MISSED' | 'INCOMING' | 'OUTGOING';
  time: string;
  duration: string;
  hasVoicemail?: boolean;
  voicemailTranscript?: string;
  autoTextSent?: boolean;
}

const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'c-1',
    callerName: 'Dr. Walter Evans (Jackson Medical Mall, Jackson MS)',
    callerPhone: '(601) 982-8400',
    type: 'MISSED',
    time: '12m ago',
    duration: '0:00',
    hasVoicemail: true,
    voicemailTranscript: '"Hey Ray and Sarah, this is Dr. Evans from Jackson Medical Mall. Calling regarding the rooftop chiller unit #2 alarm. Please text or call me back at 601-982-8400."',
    autoTextSent: true,
  },
  {
    id: 'c-2',
    callerName: 'Arthur Pendelton (Madison Station Plaza, Madison MS)',
    callerPhone: '(601) 856-7116',
    type: 'INCOMING',
    time: '2h ago',
    duration: '5:12',
  },
  {
    id: 'c-3',
    callerName: 'Brenda Montgomery (Highland Colony Park, Ridgeland MS)',
    callerPhone: '(601) 957-2200',
    type: 'OUTGOING',
    time: '4h ago',
    duration: '3:40',
  },
];

export const VirtualPhonesPage: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [autoTextEnabled, setAutoTextEnabled] = useState<boolean>(true);
  const [autoTextMessage, setAutoTextMessage] = useState<string>(
    "Hi! This is Environment Masters (Jackson, MS). Sorry we missed your call — how can our HVAC, plumbing, or electrical team help you today?"
  );

  const handleSaveAutoText = () => {
    toast.success('✅ Missed-Call Auto-Text workflow updated!', { icon: '📱' });
  };

  return (
    <div className="h-full flex flex-col font-sans bg-[#080c16] text-slate-100 p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-serif">Virtual Phones & Missed-Call Auto-Text</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/40">
              VOICE & AUTO-TEXT
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Never lose an inbound customer. Automatically text callers back in seconds when calls go unanswered.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Missed Call Auto-Recovery Rate</span>
          <p className="text-2xl font-black text-indigo-400">92.4%</p>
          <p className="text-[10px] text-emerald-400 font-mono">Leads recovered via sub-15s auto SMS</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Dedicated Mississippi Line</span>
          <p className="text-xl font-bold text-white font-mono">(601) 353-4681</p>
          <p className="text-[10px] text-emerald-400 font-mono">● Jackson MS Active Routing</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Calls Handled</span>
          <p className="text-2xl font-black text-emerald-400">328</p>
          <p className="text-[10px] text-slate-400 font-mono">Voicemails automatically transcribed</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Missed-Call Auto-Text Settings (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#090d16] border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneMissed className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white font-serif">Missed-Call Auto-Text Back</h3>
            </div>
            <button
              type="button"
              onClick={() => setAutoTextEnabled(!autoTextEnabled)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition cursor-pointer ${
                autoTextEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${
                  autoTextEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-300">
            When you're on a shoot, in a meeting, or away from your desk, this message will be automatically sent to the caller's mobile phone within 15 seconds.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase">Auto-Text Message</label>
            <textarea
              rows={3}
              value={autoTextMessage}
              onChange={(e) => setAutoTextMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveAutoText}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Save Auto-Text Workflow
          </button>
        </div>

        {/* Right: Call Logs & Voicemail Transcripts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white font-serif">Recent Call Activity</h3>
            <span className="text-[10px] font-mono text-slate-400">Live Carrier Call Log</span>
          </div>

          <div className="space-y-3">
            {calls.map((call) => (
              <div key={call.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        call.type === 'MISSED'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                          : call.type === 'INCOMING'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-indigo-950/80 text-indigo-400 border border-indigo-500/40'
                      }`}
                    >
                      {call.type === 'MISSED' && <PhoneMissed className="w-4 h-4" />}
                      {call.type === 'INCOMING' && <PhoneIncoming className="w-4 h-4" />}
                      {call.type === 'OUTGOING' && <PhoneOutgoing className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{call.callerName}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{call.callerPhone}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {call.time} • Duration: {call.duration}
                      </span>
                    </div>
                  </div>

                  {call.autoTextSent && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[9px] font-bold border border-indigo-500/40 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Auto-Texted
                    </span>
                  )}
                </div>

                {/* Voicemail AI Transcript */}
                {call.hasVoicemail && (
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-indigo-400" />
                        <span>AI Voicemail Transcript</span>
                      </span>
                      <span className="text-slate-500">Audio 0:24</span>
                    </div>
                    <p className="italic text-slate-300 leading-relaxed font-sans">{call.voicemailTranscript}</p>
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
