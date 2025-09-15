
'use client';

import React, { useState, useTransition } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, List, Plus, Sparkles, Loader2, MoreHorizontal, Copy, Trash2, Pencil } from 'lucide-react';
import { useApp } from '@/context/app-provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PostSheet } from './post-sheet';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateContentPlan } from './actions';

export function CalendarClientPage() {
  const { posts, addPost, user, deletePost, copyPost } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isGeneratingPlan, startPlanGeneration] = useTransition();
  const { toast } = useToast();


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setActivePost(null);
    setIsSheetOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedDate(post.date);
    setActivePost(post);
    setIsSheetOpen(true);
  };
  
  const handleNewPost = () => {
    setSelectedDate(new Date());
    setActivePost(null);
    setIsSheetOpen(true);
  };

  const handleCopyPost = (post: Post) => {
    copyPost(post.id);
    toast({
      title: 'Post Copied',
      description: `A copy of "${post.title}" has been created as a draft.`,
    });
  };
  
  const handleDeletePost = (postId: string) => {
    deletePost(postId);
     toast({
      title: 'Post Deleted',
      description: 'The post has been successfully deleted.',
    });
  };

  const handleGeneratePlan = () => {
    startPlanGeneration(async () => {
        const result = await generateContentPlan({
            topicPreferences: user.topicPreferences,
            postFrequency: user.postFrequency,
        });

        if(result.posts) {
            result.posts.forEach(post => {
                addPost({
                    ...post,
                    id: new Date().toISOString() + Math.random(),
                    analytics: { likes: 0, retweets: 0, impressions: 0 },
                });
            });
            toast({
                title: 'Content Plan Generated',
                description: `${result.posts.length} new posts have been added to your calendar as drafts.`
            });
        } else {
             toast({
                title: 'Error',
                description: 'Could not generate a content plan. Please try again.',
                variant: 'destructive',
            });
        }
    });
  }


  const statusColors: { [key: string]: string } = {
    Published: 'bg-green-100 text-green-800 border-green-200',
    Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    'Needs Verification': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <Button onClick={handleNewPost}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles />
              Generate Content Plan
            </CardTitle>
            <CardDescription>
              Let AI create a week's worth of content ideas based on your profile preferences.
              Posts will be added as drafts for you to review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGeneratePlan} disabled={isGeneratingPlan}>
              {isGeneratingPlan ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Weekly Plan
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" /> Calendar View</TabsTrigger>
            <TabsTrigger value="list"><List className="mr-2 h-4 w-4" /> List View</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full"
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full p-4',
                    month: 'space-y-4 w-full',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex w-full',
                    head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'h-full w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-background/80 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-full w-full p-2 font-normal aria-selected:opacity-100',
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      const postsForDay = posts.filter((p) => isSameDay(p.date, date));
                      return (
                        <button
                          className={cn(
                            "relative flex flex-col h-24 w-full p-2 text-left",
                            isSameDay(date, selectedDate || new Date()) && "bg-secondary"
                          )}
                          onClick={() => handleDateSelect(date)}
                        >
                          <span {...props} >
                            {format(date, 'd')}
                          </span>
                           {postsForDay.length > 0 && (
                            <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                                {postsForDay.map(post => (
                                    <button 
                                        key={post.id} 
                                        className={cn(
                                          "w-full text-left text-xs rounded-md p-1 hover:bg-muted",
                                          statusColors[post.status]
                                         )}
                                        onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                                    >
                                        {post.title}
                                    </button>
                                ))}
                            </div>
                           )}
                        </button>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list">
             <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.sort((a, b) => b.date.getTime() - a.date.getTime()).map(post => (
                                <TableRow key={post.id}>
                                    <TableCell>{format(post.date, 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <p className="font-medium">{post.title}</p>
                                        <p className="text-sm text-muted-foreground truncate max-w-xs">{post.content}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("font-normal border-border", statusColors[post.status])}>
                                          {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">More</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCopyPost(post)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Copy
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleDeletePost(post.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PostSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        post={activePost}
        selectedDate={selectedDate}
      />
    </>
  );
}
