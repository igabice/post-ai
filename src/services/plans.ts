import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ContentPlan } from "@/lib/types";

export const addContentPlanToFirestore = async (
  plan: Omit<ContentPlan, "id" | "createdAt" | "teamId">,
  teamId: string
): Promise<ContentPlan> => {
  const contentPlanCollectionRef = collection(db, "contentPlans");
  const newPlanRef = await addDoc(contentPlanCollectionRef, {
    ...plan,
    teamId,
    createdAt: serverTimestamp(),
  });

  return {
    ...plan,
    id: newPlanRef.id,
    teamId,
    createdAt: new Date(),
  };
};

export const getContentPlansFromFirestore = async (
  teamId: string
): Promise<ContentPlan[]> => {
  const q = query(
    collection(db, "contentPlans"),
    where("teamId", "==", teamId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as ContentPlan)
  );
};
