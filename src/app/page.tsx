
'use client';
import { useApp } from '@/context/app-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { user, isOnboardingCompleted } = useApp();

    useEffect(() => {
        if (user === null) {
            redirect('/login');
        } else if (user) {
            if (isOnboardingCompleted) {
                redirect('/calendar');
            } else {
                redirect('/onboarding/step1');
            }
        }
        // If user is undefined, it means we're still waiting for the auth state, so we do nothing.
    }, [user, isOnboardingCompleted]);

    // Render nothing, or a loading spinner, while the initial auth check and redirect is happening.
    return null; 
}
