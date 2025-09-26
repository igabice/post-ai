import {
  doc,
  writeBatch,
  serverTimestamp,
  collection,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Team, TeamMember, Permissions } from "@/lib/types";

export const completeOnboardingInFirestore = async (
  user: UserProfile,
  userData: Omit<
    UserProfile,
    "uid" | "avatarUrl" | "teams" | "activeTeamId" | "isOnboardingCompleted"
  >,
  teamData: Omit<Team, "id" | "members" | "createdAt">
) => {
  const clientDate = new Date();
  const teamCollectionRef = collection(db, "teams");
  const newTeamRef = doc(teamCollectionRef);
  const newTeamId = newTeamRef.id;

  const adminPermissions: Permissions = {
    createPost: true,
    editPost: true,
    createContentPlan: true,
    sendInvites: true,
    isAdmin: true,
  };

  const newMember: TeamMember = {
    status: "active",
    permissions: adminPermissions,
  };

  const newTeamForCollection: Team = {
    ...teamData,
    description: teamData.description || "",
    id: newTeamId,
    createdAt: serverTimestamp(),
    members: {
      [user.uid]: newMember,
    },
  };

  const newTeamForUser: Team = {
    ...newTeamForCollection,
    createdAt: clientDate.toISOString(),
  };

  const updatedUserForFirestore: UserProfile = {
    uid: user.uid,
    name: userData.name,
    avatarUrl: user.avatarUrl,
    topicPreferences: userData.topicPreferences,
    postFrequency: userData.postFrequency,
    signature: userData.signature || "",
    teams: [newTeamForUser],
    activeTeamId: newTeamId,
    isOnboardingCompleted: true,
    defaultLayout: "calendar",
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(db);

  const userRef = doc(db, "users", user.uid);
  batch.set(userRef, updatedUserForFirestore);

  batch.set(newTeamRef, newTeamForCollection);

  await batch.commit();

  const updatedUserForState = {
    ...updatedUserForFirestore,
    updatedAt: clientDate.toISOString(),
  };

  return updatedUserForState;
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | undefined> => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return undefined;
};

export const updateUserActiveTeam = async (userId: string, teamId: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { activeTeamId: teamId });
};

// services/user.ts - Add missing function
export const createUserProfile = async (
  userProfile: UserProfile
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userProfile.uid);
    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error("Failed to create user profile");
  }
};
