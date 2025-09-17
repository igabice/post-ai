
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-provider';
import { useEffect } from 'react';

export default function WelcomePage() {
    const router = useRouter();
    const { user } = useApp();

    useEffect(() => {
        if (!user || !user.isOnboardingCompleted) {
            // Redirect if user is not logged in or hasn't finished onboarding
            router.replace('/onboarding/step1');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

  return (
    <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="mt-4">You're all set, {user.name}!</CardTitle>
            <CardDescription>Your profile and preferences have been saved. You're ready to start creating amazing content.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                You can always update your preferences later in your profile settings.
            </p>
        </CardContent>
        <CardFooter className="justify-center">
            <Button asChild>
                <Link href="/calendar">Start Creating Posts</Link>
            </Button>
        </CardFooter>
    </Card>
  );
}
