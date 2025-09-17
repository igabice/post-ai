
'use client';

import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Chrome, Facebook } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithFacebook } = useApp();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Icons.Logo className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Welcome to Content Compass</CardTitle>
          <CardDescription>
            Automate your social media with a content calendar, AI-powered planning, and post generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" onClick={signInWithGoogle}>
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <Button variant="outline" onClick={signInWithFacebook}>
            <Facebook className="mr-2 h-4 w-4" />
            Sign in with Facebook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
