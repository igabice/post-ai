
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/onboarding-provider';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const step2Schema = z.object({
  teamName: z.string().min(3, 'Team name must be at least 3 characters.'),
  teamDescription: z.string().optional(),
});

export default function OnboardingStep2() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      teamName: onboardingData.teamName || (onboardingData.name ? `${onboardingData.name}'s Team` : ''),
      teamDescription: onboardingData.teamDescription,
    },
  });

  useEffect(() => {
    if (!onboardingData.name) {
      router.replace('/onboarding/step1');
    }
  }, [onboardingData.name, router]);

  const onSubmit = (data: z.infer<typeof step2Schema>) => {
    updateOnboardingData(data);
    router.push('/onboarding/step3');
  };

  return (
    <div className="space-y-6">
      <Progress value={66} className="mb-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Create your first team</CardTitle>
              <CardDescription>A team is a workspace for your content. You can create more later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marketing Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Content for our company's main brand." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Back</Button>
                <Button type="submit">Next</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
