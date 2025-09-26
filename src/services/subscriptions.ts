import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { UserProfile } from "@/lib/types";

export const manageSubscriptionStatusChange = async (
  customerId: string,
  subscriptionId: string,
  createAction: boolean
) => {
  // Get customer's user ID from your Firestore (assuming you store customerId in UserProfile)
  const usersCollectionRef = collection(db, "users");
  const userQuery = query(
    usersCollectionRef,
    where("stripeCustomerId", "==", customerId)
  );
  const userQuerySnapshot = await getDocs(userQuery);

  if (userQuerySnapshot.empty) {
    console.error("User not found for Stripe customer ID:", customerId);
    return;
  }

  const userDoc = userQuerySnapshot.docs[0];
  const userId = userDoc.id;

  const userProfileRef = doc(db, "users", userId);

  if (createAction) {
    // Create or update subscription details
    await updateDoc(userProfileRef, {
      stripeSubscriptionId: subscriptionId,
      // Add other subscription details as needed
      updatedAt: serverTimestamp(),
    });
  } else {
    // Handle subscription cancellation or end
    await updateDoc(userProfileRef, {
      stripeSubscriptionId: null,
      // Clear other subscription details
      updatedAt: serverTimestamp(),
    });
  }

  console.log(
    `Subscription ${subscriptionId} for user ${userId} managed successfully.`
  );
};
