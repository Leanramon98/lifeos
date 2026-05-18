"use client";

import React from "react";
import { GripVertical, MessageSquare, Paperclip, Flag, MoreVertical, Edit2, Trash2, Archive } from "lucide-react";
import { Task, TaskPriority } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, getDueDateUrgency, getDueDateColor } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  showWorkspace?: boolean;
  showProject?: boolean;
}

export function TaskRow({ 
  task, 
  onToggle, 
  onClick, 
  onEdit, 
  onDelete, 
  onArchive,
  showWorkspace = true, 
  showProject = true 
}: TaskRowProps) {
  const isDone = task.status === 'done';
  const dueDate = task.dueDate ? new Date(task.dueDate.seconds * 1000) : null;
  const urgency = getDueDateUrgency(dueDate);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'text-danger';
      case 'high': return 'text-warning';
      case 'medium': return 'text-primary';
      case 'low': return 'text-foreground-tertiary';
    }
  };

  return (
    <div 
      onClick={() => onClick(task)}
      className={cn(
        "group flex items-center gap-3 p-2 h-12 bg-surface border-b border-border/50 hover:bg-surface-hover transition-all cursor-pointer select-none",
        isDone && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      <div className="w-6 flex justify-center text-foreground-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isDone} 
          onCheckedChange={() => onToggle(task.id)}
          className="rounded-full w-5 h-5 border-foreground-tertiary data-[state=checked]:bg-success data-[state=checked]:border-success"
        />
      </div>

      {/* Title & Info */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className={cn(
          "text-sm font-medium text-foreground truncate",
          isDone && "line-through text-foreground-tertiary"
        )}>
          {task.title}
        </span>

        {task.subtaskCounts.total > 0 && (
          <span className="text-[10px] text-foreground-tertiary font-medium">
            ({task.subtaskCounts.done}/{task.subtaskCounts.total})
          </span>
        )}

        <div className="flex items-center gap-2">
          {showWorkspace && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-surface-elevated/50">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.workspaceColor }} />
              <span className="text-[10px] font-medium text-foreground-secondary uppercase tracking-wider">{task.workspaceName}</span>
            </div>
          )}
          {showProject && task.projectName && (
            <div className="px-2 py-0.5 rounded-full border border-border text-[10px] font-medium text-foreground-tertiary truncate max-w-[120px]">
              {task.projectName}
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {task.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal h-4">#{tag}</Badge>
            ))}
            {task.tags.length > 2 && <span className="text-[10px] text-foreground-tertiary">+{task.tags.length - 2}</span>}
          </div>
        )}
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        {task.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-foreground-tertiary" />}
        
        {dueDate && (
          <div className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded border",
            getDueDateColor(urgency)
          )}>
            {formatRelativeDate(dueDate)}
          </div>
        )}

        <Flag className={cn("w-3.5 h-3.5", getPriorityColor(task.priority))} />

        <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-surface-elevated rounded-md">
                <MoreVertical className="w-4 h-4 text-foreground-tertiary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.(task.id)}>
                <Archive className="w-3.5 h-3.5 mr-2" /> Archivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger" onClick={() => onDelete?.(task.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
