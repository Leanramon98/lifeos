"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LogOut, Home, CheckSquare, FolderGit2, FileText, 
  ChevronLeft, ChevronRight, Settings, Sparkles, 
  HeartPulse, Wallet, Plane, Trophy, Clapperboard, Calendar,
  Search, User, Plus, LayoutGrid
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { signOut } from "@/lib/firebase/auth";
import { useUIStore } from "@/lib/stores/useUIStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./Logo";
import { WorkspaceFormDialog } from "@/components/workspaces/WorkspaceFormDialog";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  isMobile?: boolean;
}

export function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { userData } = useAuth();
  const { workspaces, isLoading } = useWorkspaces();
  const { sidebarCollapsed, toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);

  const collapsed = !isMobile && sidebarCollapsed;

  const mainItems = [
    { name: "Inicio", href: "/inicio", icon: Home },
    { name: "Tareas", href: "/tareas", icon: CheckSquare },
    { name: "Proyectos", href: "/proyectos", icon: FolderGit2 },
    { name: "Notas", href: "/notas", icon: FileText },
  ];

  const trackingItems = [
    { name: "Salud", icon: HeartPulse, soon: true },
    { name: "Finanzas", icon: Wallet, soon: true },
    { name: "Viajes", icon: Plane, soon: true },
  ];

  const lifeItems = [
    { name: "Deporte", icon: Trophy, soon: true },
    { name: "Media", icon: Clapperboard, soon: true },
    { name: "Calendario", icon: Calendar, soon: true },
  ];

  const renderItem = (item: { name: string; href?: string; icon?: React.ElementType; soon?: boolean; color?: string }, customIcon?: React.ReactNode) => {
    const isActive = item.href ? pathname === item.href : false;
    const content = (
      <div className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors relative group",
        collapsed ? "justify-center p-2 mx-auto" : "px-3 py-2 space-x-3 w-full",
        isActive ? "bg-surface-elevated text-foreground" : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground",
        item.soon && "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-foreground-secondary"
      )}>
        {isActive && !collapsed && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-full" />
        )}
        
        {customIcon ? customIcon : item.icon && <item.icon strokeWidth={1.5} className="w-[18px] h-[18px] flex-shrink-0" />}
        
        {!collapsed && (
          <div className="flex flex-1 items-center justify-between truncate">
            <span className="truncate">{item.name}</span>
            {item.soon && <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal ml-2">Pronto</Badge>}
          </div>
        )}
      </div>
    );

    if (item.soon) {
      return <div key={item.name}>{content}</div>;
    }

    const wrapper = item.href ? <Link key={item.name} href={item.href}>{content}</Link> : <div key={item.name}>{content}</div>;

    if (collapsed) {
      return (
        <TooltipProvider key={item.name} delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{wrapper}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return wrapper;
  };

  const renderSectionLabel = (children: React.ReactNode) => {
    if (collapsed) return <div className="h-4" />;
    return (
      <h4 className="px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-tertiary mb-1 mt-4">
        {children}
      </h4>
    );
  };

  return (
    <div className={cn(
      "flex flex-col bg-surface border-r border-border h-screen transition-all duration-300",
      isMobile ? "w-full" : collapsed ? "w-[64px]" : "w-[240px]"
    )}>
      {/* Header / Logo */}
      <div className="p-4 flex items-center justify-between">
        <Logo showText={!collapsed} />
        {!isMobile && (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-foreground-tertiary hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className={cn("px-4 py-2", collapsed && "flex justify-center px-0")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 w-full rounded-md hover:bg-surface-elevated transition-colors text-left",
              collapsed ? "justify-center p-1" : "p-2"
            )}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={userData?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {userData?.name?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {userData?.name || "Cargando..."}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? "start" : "end"} className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Ver perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-danger focus:text-danger" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search / Command */}
      <div className={cn("px-3 py-2", collapsed && "flex justify-center px-0")}>
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "flex items-center text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-colors rounded-md",
            collapsed ? "w-10 h-10 justify-center" : "w-full px-3 py-2 space-x-3"
          )}
        >
          <Search strokeWidth={1.5} className="w-[18px] h-[18px]" />
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm font-medium">Buscar...</span>
              <kbd className="text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-mono text-foreground-tertiary">⌘K</kbd>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-2">
        <div className="px-3 space-y-0.5">
          {mainItems.map(item => renderItem(item))}
        </div>

        {renderSectionLabel("Workspaces")}
        <div className="px-3 space-y-0.5">
          {isLoading ? (
            <div className="space-y-2 px-3 py-2">
              <div className="h-6 bg-surface-elevated animate-pulse rounded-md w-full" />
              <div className="h-6 bg-surface-elevated animate-pulse rounded-md w-4/5" />
            </div>
          ) : workspaces.length > 0 ? (
            workspaces.map(w => renderItem({ name: w.name, href: `/workspaces/${w.slug}` }, (
              <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
              </div>
            )))
          ) : !collapsed && (
            <div className="px-3 py-2 text-xs text-foreground-secondary italic">Aún no tenés workspaces</div>
          )}
          {!collapsed && (
            <button 
              onClick={() => setFormOpen(true)}
              className="flex w-full items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground-tertiary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors mt-1"
            >
              <Plus strokeWidth={1.5} className="w-[18px] h-[18px]" />
              <span>Nuevo workspace</span>
            </button>
          )}
        </div>

        {renderSectionLabel("Tracking")}
        <div className="px-3 space-y-0.5">
          {trackingItems.map(item => renderItem(item))}
        </div>

        {renderSectionLabel("Life")}
        <div className="px-3 space-y-0.5">
          {lifeItems.map(item => renderItem(item))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border mt-auto flex-shrink-0">
        {renderItem({ name: "Configuración", href: "/settings", icon: Settings })}
        {renderItem({ name: "Asistente IA", icon: Sparkles, soon: true })}
      </div>

      <WorkspaceFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
