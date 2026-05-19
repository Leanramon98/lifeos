"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/hooks/useTasks";
import { useUIStore } from "@/lib/store/useUIStore";
import { TasksFiltersBar } from "@/components/tasks/TasksFiltersBar";
import { TasksViewSwitcher } from "@/components/tasks/TasksViewSwitcher";
import { TasksListView } from "@/components/tasks/TasksListView";
import { TasksBoardView } from "@/components/tasks/TasksBoardView";
import { TasksCalendarView } from "@/components/tasks/TasksCalendarView";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { QuickAddTaskDialog } from "@/components/tasks/QuickAddTaskDialog";
import { Task } from "@/lib/types";

export default function TareasPageClient() {
  const { tasks, isLoading, completeTask, uncompleteTask, deleteTask } = useTasks();
  const ui = useUIStore();
  
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Shortcuts for view switching
  useHotkeys('v+l', (e) => { e.preventDefault(); ui.setTaskViewMode('list'); });
  useHotkeys('v+t', (e) => { e.preventDefault(); ui.setTaskViewMode('kanban'); });
  useHotkeys('v+c', (e) => { e.preventDefault(); ui.setTaskViewMode('calendar'); });

  // Shortcut for Quick Add
  useHotkeys('t', (e) => {
    e.preventDefault();
    setQuickAddOpen(true);
  }, { enabled: !quickAddOpen && !detailOpen });

  // Filter logic (must match the logic in the Sidebar but applied to the local view)
  const filteredTasks = useMemo(() => {
    let result = tasks;
    const f = ui.taskFilters;

    if (f.status.length > 0) result = result.filter(t => f.status.includes(t.status));
    if (f.priority.length > 0) result = result.filter(t => f.priority.includes(t.priority));
    if (f.areas.length > 0) result = result.filter(t => f.areas.includes(t.areaSlug));
    if (f.workspaces.length > 0) result = result.filter(t => f.workspaces.includes(t.workspaceId));
    if (f.projects.length > 0) result = result.filter(t => f.projects.includes(t.projectId || ''));
    if (f.search) {
      const q = f.search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    
    return result;
  }, [tasks, ui.taskFilters]);

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status === 'done' ? uncompleteTask(id) : completeTask(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-8 pt-6 pb-4">
        <PageHeader 
          title="Tareas" 
          description={`${tasks.length} tareas totales`}
          actions={<Button onClick={() => setQuickAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Nueva tarea</Button>}
        />

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TasksViewSwitcher scope="global" />
          </div>
          <TasksFiltersBar scope="global" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 md:px-8 pb-8 flex flex-col">
        {ui.taskViewMode === 'list' && (
          <TasksListView 
            tasks={filteredTasks} 
            onTaskClick={openTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={deleteTask}
            onQuickAdd={() => setQuickAddOpen(true)}
            scope="global"
          />
        )}
        {ui.taskViewMode === 'kanban' && (
          <TasksBoardView tasks={filteredTasks} onTaskClick={openTask} />
        )}
        {ui.taskViewMode === 'calendar' && (
          <TasksCalendarView tasks={filteredTasks} onTaskClick={openTask} />
        )}
      </div>

      <QuickAddTaskDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
      <TaskDetail task={selectedTask} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
