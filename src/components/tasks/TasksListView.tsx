"use client";

import React, { useState, useMemo } from "react";
import { TaskRow } from "./TaskRow";
import { TaskGroupHeader } from "./TaskGroupHeader";
import { TaskStatusIcon, statusConfig } from "./TaskStatusIcon";
import { useUIStore } from "@/lib/store/useUIStore";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: () => void;
  scope: 'global' | 'workspace' | 'project';
}

export function TasksListView({ tasks, onTaskClick, onToggleTask, onDeleteTask, onQuickAdd, scope }: Props) {
  const ui = useUIStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const groupedTasks = useMemo(() => {
    const groups: Record<string, { title: string; tasks: Task[]; icon?: React.ReactNode; color?: string }> = {};
    const by = ui.taskGroupBy;

    if (by === 'none') {
      groups['all'] = { title: 'Todas las tareas', tasks };
    } else {
      tasks.forEach(task => {
        let key = '';
        let title = '';
        let icon: React.ReactNode = null;
        let color = undefined;

        if (by === 'status') {
          key = task.status;
          title = statusConfig[task.status].label;
          icon = <TaskStatusIcon status={task.status} />;
        } else if (by === 'workspace') {
          key = task.workspaceId;
          title = task.workspaceName;
          color = task.workspaceColor;
        } else if (by === 'project') {
          key = task.projectId || 'no-project';
          title = task.projectName || 'Sin proyecto';
        } else if (by === 'priority') {
          key = task.priority;
          title = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        }

        if (!groups[key]) {
          groups[key] = { title, tasks: [], icon, color };
        }
        groups[key].tasks.push(task);
      });
    }

    return groups;
  }, [tasks, ui.taskGroupBy]);

  if (tasks.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center">
        <p className="text-foreground-secondary mb-4">No se encontraron tareas con los filtros actuales</p>
        <Button variant="outline" onClick={onQuickAdd}>Añadir tarea</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {Object.entries(groupedTasks).map(([key, group]) => (
        <div key={key} className="mb-2">
          <TaskGroupHeader 
            title={group.title} 
            count={group.tasks.length} 
            icon={group.icon}
            color={group.color}
            isCollapsed={collapsedGroups[key]}
            onToggle={() => setCollapsedGroups(p => ({ ...p, [key]: !p[key] }))}
            onAddClick={onQuickAdd}
          />
          {!collapsedGroups[key] && (
            <div className="flex flex-col">
              {group.tasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  showWorkspace={scope === 'global'}
                  showProject={scope !== 'project'}
                  onClick={onTaskClick}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
