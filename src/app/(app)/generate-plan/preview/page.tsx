
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar, Check, ChevronsUpDown, Trash2, X } from 'lucide-react';

import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Post, PostStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  date: z.date(),
  status: z.enum(['Draft', 'Scheduled', 'Published', 'Needs Verification']),
  autoPublish: z.boolean(),
});

const formSchema = z.object({
  posts: z.array(postSchema),
});

export default function PreviewPlanPage() {
  const { generatedPosts, addPost, addContentPlan, setGeneratedPosts } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posts: [],
    },
  });

  const { fields, remove, update } = useFieldArray({
    control: form.control,
    name: 'posts',
  });

  useEffect(() => {
    if (!generatedPosts || generatedPosts.length === 0) {
      router.replace('/generate-plan');
    } else {
      form.reset({ posts: generatedPosts });
    }
  }, [generatedPosts, router, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const newPostIds: string[] = [];
    data.posts.forEach((post) => {
      const { id, ...postData } = post; // remove temporary id
      const newPost = addPost(postData);
      newPostIds.push(newPost.id);
    });

    const planTitle = searchParams.get('title');
    const planDescription = searchParams.get('description');
    const planTone = searchParams.get('tone');

    if (planTitle && planDescription && planTone) {
        addContentPlan({
            title: planTitle,
            description: planDescription,
            tone: planTone,
            postIds: newPostIds,
        });
    }

    toast({
      title: 'Content Plan Scheduled!',
      description: `${data.posts.length} new posts have been added to your calendar.`,
    });
    setGeneratedPosts([]); // Clear the temporary posts
    router.push('/content-plans');
  };

  if (!generatedPosts || generatedPosts.length === 0) {
    return null; // Or a loading indicator
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preview & Schedule</h1>
        <p className="text-muted-foreground">
          Review and edit your AI-generated posts before scheduling them.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Post {index + 1}</CardTitle>
                  <CardDescription>{format(form.getValues(`posts.${index}.date`), 'MMMM d, yyyy @ h:mm a')}</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete Post</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor={`posts.${index}.title`}>Title</label>
                    <Input id={`posts.${index}.title`} {...form.register(`posts.${index}.title`)} />
                </div>
                <div className="space-y-2">
                    <label htmlFor={`posts.${index}.content`}>Content</label>
                    <Textarea id={`posts.${index}.content`} {...form.register(`posts.${index}.content`)} className="min-h-[100px]" />
                </div>
                <div className="flex items-center gap-4">
                    <Controller
                        control={form.control}
                        name={`posts.${index}.status`}
                        render={({ field }) => (
                            <div className="flex items-center gap-2">
                                <label>Status:</label>
                                <Badge variant={field.value === 'Draft' ? 'outline' : 'default'}>{field.value}</Badge>
                            </div>
                        )}
                    />
                     <Controller
                        control={form.control}
                        name={`posts.${index}.autoPublish`}
                        render={({ field }) => (
                            <div className="flex items-center gap-2">
                                <label>Auto-publish:</label>
                                <Badge variant={field.value ? 'default' : 'secondary'}>{field.value ? 'On' : 'Off'}</Badge>
                            </div>
                        )}
                    />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6">
            <CardFooter className="flex justify-end gap-2 p-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Schedule All Posts</Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
