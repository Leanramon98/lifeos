"use client";

import React, { useEffect, useState } from "react";
import { LayoutList, Kanban, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store/useUIStore";
import { cn } from "@/lib/utils";

interface Props {
  scope: 'global' | 'workspace' | 'project';
  workspaceId?: string;
  projectId?: string;
}

export function TasksViewSwitcher({ scope, workspaceId, projectId }: Props) {
  const ui = useUIStore();
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `leso_tasks_view_${scope}${workspaceId ? `_${workspaceId}` : ''}${projectId ? `_${projectId}` : ''}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as any;
    if (saved && ['list', 'kanban', 'calendar'].includes(saved)) {
      ui.setTaskViewMode(saved);
    }
    setIsLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, ui.taskViewMode);
    }
  }, [ui.taskViewMode, storageKey, isLoaded]);

  return (
    <div className="flex items-center bg-surface border border-border rounded-md p-1 w-fit">
      <Button 
        variant={ui.taskViewMode === 'list' ? 'secondary' : 'ghost'} 
        size="sm" 
        className="h-7 px-3 text-xs"
        onClick={() => ui.setTaskViewMode('list')}
      >
        <LayoutList className="w-3.5 h-3.5 mr-1.5" /> Lista
      </Button>
      
      <Button 
        variant={ui.taskViewMode === 'kanban' ? 'secondary' : 'ghost'} 
        size="sm" 
        className="h-7 px-3 text-xs relative"
        onClick={() => ui.setTaskViewMode('kanban')}
      >
        <Kanban className="w-3.5 h-3.5 mr-1.5" /> Tablero
      </Button>

      <Button 
        variant={ui.taskViewMode === 'calendar' ? 'secondary' : 'ghost'} 
        size="sm" 
        className="h-7 px-3 text-xs"
        onClick={() => ui.setTaskViewMode('calendar')}
      >
        <Calendar className="w-3.5 h-3.5 mr-1.5" /> Calendario
      </Button>
    </div>
  );
}
