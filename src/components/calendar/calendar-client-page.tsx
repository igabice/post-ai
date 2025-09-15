'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, List, Plus, Sparkles, Loader2, MoreHorizontal, Copy, Trash2, Pencil, ChevronDown, X, Eye } from 'lucide-react';
import { useApp } from '@/context/app-provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PostSheet } from './post-sheet';
import type { Post, PostStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateContentPlan } from './actions';
import { Separator } from '../ui/separator';

export function CalendarClientPage() {
  const { posts, addPost, user, deletePost, copyPost } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isGeneratingPlan, startPlanGeneration] = useTransition();
  const [isPostListDialogOpen, setIsPostListDialogOpen] = useState(false);
  const [postsForSelectedDay, setPostsForSelectedDay] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    const postsForDay = posts.filter((p) => isSameDay(p.date, date));
    
    if (postsForDay.length > 1) {
      setPostsForSelectedDay(postsForDay);
      setIsPostListDialogOpen(true);
    } else if (postsForDay.length === 1) {
      handleViewPost(postsForDay[0]);
    } else {
      setActivePost(null);
      setIsSheetOpen(true);
    }
  };

  const handleViewPost = (post: Post) => {
    setActivePost(post);
    setIsViewDialogOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedDate(post.date);
    setActivePost(post);
    setIsSheetOpen(true);
  };
  
  const handleNewPost = (date?: Date) => {
    setSelectedDate(date || new Date());
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

  const filteredPosts = useMemo(() => posts
    .filter(post => {
      const statusMatch = statusFilter === 'All' || post.status === statusFilter;
      
      let dateMatch = true;
      if (dateRange?.from) {
        const from = new Date(dateRange.from);
        from.setHours(0,0,0,0);
        const to = dateRange.to ? new Date(dateRange.to) : from;
        to.setHours(23, 59, 59, 999);
        dateMatch = post.date >= from && post.date <= to;
      }

      return statusMatch && dateMatch;
    }), [posts, statusFilter, dateRange]);


  const statusColors: { [key: string]: string } = {
    Published: 'bg-green-100 text-green-800 border-green-200',
    Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    'Needs Verification': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const hasFilters = statusFilter !== 'All' || !!dateRange;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <Button onClick={() => handleNewPost()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        <Card>
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
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" /> Calendar View</TabsTrigger>
              <TabsTrigger value="list"><List className="mr-2 h-4 w-4" /> List View</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex items-center justify-between min-h-[40px] mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                  {hasFilters && (
                      <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('All'); setDateRange(undefined); }}>
                          <X className="mr-2 h-4 w-4" />
                          Clear all filters
                      </Button>
                  )}
                  {statusFilter !== 'All' && (
                    <Badge variant="secondary" className="pl-2 pr-1 h-7">
                      Status: {statusFilter}
                      <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => setStatusFilter('All')}>
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove status filter</span>
                      </Button>
                    </Badge>
                  )}
                  {dateRange?.from && (
                    <Badge variant="secondary" className="pl-2 pr-1 h-7">
                        {dateRange.to ? `${format(dateRange.from, "LLL d")} - ${format(dateRange.to, "LLL d")}` : format(dateRange.from, "LLL d")}
                       <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => setDateRange(undefined)}>
                          <X className="h-3 w-3" />
                           <span className="sr-only">Remove date filter</span>
                      </Button>
                    </Badge>
                  )}
              </div>
              <div className="text-sm text-muted-foreground hidden sm:block">
                  {filteredPosts.length} post{filteredPosts.length !== 1 && 's'} found
              </div>
          </div>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="p-0"
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4 w-full',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-background/80 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-full w-full p-0 font-normal aria-selected:opacity-100',
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      const postsForDay = filteredPosts.filter((p) => isSameDay(p.date, date));
                      return (
                        <button
                          className={cn(
                            "relative flex flex-col h-full w-full p-1 text-left",
                            selectedDate && isSameDay(date, selectedDate) && "bg-secondary"
                          )}
                          onClick={() => handleDateSelect(date)}
                        >
                          <span className={cn(props.className, 'h-auto p-0 text-xs sm:text-sm')} >
                            {format(date, 'd')}
                          </span>
                           {postsForDay.length > 0 && (
                            <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                                {postsForDay.slice(0, 2).map(post => (
                                    <div 
                                        key={post.id} 
                                        className={cn(
                                          "w-full text-left text-[10px] sm:text-xs rounded-sm p-0.5 whitespace-normal break-words",
                                          statusColors[post.status]
                                         )}
                                    >
                                        {post.title}
                                    </div>
                                ))}
                                {postsForDay.length > 2 && (
                                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                                        + {postsForDay.length - 2} more
                                    </div>
                                )}
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
                                <TableHead className="flex items-center gap-1">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="date"
                                        variant={"ghost"}
                                        className={cn(
                                          "p-1 h-auto font-medium justify-start",
                                          !dateRange && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                          dateRange.to ? (
                                            <>
                                              {format(dateRange.from, "LLL dd, y")} -{" "}
                                              {format(dateRange.to, "LLL dd, y")}
                                            </>
                                          ) : (
                                            format(dateRange.from, "LLL dd, y")
                                          )
                                        ) : (
                                          <span>Date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  {dateRange && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => setDateRange(undefined)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="p-1 h-auto font-medium">
                                        Status <ChevronDown className="ml-1 h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      {['All', 'Draft', 'Needs Verification', 'Scheduled', 'Published'].map(status => (
                                        <DropdownMenuCheckboxItem
                                          key={status}
                                          checked={statusFilter === status}
                                          onSelect={() => setStatusFilter(status as PostStatus | 'All')}
                                        >
                                          {status}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPosts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell>{format(post.date, 'Pp')}</TableCell>
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
                                                <DropdownMenuItem onClick={() => handleViewPost(post)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCopyPost(post)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Copy
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePost(post.id)}>
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

       <Dialog open={isPostListDialogOpen} onOpenChange={setIsPostListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Posts for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</DialogTitle>
            <DialogDescription>Select a post to view or edit, or create a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {postsForSelectedDay.map(post => (
              <Button
                key={post.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setIsPostListDialogOpen(false);
                  handleViewPost(post);
                }}
              >
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className={cn("font-normal border-border h-5", statusColors[post.status])}>
                        {post.status}
                    </Badge>
                    <span className="truncate">{post.title}</span>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPostListDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsPostListDialogOpen(false);
              handleNewPost(selectedDate);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Create New Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {activePost && (
            <>
              <DialogHeader>
                <DialogTitle>{activePost.title}</DialogTitle>
                <DialogDescription>
                  {format(activePost.date, 'MMMM d, yyyy, p')}
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="prose prose-sm dark:prose-invert max-w-none py-4 whitespace-pre-wrap">
                {activePost.content}
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <Badge variant="outline" className={cn("font-normal border-border", statusColors[activePost.status])}>
                    {activePost.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Auto-publish:</span>
                  <Badge variant={activePost.autoPublish ? 'default' : 'secondary'}>
                    {activePost.autoPublish ? 'On' : 'Off'}
                  </Badge>
                </div>
              </div>
               {activePost.status === 'Published' && (
                <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Analytics</h4>
                  <div className="flex justify-around text-center">
                    <div>
                      <p className="text-2xl font-bold">{activePost.analytics.impressions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Impressions</p>
                    </div>
                     <div>
                      <p className="text-2xl font-bold">{activePost.analytics.likes.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                     <div>
                      <p className="text-2xl font-bold">{activePost.analytics.retweets.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Retweets</p>
                    </div>
                  </div>
                </div>
                </>
              )}
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditPost(activePost);
                }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

    