
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Post, UserProfile, ContentPlan, Team, availableTopics, availableFrequencies } from '@/lib/types';
import { posts as initialPosts } from '@/lib/data';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AppContextType {
  user: UserProfile | null | undefined;
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
  switchTeam: (teamId: string) => Promise<void>;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  completeOnboarding: (userData: Omit<UserProfile, 'avatarUrl' | 'teams' | 'activeTeamId' | 'isOnboardingCompleted' | 'uid'>, teamData: Omit<Team, 'id'>) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data() as UserProfile);
        } else {
          // This is a new user, create a temporary profile for onboarding
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
          // We don't save to DB yet, just set in state for the onboarding flow.
          setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const isOnboardingCompleted = useMemo(() => user?.isOnboardingCompleted || false, [user]);

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profile };
    setUser(updatedUser);
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, profile);
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

  const switchTeam = async (teamId: string) => {
    if (!user) return;
    setUser(prev => (prev ? {...prev, activeTeamId: teamId} : null));
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { activeTeamId: teamId });
  };

  const addTeam = async (teamData: Omit<Team, 'id'>) => {
    if (!user) return;
    const teamsCollectionRef = collection(db, `users/${user.uid}/teams`);
    const teamDocRef = await addDoc(teamsCollectionRef, teamData);
    
    const newTeam: Team = {
      ...teamData,
      id: teamDocRef.id,
    };
    
    const updatedUser = {
      ...user,
      teams: [...user.teams, newTeam],
      activeTeamId: newTeam.id,
    };

    setUser(updatedUser);
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        teams: updatedUser.teams,
        activeTeamId: newTeam.id
    });
  };

  const completeOnboarding = async (userData: Omit<UserProfile, 'avatarUrl' | 'teams' | 'activeTeamId' | 'isOnboardingCompleted' | 'uid'>, teamData: Omit<Team, 'id'>) => {
    if (!user) return;

    const teamDocRef = await addDoc(collection(db, `users/${user.uid}/teams`), teamData);
    const newTeam: Team = {
      ...teamData,
      id: teamDocRef.id,
    };

    const finalUserProfile: UserProfile = {
      ...user,
      ...userData,
      teams: [newTeam],
      activeTeamId: newTeam.id,
      isOnboardingCompleted: true,
    };
    
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, finalUserProfile);
    setUser(finalUserProfile);

    router.push('/calendar');
  };
  
 const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        toast({
          title: 'Login Successful!',
          description: "Welcome! Let's get you set up.",
        });
        // The onAuthStateChanged listener will handle the user creation and state update.
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
    firebaseSignOut(auth).then(() => {
        setUser(null);
        router.push('/login');
    }).catch((error) => {
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
    return null; // Render nothing while waiting for auth state
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
