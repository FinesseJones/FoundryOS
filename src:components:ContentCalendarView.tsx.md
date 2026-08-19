'use client';

import { useState } from 'react';
import { ContentItem } from '@/lib/contentGenerator';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';

type PlatformColor = {
 instagram: { bg: string; text: string };
 twitter: { bg: string; text: string };
 linkedin: { bg: string; text: string };
 facebook: { bg: string; text: string };
 thread: { bg: string; text: string };
};

const COLORS: PlatformColor = {
 instagram: { bg: 'bg-pink-50 text-pink-800', text: 'text-pink-500' },
 twitter: { bg: 'bg-blue-50 text-blue-800', text: 'text-blue-500' },
 linkedin: { bg: 'bg-blue-600 text-white', text: 'text-blue-500' },
 facebook: { bg: 'bg-blue-700 text-white', text: 'text-blue-500' },
 thread: { bg: 'bg-gray-100 text-gray-800', text: 'text-gray-500' },
};

export default function ContentCalendarView({
 items,
 onSelect,
}: {
 items: ContentItem[];
 onSelect: (item: ContentItem) => void;
}) {
 const [view, setView] = useState<'week' | 'month'>('week');
 const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

 const filteredItems = items.filter(
   (item) => selectedPlatform === 'all' || item.platform === selectedPlatform
 );

 const grouped = filteredItems.reduce<Record<string, ContentItem[]>>((acc, item) => {
   acc[item.scheduledFor] = (acc[item.scheduledFor] || []).push(item) || [];
   return acc;
 }, {} as Record<string, ContentItem[]>);

 return (
   <div className="space-y-6">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
       <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
       <div className="flex gap-2">
         <Select
           value={selectedPlatform}
           onChange={(val) => setSelectedPlatform(val)}
           placeholder="All platforms"
           options={[
             { value: 'all', label: 'All' },
             { value: 'instagram', label: 'Instagram' },
             { value: 'twitter', label: 'Twitter' },
             { value: 'linkedin', label: 'LinkedIn' },
             { value: 'facebook', label: 'Facebook' },
             { value: 'thread', label: 'Threads' },
           ]}
         />
         <Button onClick={() => setView(view === 'week' ? 'month' : 'week')}>
           {view === 'week' ? 'Month' : 'Week'}
         </Button>
       </div>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
       {Object.entries(grouped).map(([date, dayItems]) => (
         <div key={date} className="space-y-3">
           <div className="text-center font-semibold text-gray-600 text-sm">
             {new Date(date).toLocaleDateString('en-US', {
               weekday: 'short',
               month: 'short',
               day: 'numeric',
             })}
           </div>
           {dayItems.map((item) => (
             <Card
               key={item.id}
               onClick={() => onSelect(item)}
               className="hover:border-blue-200"
             >
               <div className="flex items-center justify-between">
                 <Badge platform={item.platform} />
                 <span className="text-xs text-gray-400">{item.scheduledFor.split('-').join('/')}</span>
               </div>
               <p className="text-sm text-gray-700 line-clamp-2">{item.content}</p>
               <div className="flex gap-1 mt-2">
                 {item.tags.slice(0, 3).map((tag) => (
                   <span key={tag} className="text-xs text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">
                     {tag}
                   </span>
                 ))}
               </div>
             </Card>
           ))}
         </div>
       ))}
     </div>

     {filteredItems.length === 0 && (
       <div className="text-center py-16 text-gray-400">
         <p className="text-xl">No content scheduled for this view</p>
         <p className="mt-2">Generate a new calendar using the Brand Analysis tool</p>
       </div>
     )}
   </div>
 );
}