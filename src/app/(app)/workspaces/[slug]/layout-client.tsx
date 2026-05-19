"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical, LayoutDashboard, CheckSquare, FolderGit2, FileText, Settings as SettingsIcon } from "lucide-react";
import { useWorkspace } from "@/lib/hooks/useWorkspaces";
import { useAreas } from "@/lib/hooks/useAreas";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeletons/PageSkeleton";
import { cn } from "@/lib/utils";

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { workspace, isLoading } = useWorkspace(resolvedParams.slug);
  const { areas } = useAreas();
  const pathname = usePathname();

  if (isLoading) return <PageSkeleton />;
  
  if (!workspace) {
    return (
      <div className="p-8 text-center text-foreground-secondary mt-12">
        <h2 className="text-xl font-medium text-foreground mb-2">Workspace no encontrado</h2>
        <p>El espacio de trabajo que estás buscando no existe o fue eliminado.</p>
        <Link href="/workspaces">
          <Button className="mt-4">Volver a mis áreas</Button>
        </Link>
      </div>
    );
  }

  const area = areas.find(a => a.slug === workspace.areaSlug);

  const tabs = [
    { name: "Dashboard", href: `/workspaces/${workspace.slug}`, icon: LayoutDashboard },
    { name: "Tareas", href: `/workspaces/${workspace.slug}/tareas`, icon: CheckSquare },
    { name: "Proyectos", href: `/workspaces/${workspace.slug}/proyectos`, icon: FolderGit2 },
    { name: "Notas", href: `/workspaces/${workspace.slug}/notas`, icon: FileText },
    { name: "Settings", href: `/workspaces/${workspace.slug}/settings`, icon: SettingsIcon },
  ];

  const actions = (
    <>
      <Button disabled className="opacity-50" title="Próximamente">Nueva tarea</Button>
      <Button variant="outline" disabled className="opacity-50" title="Próximamente">Nuevo proyecto</Button>
    </>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 pt-6 px-4 md:px-8 border-b border-border bg-background">
        <PageHeader 
          title={workspace.name} 
          description={workspace.description || ""}
          breadcrumb={[
            { label: "Workspaces", href: "/workspaces" },
            { label: area?.name || "Área" },
            { label: workspace.name }
          ]}
          actions={actions}
        />

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
                    ? "text-foreground" 
                    : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border"
                )}
                style={isActive ? { borderColor: workspace.color } : undefined}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
