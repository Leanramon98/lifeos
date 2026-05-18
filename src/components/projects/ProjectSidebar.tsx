"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/lib/hooks/useTasks";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRelativeDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

export function ProjectSidebar({ project }: { project: Project }) {
  const { tasks, completeTask, uncompleteTask } = useTasks({ 
    projectId: project.id,
    status: ['backlog', 'todo', 'doing', 'waiting']
  });

  // Sort by dueDate and get top 3
  const upcomingTasks = [...tasks]
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.seconds - b.dueDate.seconds;
    })
    .slice(0, 3);

  return (
    <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-6 pl-8 border-l border-border ml-8 overflow-y-auto">
      
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 font-semibold uppercase tracking-wider text-[10px]">Estadísticas</h4>
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground-secondary">Progreso</span>
            <span className="font-bold text-foreground">{project.progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all rounded-full" 
              style={{ width: `${project.progressPct}%`, backgroundColor: project.workspaceColor }} 
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
            <div className="text-center">
              <span className="block text-xl font-bold text-foreground">{project.taskCounts.active}</span>
              <span className="text-[10px] uppercase text-foreground-tertiary font-bold tracking-tight">Activas</span>
            </div>
            <div className="text-center border-l border-border">
              <span className="block text-xl font-bold text-foreground">{project.taskCounts.done}</span>
              <span className="text-[10px] uppercase text-foreground-tertiary font-bold tracking-tight">Completadas</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 font-semibold uppercase tracking-wider text-[10px]">Próximas tareas</h4>
        <div className="space-y-3">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map(t => (
              <div key={t.id} className="flex items-start gap-3 group">
                <Checkbox 
                  checked={t.status === 'done'}
                  onCheckedChange={() => t.status === 'done' ? uncompleteTask(t.id) : completeTask(t.id)}
                  className="mt-0.5 rounded-full w-4 h-4"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-tight truncate group-hover:text-primary transition-colors cursor-pointer">
                    {t.title}
                  </p>
                  {t.dueDate && (
                    <span className="text-[10px] text-foreground-tertiary font-bold uppercase mt-1 block">
                      {formatRelativeDate(new Date(t.dueDate.seconds * 1000))}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-foreground-tertiary italic bg-surface-elevated/30 p-4 rounded-lg border border-dashed border-border text-center">
              No hay tareas pendientes
            </div>
          )}
        </div>
      </div>

      {project.tags && project.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 font-semibold uppercase tracking-wider text-[10px]">Etiquetas</h4>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map(t => (
              <Badge key={t} variant="secondary" className="font-normal text-[10px] py-0 px-2 h-5 bg-surface-elevated border border-border">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-border text-[10px] text-foreground-tertiary space-y-1 uppercase font-bold tracking-widest">
        <p>Creado: {format(project.createdAt?.seconds ? project.createdAt.seconds * 1000 : project.createdAt as any, "d MMM yyyy", { locale: es })}</p>
        <p>Actualizado: {format(project.updatedAt?.seconds ? project.updatedAt.seconds * 1000 : project.updatedAt as any, "d MMM yyyy", { locale: es })}</p>
      </div>
      
    </div>
  );
}
