"use client";

import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useNotes } from './useNotes';
import { useProjects } from './useProjects';
import { isToday, isThisWeek, isThisMonth, isSameDay } from 'date-fns';

export interface UseDashboardDataOptions {
  period?: 'today' | 'this_week' | 'this_month';
}

export const useDashboardData = (options: UseDashboardDataOptions = { period: 'this_week' }) => {
  const { allTasks, updateTask, isLoading: isLoadingTasks } = useTasks();
  const { notes, isLoading: isLoadingNotes } = useNotes();
  const { projects, isLoading: isLoadingProjects } = useProjects();

  const isLoading = isLoadingTasks || isLoadingNotes || isLoadingProjects;

  const todayTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (t.status === 'done') return false; // Filter out done tasks from "today's tasks" view unless they were completed today? The spec says "Tachado + fade si está done". So we keep them.
      if (!t.dueDate) return false;
      
      const date = t.dueDate.seconds ? new Date(t.dueDate.seconds * 1000) : t.dueDate;
      return isToday(date);
    });
  }, [allTasks]);

  const recentNotes = useMemo(() => {
    // Already sorted by updatedAt desc in useNotes
    return notes.slice(0, 3);
  }, [notes]);

  const activeProjects = useMemo(() => {
    return projects
      .filter(p => p.status === 'active')
      // Sort by updatedAt desc (assuming it's not already sorted that way, but useProjects usually sorts by order. Let's force sort)
      .sort((a, b) => {
        const dateA = a.updatedAt?.seconds || 0;
        const dateB = b.updatedAt?.seconds || 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [projects]);

  const taskStats = useMemo(() => {
    const period = options.period || 'this_week';
    
    const completedTasks = allTasks.filter(t => {
      if (t.status !== 'done') return false;
      // If completedAt is missing, fallback to updatedAt
      const dateVal = t.completedAt || t.updatedAt;
      if (!dateVal) return false;
      
      const date = dateVal.seconds ? new Date(dateVal.seconds * 1000) : dateVal;
      
      if (period === 'today') return isToday(date);
      if (period === 'this_week') return isThisWeek(date, { weekStartsOn: 1 });
      if (period === 'this_month') return isThisMonth(date);
      return false;
    });

    return {
      completed: completedTasks.length,
      completedChange: 0, // Placeholder
    };
  }, [allTasks, options.period]);

  return {
    todayTasks,
    recentNotes,
    activeProjects,
    taskStats,
    isLoading,
    updateTask, // to mark tasks as done
  };
};
