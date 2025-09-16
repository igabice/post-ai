
'use client';

import { useApp } from '@/context/app-provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CalendarRange } from 'lucide-react';
import { format } from 'date-fns';

export default function ContentPlansPage() {
  const { contentPlans } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Plans</h1>
            <p className="text-muted-foreground">
                View and manage your AI-generated content series.
            </p>
        </div>
        <Button asChild>
            <Link href="/generate-plan">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content Plan
            </Link>
        </Button>
      </div>
      
      {contentPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contentPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="truncate" title={plan.title}>{plan.title}</CardTitle>
                <CardDescription>Generated on {format(plan.createdAt, 'MMMM d, yyyy')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground line-clamp-3">{plan.description}</p>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <CalendarRange className="h-4 w-4" />
                        <span>{format(plan.startDate, 'MMM d')} - {format(plan.endDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{plan.tone} Tone</Badge>
                        <Badge variant="secondary">{plan.postIds.length} Posts</Badge>
                    </div>
                 </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/calendar">View Posts in Calendar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <Card className="text-center py-12">
            <CardContent>
                <h3 className="text-xl font-semibold">No Content Plans Yet</h3>
                <p className="text-muted-foreground mt-2 mb-6">Get started by generating your first content plan with AI.</p>
                <Button asChild>
                    <Link href="/generate-plan">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Your First Plan
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
