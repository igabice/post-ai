"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  Post,
  UserProfile,
  ContentPlan,
  Team,
  availableTopics,
  availableFrequencies,
} from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
import {
  updatePostInFirestore,
  addPostToFirestore,
  deletePostFromFirestore,
  getPostFromFirestore,
} from "@/services/posts";
import {
  completeOnboardingInFirestore,
  updateUserActiveTeam,
  createUserProfile,
} from "@/services/user";
import { addTeamToFirestore, getTeamById } from "@/services/teams";
import {
  acceptInvite,
  acceptInvite as acceptInviteInFirestore,
} from "@/services/invites";
import { useAsyncSafeState } from "@/hooks/useAsyncSafeState";
import { stateManager } from "@/lib/stateManager";

interface AppContextType {
  user: UserProfile | null | undefined;
  posts: Post[];
  contentPlans: ContentPlan[];
  generatedPosts: Post[];
  activeTeam: Team | null | undefined;
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  setGeneratedPosts: (posts: Post[]) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateTeam: (teamId: string, teamData: Partial<Team>) => Promise<void>;
  updatePost: (postId: string, postData: Partial<Post>) => Promise<void>;
  addPost: (
    postData: Omit<Post, "id" | "analytics" | "teamId">
  ) => Promise<Post | undefined>;
  addContentPlan: (
    plan: Omit<ContentPlan, "id" | "createdAt" | "teamId">
  ) => void;
  deletePost: (postId: string) => Promise<void>;
  copyPost: (postId: string) => Promise<void>;
  availableTopics: string[];
  availableFrequencies: string[];
  getPostById: (postId: string) => Post | undefined;
  switchTeam: (teamId: string) => Promise<void>;
  addTeam: (
    teamData: Omit<Team, "id" | "createdAt" | "members">
  ) => Promise<boolean>;
  completeOnboarding: (
    userData: Omit<
      UserProfile,
      "uid" | "avatarUrl" | "teams" | "activeTeamId" | "isOnboardingCompleted"
    >,
    teamData: Omit<Team, "id">
  ) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => void;
  sendInvite: (
    teamId: string,
    inviteeEmail: string,
    invitationId: string
  ) => Promise<string | undefined>;
  acceptInvite: (token: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useAsyncSafeState<UserProfile | null | undefined>(
    undefined
  );
  const [activeTeam, setActiveTeam] = useAsyncSafeState<Team | null | undefined>(
    undefined
  );
  const [allPosts, setAllPosts] = useAsyncSafeState<Post[]>([]);
  const [allContentPlans, setAllContentPlans] = useAsyncSafeState<
    ContentPlan[]
  >([]);
  const [generatedPosts, setGeneratedPosts] = useAsyncSafeState<Post[]>([]);
  const [isLoading, setIsLoading] = useAsyncSafeState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Safe date conversion utility
  const convertToDate = (date: any): Date => {
    if (date instanceof Date) return date;
    if (date instanceof Timestamp) return date.toDate();
    if (typeof date === "string") return new Date(date);
    return new Date();
  };

  // Enhanced auth state handler with proper error handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        try {
          setIsLoading(true);

          if (firebaseUser) {
            await stateManager.executeWithLock(
              `auth-${firebaseUser.uid}`,
              async () => {
                const userRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                  const userData = docSnap.data();
                  // Validate user data structure
                  if (userData && typeof userData === "object") {
                    setUser(userData as UserProfile);
                  } else {
                    throw new Error("Invalid user data structure");
                  }
                } else {
                  // Create new user profile with rollback capability
                  try {
                    const newUserProfile: UserProfile = {
                      uid: firebaseUser.uid,
                      email: firebaseUser.email || "",
                      name: firebaseUser.displayName || "New User",
                      avatarUrl:
                        firebaseUser.photoURL ||
                        `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
                      isOnboardingCompleted: false,
                      teams: [],
                      activeTeamId: "",
                      topicPreferences: [],
                      postFrequency: "",
                      signature: "",
                      updatedAt: new Date().toISOString(),
                      defaultLayout: "calendar",
                    };

                    await createUserProfile(newUserProfile);
                    setUser(newUserProfile);
                  } catch (error) {
                    console.error("Failed to create user profile:", error);
                    // Don't set user state if Firestore creation fails
                    setUser(null);
                  }
                }
              }
            );
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [setUser, setIsLoading]);

  // Debounced posts fetching with cleanup
  useEffect(() => {
    if (!user?.activeTeamId) {
      setAllPosts([]);
      return;
    }

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        await stateManager.executeWithLock(
          `posts-${user.activeTeamId}`,
          async () => {
            const postsQuery = query(
              collection(db, "posts"),
              where("teamId", "==", user.activeTeamId)
            );
            const querySnapshot = await getDocs(postsQuery);
            const postsData = querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as Post[];

            const postsWithDateObjects = postsData.map((post) => ({
              ...post,
              date: convertToDate(post.date),
            }));

            setAllPosts(postsWithDateObjects);
          }
        );
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPosts, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [user?.activeTeamId, setAllPosts, setIsLoading, toast]);

  useEffect(() => {
    if (user?.activeTeamId) {
      getTeamById(user.activeTeamId).then(setActiveTeam);
    }
  }, [user?.activeTeamId, setActiveTeam]);

  // Navigation logic with proper sequencing
  useEffect(() => {
    if (user === undefined || isLoading) return;

    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");
    const isOnboardingPage = pathname.startsWith("/onboarding");

    if (user) {
      if (isAuthPage) {
        router.push("/calendar");
        return;
      }

      if (user.isOnboardingCompleted) {
        if (isOnboardingPage) {
          router.push("/calendar");
        }
      } else if (!isOnboardingPage) {
        router.push("/onboarding/welcome");
      }
    } else if (user === null && !isAuthPage) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    if (user) {
      const pendingToken = localStorage.getItem("pending-invite-token");
      if (pendingToken) {
        acceptInvite(pendingToken, user);
        localStorage.removeItem("pending-invite-token");
      }
    }
  }, [user]);

  const isOnboardingCompleted = useMemo(
    () => user?.isOnboardingCompleted || false,
    [user]
  );

  // Optimistic update with rollback capability
  const updatePost = async (postId: string, postData: Partial<Post>) => {
    const previousPosts = allPosts;

    try {
      // Optimistic update
      setAllPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...postData } : p))
      );

      await updatePostInFirestore(postId, postData);
      toast({ title: "Success", description: "Post updated." });
    } catch (error) {
      // Rollback on error
      setAllPosts(previousPosts);
      console.error("Error updating post: ", error);
      toast({
        title: "Error",
        description: "There was a problem updating the post.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addPost = async (
    postData: Omit<Post, "id" | "analytics" | "teamId">
  ): Promise<Post | undefined> => {
    if (!user || !user.activeTeamId) {
      toast({
        title: "Error",
        description: "No active team selected.",
        variant: "destructive",
      });
      return undefined;
    }

    try {
      const { socialMediaAccountIds, ...restOfPostData } = postData;
      const newPost = await addPostToFirestore(
        restOfPostData,
        user.activeTeamId,
        socialMediaAccountIds
      );
      setAllPosts((prev) =>
        [...prev, newPost].sort((a, b) => b.date.getTime() - a.date.getTime())
      );
      toast({ title: "Success", description: "Post created." });
      return newPost;
    } catch (error) {
      console.error("Error creating post: ", error);
      toast({
        title: "Error",
        description: "There was a problem creating the post.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const switchTeam = async (teamId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await stateManager.executeWithLock(
        `switch-team-${user.uid}`,
        async () => {
          // Update Firestore first
          await updateUserActiveTeam(user.uid, teamId);
          // Then update local state
          setUser((prev) => (prev ? { ...prev, activeTeamId: teamId } : null));
          const newActiveTeam = await getTeamById(teamId);
          setActiveTeam(newActiveTeam);
        }
      );
      toast({ title: "Success", description: "Active team switched." });
    } catch (error) {
      console.error("Error switching active team: ", error);
      toast({
        title: "Error",
        description: "There was a problem switching the active team.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addTeam = async (
    teamData: Omit<Team, "id" | "createdAt" | "members">
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      return await stateManager.executeWithLock(
        `add-team-${user.uid}`,
        async () => {
          const newTeam = await addTeamToFirestore(teamData, user.uid);
          const newTeamForUser = {
            ...newTeam,
            createdAt: new Date().toISOString(),
          };

          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            {
              teams: arrayUnion(newTeamForUser),
              activeTeamId: newTeam.id,
            },
            { merge: true }
          );

          // Re-fetch user to ensure consistency
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const updatedUser = docSnap.data() as UserProfile;
            setUser(updatedUser);
          }

          toast({ title: "Success", description: "Team created." });
          return true;
        }
      );
    } catch (error) {
      console.error("Error adding team: ", error);
      toast({
        title: "Error",
        description: "There was a problem adding the team.",
        variant: "destructive",
      });
      return false;
    }
  };

  const completeOnboarding = async (
    userData: Omit<
      UserProfile,
      "uid" | "avatarUrl" | "teams" | "activeTeamId" | "isOnboardingCompleted"
    >,
    teamData: Omit<Team, "id">
  ) => {
    if (!user) return;

    if (
      !teamData.name ||
      !userData.name ||
      !userData.postFrequency ||
      userData.topicPreferences.length === 0
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const updatedUserForState = await completeOnboardingInFirestore(
        user,
        userData,
        teamData
      );
      setUser(updatedUserForState);
      router.push("/calendar");
    } catch (error) {
      console.error("Error completing onboarding: ", error);
      toast({
        title: "Onboarding Failed",
        description:
          "There was a problem saving your information. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      if (error.code === "auth/popup-closed-by-user") {
        toast({
          title: "Sign-in cancelled",
          description:
            "You closed the sign-in window before completing the process.",
        });
        return;
      }
      console.error("Error signing in with Google", error);
      toast({
        title: "Login Failed",
        description: "There was a problem signing you in. Please try again.",
        variant: "destructive",
      });
    });
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAllPosts([]);
      setAllContentPlans([]);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
      toast({
        title: "Error",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  const posts = useMemo(
    () => (user ? allPosts.filter((p) => p.teamId === user.activeTeamId) : []),
    [allPosts, user]
  );

  const contentPlans = useMemo(
    () =>
      user ? allContentPlans.filter((p) => p.teamId === user.activeTeamId) : [],
    [allContentPlans, user]
  );

  const updateTeam = async (teamId: string, teamData: Partial<Team>) => {
    if (!user) return;

    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, teamData);

      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedTeams = prevUser.teams.map((team) =>
          team.id === teamId ? { ...team, ...teamData } : team
        );
        return { ...prevUser, teams: updatedTeams };
      });
      toast({ title: "Success", description: "Team updated." });
    } catch (error) {
      console.error("Error updating team: ", error);
      toast({
        title: "Error",
        description: "There was a problem updating the team.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    posts,
    contentPlans,
    generatedPosts,
    setGeneratedPosts,
    activeTeam,
    isOnboardingCompleted,
    isLoading,
    updateProfile: async (profile: Partial<UserProfile>) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, profile);
        setUser((prev) => (prev ? { ...prev, ...profile } : null));
        toast({ title: "Success", description: "Profile updated." });
      } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
          title: "Error",
          description: "There was a problem updating your profile.",
          variant: "destructive",
        });
        throw error;
      }
    },
    updateTeam,
    updatePost,
    addPost,
    addContentPlan: (
      plan: Omit<ContentPlan, "id" | "createdAt" | "teamId">
    ) => {
      const newPlan: ContentPlan = {
        ...plan,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        teamId: user?.activeTeamId || "",
        createdAt: new Date(),
      };
      setAllContentPlans((prev) => [newPlan, ...prev]);
    },
    deletePost: async (postId: string) => {
      const previousPosts = allPosts;
      try {
        setAllPosts((prev) => prev.filter((p) => p.id !== postId));
        await deletePostFromFirestore(postId);
        toast({ title: "Success", description: "Post deleted." });
      } catch (error) {
        setAllPosts(previousPosts);
        console.error("Error deleting post: ", error);
        toast({
          title: "Error",
          description: "There was a problem deleting the post.",
          variant: "destructive",
        });
        throw error;
      }
    },
    copyPost: async (postId: string) => {
      if (!user || !user.activeTeamId) {
        toast({
          title: "Error",
          description: "No active team selected.",
          variant: "destructive",
        });
        return;
      }
      try {
        const postToCopy = await getPostFromFirestore(postId);
        if (postToCopy) {
          const postData: Omit<Post, "id" | "analytics" | "teamId"> = {
            title: `${postToCopy.title} (Copy)`,
            content: postToCopy.content,
            socialMediaAccountIds: postToCopy.socialMediaAccountIds,
            date: new Date(),
            status: "Draft",
            autoPublish: false,
          };
          const { socialMediaAccountIds, ...restOfPostData } = postData;
          const newPost = await addPostToFirestore(
            restOfPostData,
            user.activeTeamId,
            socialMediaAccountIds
          );
          setAllPosts((prev) =>
            [...prev, newPost].sort(
              (a, b) => b.date.getTime() - a.date.getTime()
            )
          );
          toast({ title: "Success", description: "Post copied." });
        }
      } catch (error) {
        console.error("Error copying post: ", error);
        toast({
          title: "Error",
          description: "There was a problem copying the post.",
          variant: "destructive",
        });
        throw error;
      }
    },
    getPostById: (postId: string) => allPosts.find((p) => p.id === postId),
    switchTeam,
    addTeam,
    completeOnboarding,
    signInWithGoogle,
    signOut,
    sendInvite: async (
      teamId: string,
      inviteeEmail: string,
      invitationId: string
    ) => {
      try {
        const response = await fetch("/api/send-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, inviteeEmail, invitationId }),
        });

        if (!response.ok) throw new Error("Failed to send invitation");

        const data = await response.json();
        toast({ title: "Success", description: "Invitation sent." });
        return data.previewUrl;
      } catch (error) {
        console.error("Error sending invite: ", error);
        toast({
          title: "Error",
          description: "There was a problem sending the invitation.",
          variant: "destructive",
        });
        throw error;
      }
    },
    acceptInvite: async (token: string) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to accept an invite.",
          variant: "destructive",
        });
        return;
      }
      try {
        await acceptInviteInFirestore(token, user);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserProfile);
        }
        toast({ title: "Success", description: "Invitation accepted!" });
        router.push("/calendar");
      } catch (error) {
        console.error("Error accepting invite: ", error);
        toast({
          title: "Error",
          description:
            (error as Error).message ||
            "There was a problem accepting the invitation.",
          variant: "destructive",
        });
        throw error;
      }
    },
    availableTopics,
    availableFrequencies,
  };

  if (user === undefined || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};