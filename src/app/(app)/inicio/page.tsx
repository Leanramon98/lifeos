"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Sparkles, 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  FileText,
  Activity,
  FolderOpen
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function InicioPage() {
  const { userData } = useAuth();
  const [period, setPeriod] = useState<'today' | 'this_week' | 'this_month'>('this_week');
  const { todayTasks, recentNotes, activeProjects, taskStats, isLoading, updateTask } = useDashboardData({ period });
  
  const firstName = userData?.name ? userData.name.split(" ")[0] : "Usuario";
  
  const hour = new Date().getHours();
  let greeting = "Buenos días";
  if (hour >= 12 && hour < 19) greeting = "Buenas tardes";
  else if (hour >= 19) greeting = "Buenas noches";

  const currentDateStr = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 h-full flex flex-col gap-6">
        <div className="h-16 w-64 bg-surface-elevated animate-pulse rounded-xl" />
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

  const handleAskAI = () => {
    toast("Próximamente", { description: "El asistente IA se activará en la Fase 4." });
  };

  const handleConnectCalendar = () => {
    toast("Próximamente", { description: "La integración con Google Calendar llegará en la Fase 2." });
  };

  const isEmpty = todayTasks.length === 0 && recentNotes.length === 0 && activeProjects.length === 0;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto scrollbar-none flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm font-medium text-foreground-tertiary capitalize">
            {currentDateStr}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notas/nueva">
            <Button variant="secondary" className="bg-surface-elevated">
              <Plus className="w-4 h-4 mr-2" /> Nueva nota
            </Button>
          </Link>
          <Button onClick={handleAskAI} className="bg-primary hover:bg-primary-hover text-white border-none shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 fill-current" /> Preguntar a IA
          </Button>
        </div>
      </header>

      {isEmpty ? (
        <div className="flex-1 bg-surface border border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full mt-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bienvenida a tu Life OS</h2>
          <p className="text-foreground-secondary mb-8">No tenés datos cargados aún. Empezá por acá para configurar tu sistema:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Link href="/workspaces">
              <div className="bg-surface-elevated p-5 rounded-xl border border-border hover:border-foreground-tertiary transition-colors cursor-pointer flex flex-col items-start text-left">
                <FolderOpen className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1">Explorar workspaces</h3>
                <p className="text-xs text-foreground-tertiary">Organizá tus áreas de vida</p>
              </div>
            </Link>
            <Link href="/proyectos">
              <div className="bg-surface-elevated p-5 rounded-xl border border-border hover:border-foreground-tertiary transition-colors cursor-pointer flex flex-col items-start text-left">
                <Activity className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1">Configurar un proyecto</h3>
                <p className="text-xs text-foreground-tertiary">Definí tus objetivos grandes</p>
              </div>
            </Link>
            <Link href="/tareas">
              <div className="bg-surface-elevated p-5 rounded-xl border border-border hover:border-foreground-tertiary transition-colors cursor-pointer flex flex-col items-start text-left">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1">Crear tu primera tarea</h3>
                <p className="text-xs text-foreground-tertiary">Anotá lo que tenés pendiente</p>
              </div>
            </Link>
            <Link href="/notas/nueva">
              <div className="bg-surface-elevated p-5 rounded-xl border border-border hover:border-foreground-tertiary transition-colors cursor-pointer flex flex-col items-start text-left">
                <FileText className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1">Agregar una nota</h3>
                <p className="text-xs text-foreground-tertiary">Documentá tus ideas</p>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
          {/* Columna Izquierda Top */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-[400px]">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground">Tareas de hoy</h2>
                  <Badge variant="secondary" className="bg-surface-elevated h-6 px-2 text-xs font-bold">{todayTasks.length}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-foreground-secondary hover:text-foreground">
                  <Plus className="w-4 h-4 mr-1.5" /> Añadir
                </Button>
              </header>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1">
                {todayTasks.length > 0 ? (
                  todayTasks.map(task => {
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
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <Badge variant="secondary" className="bg-surface-elevated border-border text-[10px] uppercase tracking-wider py-0 h-5 px-1.5 hidden sm:flex">
                            <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: task.workspaceColor || '#ccc' }} />
                            {task.workspaceName}
                          </Badge>
                          {/* Hora placeholder if any, or just empty space */}
                          <span className="text-[11px] text-foreground-tertiary font-medium w-10 text-right">
                            {/* task.dueDate time would go here */}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-foreground-tertiary">
                    <CheckCircle2 className="w-10 h-10 mb-3 text-border" />
                    <p className="text-sm">Sin tareas para hoy. Disfrutá el día ☀️</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-center">
                <Link href="/tareas" className="text-[11px] font-bold text-foreground-tertiary hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
                  Ver todas las tareas <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </section>
          </div>

          {/* Columna Derecha Top */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-[400px]">
              <header className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Próximos eventos</h2>
                <span className="text-xs font-bold text-foreground-tertiary uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                  Hoy <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </header>

              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center mb-4">
                  <CalendarIcon className="w-6 h-6 text-foreground-tertiary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">Conectá tu Google Calendar</p>
                <p className="text-xs text-foreground-tertiary mb-6 max-w-[200px]">Para ver tus eventos y reuniones directamente en tu dashboard.</p>
                <Button size="sm" variant="secondary" onClick={handleConnectCalendar}>
                  Conectar
                </Button>
              </div>
            </section>
          </div>

          {/* Resumen Rápido (Full Width) */}
          <section className="lg:col-span-12 bg-surface border border-border rounded-2xl p-6">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Resumen rápido</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold uppercase tracking-widest text-foreground-tertiary">
                    {period === 'this_week' ? 'Esta semana' : period === 'this_month' ? 'Este mes' : 'Hoy'} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPeriod('today')}>Hoy</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPeriod('this_week')}>Esta semana</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPeriod('this_month')}>Este mes</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-elevated p-4 rounded-xl border border-border">
                <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">Peso</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground-secondary">—</span>
                </div>
                <p className="text-[10px] text-foreground-tertiary mt-1">Disponible en Fase 2</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-xl border border-border">
                <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">Entrenamientos</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground-secondary">—</span>
                </div>
                <p className="text-[10px] text-foreground-tertiary mt-1">Disponible en Fase 2</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-xl border border-border">
                <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">Tareas completadas</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{taskStats.completed}</span>
                  <span className="text-xs font-medium text-success">+0%</span>
                </div>
                <p className="text-[10px] text-foreground-tertiary mt-1">vs período anterior</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-xl border border-border">
                <p className="text-[11px] font-bold text-foreground-tertiary uppercase tracking-wider mb-2">Gastos</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground-secondary">—</span>
                </div>
                <p className="text-[10px] text-foreground-tertiary mt-1">Disponible en Fase 2</p>
              </div>
            </div>
          </section>

          {/* Columna Izquierda Bottom */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
              <header className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Notas recientes</h2>
                <Link href="/notas" className="text-[11px] font-bold text-foreground-tertiary hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
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
                    <p className="text-sm text-foreground-tertiary mb-3">Aún no tenés notas.</p>
                    <Link href="/notas/nueva">
                      <Button variant="outline" size="sm">Crear la primera <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Columna Derecha Bottom */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
              <header className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Proyectos activos</h2>
                <Link href="/proyectos" className="text-[11px] font-bold text-foreground-tertiary hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
                  Ver todos <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </header>

              <div className="flex flex-col gap-3">
                {activeProjects.length > 0 ? (
                  activeProjects.map(project => (
                    <Link key={project.id} href={`/proyectos/${project.id}`} className="group block bg-surface-elevated border border-border p-4 rounded-xl hover:border-foreground-tertiary transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-surface border-border text-[10px] uppercase tracking-wider py-0 h-5 px-1.5">
                          <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: project.workspaceColor || '#ccc' }} />
                          {project.workspaceName}
                        </Badge>
                        <span className="text-[10px] font-bold text-foreground-secondary">
                          {project.taskCounts.done} de {project.taskCounts.total} tareas ({project.progressPct}%)
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-1">{project.name}</h3>
                      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${project.progressPct}%` }} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl p-8">
                    <p className="text-sm text-foreground-tertiary mb-3">Sin proyectos activos.</p>
                    <Link href="/proyectos">
                      <Button variant="outline" size="sm">Crear uno <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
