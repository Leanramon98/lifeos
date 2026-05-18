"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Briefcase, Handshake, Rocket, User as UserIcon, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useAreas } from "@/lib/hooks/useAreas";
import { WorkspaceFormDialog } from "@/components/workspaces/WorkspaceFormDialog";
import { AreaSlug, Workspace } from "@/lib/types";

export default function WorkspacesPage() {
  const router = useRouter();
  const { areas } = useAreas();
  const { workspaces, archivedWorkspaces, archiveWorkspace, unarchiveWorkspace, deleteWorkspace } = useWorkspaces();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaSlug | undefined>();
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | undefined>();

  const openForm = (areaSlug?: AreaSlug, workspace?: Workspace) => {
    setSelectedArea(areaSlug);
    setWorkspaceToEdit(workspace);
    setFormOpen(true);
  };

  const WorkspaceCard = ({ w, isArchived = false }: { w: Workspace, isArchived?: boolean }) => (
    <div 
      className="group relative bg-surface border border-border rounded-card overflow-hidden hover:shadow-soft transition-all cursor-pointer flex flex-col"
      onClick={() => router.push(`/workspaces/${w.slug}`)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: w.color }} />
      <div className="p-4 pl-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <span style={{ color: w.color }}>{/* Icon Placeholder */} <LayoutGrid className="w-4 h-4" /></span>
            {w.name}
          </h4>
          <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-foreground-tertiary hover:text-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openForm(w.areaSlug, w)}>Editar</DropdownMenuItem>
                {isArchived ? (
                  <DropdownMenuItem onClick={() => unarchiveWorkspace(w.id)}>Desarchivar</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => archiveWorkspace(w.id)}>Archivar</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger" onClick={() => deleteWorkspace(w.id)}>Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-sm text-foreground-secondary line-clamp-2 flex-1">
          {w.description || "Sin descripción"}
        </p>
        <div className="mt-4 pt-3 border-t border-border flex items-center text-xs text-foreground-tertiary">
          <span>0 proyectos · 0 tareas</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 h-full max-w-6xl mx-auto">
      <PageHeader 
        title="Mis Áreas" 
        description="Vista panorámica de tu vida"
        actions={<Button onClick={() => openForm()}><Plus className="w-4 h-4 mr-2" /> Nuevo workspace</Button>}
      />

      {workspaces.length === 0 && archivedWorkspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-surface-elevated/30 mt-8">
          <LayoutGrid className="w-12 h-12 text-foreground-tertiary mb-4" strokeWidth={1} />
          <h3 className="text-lg font-medium text-foreground mb-1">Aún no tenés workspaces</h3>
          <p className="text-foreground-secondary mb-6 max-w-sm">Los espacios de trabajo te permiten organizar tus proyectos y tareas.</p>
          <Button onClick={() => openForm()}>Crear mi primer workspace</Button>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {areas.map(area => {
            const areaWorkspaces = workspaces.filter(w => w.areaSlug === area.slug);
            const Icon = area.icon === 'Briefcase' ? Briefcase : 
                         area.icon === 'Handshake' ? Handshake : 
                         area.icon === 'Rocket' ? Rocket : UserIcon;

            return (
              <Collapsible key={area.id} defaultOpen className="group">
                <div className="flex items-center justify-between mb-4">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
                      <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-foreground leading-none">{area.name}</h3>
                        <span className="text-xs text-foreground-tertiary mt-1 block">
                          {areaWorkspaces.length} activos
                        </span>
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <Button variant="ghost" size="sm" onClick={() => openForm(area.slug as AreaSlug)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  {areaWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {areaWorkspaces.map(w => <WorkspaceCard key={w.id} w={w} />)}
                    </div>
                  ) : (
                    <div className="py-6 text-center border border-dashed border-border rounded-card bg-surface-elevated/30">
                      <p className="text-sm text-foreground-secondary italic">Sin espacios de trabajo activos</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {archivedWorkspaces.length > 0 && (
            <div className="pt-8 mt-8 border-t border-border">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button className="font-medium text-foreground-secondary hover:text-foreground transition-colors mb-4 flex items-center gap-2">
                    Workspaces archivados ({archivedWorkspaces.length})
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedWorkspaces.map(w => <WorkspaceCard key={w.id} w={w} isArchived />)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      )}

      <WorkspaceFormDialog 
        open={formOpen} 
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setTimeout(() => setWorkspaceToEdit(undefined), 300);
        }} 
        defaultAreaSlug={selectedArea}
        workspace={workspaceToEdit}
      />
    </div>
  );
}
