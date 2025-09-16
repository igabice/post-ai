
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDays, format } from 'date-fns';
import { CalendarIcon, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
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
import { generateContentPlan } from '../calendar/actions';

const availableDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeEntrySchema = z.object({
  time: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
    message: 'Invalid time format. Use HH:mm.',
  }),
});

const dayScheduleSchema = z.object({
  day: z.string(),
  times: z.array(timeEntrySchema),
});

const generatePlanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  tone: z.string().nonempty('Please select a tone.'),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  schedule: z.array(dayScheduleSchema).refine(
    (schedule) => schedule.some((day) => day.times.length > 0),
    {
      message: 'You have to select at least one time slot for one day.',
      path: ['schedule'],
    }
  ),
});

export function GeneratePlanForm() {
  const { user, setGeneratedPosts } = useApp();
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
      schedule: availableDays.map((day) => ({
        day,
        times: [],
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'schedule',
  });

  async function onSubmit(data: z.infer<typeof generatePlanSchema>) {
    startGeneration(async () => {
      const { dateRange, schedule } = data;
      const postDates: Date[] = [];

      let currentDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      currentDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        const dayIndex = currentDate.getDay();
        const dayName = availableDays[dayIndex];
        const daySchedule = schedule.find(s => s.day === dayName);
        
        if (daySchedule && daySchedule.times.length > 0) {
          daySchedule.times.forEach((timeEntry) => {
            const [hours, minutes] = timeEntry.time.split(':').map(Number);
            const postDate = new Date(currentDate);
            postDate.setHours(hours, minutes, 0, 0);
            if (postDate > new Date()) {
              postDates.push(postDate);
            }
          });
        }
        currentDate = addDays(currentDate, 1);
      }
      
      postDates.sort((a, b) => a.getTime() - b.getTime());

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
          postFrequency: `${postDates.length} posts over the selected period`,
          title: data.title,
          description: data.description,
          tone: data.tone,
        });

        if (result.posts && result.posts.length > 0) {
           const postsToPreview = result.posts.map((post, index) => {
             if (postDates[index]) {
               return {
                 ...post,
                 id: `temp-${index}`, // Temporary ID
                 date: postDates[index],
                 status: 'Draft' as const,
                 autoPublish: false,
                 analytics: { impressions: 0, likes: 0, retweets: 0 },
               };
             }
             return null;
           }).filter((p): p is NonNullable<typeof p> => p !== null);

          setGeneratedPosts(postsToPreview);
          router.push('/generate-plan/preview');

        } else {
          toast({
            title: 'Error',
            description: 'Could not generate a content plan. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error("Plan generation error:", error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred during plan generation. Please try again.',
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
                        onSelect={(range) => {
                           if (range) {
                             form.setValue('dateRange', range as { from: Date; to: Date; });
                           }
                        }}
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
              name="schedule"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Days & Times</FormLabel>
                    <FormDescription>Select the days and times you want to schedule posts for.</FormDescription>
                  </div>
                  <div className="space-y-4">
                    {fields.map((dayField, dayIndex) => {
                      const dayName = dayField.day;
                      const { fields: timeFields, append: appendTime, remove: removeTime } = useFieldArray({
                        control: form.control,
                        name: `schedule.${dayIndex}.times`,
                      });
                      
                      return (
                        <div key={dayField.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-center">
                            <FormLabel className="font-semibold">{dayName}</FormLabel>
                             <Button type="button" size="sm" variant="ghost" onClick={() => appendTime({ time: '09:00' })}>
                              <Plus className="mr-2 h-4 w-4" /> Add time
                            </Button>
                          </div>
                          {timeFields.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {timeFields.map((timeField, timeIndex) => (
                                <div key={timeField.id} className="flex items-center gap-2">
                                  <FormField
                                    control={form.control}
                                    name={`schedule.${dayIndex}.times.${timeIndex}.time`}
                                    render={({ field }) => (
                                      <FormItem className="flex-1">
                                        <FormControl>
                                          <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button type="button" size="icon" variant="ghost" onClick={() => removeTime(timeIndex)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Posts
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

    