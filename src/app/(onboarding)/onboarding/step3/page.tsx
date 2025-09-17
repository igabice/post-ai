
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/onboarding-provider';
import { useApp } from '@/context/app-provider';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const step3Schema = z.object({
  topicPreferences: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one topic.',
  }).refine((value) => value.length <= 3, {
    message: 'You can select up to 3 topics.',
  }),
  postFrequency: z.string({ required_error: 'Please select a posting frequency.' }),
});

export default function OnboardingStep3() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { availableTopics, availableFrequencies, completeOnboarding } = useApp();

  const form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      topicPreferences: onboardingData.topicPreferences,
      postFrequency: onboardingData.postFrequency,
    },
  });

  useEffect(() => {
    if (!onboardingData.teamName) {
      router.replace('/onboarding/step2');
    }
  }, [onboardingData.teamName, router]);

  const onSubmit = (data: z.infer<typeof step3Schema>) => {
    updateOnboardingData(data);
    const { name, signature, topicPreferences, postFrequency, teamName, teamDescription } = { ...onboardingData, ...data };
    
    completeOnboarding(
        { name, signature, topicPreferences, postFrequency },
        { name: teamName, description: teamDescription }
    );
    router.push('/onboarding/welcome');
  };

  return (
    <div className="space-y-6">
      <Progress value={100} className="mb-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Set your content preferences</CardTitle>
              <CardDescription>This will help us generate relevant content for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="topicPreferences"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Core Topic Preferences</FormLabel>
                      <FormDescription>Select up to 3 topics that best represent your brand.</FormDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {availableTopics.map((item) => {
                          const isSelected = field.value?.includes(item);
                          return (
                            <button
                                type="button"
                                key={item}
                                onClick={() => {
                                    const newValue = isSelected
                                    ? field.value?.filter((value) => value !== item)
                                    : [...(field.value || []), item];
                                    field.onChange(newValue);
                                }}
                                className={cn(
                                    "rounded-full border px-3 py-1 text-sm transition-colors",
                                    isSelected
                                    ? "bg-primary text-primary-foreground border-transparent"
                                    : "bg-background hover:bg-accent"
                                )}
                            >
                              {item}
                            </button>
                          );
                       })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Post Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select how often you want to post" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableFrequencies.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Back</Button>
                <Button type="submit">Finish</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
