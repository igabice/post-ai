
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/onboarding-provider';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  signature: z.string().optional(),
});

export default function OnboardingStep1() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: onboardingData.name,
      signature: onboardingData.signature,
    },
  });

  const onSubmit = (data: z.infer<typeof step1Schema>) => {
    updateOnboardingData(data);
    router.push('/onboarding/step2');
  };

  return (
    <div className="space-y-6">
        <Progress value={33} className="mb-8" />
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
            <CardHeader>
                <CardTitle>Welcome! Let's get to know you.</CardTitle>
                <CardDescription>Start by telling us your name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Signature (Optional)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g., Cheers, John | Building awesome things" {...field} />
                    </FormControl>
                    <FormDescription>This can be automatically appended to your posts.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit">Next</Button>
            </CardFooter>
            </Card>
        </form>
        </Form>
    </div>
  );
}
