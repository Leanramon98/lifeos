"use client";

import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useNotes } from './useNotes';
import { useProjects } from './useProjects';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toJSDate } from '../utils/dates';

export const useWorkspaceDashboard = (workspaceId: string) => {
  const { allTasks, updateTask, isLoading: isLoadingTasks } = useTasks({ workspaceId });
  const { notes, isLoading: isLoadingNotes } = useNotes({ workspaceId });
  const { projects, isLoading: isLoadingProjects } = useProjects({ workspaceId });

  const isLoading = isLoadingTasks || isLoadingNotes || isLoadingProjects;

  const activeTasks = useMemo(() => {
    return allTasks
      .filter(t => t.status !== 'done')
      .slice(0, 8);
  }, [allTasks]);

  const topProjects = useMemo(() => {
    return projects
      .filter(p => p.status === 'active')
      .slice(0, 5);
  }, [projects]);

  const recentNotes = useMemo(() => {
    return notes.slice(0, 4);
  }, [notes]);

  const stats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'done').length;
    const inProgress = allTasks.filter(t => t.status === 'doing').length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, progressPct };
  }, [allTasks]);

  const recentActivity = useMemo(() => {
    // We synthesize a timeline from the updated/created dates of tasks, projects, notes.
    // Real activity logging would use the TaskActivity interface, but since we don't have a global activity collection yet, we use a simple heuristic.
    const activity: any[] = [];
    
    allTasks.forEach(t => {
      const d = toJSDate(t.updatedAt);
      if (d) {
        activity.push({
          id: `task-${t.id}`,
          type: 'task',
          title: `Tarea ${t.status === 'done' ? 'completada' : 'actualizada'}: ${t.title}`,
          date: d,
        });
      }
    });

    projects.forEach(p => {
      const d = toJSDate(p.updatedAt);
      if (d) {
        activity.push({
          id: `project-${p.id}`,
          type: 'project',
          title: `Proyecto actualizado: ${p.name}`,
          date: d,
        });
      }
    });

    notes.forEach(n => {
      const d = toJSDate(n.updatedAt);
      if (d) {
        activity.push({
          id: `note-${n.id}`,
          type: 'note',
          title: `Nota editada: ${n.title || 'Sin título'}`,
          date: d,
        });
      }
    });

    return activity
      .filter(a => a.date)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [allTasks, projects, notes]);

  return {
    activeTasks,
    topProjects,
    recentNotes,
    stats,
    recentActivity,
    isLoading,
    updateTask,
  };
};
