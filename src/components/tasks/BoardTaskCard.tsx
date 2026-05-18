"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paperclip, MessageSquare, Flag, Calendar } from "lucide-react";
import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatRelativeDate, getDueDateUrgency, getDueDateColor } from "@/lib/utils/dates";

interface Props {
  task: Task;
  onClick: (task: Task) => void;
  showWorkspace?: boolean;
  showProject?: boolean;
}

export function BoardTaskCard({ task, onClick, showWorkspace, showProject }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const urgency = task.dueDate ? getDueDateUrgency(new Date(task.dueDate.seconds * 1000)) : 'none';
  const subtasksCount = task.subtasksCount || 0;
  const subtasksDone = task.subtasksDone || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "bg-surface border border-border rounded-lg p-3 shadow-sm hover:shadow-md hover:border-foreground-tertiary transition-all cursor-pointer group select-none mb-2 last:mb-0",
        isDragging && "z-50 shadow-2xl scale-[1.02] border-primary"
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            {task.priority !== 'medium' && (
              <Flag className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", 
                task.priority === 'urgent' ? 'text-danger fill-danger' : 
                task.priority === 'high' ? 'text-warning fill-warning' : 'text-foreground-tertiary'
              )} />
            )}
          </div>

          {(showWorkspace || (showProject && task.projectName)) && (
            <div className="flex flex-wrap gap-1.5">
              {showWorkspace && (
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-[10px] font-bold text-foreground-secondary uppercase tracking-tight">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.workspaceColor }} />
                  {task.workspaceName}
                </div>
              )}
              {showProject && task.projectName && (
                <div className="px-1.5 py-0.5 rounded bg-surface-elevated/50 border border-border text-[10px] font-medium text-foreground-tertiary truncate max-w-[120px]">
                  {task.projectName}
                </div>
              )}
            </div>
          )}
        </div>

        {subtasksCount > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-foreground-tertiary font-bold uppercase">
              <span>Subtareas</span>
              <span>{subtasksDone}/{subtasksCount}</span>
            </div>
            <Progress value={(subtasksDone / subtasksCount) * 100} className="h-1 bg-surface-elevated" />
          </div>
        )}

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border", getDueDateColor(urgency))}>
                <Calendar className="w-3 h-3" />
                {formatRelativeDate(new Date(task.dueDate.seconds * 1000))}
              </div>
            )}
            {task.tags?.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 1).map(tag => (
                  <span key={tag} className="text-[10px] text-foreground-tertiary font-medium">#{tag}</span>
                ))}
                {task.tags.length > 1 && <span className="text-[10px] text-foreground-tertiary font-bold">+{task.tags.length - 1}</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-foreground-tertiary">
            {task.attachmentsCount > 0 && (
              <div className="flex items-center gap-0.5">
                <Paperclip className="w-3 h-3" />
                <span className="text-[10px] font-bold">{task.attachmentsCount}</span>
              </div>
            )}
            {task.updatesCount > 0 && (
              <div className="flex items-center gap-0.5">
                <MessageSquare className="w-3 h-3" />
                <span className="text-[10px] font-bold">{task.updatesCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
