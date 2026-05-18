"use client";

import React, { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  FileText, 
  Activity, 
  FolderOpen, 
  Home, 
  Settings, 
  Plus, 
  Clock,
  Search,
  CheckCircle
} from "lucide-react";
import { 
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
} from "@/components/ui/command";
import { useCommandPalette } from "@/lib/hooks/useCommandPalette";
import { Badge } from "@/components/ui/badge";

export function CommandPalette() {
  const { 
    isOpen, 
    close, 
    query, 
    setQuery, 
    results, 
    recentItems, 
    navigateToItem, 
    executeAction,
    workspaces
  } = useCommandPalette();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput 
        placeholder="Buscar o ejecutar comando..." 
        value={query} 
        onValueChange={setQuery} 
      />
      <CommandList className="scrollbar-thin">
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        {!query && (
          <>
            <CommandGroup heading="ACCIONES RÁPIDAS">
              <CommandItem onSelect={() => executeAction("/tareas/nueva")}>
                <Plus className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Nueva tarea</span>
                <CommandShortcut>T</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/notas/nueva")}>
                <Plus className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Nueva nota</span>
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/proyectos/nuevo")}>
                <Plus className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Nuevo proyecto</span>
                <CommandShortcut>P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/settings?section=workspaces&new=true")}>
                <Plus className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Nuevo workspace</span>
                <CommandShortcut>W</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            
            <CommandGroup heading="IR A">
              <CommandItem onSelect={() => executeAction("/inicio")}>
                <Home className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Inicio</span>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/tareas")}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Tareas</span>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/proyectos")}>
                <Activity className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Proyectos</span>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/notas")}>
                <FileText className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Notas</span>
              </CommandItem>
              <CommandItem onSelect={() => executeAction("/settings")}>
                <Settings className="mr-2 h-4 w-4 text-foreground-tertiary" />
                <span>Configuración</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />

            {workspaces.length > 0 && (
              <CommandGroup heading="WORKSPACES">
                {workspaces.map(ws => (
                  <CommandItem key={ws.id} onSelect={() => navigateToItem(ws, 'workspace')}>
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: ws.color }} />
                    <span>{ws.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentItems.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="RECIENTES">
                  {recentItems.map(item => (
                    <CommandItem key={`${item.type}-${item.id}`} onSelect={() => executeAction(item.url)}>
                      {item.type === 'task' ? <CheckCircle2 className="mr-2 h-4 w-4 text-foreground-tertiary" /> :
                       item.type === 'project' ? <Activity className="mr-2 h-4 w-4 text-foreground-tertiary" /> :
                       <FileText className="mr-2 h-4 w-4 text-foreground-tertiary" />}
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.context && <span className="text-[10px] text-foreground-tertiary">{item.context}</span>}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}

        {query && (
          <>
            {results.tasks.length > 0 && (
              <CommandGroup heading="TAREAS">
                {results.tasks.map(task => (
                  <CommandItem key={task.id} onSelect={() => navigateToItem(task, 'task')}>
                    {task.status === 'done' ? <CheckCircle className="mr-2 h-4 w-4 text-success" /> : <Circle className="mr-2 h-4 w-4 text-foreground-tertiary" />}
                    <div className="flex flex-col">
                      <span>{task.title}</span>
                      <span className="text-[10px] text-foreground-tertiary">
                        {task.workspaceName} {task.projectName ? `· ${task.projectName}` : ''} · {task.status}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.projects.length > 0 && (
              <CommandGroup heading="PROYECTOS">
                {results.projects.map(project => (
                  <CommandItem key={project.id} onSelect={() => navigateToItem(project, 'project')}>
                    <Badge variant="secondary" className="mr-2 h-5 px-1.5 py-0 text-[10px] bg-surface border-border uppercase">
                      {project.workspaceName}
                    </Badge>
                    <div className="flex flex-col">
                      <span>{project.name}</span>
                      {project.description && <span className="text-[10px] text-foreground-tertiary line-clamp-1">{project.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.notes.length > 0 && (
              <CommandGroup heading="NOTAS">
                {results.notes.map(note => (
                  <CommandItem key={note.id} onSelect={() => navigateToItem(note, 'note')}>
                    <FileText className="mr-2 h-4 w-4 text-foreground-tertiary" />
                    <div className="flex flex-col">
                      <span>{note.title || "Sin título"}</span>
                      {note.contentText && <span className="text-[10px] text-foreground-tertiary line-clamp-1">{note.contentText}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.workspaces.length > 0 && (
              <CommandGroup heading="WORKSPACES">
                {results.workspaces.map(ws => (
                  <CommandItem key={ws.id} onSelect={() => navigateToItem(ws, 'workspace')}>
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: ws.color }} />
                    <span>{ws.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      <div className="border-t border-border p-2 bg-surface text-[10px] text-foreground-tertiary flex items-center justify-between">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="bg-surface-elevated px-1.5 py-0.5 rounded text-foreground-secondary border border-border">↑</span><span className="bg-surface-elevated px-1.5 py-0.5 rounded text-foreground-secondary border border-border">↓</span> navegar</span>
          <span className="flex items-center gap-1"><span className="bg-surface-elevated px-1.5 py-0.5 rounded text-foreground-secondary border border-border">↵</span> seleccionar</span>
          <span className="flex items-center gap-1"><span className="bg-surface-elevated px-1.5 py-0.5 rounded text-foreground-secondary border border-border">esc</span> cerrar</span>
        </div>
      </div>
    </CommandDialog>
  );
}
