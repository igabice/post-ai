
import type { Metadata } from 'next';
import { Providers } from '@/context/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Compass: AI Social Media Automation',
  description: "Don't spend time managing posts. Let's help you automate your social media with a content calendar, AI-powered planning, and post generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
