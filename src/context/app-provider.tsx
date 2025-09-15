"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post, UserProfile, availableTopics, availableFrequencies } from '@/lib/types';
import { user as initialUser, posts as initialPosts } from '@/lib/data';

interface AppContextType {
  user: UserProfile;
  posts: Post[];
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePost: (postId: string, postData: Partial<Post>) => void;
  addPost: (postData: Post) => void;
  availableTopics: string[];
  availableFrequencies: string[];
  getPostById: (postId: string) => Post | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  const updatePost = (postId: string, postData: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...postData } : p))
    );
  };
  
  const addPost = (postData: Post) => {
    setPosts((prev) => [...prev, postData]);
  };

  const getPostById = (postId: string) => {
    return posts.find(p => p.id === postId);
  };

  return (
    <AppContext.Provider value={{ user, posts, updateProfile, updatePost, addPost, availableTopics, availableFrequencies, getPostById }}>
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
