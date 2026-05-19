"use client";

import React, { useState, useMemo, use } from "react";
import { Plus } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/hooks/useTasks";
import { useWorkspace } from "@/lib/hooks/useWorkspaces";
import { useUIStore } from "@/lib/store/useUIStore";
import { TasksFiltersBar } from "@/components/tasks/TasksFiltersBar";
import { TasksViewSwitcher } from "@/components/tasks/TasksViewSwitcher";
import { TasksListView } from "@/components/tasks/TasksListView";
import { TasksBoardView } from "@/components/tasks/TasksBoardView";
import { TasksCalendarView } from "@/components/tasks/TasksCalendarView";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { QuickAddTaskDialog } from "@/components/tasks/QuickAddTaskDialog";
import { Task } from "@/lib/types";

export default function WorkspaceTareasPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { workspace } = useWorkspace(resolvedParams.slug);
  const { tasks, completeTask, uncompleteTask, deleteTask } = useTasks({ workspaceId: workspace?.id });
  
  const ui = useUIStore();
  
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Shortcut for Quick Add
  useHotkeys('t', (e) => {
    e.preventDefault();
    setQuickAddOpen(true);
  }, { enabled: !quickAddOpen && !selectedTask });

  const filteredTasks = useMemo(() => {
    let result = tasks;
    const f = ui.taskFilters || {};

    const statusFilters = f.status || [];
    const priorityFilters = f.priority || [];
    const projectsFilters = f.projects || [];
    const searchFilter = f.search || '';

    if (statusFilters.length > 0) result = result.filter(t => statusFilters.includes(t.status));
    if (priorityFilters.length > 0) result = result.filter(t => priorityFilters.includes(t.priority));
    if (projectsFilters.length > 0) result = result.filter(t => projectsFilters.includes(t.projectId || ''));
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    
    return result;
  }, [tasks, ui.taskFilters]);

  if (!workspace) return null;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground">
          Tareas <span className="text-foreground-tertiary ml-2 font-normal">{tasks.filter(t => t.status !== 'done').length} pendientes</span>
        </h3>
        <Button onClick={() => setQuickAddOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Nueva tarea</Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <TasksViewSwitcher scope="workspace" workspaceId={workspace.id} />
        </div>
        <TasksFiltersBar scope="workspace" workspaceId={workspace.id} />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {ui.taskViewMode === 'list' && (
          <TasksListView 
            tasks={filteredTasks} 
            onTaskClick={setSelectedTask}
            onToggleTask={(id) => {
              const task = tasks.find(t => t.id === id);
              if (task) task.status === 'done' ? uncompleteTask(id) : completeTask(id);
            }}
            onDeleteTask={deleteTask}
            onQuickAdd={() => setQuickAddOpen(true)}
            scope="workspace"
          />
        )}
        {ui.taskViewMode === 'kanban' && (
          <TasksBoardView tasks={filteredTasks} onTaskClick={setSelectedTask} workspaceId={workspace.id} />
        )}
        {ui.taskViewMode === 'calendar' && (
          <TasksCalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} workspaceId={workspace.id} />
        )}
      </div>

      <QuickAddTaskDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} defaultWorkspaceId={workspace.id} />
      <TaskDetail task={selectedTask} open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} />
    </div>
  );
}

