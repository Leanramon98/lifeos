import React from "react";
import { Circle, CircleDot, Clock, CheckCircle2, Inbox } from "lucide-react";
import { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusIcon({ status, className }: Props) {
  switch (status) {
    case 'backlog':
      return <Inbox className={cn("w-4 h-4 text-foreground-tertiary", className)} />;
    case 'todo':
      return <Circle className={cn("w-4 h-4 text-foreground-tertiary", className)} />;
    case 'doing':
      return <CircleDot className={cn("w-4 h-4 text-primary", className)} />;
    case 'waiting':
      return <Clock className={cn("w-4 h-4 text-warning", className)} />;
    case 'done':
      return <CheckCircle2 className={cn("w-4 h-4 text-success", className)} />;
    default:
      return <Circle className={cn("w-4 h-4", className)} />;
  }
}

export const statusConfig = {
  backlog: { label: 'Backlog', color: 'text-foreground-tertiary', bg: 'bg-foreground-tertiary/10' },
  todo: { label: 'To Do', color: 'text-foreground-secondary', bg: 'bg-foreground-secondary/10' },
  doing: { label: 'In Progress', color: 'text-primary', bg: 'bg-primary/10' },
  waiting: { label: 'En espera', color: 'text-warning', bg: 'bg-warning/10' },
  done: { label: 'Completado', color: 'text-success', bg: 'bg-success/10' },
};
