import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Team, TeamMember, Permissions } from "@/lib/types";

export const addTeamToFirestore = async (teamData: Omit<Team, 'id' | 'createdAt' | 'members'>, userId: string): Promise<Team> => {
  const teamCollectionRef = collection(db, 'teams');
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
    status: 'active',
    permissions: adminPermissions,
  };

  const newTeam: Team = {
    ...teamData,
    id: newTeamId,
    createdAt: serverTimestamp(),
    members: {
      [userId]: newMember,
    },
  };

  await setDoc(newTeamRef, newTeam);
  return newTeam;
};