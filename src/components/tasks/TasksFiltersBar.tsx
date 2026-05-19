"use client";

import React from "react";
import { Search, ArrowUpDown, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store/useUIStore";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useProjects } from "@/lib/hooks/useProjects";
import { useAreas } from "@/lib/hooks/useAreas";
import { TaskStatus, TaskPriority, AreaSlug } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

interface Props {
  scope: 'global' | 'workspace' | 'project';
  workspaceId?: string;
  projectId?: string;
}

export function TasksFiltersBar({ scope, workspaceId, projectId }: Props) {
  const ui = useUIStore();
  const { workspaces } = useWorkspaces();
  const { projects } = useProjects();
  const { areas } = useAreas();

  // Safely extract filters with arrays fallback
  const f = ui.taskFilters || {};
  const statusFilters = f.status || [];
  const priorityFilters = f.priority || [];
  const areasFilters = f.areas || [];
  const workspacesFilters = f.workspaces || [];
  const projectsFilters = f.projects || [];
  const dateRangeFilter = f.dateRange || 'all';
  const searchFilter = f.search || '';

  const activeFilterCount = 
    statusFilters.length + 
    priorityFilters.length + 
    areasFilters.length + 
    (scope === 'global' ? workspacesFilters.length : 0) + 
    (scope !== 'project' ? projectsFilters.length : 0) + 
    (dateRangeFilter !== 'all' ? 1 : 0);

  const toggleFilter = (type: keyof typeof ui.taskFilters, value: any) => {
    const current = (ui.taskFilters?.[type] || []) as any[];
    if (current.includes(value)) {
      ui.updateTaskFilters({ [type]: current.filter(v => v !== value) });
    } else {
      ui.updateTaskFilters({ [type]: [...current, value] });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-tertiary" />
          <Input 
            placeholder="Buscar tareas..." 
            className="pl-9 h-9"
            value={searchFilter}
            onChange={e => ui.updateTaskFilters({ search: e.target.value })}
          />
          {searchFilter && (
            <button 
              onClick={() => ui.updateTaskFilters({ search: "" })}
              className="absolute right-2.5 top-2.5 text-foreground-tertiary hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {ui.taskViewMode === 'list' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-dashed">
                <ArrowUpDown className="w-3.5 h-3.5 mr-2" /> 
                Agrupar: <span className="ml-1 font-bold capitalize">{ui.taskGroupBy === 'none' ? 'Ninguno' : ui.taskGroupBy}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => ui.setTaskGroupBy('status')}>Estado</DropdownMenuItem>
              {scope === 'global' && <DropdownMenuItem onClick={() => ui.setTaskGroupBy('workspace')}>Workspace</DropdownMenuItem>}
              {scope !== 'project' && <DropdownMenuItem onClick={() => ui.setTaskGroupBy('project')}>Proyecto</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => ui.setTaskGroupBy('priority')}>Prioridad</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => ui.setTaskGroupBy('none')}>Ninguno</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 gap-1", statusFilters.length > 0 && "bg-primary/5 border-primary/50 text-primary")}>
              Estado {statusFilters.length > 0 && `(${statusFilters.length})`}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['backlog', 'todo', 'doing', 'waiting', 'done'].map((s) => (
              <DropdownMenuCheckboxItem 
                key={s}
                checked={statusFilters.includes(s as TaskStatus)}
                onCheckedChange={() => toggleFilter('status', s)}
                className="capitalize"
              >
                {s.replace('_', ' ')}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 gap-1", priorityFilters.length > 0 && "bg-primary/5 border-primary/50 text-primary")}>
              Prioridad {priorityFilters.length > 0 && `(${priorityFilters.length})`}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['urgent', 'high', 'medium', 'low'].map((p) => (
              <DropdownMenuCheckboxItem 
                key={p}
                checked={priorityFilters.includes(p as TaskPriority)}
                onCheckedChange={() => toggleFilter('priority', p)}
                className="capitalize"
              >
                {p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {scope === 'global' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 gap-1", areasFilters.length > 0 && "bg-primary/5 border-primary/50 text-primary")}>
                Área {areasFilters.length > 0 && `(${areasFilters.length})`}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {areas.map((a) => (
                <DropdownMenuCheckboxItem 
                  key={a.id}
                  checked={areasFilters.includes(a.slug)}
                  onCheckedChange={() => toggleFilter('areas', a.slug)}
                >
                  {a.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {scope === 'global' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 gap-1", workspacesFilters.length > 0 && "bg-primary/5 border-primary/50 text-primary")}>
                Workspace {workspacesFilters.length > 0 && `(${workspacesFilters.length})`}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {workspaces.map((w) => (
                <DropdownMenuCheckboxItem 
                  key={w.id}
                  checked={workspacesFilters.includes(w.id)}
                  onCheckedChange={() => toggleFilter('workspaces', w.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                    {w.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {scope !== 'project' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 gap-1", projectsFilters.length > 0 && "bg-primary/5 border-primary/50 text-primary")}>
                Proyecto {projectsFilters.length > 0 && `(${projectsFilters.length})`}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {projects.filter(p => !workspaceId || p.workspaceId === workspaceId).map((p) => (
                <DropdownMenuCheckboxItem 
                  key={p.id}
                  checked={projectsFilters.includes(p.id)}
                  onCheckedChange={() => toggleFilter('projects', p.id)}
                >
                  {p.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 gap-1", dateRangeFilter !== 'all' && "bg-primary/5 border-primary/50 text-primary")}>
              Fecha {dateRangeFilter !== 'all' && `: ${dateRangeFilter}`}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => ui.updateTaskFilters({ dateRange: 'all' })}>Cualquier fecha</DropdownMenuItem>
            <DropdownMenuItem onClick={() => ui.updateTaskFilters({ dateRange: 'today' })}>Hoy</DropdownMenuItem>
            <DropdownMenuItem onClick={() => ui.updateTaskFilters({ dateRange: 'week' })}>Esta semana</DropdownMenuItem>
            <DropdownMenuItem onClick={() => ui.updateTaskFilters({ dateRange: 'month' })}>Este mes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => ui.updateTaskFilters({ dateRange: 'overdue' })}>Vencidas</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-foreground-tertiary hover:text-foreground text-xs"
            onClick={() => ui.resetTaskFilters()}
          >
            <X className="w-3.5 h-3.5 mr-1" /> Limpiar filtros ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
