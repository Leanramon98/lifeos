import { collection, doc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './config';
import { Area } from '../types';

export const getAreasRef = (userId: string) => collection(db, `users/${userId}/areas`);

export const getAreas = async (userId: string): Promise<Area[]> => {
  const q = query(getAreasRef(userId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Area));
};

export const updateAreaName = async (userId: string, areaId: string, newName: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/areas`, areaId);
  await updateDoc(docRef, { name: newName });
};
