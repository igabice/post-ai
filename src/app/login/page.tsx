
'use client';

import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Chrome, Facebook } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithFacebook } = useApp();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter">
          Stop managing posts, start building a brand.
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Automate your social media with a content calendar, AI-powered planning, and post generation.
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Icons.Logo className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Choose your preferred provider to continue.
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
