"use client";

import { useState, useMemo, use, useEffect } from "react";
import { Plus, LayoutGrid, List, Search, X } from "lucide-react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/lib/hooks/useProjects";
import { useWorkspace } from "@/lib/hooks/useWorkspaces";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { Project, ProjectStatus } from "@/lib/types";
import { fuzzySearch } from "@/lib/utils/search";
import { cn } from "@/lib/utils";

// Sortable wrapper for ProjectCard in list view
const SortableProjectCard = ({ project, viewMode, ...props }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative", isDragging && "opacity-50")}>
      {/* Drag handle */}
      {viewMode === 'list' && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 hover:bg-surface-hover transition-all z-10 rounded-l-lg"
        >
          <div className="w-1 h-4 flex flex-col justify-between items-center opacity-40">
            <div className="w-1 h-1 bg-foreground rounded-full" />
            <div className="w-1 h-1 bg-foreground rounded-full" />
            <div className="w-1 h-1 bg-foreground rounded-full" />
          </div>
        </div>
      )}
      <div className={cn(viewMode === 'list' && "pl-6")}>
        <ProjectCard project={project} viewMode={viewMode} {...props} showWorkspaceChip={false} />
      </div>
    </div>
  );
};

export default function WorkspaceProyectosPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { workspace } = useWorkspace(resolvedParams.slug);
  
  // Only fetch projects for this workspace
  const { 
    projects: fetchedProjects, 
    updateProject, 
    archiveProject, 
    deleteProject,
    reorderProjects
  } = useProjects({ 
    workspaceId: workspace?.id, 
    includeArchived: true 
  });

  // Local state for optimistic drag and drop
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  useMemo(() => {
    // Only update local projects when fetched projects actually change (not during drag)
    setLocalProjects(fetchedProjects);
  }, [fetchedProjects]);
  
  const [formOpen, setFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>();
  
  // Filters state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // List is better for DND

  // Persist viewMode
  useEffect(() => {
    const saved = localStorage.getItem("leso_ws_proyectos_view_mode") as "grid" | "list";
    if (saved) setViewMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("leso_ws_proyectos_view_mode", viewMode);
  }, [viewMode]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("active");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openForm = (project?: Project) => {
    setProjectToEdit(project);
    setFormOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && workspace) {
      const oldIndex = localProjects.findIndex(p => p.id === active.id);
      const newIndex = localProjects.findIndex(p => p.id === over.id);
      
      const newOrdered = arrayMove(localProjects, oldIndex, newIndex);
      setLocalProjects(newOrdered);
      
      // Update backend
      reorderProjects({
        workspaceId: workspace.id,
        orderedIds: newOrdered.map(p => p.id)
      });
    }
  };

  // Filter logic
  const filteredProjects = useMemo(() => {
    let result = localProjects;
    
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }
    
    if (search) {
      result = fuzzySearch(result, search, ['name', 'description']);
    }
    
    return result;
  }, [localProjects, statusFilter, search]);

  if (!workspace) return null;

  const isDndEnabled = viewMode === 'list' && statusFilter === 'all' && !search;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground">
          Proyectos <span className="text-foreground-tertiary ml-2 font-normal">{localProjects.filter(p => p.status === 'active').length} activos</span>
        </h3>
        <Button onClick={() => openForm()} size="sm"><Plus className="w-4 h-4 mr-2" /> Nuevo proyecto</Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <Badge 
            variant={statusFilter === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("all")}
          >Todos</Badge>
          <Badge 
            variant={statusFilter === "active" ? "default" : "outline"} 
            className={cn("cursor-pointer", statusFilter === "active" && "bg-success/10 text-success hover:bg-success/20 border-success/20")}
            onClick={() => setStatusFilter("active")}
          >Activos</Badge>
          <Badge 
            variant={statusFilter === "paused" ? "default" : "outline"} 
            className={cn("cursor-pointer", statusFilter === "paused" && "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20")}
            onClick={() => setStatusFilter("paused")}
          >Pausados</Badge>
          <Badge 
            variant={statusFilter === "done" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("done")}
          >Completados</Badge>
          <Badge 
            variant={statusFilter === "archived" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter("archived")}
          >Archivados</Badge>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-tertiary" />
            <Input 
              placeholder="Buscar..." 
              className="pl-9 h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-foreground-tertiary hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center bg-surface border border-border rounded-md">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-l-md transition-colors", viewMode === "grid" ? "bg-surface-elevated text-foreground" : "text-foreground-secondary hover:text-foreground")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-r-md transition-colors", viewMode === "list" ? "bg-surface-elevated text-foreground" : "text-foreground-secondary hover:text-foreground")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects list */}
      <div className="flex-1 mt-6">
        {filteredProjects.length > 0 ? (
          isDndEnabled ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={filteredProjects.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {filteredProjects.map(p => (
                    <SortableProjectCard 
                      key={p.id} 
                      project={p} 
                      viewMode={viewMode}
                      onEdit={openForm}
                      onArchive={archiveProject}
                      onUnarchive={(id) => updateProject({ id, data: { status: 'active' }})}
                      onDelete={deleteProject}
                      onChangeStatus={(id: string, status: any) => updateProject({ id, data: { status }})}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                : "flex flex-col gap-2"
            )}>
              {filteredProjects.map(p => (
                <ProjectCard 
                  key={p.id} 
                  project={p} 
                  viewMode={viewMode}
                  showWorkspaceChip={false}
                  onEdit={openForm}
                  onArchive={archiveProject}
                  onUnarchive={(id) => updateProject({ id, data: { status: 'active' }})}
                  onDelete={deleteProject}
                  onChangeStatus={(id, status) => updateProject({ id, data: { status }})}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-surface-elevated/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FolderGit2Icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Este workspace aún no tiene proyectos</h3>
            <p className="text-foreground-secondary mb-6 max-w-sm">
              Creá tu primer proyecto para empezar a organizar el trabajo de {workspace.name}.
            </p>
            <Button onClick={() => openForm()}><Plus className="w-4 h-4 mr-2" /> Crear proyecto</Button>
          </div>
        )}
      </div>

      <ProjectFormDialog 
        open={formOpen} 
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setTimeout(() => setProjectToEdit(undefined), 300);
        }}
        project={projectToEdit}
        defaultWorkspaceId={workspace.id}
      />
    </div>
  );
}

const FolderGit2Icon = ({ className, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"/><circle cx="13" cy="13" r="2"/><path d="M13 15v5"/><path d="M15 15l4-4"/><path d="M19 11v4"/>
  </svg>
);

export function generateStaticParams() {
  return [];
}
