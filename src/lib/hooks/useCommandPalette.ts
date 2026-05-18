"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../stores/useUIStore';
import { useTasks } from './useTasks';
import { useProjects } from './useProjects';
import { useNotes } from './useNotes';
import { useWorkspaces } from './useWorkspaces';
import Fuse from 'fuse.js';

export const useCommandPalette = () => {
  const router = useRouter();
  const { 
    commandPaletteOpen: isOpen, 
    setCommandPaletteOpen,
    recentCommandItems: recentItems,
    addRecentCommandItem
  } = useUIStore();

  const [query, setQuery] = useState('');

  const { allTasks } = useTasks();
  const { projects } = useProjects();
  const { notes, pinnedNotes } = useNotes();
  const allNotes = useMemo(() => [...pinnedNotes, ...notes], [pinnedNotes, notes]);
  const { workspaces } = useWorkspaces();

  // Initialize Fuse instances
  const fuseTasks = useMemo(() => new Fuse(allTasks, { keys: ['title'], threshold: 0.3 }), [allTasks]);
  const fuseProjects = useMemo(() => new Fuse(projects, { keys: ['name', 'description'], threshold: 0.3 }), [projects]);
  const fuseNotes = useMemo(() => new Fuse(allNotes, { keys: ['title', 'contentText'], threshold: 0.3 }), [allNotes]);
  const fuseWorkspaces = useMemo(() => new Fuse(workspaces, { keys: ['name'], threshold: 0.3 }), [workspaces]);

  const results = useMemo(() => {
    if (!query) return { tasks: [], projects: [], notes: [], workspaces: [] };
    
    return {
      tasks: fuseTasks.search(query).map(r => r.item).slice(0, 5),
      projects: fuseProjects.search(query).map(r => r.item).slice(0, 5),
      notes: fuseNotes.search(query).map(r => r.item).slice(0, 5),
      workspaces: fuseWorkspaces.search(query).map(r => r.item).slice(0, 5),
    };
  }, [query, fuseTasks, fuseProjects, fuseNotes, fuseWorkspaces]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!isOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setCommandPaletteOpen]);

  const open = () => setCommandPaletteOpen(true);
  const close = () => {
    setCommandPaletteOpen(false);
    setQuery('');
  };
  const toggle = () => setCommandPaletteOpen(!isOpen);

  const navigateToItem = (item: any, type: 'task' | 'project' | 'note' | 'workspace') => {
    let url = '';
    let title = '';
    let context = '';

    if (type === 'task') {
      // In this version we open task details (which might be a modal or page depending on setup)
      // The prompt says "Click abre Task Detail", we might just route to /tareas?taskId=
      url = `/tareas?taskId=${item.id}`;
      title = item.title;
      context = `${item.workspaceName} · ${item.status}`;
    } else if (type === 'project') {
      url = `/proyectos/${item.id}`;
      title = item.name;
      context = item.workspaceName;
    } else if (type === 'note') {
      url = `/notas/${item.id}`;
      title = item.title || 'Sin título';
      context = 'Nota';
    } else if (type === 'workspace') {
      url = `/workspaces/${item.slug}`;
      title = item.name;
    }

    if (type !== 'workspace') {
      addRecentCommandItem({ id: item.id, type, title, context, url });
    }

    close();
    router.push(url);
  };

  const executeAction = (actionUrl: string) => {
    close();
    router.push(actionUrl);
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    results,
    recentItems,
    navigateToItem,
    executeAction,
    workspaces // expose for empty state workspaces list
  };
};
