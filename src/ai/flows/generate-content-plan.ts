
'use server';

/**
 * @fileOverview AI-powered content plan generator.
 *
 * - generateContentPlan - A function that generates a content plan for a week.
 * - GenerateContentPlanInput - The input type for the generateContentPlan function.
 * - GenerateContentPlanOutput - The return type for the generateContentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Post } from '@/lib/types';
import { addDays } from 'date-fns';

const GenerateContentPlanInputSchema = z.object({
  topicPreferences: z
    .array(z.string())
    .describe('User selected core topic preferences'),
  postFrequency: z
    .string()
    .describe(
      'The desired post frequency (e.g., 3x a week, 10x a month) that represents how often the user wants to post.'
    ),
    title: z.string().describe('The target title for the content series.'),
    description: z.string().describe('A detailed description of the content to be generated.'),
    tone: z.string().describe('The desired tone for the generated posts.'),
});
export type GenerateContentPlanInput = z.infer<
  typeof GenerateContentPlanInputSchema
>;

const PostSchema = z.object({
  title: z.string().describe("Title of the post (for internal tracking)."),
  content: z.string().describe("The full content of the tweet."),
  dayOffset: z.number().describe("The number of days from today to schedule the post."),
  autoPublish: z.boolean().describe("Whether the post should be auto-published."),
  status: z.enum(['Draft', 'Scheduled', 'Published', 'Needs Verification']).describe("The status of the post."),
});

const GenerateContentPlanOutputSchema = z.object({
  posts: z.array(PostSchema).describe('A list of generated posts for the content plan.'),
});
export type GenerateContentPlanOutput = z.infer<
  typeof GenerateContentPlanOutputSchema
>;


const generateContentPlanPrompt = ai.definePrompt({
  name: 'generateContentPlanPrompt',
  input: {schema: GenerateContentPlanInputSchema},
  output: {schema: GenerateContentPlanOutputSchema},
  prompt: `You are an AI assistant designed to help users create a content plan based on a central theme.

  The user wants to create a series of posts with the target title: "{{title}}".
  Here is the description of the content they want: "{{description}}".
  The desired tone for the posts is: "{{tone}}".

  The user has the following topic preferences: {{topicPreferences}}
  The user wants to post {{postFrequency}}.

  Generate a list of tweet ideas based on the provided title, description, and tone. The posts should feel like a cohesive series but each should be unique and stand on its own.

  For each post, provide:
  - A title (for internal tracking, it should be a variation of the main title e.g. "{{title}} - Part 1")
  - The tweet content.
  - A dayOffset from today (a unique number for each post, starting from 1).
  - A status for the post (should be 'Draft').
  - An autoPublish recommendation (always false).

  The tweet ideas should sound natural, be engaging, and be relevant to the user's chosen topics and the provided context.
  `,
});


const generateContentPlanFlow = ai.defineFlow(
  {
    name: 'generateContentPlanFlow',
    inputSchema: GenerateContentPlanInputSchema,
    outputSchema: z.object({ posts: z.array(z.any()) }),
  },
  async (input) => {
    const { output } = await generateContentPlanPrompt(input);
    if (!output || !output.posts) {
        return { posts: [] };
    }

    const today = new Date();
    const plannedPosts: Omit<Post, 'id' | 'analytics'>[] = output.posts.map(p => ({
        ...p,
        date: addDays(today, p.dayOffset),
    }));

    return { posts: plannedPosts };
  }
);


// Wrapper function to be called from the client
export async function generateContentPlan(input: GenerateContentPlanInput): Promise<{ posts: Omit<Post, 'id' | 'analytics'>[] }> {
    return generateContentPlanFlow(input);
}
