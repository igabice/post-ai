import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  runTransaction,
  arrayUnion,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Team, Invitation } from "@/lib/types";
import { Firestore as AdminFirestore } from "firebase-admin/firestore";

export const addInviteToFirestore = async (
  inviteData: Omit<Invitation, "id" | "createdAt" | "status">
): Promise<string> => {
  const docRef = await addDoc(collection(db, "invitations"), {
    ...inviteData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const deleteInviteFromFirestore = async (
  inviteId: string
): Promise<void> => {
  await deleteDoc(doc(db, "invitations", inviteId));
};

export const resendInviteEmail = async (
  teamId: string,
  inviteeEmail: string,
  invitationId: string
): Promise<string | undefined> => {
  try {
    const response = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, inviteeEmail, invitationId }),
    });

    if (!response.ok) throw new Error("Failed to resend invitation");

    const data = await response.json();
    return data.previewUrl;
  } catch (error) {
    console.error("Error resending invite: ", error);
    throw error;
  }
};

export const sendInviteToTeam = async (
  teamId: string,
  inviteeEmail: string
): Promise<string> => {
  const invitationCollectionRef = collection(db, "invitations");
  const newInvitation = {
    teamId,
    inviteeEmail,
    status: "pending" as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(invitationCollectionRef, newInvitation);
  return docRef.id;
};

export const sendInviteToTeamAdmin = async (
  adminDb: AdminFirestore,
  teamId: string,
  inviteeEmail: string
): Promise<string> => {
  const invitationCollectionRef = adminDb.collection("invitations");
  const newInvitation = {
    teamId,
    inviteeEmail,
    status: "pending" as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await invitationCollectionRef.add(newInvitation);
  return docRef.id;
};

export const acceptInvite = async (token: string, user: UserProfile) => {
  const invitationRef = doc(db, "invitations", token);

  await runTransaction(db, async (transaction) => {
    const invitationDoc = await transaction.get(invitationRef);
    if (!invitationDoc.exists() || invitationDoc.data().status !== "pending") {
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
      [`members.${user.uid}`]: {
        status: "active",
        permissions: {
          isAdmin: false,
          createPost: true,
          editPost: true,
          createContentPlan: true,
          sendInvites: false,
        },
      },
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
          [user.uid]: {
            status: "active",
            permissions: {
              isAdmin: false,
              createPost: true,
              editPost: true,
              createContentPlan: true,
              sendInvites: false,
            },
          }, // Default permissions for a new member
        },
      }),
    });

    // Update invitation status
    transaction.update(invitationRef, {
      status: "accepted",
    });
  });
};

export const getPendingInvites = async (
  teamId: string
): Promise<Invitation[]> => {
  const q = query(
    collection(db, "invitations"),
    where("teamId", "==", teamId),
    where("status", "==", "pending")
  );
  const querySnapshot = await getDocs(q);
  console.log(
    "Pending invites fetched:",
    querySnapshot.docs.map((doc) => doc.data())
  );
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Invitation[];
};
