import React, { useEffect, useState } from 'react';

interface DNAProgressScreenProps {
  websiteUrl: string;
  onComplete: () => void;
}

interface SignalStep {
  id: number;
  label: string;
  detail: string;
  completed: boolean;
}

export const DNAProgressScreen: React.FC<DNAProgressScreenProps> = ({ websiteUrl, onComplete }) => {
  const [progress, setProgress] = useState(10);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: SignalStep[] = [
    { id: 1, label: 'DOM Structure & Meta Signal Crawl', detail: `Connecting to ${websiteUrl} and extracting header tags...`, completed: progress >= 25 },
    { id: 2, label: 'Brand Voice & Vocabulary Density Analysis', detail: 'Evaluating word distribution, tone descriptors, and restricted vocabulary...', completed: progress >= 55 },
    { id: 3, label: 'Ideal Customer Profile & Pain Points Inference', detail: 'Analyzing target audience messaging, key benefits, and buyer personas...', completed: progress >= 80 },
    { id: 4, label: 'Zod Contract Validation & Field Confidence Scoring', detail: 'Applying KnowledgeField provenance containers and calculating aggregate health index...', completed: progress >= 100 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        const next = prev + 15;
        if (next >= 80) setCurrentStepIndex(3);
        else if (next >= 55) setCurrentStepIndex(2);
        else if (next >= 25) setCurrentStepIndex(1);
        return next;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [onComplete]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center space-y-8">
      {/* Radial Circular Progress Gauge */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="text-slate-900"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="text-indigo-500 transition-all duration-500 ease-out"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="url(#progressGradient)"
            fill="transparent"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
          <span className="text-4xl font-extrabold text-white font-mono">{progress}%</span>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Analyzing</span>
        </div>
      </div>

      {/* Main Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Analyzing Digital Footprint & Signals</h2>
        <p className="text-xs text-slate-400 font-mono">{websiteUrl}</p>
      </div>

      {/* Real-Time Extraction Ticker Cards */}
      <div className="glass-card p-6 text-left space-y-4 border-indigo-500/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Extraction Pipeline</span>
          <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-semibold">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            Live Processing
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`p-3.5 rounded-xl border transition-all ${
                s.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : idx === currentStepIndex
                  ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-100 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-white/5 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span>{s.completed ? '✓' : idx === currentStepIndex ? '⚡' : '⏳'}</span>
                  <span>{s.label}</span>
                </span>
                <span className="font-mono text-[10px]">
                  {s.completed ? 'DONE' : idx === currentStepIndex ? 'ACTIVE' : 'QUEUED'}
                </span>
              </div>
              {idx === currentStepIndex && (
                <p className="text-[11px] text-indigo-300 pt-1.5 pl-6 font-mono leading-relaxed">{s.detail}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
