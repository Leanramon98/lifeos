"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, MoreVertical, LayoutPanelLeft } from "lucide-react";
import { useProject, useProjects } from "@/lib/hooks/useProjects";
import { useAreas } from "@/lib/hooks/useAreas";
import { PageSkeleton } from "@/components/ui/skeletons/PageSkeleton";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectSidebar } from "@/components/projects/ProjectSidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { project, isLoading } = useProject(resolvedParams.id);
  const { updateProject, archiveProject, deleteProject } = useProjects();
  const { areas } = useAreas();
  
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Inline edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) nameInputRef.current.focus();
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingDesc && descInputRef.current) descInputRef.current.focus();
  }, [isEditingDesc]);

  if (isLoading) return <PageSkeleton />;
  if (!project) return (
    <div className="p-8 text-center mt-12">
      <h2 className="text-xl font-medium mb-2">Proyecto no encontrado</h2>
      <Link href="/proyectos"><Button>Volver a proyectos</Button></Link>
    </div>
  );

  const area = areas.find(a => a.slug === project.areaSlug);

  const handleNameSave = () => {
    setIsEditingName(false);
    if (editName.trim() && editName !== project.name) {
      updateProject({ id: project.id, data: { name: editName.trim() } });
    }
  };

  const handleDescSave = () => {
    setIsEditingDesc(false);
    if (editDesc.trim() !== project.description) {
      updateProject({ id: project.id, data: { description: editDesc.trim() } });
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText === project.name) {
      await deleteProject(project.id);
      router.push("/proyectos");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success';
      case 'paused': return 'bg-warning text-warning';
      case 'done': return 'bg-foreground-secondary text-foreground-secondary';
      case 'archived': return 'bg-border text-foreground-tertiary';
      default: return 'bg-primary text-primary';
    }
  };

  const tabs = [
    { name: "Tareas", href: `/proyectos/${project.id}` },
    { name: "Notas", href: `/proyectos/${project.id}/notas` },
    { name: "Documentos", href: `/proyectos/${project.id}/documentos` },
    { name: "Actividad", href: `/proyectos/${project.id}/actividad` },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-shrink-0 pt-4 px-4 md:px-8 border-b border-border" style={{ backgroundColor: `${project.workspaceColor}08` }}>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-foreground-tertiary mb-6">
          <Link href="/proyectos" className="hover:text-foreground transition-colors">Proyectos</Link>
          <ChevronRight className="w-3 h-3" />
          <span>{area?.name || "Área"}</span>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/workspaces/${project.workspaceSlug}`} className="hover:text-foreground transition-colors">
            {project.workspaceName}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground-secondary truncate max-w-[200px]">{project.name}</span>
        </div>

        {/* Header Content */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: project.workspaceColor }}>
                {project.workspaceName}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface border border-border text-xs hover:bg-surface-hover transition-colors">
                    <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(project.status).split(' ')[0])} />
                    <span className="capitalize text-foreground-secondary">
                      {project.status === 'done' ? 'Completado' : project.status === 'paused' ? 'Pausado' : project.status === 'archived' ? 'Archivado' : 'Activo'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => updateProject({ id: project.id, data: { status: 'active' }})}>Activo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateProject({ id: project.id, data: { status: 'paused' }})}>Pausado</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateProject({ id: project.id, data: { status: 'done' }})}>Completado</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateProject({ id: project.id, data: { status: 'archived' }})}>Archivado</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isEditingName ? (
              <Input
                ref={nameInputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                className="text-2xl md:text-3xl font-semibold h-auto py-1 mb-2 max-w-xl"
              />
            ) : (
              <h1 
                className="text-2xl md:text-3xl font-semibold text-foreground mb-2 cursor-text hover:bg-foreground/5 rounded-md -ml-2 px-2 py-1 max-w-fit"
                onClick={() => { setEditName(project.name); setIsEditingName(true); }}
              >
                {project.name}
              </h1>
            )}

            {isEditingDesc ? (
              <textarea
                ref={descInputRef}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                onBlur={handleDescSave}
                onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleDescSave()}
                className="w-full max-w-2xl text-sm bg-background border border-primary ring-1 ring-primary rounded-md p-2 min-h-[60px] resize-none outline-none"
              />
            ) : (
              <p 
                className="text-sm text-foreground-secondary cursor-text hover:bg-foreground/5 rounded-md -ml-2 px-2 py-1 max-w-2xl min-h-[28px]"
                onClick={() => { setEditDesc(project.description || ""); setIsEditingDesc(true); }}
              >
                {project.description || "Añadir descripción..."}
              </p>
            )}

            {/* Metrics inline */}
            <div className="flex items-center gap-4 text-xs text-foreground-tertiary mt-4">
              <span>{project.taskCounts.active} tareas activas</span>
              <span>{project.taskCounts.done} completadas</span>
              <span>{project.progressPct}% progreso</span>
              {project.startDate && <span>Inicio: {format(project.startDate?.seconds ? project.startDate.seconds * 1000 : project.startDate as any, "d MMM yyyy", { locale: es })}</span>}
              {project.dueDate && <span>Vence: {format(project.dueDate?.seconds ? project.dueDate.seconds * 1000 : project.dueDate as any, "d MMM yyyy", { locale: es })}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>Editar</Button>
            <Button variant="outline" size="icon" className="w-8 h-8 md:hidden"><LayoutPanelLeft className="w-4 h-4" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {project.status !== 'archived' ? (
                  <DropdownMenuItem onClick={() => archiveProject(project.id)}>Archivar proyecto</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => updateProject({ id: project.id, data: { status: 'active' }})}>Desarchivar proyecto</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger" onClick={() => setDeleteDialogOpen(true)}>Eliminar proyecto</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 overflow-x-auto scrollbar-none mt-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname === tab.href + '/';
            return (
              <Link 
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap text-sm font-medium",
                  isActive 
                    ? "text-foreground border-foreground" 
                    : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border"
                )}
                style={isActive ? { borderColor: project.workspaceColor } : undefined}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex">
        <div className="flex-1 min-w-0">
          {children}
        </div>
        
        {/* Optional Right Sidebar (hidden on mobile, can be toggled) */}
        <ProjectSidebar project={project} />
      </div>

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} project={project} />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar proyecto?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Cuando implementemos tareas, también se eliminarán todas las tareas y notas vinculadas a este proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-3">
            <p className="text-sm text-foreground">
              Escribí <span className="font-semibold select-none">{project.name}</span> para confirmar.
            </p>
            <Input 
              value={deleteConfirmText} 
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder={project.name}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              disabled={deleteConfirmText !== project.name}
              onClick={handleDelete}
            >
              Eliminar permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
