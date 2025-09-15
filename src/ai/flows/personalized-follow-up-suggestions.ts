
'use server';

/**
 * @fileOverview AI-powered follow-up suggestion generator.
 *
 * - generateFollowUpSuggestions - A function that generates follow-up tweet suggestions.
 * - GenerateFollowUpSuggestionsInput - The input type for the generateFollowUpSuggestions function.
 * - GenerateFollowUpSuggestionsOutput - The return type for the generateFollowUpSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowUpSuggestionsInputSchema = z.object({
  topicPreferences: z
    .array(z.string())
    .describe('User selected core topic preferences'),
  postFrequency: z
    .string()
    .describe(
      'The desired post frequency (e.g., 3x a week, 10x a month) that represents how often the user wants to post.'
    ),
  trendingTopic: z.string().describe('The current trending topic.'),
  initialTweet: z.string().describe('The initial tweet that needs follow-ups.'),
});
export type GenerateFollowUpSuggestionsInput = z.infer<
  typeof GenerateFollowUpSuggestionsInputSchema
>;

const GenerateFollowUpSuggestionsOutputSchema = z.object({
  followUpSuggestions: z
    .array(z.string())
    .describe('AI-generated tweet ideas for follow-up tweets.'),
});
export type GenerateFollowUpSuggestionsOutput = z.infer<
  typeof GenerateFollowUpSuggestionsOutputSchema
>;

export async function generateFollowUpSuggestions(
  input: GenerateFollowUpSuggestionsInput
): Promise<GenerateFollowUpSuggestionsOutput> {
  return generateFollowUpSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFollowUpSuggestionsPrompt',
  input: {schema: GenerateFollowUpSuggestionsInputSchema},
  output: {schema: GenerateFollowUpSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to help users generate engaging tweet threads based on trending topics.

  The user has the following topic preferences: {{topicPreferences}}
  The user wants to post {{postFrequency}}.

  The current trending topic is: {{trendingTopic}}
  The initial tweet is: {{initialTweet}}

  Generate a list of follow-up tweet ideas that would create a deeper conversation around the initial tweet and trending topic, while aligning with the user's topic preferences.  The tweet ideas should sound natural and engaging.

  Follow-up tweet ideas:
  `,
});

const generateFollowUpSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateFollowUpSuggestionsFlow',
    inputSchema: GenerateFollowUpSuggestionsInputSchema,
    outputSchema: GenerateFollowUpSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
