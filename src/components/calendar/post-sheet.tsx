'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Sparkles, Loader2 } from 'lucide-react';

import { useApp } from '@/context/app-provider';
import { getFollowUpSuggestions, getTrendingTopics } from '@/components/calendar/actions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Post, PostStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

type PostSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: Post | null;
  selectedDate?: Date;
};

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  date: z.date(),
  autoPublish: z.boolean(),
  status: z.enum(['Draft', 'Scheduled', 'Published', 'Needs Verification']),
});

export function PostSheet({ isOpen, setIsOpen, post, selectedDate }: PostSheetProps) {
  const { addPost, updatePost, user } = useApp();
  const { toast } = useToast();
  const [isAiPending, startAiTransition] = useTransition();
  const [isAutofillPending, startAutofillTransition] = useTransition();
  const [followUpIdeas, setFollowUpIdeas] = useState<string[]>([]);
  
  const { register, handleSubmit, control, reset, watch, setValue } = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      date: selectedDate || new Date(),
      autoPublish: false,
      status: 'Draft',
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
        date: post.date,
        autoPublish: post.autoPublish,
        status: post.status,
      });
    } else {
      reset({
        title: '',
        content: '',
        date: selectedDate || new Date(),
        autoPublish: false,
        status: 'Draft',
      });
    }
    setFollowUpIdeas([]);
  }, [post, selectedDate, reset, isOpen]);

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    if (post) {
      updatePost(post.id, data);
      toast({ title: 'Post updated', description: 'Your post has been successfully updated.' });
    } else {
      addPost(data);
      toast({ title: 'Post created', description: 'Your new post has been saved as a draft.' });
    }
    setIsOpen(false);
  };

  const handleGenerateFollowUps = () => {
    startAiTransition(async () => {
      const result = await getFollowUpSuggestions({
        initialTweet: watchedContent,
        trendingTopic: watchedTitle,
        topicPreferences: user.topicPreferences,
        postFrequency: user.postFrequency,
      });
      setFollowUpIdeas(result.followUpSuggestions);
    });
  };

  const handleAutofill = () => {
    startAutofillTransition(async () => {
       const result = await getTrendingTopics({
        topicPreferences: user.topicPreferences,
        postFrequency: user.postFrequency,
      });
      if (result.trendingTopic && result.tweetIdeas.length > 0) {
        setValue('title', result.trendingTopic);
        setValue('content', result.tweetIdeas[0]);
        toast({ title: 'Content Suggested', description: 'AI has filled in the title and content for you.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate AI suggestions.' });
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>{post ? 'Edit Post' : 'Create Post'}</SheetTitle>
          <SheetDescription>
            {post ? 'Make changes to your post here.' : 'Craft your new post. Click save when you\'re done.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 overflow-y-auto p-1">
          <Button variant="secondary" type="button" onClick={handleAutofill} disabled={isAutofillPending}>
              {isAutofillPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Auto-fill with AI suggestion
          </Button>

          <div className="space-y-2">
            <Label htmlFor="title">Title (for internal tracking)</Label>
            <Input id="title" {...register('title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" {...register('content')} className="min-h-[120px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Date</Label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button
                              variant={'outline'}
                              className="w-full justify-start text-left font-normal"
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                           <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                     </Popover>
                  )}
                />
             </div>
             <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                            {(['Draft', 'Needs Verification', 'Scheduled'] as PostStatus[]).map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  )}
                />
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="autoPublish"
              render={({ field }) => (
                <Switch id="auto-publish" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="auto-publish">Auto-publish</Label>
          </div>
          
          <Separator className="my-2" />

          <div className="space-y-4">
            <h3 className="text-md font-semibold flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4"/> AI Suggestions
            </h3>
            <Button variant="secondary" type="button" onClick={handleGenerateFollowUps} disabled={isAiPending || !watchedContent}>
              {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Follow-up Ideas
            </Button>
            {followUpIdeas.length > 0 && (
              <div className="space-y-2 rounded-md border p-4">
                <h4 className="font-medium">Follow-up Thread Ideas:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {followUpIdeas.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
        <SheetFooter className="mt-auto pt-4 border-t">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
