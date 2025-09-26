
'use client';

import { AppProvider } from './app-provider';
import { OnboardingProvider } from './onboarding-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <OnboardingProvider>{children}</OnboardingProvider>
    </AppProvider>
  );
}
