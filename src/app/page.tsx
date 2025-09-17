
'use client';
import { useApp } from '@/context/app-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { user, isOnboardingCompleted } = useApp();

    useEffect(() => {
        // useApp provider now handles the initial undefined state.
        // So we can directly check for user object or null.
        if (user) {
            if (isOnboardingCompleted) {
                redirect('/calendar');
            } else {
                redirect('/onboarding/step1');
            }
        } else {
            redirect('/login');
        }
    }, [user, isOnboardingCompleted]);

    // Render nothing, or a loading spinner, while the redirect is happening.
    return null; 
}
