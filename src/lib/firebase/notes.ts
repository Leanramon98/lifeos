import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  orderBy, 
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Note, NoteFormData } from '../types';
import { getTemplate } from '../utils/note-templates';

export const getNotesRef = (userId: string) => collection(db, `users/${userId}/notes`);

export const createNote = async (userId: string, data: NoteFormData): Promise<Note> => {
  const notesRef = getNotesRef(userId);
  const newDocRef = doc(notesRef);
  const now = serverTimestamp();

  let title = data.title || '';
  let content = data.content || JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

  if (data.template && data.template !== 'blank') {
    const template = getTemplate(data.template);
    if (!title) title = template.title;
    content = JSON.stringify(template.content);
  }

  // Denormalization
  let workspaceName = null;
  let workspaceColor = null;
  let workspaceSlug = null;
  let projectName = null;

  if (data.workspaceId) {
    const wsSnap = await getDoc(doc(db, `users/${userId}/workspaces`, data.workspaceId));
    if (wsSnap.exists()) {
      const ws = wsSnap.data();
      workspaceName = ws.name;
      workspaceColor = ws.color;
      workspaceSlug = ws.slug;
    }
  }

  if (data.projectId) {
    const pSnap = await getDoc(doc(db, `users/${userId}/projects`, data.projectId));
    if (pSnap.exists()) {
      projectName = pSnap.data().name;
    }
  }

  const newNote: Partial<Note> = {
    id: newDocRef.id,
    workspaceId: data.workspaceId || null,
    workspaceName,
    workspaceColor,
    workspaceSlug,
    projectId: data.projectId || null,
    projectName,
    title: title || 'Sin título',
    content,
    contentText: '', // Will be updated by editor on first save
    tags: data.tags || [],
    isPinned: false,
    isArchived: false,
    wordCount: 0,
    readingTime: 0,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await setDoc(newDocRef, newNote);

  return {
    ...newNote,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  } as Note;
};

export const updateNote = async (userId: string, noteId: string, data: Partial<Note>): Promise<void> => {
  const docRef = doc(db, `users/${userId}/notes`, noteId);
  const updates: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updates);
};

export const deleteNote = async (userId: string, noteId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/notes`, noteId);
  await deleteDoc(docRef);
};

export const togglePinNote = async (userId: string, noteId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/notes`, noteId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, { isPinned: !snap.data().isPinned, updatedAt: serverTimestamp() });
  }
};

export const archiveNote = async (userId: string, noteId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/notes`, noteId);
  await updateDoc(docRef, { isArchived: true, updatedAt: serverTimestamp() });
};

export const unarchiveNote = async (userId: string, noteId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/notes`, noteId);
  await updateDoc(docRef, { isArchived: false, updatedAt: serverTimestamp() });
};

export const linkNoteToWorkspace = async (userId: string, noteId: string, workspaceId: string | null): Promise<void> => {
  let workspaceName = null;
  let workspaceColor = null;
  let workspaceSlug = null;

  if (workspaceId) {
    const wsSnap = await getDoc(doc(db, `users/${userId}/workspaces`, workspaceId));
    if (wsSnap.exists()) {
      const ws = wsSnap.data();
      workspaceName = ws.name;
      workspaceColor = ws.color;
      workspaceSlug = ws.slug;
    }
  }

  await updateNote(userId, noteId, { 
    workspaceId, 
    workspaceName, 
    workspaceColor, 
    workspaceSlug,
    projectId: null, // Clear project if workspace changes
    projectName: null
  } as any);
};

export const linkNoteToProject = async (userId: string, noteId: string, projectId: string | null): Promise<void> => {
  let projectName = null;

  if (projectId) {
    const pSnap = await getDoc(doc(db, `users/${userId}/projects`, projectId));
    if (pSnap.exists()) {
      projectName = pSnap.data().name;
    }
  }

  await updateNote(userId, noteId, { projectId, projectName } as any);
};

export const getNotesByWorkspace = async (userId: string, workspaceId: string): Promise<Note[]> => {
  const q = query(getNotesRef(userId), where("workspaceId", "==", workspaceId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
};

export const getNotesByProject = async (userId: string, projectId: string): Promise<Note[]> => {
  const q = query(getNotesRef(userId), where("projectId", "==", projectId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
};

export const getAllUserTags = async (userId: string): Promise<string[]> => {
  const snap = await getDocs(getNotesRef(userId));
  const tags = new Set<string>();
  snap.docs.forEach(d => {
    const noteTags = d.data().tags as string[];
    if (noteTags) noteTags.forEach(t => tags.add(t));
  });
  return Array.from(tags).sort();
};
