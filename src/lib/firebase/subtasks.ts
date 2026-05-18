import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, writeBatch, increment, getDoc } from 'firebase/firestore';
import { db } from './config';
import { Subtask } from '../types';
import { logActivity } from './tasks';

export const getSubtasksRef = (userId: string, taskId: string) => 
  collection(db, `users/${userId}/tasks/${taskId}/subtasks`);

export const createSubtask = async (userId: string, taskId: string, title: string): Promise<Subtask> => {
  const subtasksRef = getSubtasksRef(userId, taskId);
  
  // Get max order
  const q = query(subtasksRef, orderBy('order', 'desc'));
  const snap = await getDocs(q);
  const maxOrder = snap.empty ? 0 : snap.docs[0].data().order || 0;

  const docRef = await addDoc(subtasksRef, {
    title,
    isDone: false,
    order: maxOrder + 1,
    createdAt: serverTimestamp()
  });

  // Update task counters
  const taskRef = doc(db, `users/${userId}/tasks`, taskId);
  await updateDoc(taskRef, {
    'subtaskCounts.total': increment(1),
    updatedAt: serverTimestamp()
  });

  await logActivity(userId, taskId, 'subtask_added', { title });

  return {
    id: docRef.id,
    title,
    isDone: false,
    order: maxOrder + 1
  };
};

export const updateSubtask = async (userId: string, taskId: string, subtaskId: string, data: Partial<Subtask>): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks/${taskId}/subtasks`, subtaskId);
  await updateDoc(docRef, { ...data });
};

export const toggleSubtask = async (userId: string, taskId: string, subtaskId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks/${taskId}/subtasks`, subtaskId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const subtask = snap.data() as Subtask;
  const newDone = !subtask.isDone;

  await updateDoc(docRef, { isDone: newDone });

  // Update task counters
  const taskRef = doc(db, `users/${userId}/tasks`, taskId);
  await updateDoc(taskRef, {
    'subtaskCounts.done': increment(newDone ? 1 : -1),
    updatedAt: serverTimestamp()
  });

  if (newDone) {
    await logActivity(userId, taskId, 'subtask_completed', { title: subtask.title });
  }
};

export const deleteSubtask = async (userId: string, taskId: string, subtaskId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks/${taskId}/subtasks`, subtaskId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const subtask = snap.data() as Subtask;

  await deleteDoc(docRef);

  // Update task counters
  const taskRef = doc(db, `users/${userId}/tasks`, taskId);
  const updates: any = {
    'subtaskCounts.total': increment(-1),
    updatedAt: serverTimestamp()
  };
  if (subtask.isDone) {
    updates['subtaskCounts.done'] = increment(-1);
  }
  await updateDoc(taskRef, updates);
};

export const reorderSubtasks = async (userId: string, taskId: string, orderedIds: string[]): Promise<void> => {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    const docRef = doc(db, `users/${userId}/tasks/${taskId}/subtasks`, id);
    batch.update(docRef, { order: index });
  });
  await batch.commit();
};

export const getSubtasksByTask = async (userId: string, taskId: string): Promise<Subtask[]> => {
  const q = query(getSubtasksRef(userId, taskId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subtask));
};
