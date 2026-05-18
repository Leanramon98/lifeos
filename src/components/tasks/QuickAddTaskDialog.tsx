"use client";

import React, { useState, useEffect, useRef } from "react";
import * as chrono from 'chrono-node';
import { Calendar, Tag, Briefcase, Flag, Zap, Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/hooks/useTasks";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { TaskStatus, TaskPriority, TaskFormData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils/dates";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultWorkspaceId?: string;
  defaultProjectId?: string;
  defaults?: {
    workspaceId?: string;
    projectId?: string;
    status?: TaskStatus;
    dueDate?: Date;
    priority?: TaskPriority;
  };
}

export function QuickAddTaskDialog({ open, onOpenChange, defaultWorkspaceId, defaultProjectId, defaults }: Props) {
  const { createTask } = useTasks();
  const { workspaces } = useWorkspaces();
  
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Parsed metadata
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [tags, setTags] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setWorkspaceId(defaults?.workspaceId || defaultWorkspaceId || workspaces[0]?.id || "");
      setProjectId(defaults?.projectId || defaultProjectId || null);
      setPriority(defaults?.priority || 'medium');
      setDueDate(defaults?.dueDate || null);
      setStatus(defaults?.status || 'todo');
      setTags([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultWorkspaceId, defaultProjectId, workspaces, defaults]);

  // Real-time parsing logic
  useEffect(() => {
    if (!text) return;

    // 1. Parse Date/Time using chrono
    const parsedDates = chrono.es.parse(text);
    if (parsedDates.length > 0) {
      setDueDate(parsedDates[0].start.date());
    }

    // 2. Parse Priority (#urgent, #high, etc)
    const priorityMatch = text.match(/#(urgent|high|medium|low)\b/);
    if (priorityMatch) {
      setPriority(priorityMatch[1] as TaskPriority);
    }

    // 3. Parse Workspace (@slug)
    const workspaceMatch = text.match(/@([a-z0-9-]+)\b/);
    if (workspaceMatch) {
      const slug = workspaceMatch[1];
      const ws = workspaces.find(w => w.slug === slug);
      if (ws) setWorkspaceId(ws.id);
    }

    // 4. Parse Tags (#something)
    const tagMatches = text.matchAll(/#([a-z0-9-]+)\b/g);
    const newTags: string[] = [];
    for (const match of tagMatches) {
      const tag = match[1];
      if (!['urgent', 'high', 'medium', 'low'].includes(tag)) {
        newTags.push(tag);
      }
    }
    setTags(newTags);

  }, [text, workspaces]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !workspaceId) return;

    setLoading(true);
    try {
      const data: TaskFormData = {
        title: text.trim(),
        workspaceId,
        projectId,
        priority,
        dueDate,
        tags,
        status
      };

      await createTask(data);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedWorkspace = workspaces.find(w => w.id === workspaceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col bg-surface-elevated">
          <div className="p-5 pb-2">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¿Qué hay que hacer? @workspace #urgente mañana 10am"
              className="text-lg border-none focus-visible:ring-0 px-0 h-auto bg-transparent placeholder:text-foreground-tertiary"
            />
          </div>

          <div className="px-5 pb-4 flex flex-wrap gap-2">
            {selectedWorkspace && (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2 bg-surface border border-border">
                <Briefcase className="w-3 h-3 text-foreground-tertiary" />
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedWorkspace.color }} />
                {selectedWorkspace.name}
              </Badge>
            )}
            
            {dueDate && (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2 bg-primary/10 text-primary border border-primary/20">
                <Calendar className="w-3 h-3" />
                {formatRelativeDate(dueDate)}
              </Badge>
            )}

            <Badge variant="secondary" className={cn(
              "flex items-center gap-1.5 py-1 px-2 bg-surface border border-border",
              priority === 'urgent' && "text-danger bg-danger/10 border-danger/20",
              priority === 'high' && "text-warning bg-warning/10 border-warning/20",
            )}>
              <Flag className="w-3 h-3" />
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>

            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2 bg-surface border border-border">
              <Zap className="w-3 h-3 text-foreground-tertiary" />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>

            {tags.map(tag => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1.5 py-1 px-2 border-dashed">
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="px-5 py-3 bg-surface border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-foreground-tertiary font-medium">
              <Zap className="w-3 h-3" />
              <span>@workspace · #prioridad · fecha/hora libre</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8">
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={!text.trim() || loading} className="h-8">
                {loading ? "Creando..." : "Crear tarea"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
