import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Team, Invitation } from "@/lib/types";
import { Firestore as AdminFirestore } from 'firebase-admin/firestore';

export const sendInviteToTeam = async (teamId: string, inviteeEmail: string): Promise<string> => {
  const invitationCollectionRef = collection(db, 'invitations');
  const newInvitation = {
    teamId,
    inviteeEmail,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(invitationCollectionRef, newInvitation);
  return docRef.id;
};

export const sendInviteToTeamAdmin = async (adminDb: AdminFirestore, teamId: string, inviteeEmail: string): Promise<string> => {
  const invitationCollectionRef = adminDb.collection('invitations');
  const newInvitation = {
    teamId,
    inviteeEmail,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await invitationCollectionRef.add(newInvitation);
  return docRef.id;
};

export const acceptInvite = async (token: string, user: UserProfile) => {
  const invitationRef = doc(db, "invitations", token);

  await runTransaction(db, async (transaction) => {
    const invitationDoc = await transaction.get(invitationRef);
    if (!invitationDoc.exists() || invitationDoc.data().status !== 'pending') {
      throw new Error("Invitation is invalid or has already been accepted.");
    }

    const invitation = invitationDoc.data() as Invitation;
    const teamId = invitation.teamId;
    const teamRef = doc(db, "teams", teamId);
    const userRef = doc(db, "users", user.uid);

    const teamDoc = await transaction.get(teamRef);
    if (!teamDoc.exists()) {
      throw new Error("Team does not exist.");
    }
    
    const teamData = teamDoc.data() as Team;

    // Add user to team members
    transaction.update(teamRef, {
      members: arrayUnion(user.uid)
    });

    // Add team to user's teams
    transaction.update(userRef, {
      teams: arrayUnion({
        id: teamId,
        name: teamData.name,
        description: teamData.description,
        createdAt: teamData.createdAt,
        members: {
          ...teamData.members,
          [user.uid]: { status: 'active', permissions: { isAdmin: false, createPost: true, editPost: true, createContentPlan: true, sendInvites: false } } // Default permissions for a new member
        }
      })
    });

    // Update invitation status
    transaction.update(invitationRef, {
      status: "accepted"
    });
  });
};