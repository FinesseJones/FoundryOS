import 'globals.css';
import type { ReactNode } from 'react';

export default function ProfileLayout({ children }: { children: ReactNode }) {
 return (
   <div className="min-h-screen p-4 md:p-6 bg-warm-100">
     <div className="max-w-4xl mx-auto">
       {children}
     </div>
   </div>
 );
}