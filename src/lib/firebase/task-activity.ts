import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { TaskActivity } from '../types';

export const getActivityByTask = async (userId: string, taskId: string): Promise<TaskActivity[]> => {
  const activityRef = collection(db, `users/${userId}/tasks/${taskId}/activity`);
  const q = query(activityRef, orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskActivity));
};
