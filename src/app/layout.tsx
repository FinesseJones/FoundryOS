import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Brand First — AI Knowledge & Automation Platform',
  description: 'The canonical AI Knowledge Layer and Customer Portal for brand-first applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
