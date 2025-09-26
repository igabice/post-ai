"use client";

import React, {
  createContext,
  useContext,
  useState,
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
import { posts as initialPosts } from "@/lib/data";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
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
} from "@/services/user";
import { addTeamToFirestore } from "@/services/teams";
import { acceptInvite as acceptInviteInFirestore } from "@/services/invites";

interface AppContextType {
  user: UserProfile | null | undefined;
  posts: Post[];
  contentPlans: ContentPlan[];
  generatedPosts: Post[];
  activeTeam: Team | undefined;
  isOnboardingCompleted: boolean;
  setGeneratedPosts: (posts: Post[]) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
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
  switchTeam: (teamId: string) => void;
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
    inviteeEmail: string
  ) => Promise<string | undefined>;
  acceptInvite: (token: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allContentPlans, setAllContentPlans] = useState<ContentPlan[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            const newUserProfile: UserProfile = {
              uid: firebaseUser.uid,
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
              updatedAt: "",
              defaultLayout: "calendar",
            };
            setUser(newUserProfile);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user?.activeTeamId) {
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
          date: (post.date as any).toDate(),
        }));

        setAllPosts(postsWithDateObjects);
      }
    };

    fetchPosts();
  }, [user?.activeTeamId]);

  const isOnboardingCompleted = useMemo(
    () => user?.isOnboardingCompleted || false,
    [user]
  );

  useEffect(() => {
    if (user === undefined) return; // Wait for user to be loaded

    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    if (user) {
      // User is logged in
      if (pathname.startsWith("/login")) {
        // If on login page, redirect to calendar
        router.push("/calendar");
      } else if (isOnboardingCompleted) {
        if (pathname.startsWith("/onboarding")) {
          router.push("/calendar");
        }
      } else {
        if (!pathname.startsWith("/onboarding")) {
          router.push("/onboarding/welcome");
        }
      }
    } else if (user === null && !isAuthPage) {
      // User is not logged in and not on an auth page
      router.push("/login");
    }
  }, [user, isOnboardingCompleted, router, pathname]);

  const updateProfile = async (profile: Partial<UserProfile>) => {
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
    }
  };

  const updatePost = async (postId: string, postData: Partial<Post>) => {
    try {
      await updatePostInFirestore(postId, postData);
      setAllPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...postData } : p))
      );
      toast({ title: "Success", description: "Post updated." });
    } catch (error) {
      console.error("Error updating post: ", error);
      toast({
        title: "Error",
        description: "There was a problem updating the post.",
        variant: "destructive",
      });
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
      return;
    }
    try {
      const newPost = await addPostToFirestore(postData, user.activeTeamId);
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

  const addContentPlan = (
    plan: Omit<ContentPlan, "id" | "createdAt" | "teamId">
  ) => {
    const newPlan: ContentPlan = {
      ...plan,
      id: new Date().toISOString() + Math.random(),
      teamId: user?.activeTeamId || "",
      createdAt: new Date(),
    };
    setAllContentPlans((prev) => [newPlan, ...prev]);
  };

  const deletePost = async (postId: string) => {
    try {
      await deletePostFromFirestore(postId);
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Success", description: "Post deleted." });
    } catch (error) {
      console.error("Error deleting post: ", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the post.",
        variant: "destructive",
      });
    }
  };

  const copyPost = async (postId: string) => {
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
          date: new Date(), // or postToCopy.date
          status: "Draft",
          autoPublish: false,
        };
        const newPost = await addPostToFirestore(postData, user.activeTeamId);
        setAllPosts((prev) =>
          [...prev, newPost].sort((a, b) => b.date.getTime() - a.date.getTime())
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
    }
  };

  const getPostById = (postId: string) => {
    return allPosts.find((p) => p.id === postId);
  };

  const switchTeam = async (teamId: string) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, activeTeamId: teamId } : null));
    try {
      await updateUserActiveTeam(user.uid, teamId);
      toast({ title: "Success", description: "Active team switched." });
    } catch (error) {
      console.error("Error switching active team: ", error);
      toast({
        title: "Error",
        description: "There was a problem switching the active team.",
        variant: "destructive",
      });
    }
  };

  // const addTeam = async (teamData: Omit<Team, "id" | "createdAt" | "members">): Promise<boolean> => {
  //   if (!user) return false;
  //   try {
  //     const newTeam = await addTeamToFirestore(teamData, user.uid);
  //     const newTeamForUser = { ...newTeam, createdAt: new Date().toISOString() };

  //     const userRef = doc(db, "users", user.uid);
  //     await setDoc(userRef, {
  //       teams: arrayUnion(newTeamForUser)
  //     }, { merge: true });

  //     // Re-fetch user to get updated team list
  //     const docSnap = await getDoc(userRef);
  //     if (docSnap.exists()) {
  //       const updatedUser = docSnap.data() as UserProfile;
  //       // Also set the new team as active
  //       updatedUser.activeTeamId = newTeam.id;
  //       setUser(updatedUser);
  //     }

  //     toast({ title: "Success", description: "Team created." });
  //     return true;
  //   } catch (error) {
  //     console.error("Error adding team: ", error);
  //     toast({
  //       title: "Error",
  //       description: "There was a problem adding the team.",
  //       variant: "destructive",
  //     });
  //     return false;
  //   }
  // };

  const addTeam = async (
    teamData: Omit<Team, "id" | "createdAt" | "members">
  ): Promise<boolean> => {
    if (!user) return false;
    try {
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
          activeTeamId: newTeam.id, // Set activeTeamId here
        },
        { merge: true }
      );

      // Re-fetch user to get updated team list
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const updatedUser = docSnap.data() as UserProfile;
        setUser(updatedUser);
      }

      toast({ title: "Success", description: "Team created." });
      return true;
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
    }
  };

  const sendInvite = async (teamId: string, inviteeEmail: string) => {
    try {
      const response = await fetch("/api/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId, inviteeEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invitation");
      }

      const data = await response.json();
      toast({ title: "Success", description: "Invitation sent." });
      return data.previewUrl; // Returning the Ethereal preview URL
    } catch (error) {
      console.error("Error sending invite: ", error);
      toast({
        title: "Error",
        description: "There was a problem sending the invitation.",
        variant: "destructive",
      });
    }
  };

  const acceptInvite = async (token: string) => {
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
      // Re-fetch user to get updated team list
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
    }
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Google", error);
      toast({
        title: "Login Failed",
        description: "There was a problem signing you in. Please try again.",
        variant: "destructive",
      });
    });
  };

  const signOut = () => {
    firebaseSignOut(auth)
      .then(() => {
        setUser(null);
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out", error);
      });
  };

  const activeTeam = useMemo(
    () => user?.teams.find((t) => t.id === user.activeTeamId),
    [user?.teams, user?.activeTeamId]
  );
  const posts = useMemo(
    () => (user ? allPosts.filter((p) => p.teamId === user.activeTeamId) : []),
    [allPosts, user]
  );
  const contentPlans = useMemo(
    () =>
      user ? allContentPlans.filter((p) => p.teamId === user.activeTeamId) : [],
    [allContentPlans, user]
  );

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
    signOut,
    sendInvite,
    acceptInvite,
  };

  if (user === undefined) {
    return null; 
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

    