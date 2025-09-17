
'use client';
import { useApp } from '@/context/app-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { isOnboardingCompleted } = useApp();

    useEffect(() => {
        if (isOnboardingCompleted) {
            redirect('/calendar');
        } else {
            redirect('/onboarding/step1');
        }
    }, [isOnboardingCompleted]);

    return null; // Or a loading indicator
}
