"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onSnapshot, query, orderBy, where, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { db } from "../firebase/config";
import { Note, NoteFormData } from "../types";
import * as notesService from "../firebase/notes";
import { getNotesRef } from "../firebase/notes";

// Mock data initialized inside the module for proof of concept when emulator is down
let mockNotes: Note[] = [
  {
    id: "mock-note-1",
    title: "Bienvenido a LESO LifeOS 🚀",
    content: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "¡Bienvenido a tu nuevo OS de vida!" }]
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Esta es una nota de prueba local. Podés crear, editar, fijar y archivar notas libremente en tiempo real." }
          ]
        }
      ]
    }),
    workspaceId: null,
    projectId: null,
    isPinned: true,
    isArchived: false,
    tags: ["Personal"],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  }
];

// Helper to trigger events to other instances of useNotes hook in memory
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useNotes(options: any = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMockUser = user?.uid === 'mock-user-123';

  // Force local rerenders on mock updates
  useEffect(() => {
    if (isMockUser) {
      const updateNotes = () => {
        let filtered = [...mockNotes];
        if (options.workspaceId) {
          filtered = filtered.filter(n => n.workspaceId === options.workspaceId);
        } else if (options.projectId) {
          filtered = filtered.filter(n => n.projectId === options.projectId);
        }
        setNotes(filtered);
        setIsLoading(false);
      };

      updateNotes();
      listeners.add(updateNotes);
      return () => {
        listeners.delete(updateNotes);
      };
    }
  }, [user?.uid, options.workspaceId, options.projectId]);

  // Real data useEffect
  useEffect(() => {
    if (!user || isMockUser) return;

    let q = query(getNotesRef(user.uid), orderBy("updatedAt", "desc"));

    if (options.workspaceId) {
      q = query(getNotesRef(user.uid), where("workspaceId", "==", options.workspaceId), orderBy("updatedAt", "desc"));
    } else if (options.projectId) {
      q = query(getNotesRef(user.uid), where("projectId", "==", options.projectId), orderBy("updatedAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      
      setNotes(notesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, isMockUser, options.workspaceId, options.projectId]);

  const createNoteMutation = useMutation({
    mutationFn: (data: NoteFormData) => {
      if (isMockUser) {
        // Find workspace details in cache
        const workspaces = queryClient.getQueryData<any[]>(['workspaces', user?.uid]) || [];
        const ws = workspaces.find(w => w.id === data.workspaceId);

        // Find project details in cache
        let projectName = null;
        if (data.projectId) {
          const projects = queryClient.getQueryData<any[]>(['projects', user?.uid]) || [];
          const proj = projects.find(p => p.id === data.projectId);
          if (proj) {
            projectName = proj.name;
          }
        }

        const newNote: Note = {
          id: `mock-note-${Date.now()}`,
          title: data.title || 'Nueva nota',
          content: data.content || '',
          contentText: '',
          workspaceId: data.workspaceId || null,
          workspaceName: ws ? ws.name : null,
          workspaceColor: ws ? ws.color : null,
          workspaceSlug: ws ? ws.slug : null,
          projectId: data.projectId || null,
          projectName,
          isPinned: false,
          isArchived: false,
          tags: data.tags || [],
          wordCount: 0,
          readingTime: 0,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        };
        mockNotes.unshift(newNote);
        notify();
        return Promise.resolve(newNote);
      }
      return notesService.createNote(user!.uid, data);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => {
      if (isMockUser) {
        mockNotes = mockNotes.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date() as any } : n);
        notify();
        return Promise.resolve();
      }
      return notesService.updateNote(user!.uid, id, data);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => {
      if (isMockUser) {
        mockNotes = mockNotes.filter(n => n.id !== id);
        notify();
        return Promise.resolve();
      }
      return notesService.deleteNote(user!.uid, id);
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: (id: string) => {
      if (isMockUser) {
        mockNotes = mockNotes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date() as any } : n);
        notify();
        return Promise.resolve();
      }
      return notesService.togglePinNote(user!.uid, id);
    },
  });

  const archiveNoteMutation = useMutation({
    mutationFn: (id: string) => {
      if (isMockUser) {
        mockNotes = mockNotes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived, updatedAt: new Date() as any } : n);
        notify();
        return Promise.resolve();
      }
      return notesService.archiveNote(user!.uid, id);
    },
  });

  return {
    notes: notes.filter(n => !n.isPinned && !n.isArchived),
    pinnedNotes: notes.filter(n => n.isPinned && !n.isArchived),
    archivedNotes: notes.filter(n => n.isArchived),
    isLoading,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    togglePinNote: togglePinMutation.mutateAsync,
    archiveNote: archiveNoteMutation.mutateAsync,
  };
}

export function useNote(noteId: string) {
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMockUser = user?.uid === 'mock-user-123';

  useEffect(() => {
    if (!user || !noteId) return;

    if (isMockUser) {
      const updateNote = () => {
        const found = mockNotes.find(n => n.id === noteId) || null;
        setNote(found);
        setIsLoading(false);
      };
      updateNote();
      listeners.add(updateNote);
      return () => {
        listeners.delete(updateNote);
      };
    }
  }, [user?.uid, isMockUser, noteId]);

  useEffect(() => {
    if (!user || isMockUser || !noteId) return;

    const unsubscribe = onSnapshot(doc(db, `users/${user.uid}/notes`, noteId), (snapshot) => {
      if (snapshot.exists()) {
        setNote({ id: snapshot.id, ...snapshot.data() } as Note);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, isMockUser, noteId]);

  const updateNoteMutation = useMutation({
    mutationFn: (data: Partial<Note>) => {
      if (isMockUser) {
        mockNotes = mockNotes.map(n => n.id === noteId ? { ...n, ...data, updatedAt: new Date() as any } : n);
        notify();
        return Promise.resolve();
      }
      return notesService.updateNote(user!.uid, noteId, data);
    },
  });

  return {
    note,
    isLoading,
    updateNote: updateNoteMutation.mutateAsync,
  };
}
