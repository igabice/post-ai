
'use client';
import { useApp } from '@/context/app-provider';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RootPage() {
    const { user, isOnboardingCompleted } = useApp();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // This check ensures we don't redirect until auth state is confirmed.
        if (user !== undefined) {
            setIsReady(true);
        }
    }, [user]);

    useEffect(() => {
        if (isReady) {
            if (user) {
                if (isOnboardingCompleted) {
                    redirect('/calendar');
                } else {
                    redirect('/onboarding/step1');
                }
            } else {
                redirect('/login');
            }
        }
    }, [isReady, user, isOnboardingCompleted]);

    return null; // Render nothing, or a loading spinner
}
