'use server';

/**
 * @fileOverview An AI agent that monitors trending topics and generates tweet ideas.
 *
 * - getTrendingTopicAlerts - A function that retrieves trending topics and generates tweet ideas.
 * - TrendingTopicAlertsInput - The input type for the getTrendingTopicAlerts function.
 * - TrendingTopicAlertsOutput - The return type for the getTrendingTopicAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingTopicAlertsInputSchema = z.object({
  topicPreferences: z
    .array(z.string())
    .describe('List of topics that the user is interested in.'),
  postFrequency: z
    .string()
    .describe(
      'The desired post frequency (e.g., 3x a week, 10x a month) to tailor content suggestions.'
    ),
});
export type TrendingTopicAlertsInput = z.infer<typeof TrendingTopicAlertsInputSchema>;

const TrendingTopicAlertsOutputSchema = z.object({
  trendingTopic: z.string().describe('The trending topic.'),
  tweetIdeas: z.array(z.string()).describe('AI-generated tweet ideas for the trending topic.'),
});
export type TrendingTopicAlertsOutput = z.infer<typeof TrendingTopicAlertsOutputSchema>;

export async function getTrendingTopicAlerts(
  input: TrendingTopicAlertsInput
): Promise<TrendingTopicAlertsOutput> {
  return trendingTopicAlertsFlow(input);
}

const trendingTopicAlertsPrompt = ai.definePrompt({
  name: 'trendingTopicAlertsPrompt',
  input: {schema: TrendingTopicAlertsInputSchema},
  output: {schema: TrendingTopicAlertsOutputSchema},
  prompt: `You are a social media expert.  You will identify a trending topic based on the user's preferences, and create tweet ideas related to the topic.

  The user is interested in the following topics: {{topicPreferences}}
  The user wants to post {{postFrequency}}.

  Identify one trending topic relevant to the user's interests.
  Generate 3 tweet ideas related to the trending topic.
  `,
});

const trendingTopicAlertsFlow = ai.defineFlow(
  {
    name: 'trendingTopicAlertsFlow',
    inputSchema: TrendingTopicAlertsInputSchema,
    outputSchema: TrendingTopicAlertsOutputSchema,
  },
  async input => {
    const {output} = await trendingTopicAlertsPrompt(input);
    return output!;
  }
);
