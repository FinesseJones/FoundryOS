import 'globals.css';
import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function HomePage() {
 return (
   <div className="min-h-screen p-4 md:p-6 bg-warm-100">
     <div className="max-w-4xl mx-auto">
       <Card className="p-6">
         <h1 className="text-4xl font-bold text-gray-900 mb-2">
           Brand First
         </h1>
         <p className="text-gray-500 text-lg mb-8">
           Analyze your brand personality. Generate content that actually matches who you are.
         </p>
         <div className="space-y-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center">
               <svg className="w-5 h-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                 <path d="M12 6v6" />
                 <path d="M12 12v6" />
               </svg>
             </div>
             <div>
               <h2 className="font-semibold">Brand Analysis</h2>
               <p className="text-sm text-gray-500">
                 Get a full personality breakdown from your website and content.
               </p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center">
               <svg className="w-5 h-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                 <rect x="3" y="3" width="7" height="7" />
                 <rect x="14" y="3" width="7" height="7" />
                 <rect x="14" y="14" width="7" height="7" />
                 <rect x="3" y="14" width="7" height="7" />
               </svg>
             </div>
             <div>
               <h2 className="font-semibold">Content Calendar</h2>
               <p className="text-sm text-gray-500">
                 Auto-generate posts tailored to your brand voice.
               </p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center">
               <svg className="w-5 h-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                 <circle cx="12" cy="12" r="10" />
                 <path d="M8 12h4" />
                 <path d="M12 8v4" />
               </svg>
             </div>
             <div>
               <h2 className="font-semibold">Platform Strategy</h2>
               <p className="text-sm text-gray-500">
                 Know exactly what to post on each platform.
               </p>
             </div>
           </div>
         </div>
         <div className="mt-8 pt-6 border-t border-gray-200">
           <Link href="/[slug]/[analyze]/[analyze]" className="inline-flex items-center gap-2 bg-brand-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-brand-700 transition">
             Get Started
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
               <path d="M13 5l4 4-4 4" />
             </svg>
           </Link>
         </div>
       </Card>
     </div>
   </div>
 );
}