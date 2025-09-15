'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, BarChart, Heart, Repeat } from 'lucide-react';

export function StatsCards() {
  const { posts } = useApp();

  const stats = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        if (post.status === 'Published') {
          acc.totalPosts += 1;
          acc.totalImpressions += post.analytics.impressions;
          acc.totalLikes += post.analytics.likes;
          acc.totalRetweets += post.analytics.retweets;
        }
        return acc;
      },
      {
        totalPosts: 0,
        totalImpressions: 0,
        totalLikes: 0,
        totalRetweets: 0,
      }
    );
  }, [posts]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const statItems = [
    { title: 'Total Posts', value: stats.totalPosts, icon: Book, color: 'text-blue-500' },
    { title: 'Total Impressions', value: stats.totalImpressions, icon: BarChart, color: 'text-purple-500' },
    { title: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'text-red-500' },
    { title: 'Total Retweets', value: stats.totalRetweets, icon: Repeat, color: 'text-green-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(item.value)}</div>
            <p className="text-xs text-muted-foreground">from published posts</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
