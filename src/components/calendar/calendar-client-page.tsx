'use client';

import React, { useState } from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { Calendar as CalendarIcon, List, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { TrendingTopicAlertsOutput } from '@/ai/flows/trending-topic-alerts';
import { useApp } from '@/context/app-provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostSheet } from './post-sheet';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';

type CalendarClientPageProps = {
  trendingTopicData: TrendingTopicAlertsOutput;
};

export function CalendarClientPage({ trendingTopicData }: CalendarClientPageProps) {
  const { posts } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);

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

  const handleUseTrend = () => {
    setSelectedDate(new Date());
    setActivePost({
      id: '', // Will be set on save
      date: new Date(),
      title: trendingTopicData.trendingTopic,
      content: trendingTopicData.tweetIdeas[0] || '',
      status: 'Draft',
      autoPublish: false,
      analytics: { likes: 0, retweets: 0, impressions: 0 },
    });
    setIsSheetOpen(true);
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

        <Card className="bg-accent/30 border-accent/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Trending Topic Alert
            </CardTitle>
            <CardDescription>{trendingTopicData.trendingTopic}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {trendingTopicData.tweetIdeas.map((idea, index) => (
                <p key={index} className="text-muted-foreground">{`- "${idea}"`}</p>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 bg-background" onClick={handleUseTrend}>
              Use this Idea
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
                  components={{
                    DayContent: ({ date }) => {
                      const postsForDay = posts.filter((p) => isSameDay(p.date, date));
                      if (postsForDay.length > 0) {
                        return (
                          <div className="relative h-full w-full flex items-center justify-center">
                            {format(date, 'd')}
                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                          </div>
                        );
                      }
                      return <>{format(date, 'd')}</>;
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
                                        <Badge variant="outline" className={cn("font-normal", statusColors[post.status])}>
                                          {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                                            Edit
                                        </Button>
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
