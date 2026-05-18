import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp, writeBatch, getDoc, orderBy } from 'firebase/firestore';
import { db } from './config';
import { Project, ProjectFormData, Workspace } from '../types';

export const getProjectsRef = (userId: string) => collection(db, `users/${userId}/projects`);

export const createProject = async (userId: string, data: ProjectFormData): Promise<Project> => {
  const projectsRef = getProjectsRef(userId);
  const workspaceRef = doc(db, `users/${userId}/workspaces`, data.workspaceId);
  
  const workspaceSnap = await getDoc(workspaceRef);
  if (!workspaceSnap.exists()) {
    throw new Error('Workspace no encontrado');
  }
  
  const workspace = workspaceSnap.data() as Workspace;

  // Get current max order for projects in this workspace
  const q = query(projectsRef, where("workspaceId", "==", data.workspaceId));
  const allDocs = await getDocs(q);
  let maxOrder = 0;
  allDocs.forEach(d => {
    const order = d.data().order || 0;
    if (order > maxOrder) maxOrder = order;
  });

  const newDocRef = doc(projectsRef);
  const now = serverTimestamp();

  const newProject: Partial<Project> = {
    id: newDocRef.id,
    workspaceId: data.workspaceId,
    workspaceName: workspace.name,
    workspaceColor: workspace.color,
    workspaceSlug: workspace.slug,
    areaSlug: workspace.areaSlug,
    name: data.name,
    description: data.description || '',
    status: data.status,
    startDate: data.startDate as any || null,
    dueDate: data.dueDate as any || null,
    progressPct: 0,
    taskCounts: {
      total: 0,
      done: 0,
      active: 0
    },
    tags: data.tags || [],
    order: maxOrder + 1,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await setDoc(newDocRef, newProject);

  return {
    ...newProject,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  } as Project;
};

export const updateProject = async (userId: string, projectId: string, data: Partial<Project>): Promise<void> => {
  const docRef = doc(db, `users/${userId}/projects`, projectId);
  
  // If workspaceId is updated, we need to denormalize workspace fields
  if (data.workspaceId) {
    const workspaceRef = doc(db, `users/${userId}/workspaces`, data.workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    if (workspaceSnap.exists()) {
      const workspace = workspaceSnap.data() as Workspace;
      data.workspaceName = workspace.name;
      data.workspaceColor = workspace.color;
      data.workspaceSlug = workspace.slug;
      data.areaSlug = workspace.areaSlug;
    }
  }

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const archiveProject = async (userId: string, projectId: string): Promise<void> => {
  return updateProject(userId, projectId, { status: 'archived' });
};

export const deleteProject = async (userId: string, projectId: string, deleteNotes: boolean = false): Promise<void> => {
  // Cascade delete tasks
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const q = query(tasksRef, where("projectId", "==", projectId));
  const tasksSnap = await getDocs(q);
  
  if (!tasksSnap.empty) {
    const batch = writeBatch(db);
    tasksSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  // Handle Notes
  const notesRef = collection(db, `users/${userId}/notes`);
  const nq = query(notesRef, where("projectId", "==", projectId));
  const notesSnap = await getDocs(nq);
  if (!notesSnap.empty) {
    const batch = writeBatch(db);
    notesSnap.docs.forEach(d => {
      if (deleteNotes) {
        batch.delete(d.ref);
      } else {
        batch.update(d.ref, { 
          projectId: null, 
          projectName: null,
          updatedAt: serverTimestamp() 
        });
      }
    });
    await batch.commit();
  }

  const docRef = doc(db, `users/${userId}/projects`, projectId);
  await deleteDoc(docRef);
};

export const reorderProjects = async (userId: string, workspaceId: string, orderedIds: string[]): Promise<void> => {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    const docRef = doc(db, `users/${userId}/projects`, id);
    batch.update(docRef, { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

export const getProjectsByWorkspace = async (userId: string, workspaceId: string): Promise<Project[]> => {
  const q = query(getProjectsRef(userId), where("workspaceId", "==", workspaceId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
};

export const getProjectById = async (userId: string, projectId: string): Promise<Project | null> => {
  const docRef = doc(db, `users/${userId}/projects`, projectId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Project;
};

export const getActiveProjectsAcrossWorkspaces = async (userId: string): Promise<Project[]> => {
  const q = query(getProjectsRef(userId), where("status", "in", ["active", "paused"]));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
};

export const propagateWorkspaceChangesToProjects = async (userId: string, workspaceId: string, newData: Partial<Workspace>) => {
  const q = query(getProjectsRef(userId), where("workspaceId", "==", workspaceId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  const updates: Partial<Project> = {};
  
  if (newData.name) updates.workspaceName = newData.name;
  if (newData.color) updates.workspaceColor = newData.color;
  if (newData.slug) updates.workspaceSlug = newData.slug;
  if (newData.areaSlug) updates.areaSlug = newData.areaSlug;

  if (Object.keys(updates).length === 0) return;

  snapshot.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { ...updates, updatedAt: serverTimestamp() });
  });

  await batch.commit();
};

export const recalculateProjectStats = async (userId: string, projectId: string): Promise<void> => {
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const q = query(tasksRef, where("projectId", "==", projectId));
  const snapshot = await getDocs(q);
  
  const tasks = snapshot.docs.map(d => d.data());
  const total = tasks.length;
  const done = tasks.filter(t => (t as any).status === 'done').length;
  const active = total - done;
  const progressPct = total === 0 ? 0 : Math.round((done / total) * 100);

  const docRef = doc(db, `users/${userId}/projects`, projectId);
  await updateDoc(docRef, {
    taskCounts: { total, done, active },
    progressPct,
    updatedAt: serverTimestamp(),
  });
};
