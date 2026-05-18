import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  writeBatch,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './config';
import { Task, TaskFormData, Workspace, Project, ActivityType } from '../types';
import { recalculateProjectStats } from './projects';

export const getTasksRef = (userId: string) => collection(db, `users/${userId}/tasks`);

/**
 * Log activity for a specific task
 */
export const logActivity = async (userId: string, taskId: string, type: ActivityType, meta: Record<string, any> = {}) => {
  const activityRef = collection(db, `users/${userId}/tasks/${taskId}/activity`);
  await addDoc(activityRef, {
    type,
    meta,
    createdAt: serverTimestamp()
  });
};

export const createTask = async (userId: string, data: TaskFormData): Promise<Task> => {
  const tasksRef = getTasksRef(userId);
  const workspaceRef = doc(db, `users/${userId}/workspaces`, data.workspaceId);
  const workspaceSnap = await getDoc(workspaceRef);
  
  if (!workspaceSnap.exists()) throw new Error('Workspace no encontrado');
  const workspace = workspaceSnap.data() as Workspace;

  let projectName = null;
  let projectColor = null;
  let areaSlug = workspace.areaSlug;

  if (data.projectId) {
    const projectRef = doc(db, `users/${userId}/projects`, data.projectId);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      const project = projectSnap.data() as Project;
      projectName = project.name;
    }
  }

  // Get current max order
  const q = query(tasksRef, where("workspaceId", "==", data.workspaceId), orderBy('order', 'desc'));
  const snapshot = await getDocs(q);
  const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order || 0;

  const newDocRef = doc(tasksRef);
  const now = serverTimestamp();

  const newTask: Partial<Task> = {
    id: newDocRef.id,
    projectId: data.projectId || null,
    projectName,
    workspaceId: data.workspaceId,
    workspaceName: workspace.name,
    workspaceColor: workspace.color,
    workspaceSlug: workspace.slug,
    areaSlug: workspace.areaSlug,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
    completedAt: (data.status === 'done') ? now as any : null,
    tags: data.tags || [],
    subtaskCounts: { total: 0, done: 0 },
    hasAttachments: false,
    order: maxOrder + 1,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await setDoc(newDocRef, newTask);
  
  // Log activity
  await logActivity(userId, newDocRef.id, 'created', { title: data.title });

  // Update project stats if needed
  if (data.projectId) {
    await recalculateProjectStats(userId, data.projectId);
  }

  return {
    ...newTask,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  } as Task;
};

export const updateTask = async (userId: string, taskId: string, data: Partial<Task>): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks`, taskId);
  const oldSnap = await getDoc(docRef);
  if (!oldSnap.exists()) return;
  const oldTask = oldSnap.data() as Task;

  const updates: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Handle status changes for completedAt
  if (data.status && data.status !== oldTask.status) {
    if (data.status === 'done') {
      updates.completedAt = serverTimestamp();
      await logActivity(userId, taskId, 'completed');
    } else if (oldTask.status === 'done') {
      updates.completedAt = null;
      await logActivity(userId, taskId, 'uncompleted');
    }
    await logActivity(userId, taskId, 'status_changed', { from: oldTask.status, to: data.status });
  }

  // Handle project changes (denormalization)
  if (data.projectId !== undefined && data.projectId !== oldTask.projectId) {
    if (data.projectId) {
      const projectRef = doc(db, `users/${userId}/projects`, data.projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const project = projectSnap.data() as Project;
        updates.projectName = project.name;
        updates.workspaceId = project.workspaceId;
        updates.workspaceName = project.workspaceName;
        updates.workspaceColor = project.workspaceColor;
        updates.workspaceSlug = project.workspaceSlug;
        updates.areaSlug = project.areaSlug;
      }
    } else {
      updates.projectId = null;
      updates.projectName = null;
    }
    await logActivity(userId, taskId, 'project_changed', { from: oldTask.projectId, to: data.projectId });
  }

  if (data.priority && data.priority !== oldTask.priority) {
    await logActivity(userId, taskId, 'priority_changed', { from: oldTask.priority, to: data.priority });
  }

  if (data.dueDate !== undefined) {
    await logActivity(userId, taskId, 'due_date_changed', { from: oldTask.dueDate, to: data.dueDate });
  }

  await updateDoc(docRef, updates);

  // Recalculate stats for old and new projects if changed
  if (oldTask.projectId) await recalculateProjectStats(userId, oldTask.projectId);
  if (data.projectId && data.projectId !== oldTask.projectId) await recalculateProjectStats(userId, data.projectId);
  // Also recal if status changed within same project
  if (data.status && oldTask.projectId && !data.projectId) await recalculateProjectStats(userId, oldTask.projectId);
};

export const completeTask = async (userId: string, taskId: string) => {
  return updateTask(userId, taskId, { status: 'done' });
};

export const uncompleteTask = async (userId: string, taskId: string) => {
  return updateTask(userId, taskId, { status: 'todo' });
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks`, taskId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const task = snap.data() as Task;

  // TODO: Delete subcollections (updates, subtasks, activity, attachments)
  // Firestore doesn't support recursive delete from client SDK easily.
  // We'll leave it as is or implement a batch if critical.
  
  await deleteDoc(docRef);

  if (task.projectId) {
    await recalculateProjectStats(userId, task.projectId);
  }
};

export const bulkUpdateTasks = async (userId: string, taskIds: string[], updates: Partial<Task>): Promise<void> => {
  const batch = writeBatch(db);
  taskIds.forEach(id => {
    const docRef = doc(db, `users/${userId}/tasks`, id);
    batch.update(docRef, { ...updates, updatedAt: serverTimestamp() });
  });
  await batch.commit();
  
  // This is expensive if many projects are involved, but for bulk it's needed.
  // We could optimize by collecting unique projectIds.
};

export const reorderTasks = async (userId: string, taskIds: string[]): Promise<void> => {
  const batch = writeBatch(db);
  taskIds.forEach((id, index) => {
    const docRef = doc(db, `users/${userId}/tasks`, id);
    batch.update(docRef, { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

export const getTasksByWorkspace = async (userId: string, workspaceId: string): Promise<Task[]> => {
  const q = query(getTasksRef(userId), where("workspaceId", "==", workspaceId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
};

export const getTasksByProject = async (userId: string, projectId: string): Promise<Task[]> => {
  const q = query(getTasksRef(userId), where("projectId", "==", projectId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
};

export const propagateWorkspaceChangesToTasks = async (userId: string, workspaceId: string, newData: Partial<Workspace>) => {
  const q = query(getTasksRef(userId), where("workspaceId", "==", workspaceId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  const updates: any = {};
  
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
