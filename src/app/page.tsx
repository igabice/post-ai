
'use client';
import { useApp } from '@/context/app-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { user, isOnboardingCompleted } = useApp();
    const router = useRouter();

    useEffect(() => {
        // If user status is still being determined, do nothing.
        if (user === undefined) {
            return;
        }

        if (user === null) {
            router.replace('/login');
        } else {
            if (isOnboardingCompleted) {
                router.replace('/calendar');
            } else {
                router.replace('/onboarding/step1');
            }
        }
    }, [user, isOnboardingCompleted, router]);

    // Render a loading indicator or nothing while the initial auth check and redirect is happening.
    return null; 
}
