"use client";

import React, { useState, useMemo, use } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProject } from "@/lib/hooks/useProjects";
import { useUIStore } from "@/lib/store/useUIStore";
import { TasksFiltersBar } from "@/components/tasks/TasksFiltersBar";
import { TasksViewSwitcher } from "@/components/tasks/TasksViewSwitcher";
import { TasksListView } from "@/components/tasks/TasksListView";
import { TasksBoardView } from "@/components/tasks/TasksBoardView";
import { TasksCalendarView } from "@/components/tasks/TasksCalendarView";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { QuickAddTaskDialog } from "@/components/tasks/QuickAddTaskDialog";
import { Task } from "@/lib/types";

export default function ProjectTareasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { project } = useProject(resolvedParams.id);
  const { tasks, completeTask, uncompleteTask, deleteTask } = useTasks({ projectId: resolvedParams.id });
  const ui = useUIStore();
  
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    const f = ui.taskFilters;

    if (f.status.length > 0) result = result.filter(t => f.status.includes(t.status));
    if (f.priority.length > 0) result = result.filter(t => f.priority.includes(t.priority));
    if (f.search) {
      const q = f.search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    
    return result;
  }, [tasks, ui.taskFilters]);

  if (!project) return null;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground">
          Tareas del proyecto <span className="text-foreground-tertiary ml-2 font-normal">{tasks.filter(t => t.status !== 'done').length} pendientes</span>
        </h3>
        <Button onClick={() => setQuickAddOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Nueva tarea</Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <TasksViewSwitcher scope="project" projectId={project.id} />
        </div>
        <TasksFiltersBar scope="project" projectId={project.id} />
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
            scope="project"
          />
        )}
        {ui.taskViewMode === 'kanban' && (
          <TasksBoardView tasks={filteredTasks} onTaskClick={setSelectedTask} projectId={project.id} />
        )}
        {ui.taskViewMode === 'calendar' && (
          <TasksCalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} projectId={project.id} />
        )}
      </div>

      <QuickAddTaskDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} defaultWorkspaceId={project.workspaceId} defaultProjectId={project.id} />
      <TaskDetail task={selectedTask} open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} />
    </div>
  );
}
