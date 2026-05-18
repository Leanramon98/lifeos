"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { BoardTaskCard } from "./BoardTaskCard";
import { TaskStatusIcon, statusConfig } from "./TaskStatusIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  showWorkspace?: boolean;
  showProject?: boolean;
}

export function BoardColumn({ id, title, tasks, onTaskClick, onAddTask, showWorkspace, showProject }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-[300px] h-full flex-shrink-0 bg-surface/30 rounded-xl border border-border/50">
      <div 
        className={cn(
          "flex items-center justify-between p-4 border-t-2 transition-colors",
          statusConfig[id].borderColor,
          isOver && "bg-surface-elevated/50"
        )}
      >
        <div className="flex items-center gap-2.5">
          <TaskStatusIcon status={id} />
          <span className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</span>
          <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center bg-surface-elevated border-border text-[10px] font-bold">
            {tasks.length}
          </Badge>
        </div>
        <button 
          onClick={() => onAddTask(id)}
          className="p-1 hover:bg-surface-elevated rounded transition-colors text-foreground-tertiary hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-2 min-h-[150px] transition-colors",
          isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20 rounded-b-xl"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <BoardTaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={onTaskClick}
                  showWorkspace={showWorkspace}
                  showProject={showProject}
                />
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-center p-4 border border-dashed border-border/50 rounded-lg">
                <p className="text-[11px] text-foreground-tertiary font-medium">Sin tareas</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
