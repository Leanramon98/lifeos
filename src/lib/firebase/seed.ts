import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { Area } from '../types';

export const seedUserData = async (userId: string, email: string, name: string) => {
  const batch = writeBatch(db);

  const userRef = doc(db, 'users', userId);
  batch.set(userRef, {
    id: userId,
    email,
    name,
    avatarUrl: null,
    settings: {
      theme: 'system',
      density: 'comfortable',
      language: 'es',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const areas: Omit<Area, 'id'>[] = [
    { slug: 'trabajo', name: 'Trabajo', icon: 'Briefcase', order: 1 },
    { slug: 'freelance', name: 'Freelance', icon: 'Handshake', order: 2 },
    { slug: 'emprendimientos', name: 'Emprendimientos', icon: 'Rocket', order: 3 },
    { slug: 'personal', name: 'Personal', icon: 'User', order: 4 },
  ];

  areas.forEach((area) => {
    const areaRef = doc(db, 'users', userId, 'areas', area.slug);
    batch.set(areaRef, {
      ...area,
      id: area.slug,
    });
  });

  await batch.commit();
};
