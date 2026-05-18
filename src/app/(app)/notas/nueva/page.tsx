"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  ChevronLeft, 
  FileText, 
  Users, 
  Lightbulb, 
  Sun, 
  Calendar, 
  BarChart3, 
  Briefcase, 
  ListTodo,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/lib/hooks/useNotes";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useProjects } from "@/lib/hooks/useProjects";
import { NoteTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEMPLATES: { type: NoteTemplate; label: string; desc: string; icon: any }[] = [
  { type: 'blank', label: 'En blanco', desc: 'Empezá desde cero', icon: FileText },
  { type: 'meeting', label: 'Reunión', desc: 'Minutas, asistentes y acciones', icon: Users },
  { type: 'daily', label: 'Daily Journal', desc: 'Planificá y reflexioná tu día', icon: Sun },
  { type: 'idea', label: 'Nueva Idea', desc: 'Capturá chispazos de inspiración', icon: Lightbulb },
  { type: 'journal', label: 'Diario personal', desc: 'Pensamientos y gratitud', icon: Calendar },
  { type: 'weekly_review', label: 'Weekly Review', desc: 'Repaso de la semana', icon: BarChart3 },
  { type: 'project_brief', label: 'Project Brief', desc: 'Define los objetivos', icon: Briefcase },
  { type: 'todo', label: 'Lista de Tareas', desc: 'Checklist simple', icon: ListTodo },
];

export default function NuevaNotaPage() {
  const router = useRouter();
  const { createNote } = useNotes();
  const { workspaces } = useWorkspaces();
  const { projects } = useProjects();
  
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate>('blank');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const newNote = await createNote({
        template: selectedTemplate,
        workspaceId,
        projectId,
      });
      router.push(`/notas/${newNote.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-8 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Nueva nota</h1>
              <p className="text-xs text-foreground-tertiary">Elegí una plantilla para empezar</p>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear nota"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <section>
            <h2 className="text-sm font-bold text-foreground-tertiary uppercase tracking-widest mb-6">Plantillas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                const isActive = selectedTemplate === tmpl.type;
                return (
                  <button
                    key={tmpl.type}
                    onClick={() => setSelectedTemplate(tmpl.type)}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-xl border transition-all text-left group",
                      isActive 
                        ? "bg-primary/5 border-primary ring-1 ring-primary" 
                        : "bg-surface border-border hover:border-foreground-tertiary shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors",
                      isActive ? "bg-primary text-white" : "bg-surface-elevated text-foreground-tertiary group-hover:text-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{tmpl.label}</h3>
                    <p className="text-[11px] text-foreground-tertiary leading-tight">{tmpl.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-surface-elevated/50 p-8 rounded-2xl border border-border border-dashed">
            <h2 className="text-sm font-bold text-foreground uppercase mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Vinculación inicial
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground-tertiary uppercase tracking-wider">Workspace</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={workspaceId === null ? 'secondary' : 'outline'} 
                    size="sm" 
                    className="justify-start h-10 px-4"
                    onClick={() => { setWorkspaceId(null); setProjectId(null); }}
                  >
                    Personal (Sin workspace)
                  </Button>
                  {workspaces.map(w => (
                    <Button 
                      key={w.id}
                      variant={workspaceId === w.id ? 'secondary' : 'outline'} 
                      size="sm" 
                      className="justify-start h-10 px-4"
                      onClick={() => setWorkspaceId(w.id)}
                    >
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: w.color }} />
                      {w.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground-tertiary uppercase tracking-wider">Proyecto</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={projectId === null ? 'secondary' : 'outline'} 
                    size="sm" 
                    className="justify-start h-10 px-4"
                    disabled={!workspaceId}
                    onClick={() => setProjectId(null)}
                  >
                    General (Sin proyecto)
                  </Button>
                  {projects.filter(p => p.workspaceId === workspaceId).map(p => (
                    <Button 
                      key={p.id}
                      variant={projectId === p.id ? 'secondary' : 'outline'} 
                      size="sm" 
                      className="justify-start h-10 px-4"
                      onClick={() => setProjectId(p.id)}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
