import React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MoreVertical, LayoutGrid, List } from "lucide-react";
import { Project } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  viewMode: "grid" | "list";
  onEdit: (p: Project) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: Project['status']) => void;
  showWorkspaceChip?: boolean;
}

export function ProjectCard({ 
  project, 
  viewMode, 
  onEdit, 
  onArchive, 
  onUnarchive, 
  onDelete, 
  onChangeStatus,
  showWorkspaceChip = true 
}: ProjectCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the card itself, not the dropdown
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) return;
    router.push(`/proyectos/${project.id}`);
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

  const updatedText = `Actualizado hace ${formatDistanceToNow(project.updatedAt?.seconds ? project.updatedAt.seconds * 1000 : new Date(project.updatedAt), { locale: es })}`;

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="dropdown-trigger text-foreground-tertiary hover:text-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project); }}>Editar</DropdownMenuItem>
        
        <DropdownMenuSeparator />
        {project.status !== 'active' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus(project.id, 'active'); }}>Marcar como Activo</DropdownMenuItem>}
        {project.status !== 'paused' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus(project.id, 'paused'); }}>Marcar como Pausado</DropdownMenuItem>}
        {project.status !== 'done' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus(project.id, 'done'); }}>Marcar como Completado</DropdownMenuItem>}
        
        <DropdownMenuSeparator />
        {project.status === 'archived' ? (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUnarchive(project.id); }}>Desarchivar</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(project.id); }}>Archivar</DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-danger focus:text-danger" onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}>Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <div 
        onClick={handleCardClick}
        className="group flex items-center gap-4 p-3 bg-surface border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer hover:bg-surface-elevated/50"
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.workspaceColor }} />
        
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="font-medium text-foreground truncate">{project.name}</span>
          
          {showWorkspaceChip && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-border text-foreground-secondary flex-shrink-0">
              {project.workspaceName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-2 w-24">
            <div className={cn("w-2 h-2 rounded-full", getStatusColor(project.status).split(' ')[0])} />
            <span className="text-xs text-foreground-secondary capitalize">
              {project.status === 'done' ? 'Completado' : project.status === 'paused' ? 'Pausado' : project.status === 'archived' ? 'Archivado' : 'Activo'}
            </span>
          </div>

          <div className="text-xs text-foreground-tertiary w-24 text-right">
            {project.taskCounts.done}/{project.taskCounts.total} tareas
          </div>

          <div className="w-20 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ width: `${project.progressPct}%`, backgroundColor: project.workspaceColor }} 
            />
          </div>

          <div className="text-xs text-foreground-tertiary w-32 text-right hidden md:block">
            {updatedText}
          </div>

          <div className="w-6 flex justify-end" onClick={e => e.stopPropagation()}>
            {menu}
          </div>
        </div>
      </div>
    );
  }

  // GRID MODE
  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col bg-surface border border-border rounded-card overflow-hidden hover:shadow-soft transition-all cursor-pointer"
    >
      <div className="h-[3px] w-full" style={{ backgroundColor: project.workspaceColor }} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          {showWorkspaceChip ? (
            <span 
              className="text-[10px] font-semibold px-2 py-0.5 rounded text-white mb-2 inline-block"
              style={{ backgroundColor: project.workspaceColor }}
            >
              {project.workspaceName}
            </span>
          ) : (
            <div className="h-6" /> // spacer
          )}
          <div className="ml-auto" onClick={e => e.stopPropagation()}>
            {menu}
          </div>
        </div>

        <h4 className="font-semibold text-lg text-foreground line-clamp-2 mb-1">{project.name}</h4>
        <p className="text-sm text-foreground-secondary line-clamp-2 flex-1 mb-4">
          {project.description || "Sin descripción"}
        </p>

        <div className="flex items-center justify-between text-xs text-foreground-secondary mb-2 font-medium">
          <span>{project.taskCounts.active} activas</span>
          <span>{project.taskCounts.done} completadas</span>
        </div>

        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-4">
          <div 
            className="h-full rounded-full transition-all" 
            style={{ width: `${project.progressPct}%`, backgroundColor: project.workspaceColor }} 
          />
        </div>

        <div className="flex items-center justify-between mt-auto text-[11px] text-foreground-tertiary">
          <span>{updatedText}</span>
          <div className={cn("w-2 h-2 rounded-full", getStatusColor(project.status).split(' ')[0])} title={project.status} />
        </div>
      </div>
    </div>
  );
}
