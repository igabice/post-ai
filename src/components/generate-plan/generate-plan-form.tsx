'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDays, format } from 'date-fns';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import { generateContentPlan } from '../calendar/actions';

const availableDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const generatePlanSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    description: z.string().min(10, 'Description must be at least 10 characters.'),
    tone: z.string().nonempty('Please select a tone.'),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
    days: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: 'You have to select at least one day.',
    }),
    time: z.string().refine((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date > new Date();
    }, { message: 'Time must be in the future.'}),
});

export function GeneratePlanForm() {
  const { addPost, user } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, startGeneration] = useTransition();

  const form = useForm<z.infer<typeof generatePlanSchema>>({
    resolver: zodResolver(generatePlanSchema),
    defaultValues: {
      title: '',
      description: '',
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
      days: ['Monday', 'Wednesday', 'Friday'],
      time: '09:00',
    },
  });

  async function onSubmit(data: z.infer<typeof generatePlanSchema>) {
    startGeneration(async () => {
        const { dateRange, days, time } = data;
        const dayIndexes = days.map(d => availableDays.indexOf(d));
        
        let currentDate = new Date(dateRange.from);
        const endDate = new Date(dateRange.to);
        
        const postDates: Date[] = [];

        while(currentDate <= endDate) {
            if (dayIndexes.includes(currentDate.getDay())) {
                const [hours, minutes] = time.split(':').map(Number);
                const postDate = new Date(currentDate);
                postDate.setHours(hours, minutes, 0, 0);
                if(postDate > new Date()){
                    postDates.push(postDate);
                }
            }
            currentDate = addDays(currentDate, 1);
        }

        if (postDates.length === 0) {
            toast({
                title: 'No dates selected',
                description: 'Please select at least one valid future date to generate posts.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const result = await generateContentPlan({
                topicPreferences: user.topicPreferences,
                postFrequency: `${postDates.length} posts`,
            });
    
            if(result.posts && result.posts.length > 0) {
                result.posts.forEach((post, index) => {
                    if (postDates[index]) {
                         addPost({
                            ...post,
                            title: `${data.title} - Part ${index + 1}`,
                            date: postDates[index],
                            status: 'Draft',
                            autoPublish: false,
                        });
                    }
                });
                toast({
                    title: 'Content Plan Generated!',
                    description: `${result.posts.length} new posts have been added to your calendar as drafts.`
                });
                router.push('/calendar');
            } else {
                 toast({
                    title: 'Error',
                    description: 'Could not generate a content plan. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
             toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>Content Details</CardTitle>
                <CardDescription>Provide the AI with context for the content you want to create.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Weekly Tech Roundup" {...field} />
                            </FormControl>
                            <FormDescription>This will be used as a base title for the generated posts.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the content you want to generate. e.g., A series of tweets about the latest advancements in AI." {...field} />
                            </FormControl>
                            <FormDescription>A detailed description helps the AI generate more relevant content.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tone for the content" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Playful">Playful</SelectItem>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                    <SelectItem value="Casual">Casual</SelectItem>
                                    <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                                    <SelectItem value="Serious">Serious</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <CardTitle>Scheduling</CardTitle>

                <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date range</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !field.value.from && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value.from ? (
                                        field.value.to ? (
                                        <>
                                            {format(field.value.from, "LLL dd, y")} -{" "}
                                            {format(field.value.to, "LLL dd, y")}
                                        </>
                                        ) : (
                                        format(field.value.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value.from}
                                    selected={{ from: field.value.from, to: field.value.to }}
                                    onSelect={field.onChange as (range: DateRange | undefined) => void}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Select the start and end date for your content plan.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="days"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Days of the week</FormLabel>
                            <FormDescription>Select the days you want to schedule posts for.</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {availableDays.map((item) => (
                            <FormField
                                key={item}
                                control={form.control}
                                name="days"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...field.value, item])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== item
                                                    )
                                                    );
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item}</FormLabel>
                                    </FormItem>
                                );
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time of day</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} className="w-[120px]" />
                            </FormControl>
                            <FormDescription>Set the time for the scheduled posts.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                 <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate & Schedule Posts
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
