import { doc, updateDoc, collection, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";

export const updatePostInFirestore = async (postId: string, postData: Partial<Post>) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, postData);
};

export const addPostToFirestore = async (postData: Omit<Post, 'id' | 'analytics' | 'teamId'>, teamId: string): Promise<Post> => {
  const postCollectionRef = collection(db, 'posts');
  const newPostRef = doc(postCollectionRef);
  const newPostId = newPostRef.id;

  const newPost: Post = {
    ...postData,
    id: newPostId,
    teamId: teamId,
    analytics: { likes: 0, retweets: 0, impressions: 0 },
  };

  await setDoc(newPostRef, newPost);
  return newPost;
};

export const deletePostFromFirestore = async (postId: string) => {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
};

export const getPostFromFirestore = async (postId: string): Promise<Post | undefined> => {
  const postRef = doc(db, "posts", postId);
  const docSnap = await getDoc(postRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Post;
  }
  return undefined;
};
