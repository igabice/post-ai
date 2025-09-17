
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Post, UserProfile, ContentPlan, Team, availableTopics, availableFrequencies } from '@/lib/types';
import { posts as initialPosts } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AppContextType {
  user: UserProfile | null | undefined; // Allow undefined for initial loading state
  posts: Post[];
  contentPlans: ContentPlan[];
  generatedPosts: Post[];
  activeTeam: Team | undefined;
  isOnboardingCompleted: boolean;
  setGeneratedPosts: (posts: Post[]) => void;
  updateProfile: (profile: Partial<Omit<UserProfile, 'teams' | 'activeTeamId' | 'uid'>>) => void;
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
  completeOnboarding: (userData: Omit<UserProfile, 'avatarUrl' | 'teams' | 'activeTeamId' | 'isOnboardingCompleted' | 'uid'>, teamData: Omit<Team, 'id'>) => void;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<Post[]>(initialPosts);
  const [allContentPlans, setAllContentPlans] = useState<ContentPlan[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(prevUser => {
          // If user already exists in state, don't overwrite with a blank profile
          if (prevUser && prevUser.uid === firebaseUser.uid) {
            return prevUser;
          }
          // Otherwise, create a new profile for the newly signed-in user
          const newUserProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
              isOnboardingCompleted: false,
              teams: [],
              activeTeamId: '',
              topicPreferences: [],
              postFrequency: '',
              signature: '',
          };
          return newUserProfile;
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);


  const isOnboardingCompleted = useMemo(() => user?.isOnboardingCompleted || false, [user]);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : null));
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
      teamId: user?.activeTeamId || '',
      analytics: { likes: 0, retweets: 0, impressions: 0 },
    };
    setAllPosts((prev) => [...prev, newPost].sort((a,b) => b.date.getTime() - a.date.getTime()));
    return newPost;
  };

  const addContentPlan = (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'teamId'>) => {
    const newPlan: ContentPlan = {
      ...plan,
      id: new Date().toISOString() + Math.random(),
      teamId: user?.activeTeamId || '',
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
    setUser(prev => (prev ? {...prev, activeTeamId: teamId} : null));
  };

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    if (!user) return;
    const newTeam: Team = {
      ...teamData,
      id: new Date().toISOString() + Math.random(),
    };
    setUser(prev => ({
      ...prev!,
      teams: [...prev!.teams, newTeam],
      activeTeamId: newTeam.id,
    }));
  };

  const completeOnboarding = (userData: Omit<UserProfile, 'avatarUrl' | 'teams' | 'activeTeamId' | 'isOnboardingCompleted' | 'uid'>, teamData: Omit<Team, 'id'>) => {
    setUser(prev => {
        if (!prev) return null;
        const newTeam: Team = {
            ...teamData,
            id: new Date().toISOString() + Math.random(),
        };
        const updatedUser = {
            ...prev,
            ...userData,
            teams: [newTeam],
            activeTeamId: newTeam.id,
            isOnboardingCompleted: true,
        };
        return updatedUser;
    });
    router.push('/calendar');
  };
  
 const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        toast({
          title: 'Login Successful!',
          description: "Welcome back! You've been successfully signed in.",
        });
        // The onAuthStateChanged listener will handle the user state update.
      })
      .catch((error) => {
        console.error("Error signing in with Google", error);
        toast({
          title: 'Login Failed',
          description: 'There was a problem signing you in. Please try again.',
          variant: 'destructive',
        });
      });
  };


  const signOut = () => {
    firebaseSignOut(auth).catch((error) => {
      console.error("Error signing out", error);
    });
  };


  const activeTeam = useMemo(() => user?.teams.find(t => t.id === user.activeTeamId), [user?.teams, user?.activeTeamId]);

  const posts = useMemo(() => user ? allPosts.filter(p => p.teamId === user.activeTeamId) : [], [allPosts, user]);
  const contentPlans = useMemo(() => user ? allContentPlans.filter(p => p.teamId === user.activeTeamId) : [], [allContentPlans, user]);

  const value = { 
    user, 
    posts, 
    contentPlans, 
    updateProfile, 
    updatePost, 
    addPost, 
    addContentPlan, 
    availableTopics, 
    availableFrequencies, 
    getPostById, 
    deletePost, 
    copyPost, 
    generatedPosts, 
    setGeneratedPosts, 
    activeTeam, 
    switchTeam, 
    addTeam, 
    isOnboardingCompleted, 
    completeOnboarding, 
    signInWithGoogle, 
    signOut 
  };
  
  if (user === undefined) {
    return null; 
  }

  return (
    <AppContext.Provider value={value}>
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
