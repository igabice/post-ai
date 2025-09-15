'use server';

import {
  getTrendingTopicAlerts,
  TrendingTopicAlertsInput,
  TrendingTopicAlertsOutput,
} from '@/ai/flows/trending-topic-alerts';
import {
  generateFollowUpSuggestions,
  GenerateFollowUpSuggestionsInput,
  GenerateFollowUpSuggestionsOutput,
} from '@/ai/flows/personalized-follow-up-suggestions';

export async function getTrendingTopics(
  input: TrendingTopicAlertsInput
): Promise<TrendingTopicAlertsOutput> {
  try {
    const result = await getTrendingTopicAlerts(input);
    return result;
  } catch (error) {
    console.error('Error getting trending topics:', error);
    // Return a default/error state
    return {
      trendingTopic: 'Could not fetch topic',
      tweetIdeas: ['Failed to generate tweet ideas. Please try again later.'],
    };
  }
}

export async function getFollowUpSuggestions(
  input: GenerateFollowUpSuggestionsInput
): Promise<GenerateFollowUpSuggestionsOutput> {
  try {
    const result = await generateFollowUpSuggestions(input);
    return result;
  } catch (error) {
    console.error('Error getting follow-up suggestions:', error);
    return {
      followUpSuggestions: ['Failed to generate follow-up suggestions. Please try again.'],
    };
  }
}
