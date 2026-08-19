import React from 'react';
import { ViewTab } from './Navbar';

interface CalendarItem {
  id: string;
  title: string;
  channel: string;
  date: string;
  status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';
}

interface ContentCalendarViewProps {
  setActiveTab: (tab: ViewTab) => void;
}

export const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({ setActiveTab }) => {
  const items: CalendarItem[] = [
    {
      id: 'cal_1',
      title: 'Series A Product Launch Announcement',
      channel: 'linkedin',
      date: '2026-07-28',
      status: 'scheduled',
    },
    {
      id: 'cal_2',
      title: 'Customer Case Study: 10x Speed',
      channel: 'x',
      date: '2026-07-29',
      status: 'pending',
    },
    {
      id: 'cal_3',
      title: 'Weekly Brand Strategy Newsletter',
      channel: 'email',
      date: '2026-07-30',
      status: 'approved',
    },
    {
      id: 'cal_4',
      title: 'Visual Identity & Design Deep-Dive',
      channel: 'instagram',
      date: '2026-08-01',
      status: 'draft',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Content Calendar & Schedule — <span className="text-gradient">Campaign Matrix</span>
          </h1>
          <p className="text-xs text-slate-400">
            Multi-channel calendar governed by Publishing Agent & Campaign Context directives.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('generate')}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
        >
          + Schedule New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="glass-card glass-card-hover p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-mono font-semibold uppercase text-indigo-400 border border-white/10">
                  {item.channel}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'scheduled'
                      ? 'badge-high-confidence'
                      : item.status === 'pending'
                      ? 'badge-pending'
                      : item.status === 'approved'
                      ? 'badge-approved'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <h4 className="font-bold text-slate-100 text-sm leading-snug">{item.title}</h4>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400 font-mono">
              <span>📅 {item.date}</span>
              <button
                onClick={() => setActiveTab(item.status === 'pending' ? 'approvals' : 'publishing')}
                className="text-indigo-400 hover:text-indigo-300 font-sans font-semibold text-[11px]"
              >
                Inspect →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
