"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Post, UserProfile, ContentPlan, Team, availableTopics, availableFrequencies } from '@/lib/types';
import { user as initialUser, posts as initialPosts } from '@/lib/data';

interface AppContextType {
  user: UserProfile;
  posts: Post[];
  contentPlans: ContentPlan[];
  generatedPosts: Post[];
  activeTeam: Team | undefined;
  setGeneratedPosts: (posts: Post[]) => void;
  updateProfile: (profile: Partial<Omit<UserProfile, 'teams' | 'activeTeamId'>>) => void;
  updatePost: (postId: string, postData: Partial<Post>) => void;
  addPost: (postData: Omit<Post, 'id' | 'analytics' | 'teamId'>) => Post;
  addContentPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'teamId'>) => void;
  deletePost: (postId: string) => void;
  copyPost: (postId: string) => void;
  availableTopics: string[];
  availableFrequencies: string[];
  getPostById: (postId: string) => Post | undefined;
  switchTeam: (teamId: string) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [allPosts, setAllPosts] = useState<Post[]>(initialPosts);
  const [allContentPlans, setAllContentPlans] = useState<ContentPlan[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  const updatePost = (postId: string, postData: Partial<Post>) => {
    setAllPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...postData } : p))
    );
  };
  
  const addPost = (postData: Omit<Post, 'id' | 'analytics' | 'teamId'>): Post => {
    const newPost: Post = {
      ...postData,
      id: new Date().toISOString() + Math.random(),
      teamId: user.activeTeamId,
      analytics: { likes: 0, retweets: 0, impressions: 0 },
    };
    setAllPosts((prev) => [...prev, newPost].sort((a,b) => b.date.getTime() - a.date.getTime()));
    return newPost;
  };

  const addContentPlan = (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'teamId'>) => {
    const newPlan: ContentPlan = {
      ...plan,
      id: new Date().toISOString() + Math.random(),
      teamId: user.activeTeamId,
      createdAt: new Date(),
    }
    setAllContentPlans(prev => [newPlan, ...prev]);
  };

  const deletePost = (postId: string) => {
    setAllPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const copyPost = (postId: string) => {
    const postToCopy = allPosts.find(p => p.id === postId);
    if (postToCopy) {
      const newPost: Post = {
        ...postToCopy,
        id: new Date().toISOString() + Math.random(),
        title: `${postToCopy.title} (Copy)`,
        status: 'Draft',
        autoPublish: false,
        analytics: { likes: 0, retweets: 0, impressions: 0 },
      };
      setAllPosts(prev => [newPost, ...prev]);
    }
  };

  const getPostById = (postId: string) => {
    return allPosts.find(p => p.id === postId);
  };

  const switchTeam = (teamId: string) => {
    setUser(prev => ({...prev, activeTeamId: teamId}));
  };

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: new Date().toISOString() + Math.random(),
    };
    setUser(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
      activeTeamId: newTeam.id,
    }));
  };

  const activeTeam = useMemo(() => user.teams.find(t => t.id === user.activeTeamId), [user.teams, user.activeTeamId]);

  const posts = useMemo(() => allPosts.filter(p => p.teamId === user.activeTeamId), [allPosts, user.activeTeamId]);
  const contentPlans = useMemo(() => allContentPlans.filter(p => p.teamId === user.activeTeamId), [allContentPlans, user.activeTeamId]);

  return (
    <AppContext.Provider value={{ user, posts, contentPlans, updateProfile, updatePost, addPost, addContentPlan, availableTopics, availableFrequencies, getPostById, deletePost, copyPost, generatedPosts, setGeneratedPosts, activeTeam, switchTeam, addTeam }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
