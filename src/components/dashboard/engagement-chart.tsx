'use client';

import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useApp } from '@/context/app-provider';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

export function EngagementChart() {
  const { posts } = useApp();

  const chartData = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const publishedPosts = posts.filter(
      (post) => post.status === 'Published' && post.date >= last30Days
    );

    const dataByDay: { [key: string]: { impressions: number; likes: number; retweets: number } } = {};

    for (let i = 0; i < 30; i++) {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'MMM d');
        dataByDay[formattedDate] = { impressions: 0, likes: 0, retweets: 0 };
    }

    publishedPosts.forEach((post) => {
      const day = format(post.date, 'MMM d');
      if (dataByDay[day]) {
        dataByDay[day].impressions += post.analytics.impressions;
        dataByDay[day].likes += post.analytics.likes;
        dataByDay[day].retweets += post.analytics.retweets;
      }
    });

    return Object.entries(dataByDay)
      .map(([name, values]) => ({ name, ...values }))
      .reverse();
  }, [posts]);

  const chartConfig = {
    impressions: {
      label: 'Impressions',
      color: 'hsl(var(--chart-1))',
    },
    likes: {
      label: 'Likes',
      color: 'hsl(var(--chart-2))',
    },
     retweets: {
      label: 'Retweets',
      color: 'hsl(var(--chart-3))',
    },
  };
  
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-video">
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => value > 1000 ? `${value/1000}k` : value}/>
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="impressions" stroke={chartConfig.impressions.color} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="likes" stroke={chartConfig.likes.color} strokeWidth={2} dot={false} />
         <Line type="monotone" dataKey="retweets" stroke={chartConfig.retweets.color} strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
