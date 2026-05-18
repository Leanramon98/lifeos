import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp, writeBatch, getDoc } from 'firebase/firestore';
import { db } from './config';
import { Workspace, WorkspaceFormData } from '../types';
import { propagateWorkspaceChangesToProjects, deleteProject } from './projects';
import { propagateWorkspaceChangesToTasks } from './tasks';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const getWorkspacesRef = (userId: string) => collection(db, `users/${userId}/workspaces`);

export const createWorkspace = async (userId: string, data: WorkspaceFormData): Promise<Workspace> => {
  const workspacesRef = getWorkspacesRef(userId);
  let baseSlug = generateSlug(data.name);
  let slug = baseSlug;
  
  // Check for unique slug
  let isUnique = false;
  let counter = 1;
  while (!isUnique) {
    const q = query(workspacesRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  // Get current max order
  const allDocs = await getDocs(workspacesRef);
  let maxOrder = 0;
  allDocs.forEach(d => {
    const order = d.data().order || 0;
    if (order > maxOrder) maxOrder = order;
  });

  const newDocRef = doc(workspacesRef);
  const now = serverTimestamp();

  const newWorkspace: Partial<Workspace> = {
    id: newDocRef.id,
    areaId: data.areaSlug,
    areaSlug: data.areaSlug,
    name: data.name,
    slug,
    color: data.color,
    icon: data.icon,
    description: data.description || '',
    isActive: true,
    isArchived: false,
    order: maxOrder + 1,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await setDoc(newDocRef, newWorkspace);

  return {
    ...newWorkspace,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  } as Workspace;
};

export const updateWorkspace = async (userId: string, workspaceId: string, data: Partial<Workspace>): Promise<void> => {
  const docRef = doc(db, `users/${userId}/workspaces`, workspaceId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // Propagate to projects and tasks if denormalized fields changed
  if (data.name || data.color || data.slug || data.areaSlug) {
    await propagateWorkspaceChangesToProjects(userId, workspaceId, data);
    await propagateWorkspaceChangesToTasks(userId, workspaceId, data);
  }
};

export const archiveWorkspace = async (userId: string, workspaceId: string): Promise<void> => {
  return updateWorkspace(userId, workspaceId, { isArchived: true });
};

export const unarchiveWorkspace = async (userId: string, workspaceId: string): Promise<void> => {
  return updateWorkspace(userId, workspaceId, { isArchived: false });
};

export const deleteWorkspace = async (userId: string, workspaceId: string, deleteNotes: boolean = false): Promise<void> => {
  // Cascade delete projects (which will delete tasks)
  const projectsRef = collection(db, `users/${userId}/projects`);
  const q = query(projectsRef, where("workspaceId", "==", workspaceId));
  const projectsSnap = await getDocs(q);
  
  if (!projectsSnap.empty) {
    for (const p of projectsSnap.docs) {
      await deleteProject(userId, p.id, deleteNotes);
    }
  }

  // Also delete tasks without project
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const tq = query(tasksRef, where("workspaceId", "==", workspaceId), where("projectId", "==", null));
  const tasksSnap = await getDocs(tq);
  if (!tasksSnap.empty) {
    const batch = writeBatch(db);
    tasksSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  // Handle Notes
  const notesRef = collection(db, `users/${userId}/notes`);
  const nq = query(notesRef, where("workspaceId", "==", workspaceId));
  const notesSnap = await getDocs(nq);
  if (!notesSnap.empty) {
    const batch = writeBatch(db);
    notesSnap.docs.forEach(d => {
      if (deleteNotes) {
        batch.delete(d.ref);
      } else {
        batch.update(d.ref, { 
          workspaceId: null, 
          workspaceName: null, 
          workspaceColor: null, 
          workspaceSlug: null,
          projectId: null,
          projectName: null,
          updatedAt: serverTimestamp() 
        });
      }
    });
    await batch.commit();
  }

  const docRef = doc(db, `users/${userId}/workspaces`, workspaceId);
  await deleteDoc(docRef);
};

export const reorderWorkspaces = async (userId: string, orderedIds: string[]): Promise<void> => {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    const docRef = doc(db, `users/${userId}/workspaces`, id);
    batch.update(docRef, { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

export const getWorkspaceBySlug = async (userId: string, slug: string): Promise<Workspace | null> => {
  const q = query(getWorkspacesRef(userId), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Workspace;
};
