import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Team, TeamMember, Permissions, SocialMediaAccount } from "@/lib/types";

export const addTeamToFirestore = async (
  teamData: Omit<Team, "id" | "createdAt" | "members">,
  userId: string
): Promise<Team> => {
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

  const newTeam: Team = {
    ...teamData,
    id: newTeamId,
    createdAt: serverTimestamp(),
    members: {
      [userId]: newMember,
    },
    socialMediaAccounts: [],
  };

  await setDoc(newTeamRef, newTeam);
  return newTeam;
};

export const updateTeamSocialMediaAccounts = async (
  teamId: string,
  socialMediaAccounts: SocialMediaAccount[]
): Promise<void> => {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    socialMediaAccounts: socialMediaAccounts,
  });
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);

  if (teamSnap.exists()) {
    return teamSnap.data() as Team;
  } else {
    return null;
  }
};
