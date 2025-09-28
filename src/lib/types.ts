export type PostStatus =
  | "Draft"
  | "Scheduled"
  | "Published"
  | "Needs Verification";

export type Post = {
  id: string;
  teamId: string;
  date: Date;
  title: string;
  content: string;
  status: PostStatus;
  autoPublish: boolean;
  socialMediaAccountIds: string[];
  analytics: {
    likes: number;
    retweets: number;
    impressions: number;
  };
};

export type Permissions = {
  createPost: boolean;
  editPost: boolean;
  createContentPlan: boolean;
  sendInvites: boolean;
  isAdmin: boolean;
};

export type TeamMember = {
  status: "active" | "disabled";
  permissions: Permissions;
};

export type SocialMediaAccount = {
  id: string;
  name: string; // e.g., "Twitter", "Instagram"
  userName: string; // e.g., "@myhandle"
  title: string; // e.g., "Twitter", "Instagram"
  image?: string; // URL to icon
  profileLink?: string; // URL to profile
  active: boolean;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  members: { [uid: string]: TeamMember };
  socialMediaAccounts: SocialMediaAccount[];
};

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  avatarUrl: string;
  topicPreferences: string[];
  postFrequency: string;
  signature?: string;
  teams: Team[];
  activeTeamId: string;
  isOnboardingCompleted: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  defaultLayout: string;
  updatedAt: any;
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
};

export type Invitation = {
  id: string;
  teamId: string;
  inviteeEmail: string;
  inviterId: string;
  status: "pending" | "accepted";
  createdAt: any; // Firestore server timestamp
};

export const availableTopics = [
  "Technology",
  "Real Estate",
  "Marketing",
  "Finance",
  "Health & Wellness",
  "Startups",
  "AI & Machine Learning",
  "E-commerce",
  "Software Development",
];

export const availableFrequencies = [
  "3x a week",
  "5x a week",
  "1x a day",
  "2x a day",
];
