import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { TaskUpdate } from '../types';
import { logActivity } from './tasks';

export const getUpdatesRef = (userId: string, taskId: string) => 
  collection(db, `users/${userId}/tasks/${taskId}/updates`);

export const createUpdate = async (userId: string, taskId: string, content: string): Promise<TaskUpdate> => {
  const updatesRef = getUpdatesRef(userId, taskId);
  const now = serverTimestamp();
  
  const docRef = await addDoc(updatesRef, {
    content,
    createdAt: now,
    updatedAt: now
  });

  await logActivity(userId, taskId, 'update_added');

  return {
    id: docRef.id,
    content,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  };
};

export const updateUpdate = async (userId: string, taskId: string, updateId: string, content: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks/${taskId}/updates`, updateId);
  await updateDoc(docRef, {
    content,
    updatedAt: serverTimestamp()
  });
};

export const deleteUpdate = async (userId: string, taskId: string, updateId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks/${taskId}/updates`, updateId);
  await deleteDoc(docRef);
};

export const getUpdatesByTask = async (userId: string, taskId: string): Promise<TaskUpdate[]> => {
  const q = query(getUpdatesRef(userId, taskId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskUpdate));
};
