
import { subDays, addDays } from 'date-fns';
import type { Post, UserProfile, Team } from './types';

// This data is no longer used for the initial user state, 
// as it's now handled by Firebase Auth and the onboarding flow.

export const posts: Post[] = [
  // This will be populated after onboarding and based on team selection
];
