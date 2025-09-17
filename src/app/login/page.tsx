
'use client';

import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Chrome, Facebook, MessageSquare, Heart, Send, Repeat, BarChart2 } from 'lucide-react';

function DoodleBackground() {
    const icons = [
        { icon: <MessageSquare />, className: "top-[10%] left-[10%] rotate-[-15deg] w-12 h-12" },
        { icon: <Heart />, className: "top-[20%] right-[15%] rotate-[20deg] w-16 h-16 text-red-300" },
        { icon: <Send />, className: "bottom-[15%] left-[20%] rotate-[10deg] w-10 h-10" },
        { icon: <Repeat />, className: "bottom-[25%] right-[25%] rotate-[-5deg] w-14 h-14" },
        { icon: <BarChart2 />, className: "top-[50%] left-[30%] rotate-[25deg] w-12 h-12" },
        { icon: <MessageSquare />, className: "top-[60%] right-[10%] rotate-[15deg] w-8 h-8" },
        { icon: <Heart />, className: "bottom-[5%] right-[5%] rotate-[-10deg] w-10 h-10 text-red-200" },
    ];

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            {icons.map((item, index) => (
                <div key={index} className={`absolute text-foreground/50 ${item.className}`}>
                    {item.icon}
                </div>
            ))}
        </div>
    );
}


export default function LoginPage() {
  const { signInWithGoogle } = useApp();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
        <DoodleBackground />
      <div className="z-10 w-full flex flex-col items-center">
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
                Sign in with Google to continue.
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
            <Button onClick={signInWithGoogle} variant="destructive">
                <Chrome className="mr-2 h-4 w-4" />
                Sign in with Google
            </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
