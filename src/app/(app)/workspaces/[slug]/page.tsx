"use client";

import React, { use } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  FileText,
  Activity,
  FolderOpen
} from "lucide-react";
import { useWorkspace } from "@/lib/hooks/useWorkspaces";
import { useWorkspaceDashboard } from "@/lib/hooks/useWorkspaceDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function WorkspaceDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { workspace } = useWorkspace(resolvedParams.slug);
  const { 
    activeTasks, 
    topProjects, 
    recentNotes, 
    stats, 
    recentActivity, 
    isLoading, 
    updateTask 
  } = useWorkspaceDashboard(workspace?.id || '');

  if (!workspace) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-surface-elevated animate-pulse rounded-2xl" />
          <div className="lg:col-span-5 h-96 bg-surface-elevated animate-pulse rounded-2xl" />
          <div className="lg:col-span-12 h-32 bg-surface-elevated animate-pulse rounded-2xl" />
          <div className="lg:col-span-7 h-80 bg-surface-elevated animate-pulse rounded-2xl" />
          <div className="lg:col-span-5 h-80 bg-surface-elevated animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tareas activas */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-[400px]">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">Tareas activas</h2>
                <Badge variant="secondary" className="bg-surface-elevated h-6 px-2 text-xs font-bold">{activeTasks.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-foreground-secondary hover:text-foreground">
                <Plus className="w-4 h-4 mr-1.5" /> Nueva tarea
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1">
              {activeTasks.length > 0 ? (
                activeTasks.map(task => {
                  const isDone = task.status === 'done';
                  return (
                    <div key={task.id} className={cn(
                      "group flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors",
                      isDone && "opacity-50"
                    )}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <button 
                          className="flex-shrink-0 focus:outline-none"
                          onClick={() => updateTask({ id: task.id, data: { status: isDone ? 'todo' : 'done' } })}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-success fill-success/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-border group-hover:text-foreground-tertiary transition-colors" />
                          )}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            isDone ? "text-foreground-secondary line-through" : "text-foreground"
                          )}>
                            {task.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-foreground-tertiary">
                  <CheckCircle2 className="w-10 h-10 mb-3 text-border" />
                  <p className="text-sm">No hay tareas activas aquí</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-center">
              <Link href={`/workspaces/${resolvedParams.slug}/tareas`} className="text-[11px] font-bold text-foreground-tertiary hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
                Ver todas <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </section>
        </div>

        {/* Proyectos */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-[400px]">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Proyectos</h2>
              <Button variant="ghost" size="sm" className="h-8 text-foreground-secondary hover:text-foreground">
                <Plus className="w-4 h-4 mr-1.5" /> Nuevo
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
              {topProjects.length > 0 ? (
                topProjects.map(project => (
                  <Link key={project.id} href={`/proyectos/${project.id}`} className="group block bg-surface-elevated border border-border p-4 rounded-xl hover:border-foreground-tertiary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                      <span className="text-[10px] font-bold text-foreground-secondary">
                        {project.progressPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${project.progressPct}%` }} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-foreground-tertiary p-4">
                  <p className="text-sm">Sin proyectos activos</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex justify-center">
              <Link href={`/workspaces/${resolvedParams.slug}/proyectos`} className="text-[11px] font-bold text-foreground-tertiary hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
                Ver todos <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Stats Full Width */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Stats del workspace</h2>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">Total tareas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{stats.total}</span>
            </div>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">Completadas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{stats.completed}</span>
            </div>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">En progreso</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{stats.inProgress}</span>
            </div>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">% Completado</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{stats.progressPct}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Actividad reciente</h2>
            </header>

            <div className="flex flex-col gap-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <div key={activity.id} className="flex gap-4 items-start">
                    <div className="mt-0.5">
                      {activity.type === 'task' ? <CheckCircle2 className="w-4 h-4 text-foreground-secondary" /> :
                       activity.type === 'project' ? <Activity className="w-4 h-4 text-foreground-secondary" /> :
                       <FileText className="w-4 h-4 text-foreground-secondary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-foreground-tertiary">
                        {activity.date ? formatDistanceToNow(activity.date, { addSuffix: true, locale: es }) : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <p className="text-sm text-foreground-tertiary">Sin actividad reciente.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Notas del workspace */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Notas recientes</h2>
              <Link href={`/workspaces/${resolvedParams.slug}/notas`} className="text-[11px] font-bold text-foreground-tertiary hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
                Ver todas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </header>

            <div className="flex flex-col gap-3">
              {recentNotes.length > 0 ? (
                recentNotes.map(note => (
                  <Link key={note.id} href={`/notas/${note.id}`} className="group block bg-surface-elevated border border-border p-4 rounded-xl hover:border-foreground-tertiary transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{note.title || "Sin título"}</h3>
                      <span className="text-[10px] font-medium text-foreground-tertiary flex-shrink-0 ml-4">
                        {note.updatedAt?.seconds ? formatDistanceToNow(new Date(note.updatedAt.seconds * 1000), { addSuffix: true, locale: es }) : "Reciente"}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary line-clamp-2 leading-relaxed">{note.contentText || "Sin contenido..."}</p>
                  </Link>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl p-8">
                  <p className="text-sm text-foreground-tertiary mb-3">Aún no tenés notas en este workspace.</p>
                  <Link href={`/notas/nueva?workspaceId=${workspace.id}`}>
                    <Button variant="outline" size="sm">Crear una <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [];
}
