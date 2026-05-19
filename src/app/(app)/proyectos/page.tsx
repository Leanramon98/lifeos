"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Briefcase, Handshake, Rocket, User as UserIcon, LayoutGrid, List, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/lib/hooks/useProjects";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useAreas } from "@/lib/hooks/useAreas";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { Project, ProjectStatus, AreaSlug } from "@/lib/types";
import { fuzzySearch } from "@/lib/utils/search";
import { cn } from "@/lib/utils";

export default function ProyectosPage() {
  const { areas } = useAreas();
  const { workspaces } = useWorkspaces();
  const { projects, updateProject, archiveProject, deleteProject } = useProjects({ includeArchived: true });
  
  const [formOpen, setFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>();
  
  // Filters state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Persist viewMode
  useEffect(() => {
    const saved = localStorage.getItem("leso_proyectos_view_mode") as "grid" | "list";
    if (saved) setViewMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("leso_proyectos_view_mode", viewMode);
  }, [viewMode]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("active");
  const [areaFilter, setAreaFilter] = useState<AreaSlug | null>(null);

  const openForm = (project?: Project) => {
    setProjectToEdit(project);
    setFormOpen(true);
  };

  // Filter logic
  const filteredProjects = useMemo(() => {
    let result = projects;
    
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }
    
    if (areaFilter) {
      result = result.filter(p => p.areaSlug === areaFilter);
    }
    
    if (search) {
      result = fuzzySearch(result, search, ['name', 'description']);
    }
    
    return result;
  }, [projects, statusFilter, areaFilter, search]);

  // Area stats calculation
  const getAreaStats = (areaSlug: AreaSlug) => {
    const areaWorkspaces = workspaces.filter(w => w.areaSlug === areaSlug);
    const areaProjects = projects.filter(p => p.areaSlug === areaSlug && p.status === 'active');
    const avgProgress = areaProjects.length > 0 
      ? areaProjects.reduce((acc, p) => acc + p.progressPct, 0) / areaProjects.length 
      : 0;
      
    return {
      workspacesCount: areaWorkspaces.length,
      projectsCount: areaProjects.length,
      progress: avgProgress
    };
  };

  return (
    <div className="p-4 md:p-8 h-full max-w-7xl mx-auto flex flex-col">
      <PageHeader 
        title="Proyectos" 
        description={`${projects.length} proyectos en total`}
        actions={<Button onClick={() => openForm()}><Plus className="w-4 h-4 mr-2" /> Nuevo proyecto</Button>}
      />

      {/* Areas top cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {areas.map(area => {
          const stats = getAreaStats(area.slug as AreaSlug);
          const Icon = area.icon === 'Briefcase' ? Briefcase : 
                       area.icon === 'Handshake' ? Handshake : 
                       area.icon === 'Rocket' ? Rocket : UserIcon;
          
          const isSelected = areaFilter === area.slug;
          
          return (
            <div 
              key={area.id}
              onClick={() => setAreaFilter(isSelected ? null : area.slug as AreaSlug)}
              className={cn(
                "bg-surface border rounded-card p-4 flex flex-col cursor-pointer transition-all",
                isSelected ? "border-primary ring-1 ring-primary shadow-sm" : "border-border hover:border-foreground-tertiary"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-sm text-foreground">{area.name}</span>
              </div>
              <p className="text-xs text-foreground-secondary mb-3">
                {stats.workspacesCount} workspaces · {stats.projectsCount} activos
              </p>
              <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden mt-auto">
                <div className="h-full bg-primary transition-all" style={{ width: `${stats.progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 mt-2 border-b border-border">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
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
              placeholder="Buscar proyectos..." 
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
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "flex flex-col gap-2"
          )}>
            {filteredProjects.map(p => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                viewMode={viewMode}
                onEdit={openForm}
                onArchive={archiveProject}
                onUnarchive={(id) => updateProject({ id, data: { status: 'active' }})}
                onDelete={deleteProject}
                onChangeStatus={(id, status) => updateProject({ id, data: { status }})}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-surface-elevated/30">
            <FolderGit2Icon className="w-12 h-12 text-foreground-tertiary mb-4" strokeWidth={1} />
            <h3 className="text-lg font-medium text-foreground mb-1">No hay proyectos</h3>
            <p className="text-foreground-secondary mb-6 max-w-sm">
              {projects.length === 0 
                ? "Los proyectos viven dentro de los workspaces. Creá el primero para empezar a organizar tus tareas." 
                : "No se encontraron proyectos con los filtros actuales."}
            </p>
            {projects.length === 0 ? (
              <Button onClick={() => openForm()}><Plus className="w-4 h-4 mr-2" /> Crear proyecto</Button>
            ) : (
              <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); setAreaFilter(null); }}>
                Limpiar filtros
              </Button>
            )}
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
      />
    </div>
  );
}

const FolderGit2Icon = ({ className, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"/><circle cx="13" cy="13" r="2"/><path d="M13 15v5"/><path d="M15 15l4-4"/><path d="M19 11v4"/>
  </svg>
);
