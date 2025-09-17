export type PostStatus = 'Draft' | 'Scheduled' | 'Published' | 'Needs Verification';

export type Post = {
  id: string;
  teamId: string;
  date: Date;
  title: string;
  content: string;
  status: PostStatus;
  autoPublish: boolean;
  analytics: {
    likes: number;
    retweets: number;
    impressions: number;
  };
};

export type Team = {
    id: string;
    name: string;
    description: string;
}

export type UserProfile = {
  name: string;
  avatarUrl: string;
  topicPreferences: string[];
  postFrequency: string;
  signature?: string;
  teams: Team[];
  activeTeamId: string;
};

export type ContentPlan = {
  id: string;
  teamId: string;
  title: string;
  description: string;
  tone: string;
  postIds: string[];
  createdAt: Date;
  startDate: Date;
  endDate: Date;
}

export const availableTopics = [
  'Technology',
  'Real Estate',
  'Marketing',
  'Finance',
  'Health & Wellness',
  'Startups',
  'AI & Machine Learning',
  'E-commerce',
  'Software Development',
];

export const availableFrequencies = ['3x a week', '5x a week', '1x a day', '2x a day'];
