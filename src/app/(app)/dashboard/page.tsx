import { StatsCards } from '@/components/dashboard/stats-cards';
import { EngagementChart } from '@/components/dashboard/engagement-chart';
import { TopPosts } from '@/components/dashboard/top-posts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>Impressions, Likes, and Retweets in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <EngagementChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your posts with the highest impressions.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopPosts />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-400" /> Optimal Posting Times</CardTitle>
            <CardDescription>Post at these times for maximum reach based on your audience activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                    <p className="font-bold text-primary">Weekdays</p>
                    <p className="text-sm">8:00 AM - 10:00 AM</p>
                    <p className="text-sm">4:00 PM - 6:00 PM</p>
                </div>
                 <div className="p-3 bg-accent/10 rounded-lg text-center">
                    <p className="font-bold text-accent-foreground/80">Weekends</p>
                    <p className="text-sm">11:00 AM - 1:00 PM</p>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
