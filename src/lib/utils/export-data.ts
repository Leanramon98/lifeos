import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AreaSlug } from '../types';

export async function exportAllUserData(userId: string): Promise<string> {
  const data: any = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    workspaces: [],
    projects: [],
    tasks: [],
    notes: []
  };

  try {
    const workspacesRef = collection(db, `users/${userId}/workspaces`);
    const workspacesSnap = await getDocs(workspacesRef);
    data.workspaces = workspacesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const projectsRef = collection(db, `users/${userId}/projects`);
    const projectsSnap = await getDocs(projectsRef);
    data.projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const tasksRef = collection(db, `users/${userId}/tasks`);
    const tasksSnap = await getDocs(tasksRef);
    data.tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const notesRef = collection(db, `users/${userId}/notes`);
    const notesSnap = await getDocs(notesRef);
    data.notes = notesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error('No se pudieron exportar los datos');
  }
}
