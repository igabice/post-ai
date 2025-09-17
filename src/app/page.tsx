
'use client';
import { useApp } from '@/context/app-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { user, isOnboardingCompleted } = useApp();

    useEffect(() => {
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

    return null; // Or a loading indicator
}
