"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post, UserProfile, availableTopics, availableFrequencies } from '@/lib/types';
import { user as initialUser, posts as initialPosts } from '@/lib/data';

interface AppContextType {
  user: UserProfile;
  posts: Post[];
  generatedPosts: Post[];
  setGeneratedPosts: (posts: Post[]) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePost: (postId: string, postData: Partial<Post>) => void;
  addPost: (postData: Omit<Post, 'id' | 'analytics'>) => void;
  deletePost: (postId: string) => void;
  copyPost: (postId: string) => void;
  availableTopics: string[];
  availableFrequencies: string[];
  getPostById: (postId: string) => Post | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);


  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  const updatePost = (postId: string, postData: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...postData } : p))
    );
  };
  
  const addPost = (postData: Omit<Post, 'id' | 'analytics'>) => {
    const newPost: Post = {
      ...postData,
      id: new Date().toISOString() + Math.random(),
      analytics: { likes: 0, retweets: 0, impressions: 0 },
    };
    setPosts((prev) => [...prev, newPost].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const copyPost = (postId: string) => {
    const postToCopy = posts.find(p => p.id === postId);
    if (postToCopy) {
      const newPost: Post = {
        ...postToCopy,
        id: new Date().toISOString() + Math.random(),
        title: `${postToCopy.title} (Copy)`,
        status: 'Draft',
        autoPublish: false,
        analytics: { likes: 0, retweets: 0, impressions: 0 },
      };
      setPosts(prev => [newPost, ...prev]);
    }
  };

  const getPostById = (postId: string) => {
    return posts.find(p => p.id === postId);
  };

  return (
    <AppContext.Provider value={{ user, posts, updateProfile, updatePost, addPost, availableTopics, availableFrequencies, getPostById, deletePost, copyPost, generatedPosts, setGeneratedPosts }}>
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

    