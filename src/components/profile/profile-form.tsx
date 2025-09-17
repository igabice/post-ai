
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  signature: z.string().optional(),
  postFrequency: z.string({
    required_error: 'Please select a posting frequency.',
  }),
  topicPreferences: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one topic.',
    })
    .refine((value) => value.length <= 3, {
      message: 'You can select up to 3 topics.',
    }),
});

export function ProfileForm() {
  const { user, updateProfile, availableTopics, availableFrequencies } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      postFrequency: '',
      topicPreferences: [],
      signature: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        postFrequency: user.postFrequency,
        topicPreferences: user.topicPreferences,
        signature: user.signature,
      });
    }
  }, [user, form]);

  function onSubmit(data: z.infer<typeof profileSchema>) {
    updateProfile(data);
    toast({
      title: 'Profile Updated',
      description: 'Your preferences have been saved successfully.',
    });
  }
  
  if (!user) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>Update your personal information and content preferences for the current team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your Name" {...field} />
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
                        <FormLabel>Signature</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Your signature to be appended to posts" {...field} />
                        </FormControl>
                        <FormDescription>This signature can be automatically appended to your new posts.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
            <CardFooter className="border-t px-6 py-4">
                 <Button type="submit">Save Changes</Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
