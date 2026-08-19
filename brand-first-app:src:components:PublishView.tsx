import 'globals.css';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export default function PublishView() {
 const posts: ContentPost[] = [
   {
     id: '1',
     platform: 'instagram',
     copy: 'Brand analysis complete. Here is what we found about our brand personality.',
     hashtag: ['#brand', '#analysis'],
     format: 'post' as PostFormat,
     scheduledAt: new Date().toISOString(),
     status: 'draft',
     analysisRef: '1',
   },
   {
     id: '2',
     platform: 'twitter',
     copy: 'Our brand is authoritative. Here is how we show it.',
     hashtag: ['#strategy', '#marketing'],
     format: 'post' as PostFormat,
     scheduledAt: new Date().toISOString(),
     status: 'draft',
     analysisRef: '1',
   },
   {
     id: '3',
     platform: 'linkedin',
     copy: 'Content strategy that actually works.',
     hashtag: ['#leadership', '#marketing'],
     format: 'post' as PostFormat,
     scheduledAt: new Date().toISOString(),
     status: 'draft',
     analysisRef: '1',
   },
 ];

 return (
   <div>
     <h2 className="text-2xl font-bold text-gray-900 mb-6">Publish</h2>
     <div className="space-y-4">
       {posts.map((post) => (
         <Card key={post.id} className="p-4">
           <div className="flex items-center justify-between">
             <Badge>{post.platform}</Badge>
             <Badge variant="secondary">{post.status}</Badge>
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
}