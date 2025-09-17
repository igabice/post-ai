
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type OnboardingData = {
  name: string;
  signature: string;
  teamName: string;
  teamDescription: string;
  topicPreferences: string[];
  postFrequency: string;
};

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    signature: '',
    teamName: '',
    teamDescription: '',
    topicPreferences: [],
    postFrequency: '',
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
