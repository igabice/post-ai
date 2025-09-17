import type { Metadata } from 'next';
import { AppProvider } from '@/context/app-provider';
import { OnboardingProvider } from '@/context/onboarding-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Compass',
  description: 'Your strategic content planning and discovery tool.',
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
        <AppProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
