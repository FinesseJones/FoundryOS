import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
 title: 'Brand First',
 description: 'Analyze your brand. Build your content. Grow your audience.',
 openGraph: {
   title: 'Brand First',
   description: 'Analyze your brand. Build your content. Grow your audience.',
 },
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <html lang="en">
     <body>{children}</body>
   </html>
 );
}