
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarRange, Copy, Edit, Eye, MoreHorizontal, Sparkles, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function ContentPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { contentPlans, getPostById, deletePost, copyPost } = useApp();

  const planId = params.id as string;
  const plan = contentPlans.find(p => p.id === planId);

  if (!plan) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Content Plan not found</h1>
        <p className="text-muted-foreground">The requested content plan could not be located.</p>
        <Button asChild variant="link">
          <Link href="/content-plans">Go back to Content Plans</Link>
        </Button>
      </div>
    );
  }

  const posts = plan.postIds.map(id => getPostById(id)).filter((p): p is Post => !!p);

  const statusColors: { [key: string]: string } = {
    Published: 'bg-green-100 text-green-800 border-green-200',
    Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    'Needs Verification': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
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
  

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Content Plans
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{plan.title}</CardTitle>
          <CardDescription className="line-clamp-3">{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-2">
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
      </Card>
      
      <Separator />

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Posts in this Plan</h2>
        <Card>
            <CardContent className="p-0">
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
                        {posts.map(post => (
                            <TableRow key={post.id}>
                                <TableCell>{format(post.date, 'PPp')}</TableCell>
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
                                            <DropdownMenuItem onClick={() => router.push('/calendar')}>
                                                <Eye className="mr-2 h-4 w-4" /> View in Calendar
                                            </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => router.push('/calendar')}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCopyPost(post)}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
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
      </div>

    </div>
  );
}
