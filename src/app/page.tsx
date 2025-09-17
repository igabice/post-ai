
'use client';
import { useApp } from '@/context/app-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { user, isOnboardingCompleted } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (user === null) {
            router.replace('/login');
        } else if (user) {
            if (isOnboardingCompleted) {
                router.replace('/calendar');
            } else {
                router.replace('/onboarding/step1');
            }
        }
        // If user is undefined, it means we're still waiting for the auth state, so we do nothing.
    }, [user, isOnboardingCompleted, router]);

    // Render nothing, or a loading spinner, while the initial auth check and redirect is happening.
    return null; 
}
