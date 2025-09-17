import { subDays, addDays } from 'date-fns';
import type { Post, UserProfile, Team } from './types';

// By default, the user has not completed onboarding.
export const user: UserProfile = {
  name: '',
  avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
  topicPreferences: [],
  postFrequency: '',
  signature: '',
  teams: [],
  activeTeamId: '',
  isOnboardingCompleted: false,
};

const today = new Date();

export const posts: Post[] = [
  // This will be populated after onboarding
];
