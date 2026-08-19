import 'globals.css';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useState } from 'react';

export default function ContentCalendarView() {
 const [days, setDays] = useState<{ label: string; checked: boolean }[]>([
   { label: 'Monday', checked: true },
   { label: 'Tuesday', checked: true },
   { label: 'Wednesday', checked: true },
   { label: 'Thursday', checked: true },
   { label: 'Friday', checked: true },
   { label: 'Saturday', checked: false },
   { label: 'Sunday', checked: false },
 ]);

 const generate = () => {
   const posts: ContentPost[] = [];
   const activeDays = days.filter(d => d.checked);
   const postsPerWeek = activeDays.length;

   // For the demo
   const posts: ContentPost[] = [];
   activeDays.forEach((day) => {
     posts.push({
       id: Math.random().toString(36).substr(2, 9),
       platform: 'instagram',
       copy: 'Content post for ' + day.label,
       hashtag: ['#brand', '#marketing'],
       format: 'post' as PostFormat,
       scheduledAt: '',
       status: 'draft',
       analysisRef: '',
     });
   });

   return posts;
 };

 const posts = generate();

 return (
   <div>
     <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Calendar</h2>

     <Card className="p-6 mb-6">
       <div className="flex gap-2 flex-wrap">
         {days.map((day) => (
           <button
             key={day.label}
             onClick={() => {
               setDays(days.map(d => d.label === day.label ? { ...d, checked: !d.checked } : d));
             }}
             className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
               day.checked
                 ? 'bg-brand-600 text-white'
                 : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
             }`}
           >
             {day.label}
           </button>
         ))}
       </div>
     </Card>

     <div className="space-y-4">
       {posts.map((post) => (
         <Card key={post.id} className="p-4">
           <div className="flex items-center justify-between">
             <Badge>{post.platform}</Badge>
             <Badge variant="secondary">{post.format}</Badge>
           </div>
           <p className="mt-2 text-sm text-gray-600">{post.copy}</p>
           <div className="flex flex-wrap gap-2 mt-2">
             {post.hashtag.map((tag) => (
               <span key={tag} className="text-xs text-gray-400">{tag}</span>
             ))}
           </div>
         </Card>
       ))}
     </div>
   </div>
 );
