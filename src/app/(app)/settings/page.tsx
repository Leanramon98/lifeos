"use client";

import React, { useState } from "react";
import { 
  User, Palette, FolderOpen, LayoutGrid, Bell, 
  Puzzle, Sparkles, Database, Info, LogOut, CheckCircle2, ChevronRight, GripVertical, Plus
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { exportAllUserData } from "@/lib/utils/export-data";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableWorkspaceItem({ workspace }: { workspace: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: workspace.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-surface-elevated border border-border rounded-xl mb-2 group">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="text-border group-hover:text-foreground-tertiary cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: workspace.color }} />
        <span className="text-sm font-medium text-foreground">{workspace.name}</span>
        <span className="text-[10px] uppercase tracking-wider font-bold text-foreground-tertiary bg-surface px-1.5 py-0.5 rounded border border-border">
          {workspace.areaSlug}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Editar</Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const { workspaces, updateWorkspace } = useWorkspaces();
  const [activeTab, setActiveTab] = useState("profile");
  const [isExporting, setIsExporting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleExport = async () => {
    if (!user) return;
    setIsExporting(true);
    toast.info("Generando exportación de datos...");
    try {
      const dataStr = await exportAllUserData(user.uid);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leso-life-os-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Datos exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = workspaces.findIndex(w => w.id === active.id);
      const newIndex = workspaces.findIndex(w => w.id === over.id);
      
      const newOrder = arrayMove(workspaces, oldIndex, newIndex);
      // Actualizamos los order en batch
      newOrder.forEach((w, index) => {
        if (w.order !== index) {
          updateWorkspace(w.id, { order: index });
        }
      });
    }
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "appearance", label: "Apariencia", icon: Palette },
    { id: "workspaces", label: "Workspaces", icon: FolderOpen },
    { id: "areas", label: "Áreas", icon: LayoutGrid },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "integrations", label: "Integraciones", icon: Puzzle },
    { id: "ai", label: "IA Assistant", icon: Sparkles },
    { id: "data", label: "Datos", icon: Database },
    { id: "about", label: "Sobre LESO", icon: Info },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8 max-w-xl">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Perfil</h2>
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData?.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {userData?.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={() => toast("Próximamente", { description: "Subida de avatar en Fase 2." })}>
                  Cambiar foto
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground-secondary mb-1">Nombre</label>
                  <Input defaultValue={userData?.name} className="max-w-md" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground-secondary mb-1">Email</label>
                  <Input defaultValue={user?.email || ""} disabled className="max-w-md bg-surface" />
                  <p className="text-xs text-foreground-tertiary mt-1">El email solo se puede cambiar desde Firebase Console.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground-secondary mb-1">Idioma</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background max-w-md">
                    <option>Español</option>
                    <option disabled>English (Próximamente)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8">
                <Button onClick={() => toast.success("Cambios guardados")}>Guardar cambios</Button>
              </div>
            </div>
          </div>
        );
      
      case "workspaces":
        return (
          <div className="space-y-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Workspaces</h2>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Nuevo workspace</Button>
            </div>
            
            <p className="text-sm text-foreground-secondary mb-4">Arrastrá para reordenar cómo aparecen en tu menú lateral.</p>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={workspaces.map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {workspaces.map((workspace) => (
                    <SortableWorkspaceItem key={workspace.id} workspace={workspace} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );

      case "data":
        return (
          <div className="space-y-8 max-w-xl">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Datos y Privacidad</h2>
              
              <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
                <h3 className="text-base font-bold text-foreground mb-2">Exportar datos</h3>
                <p className="text-sm text-foreground-secondary mb-4">
                  Descargá una copia de seguridad en formato JSON con todas tus tareas, proyectos, notas y configuraciones.
                </p>
                <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "Exportando..." : "Exportar todos mis datos"}
                </Button>
              </div>

              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6">
                <h3 className="text-base font-bold text-danger mb-2">Zona de peligro</h3>
                <p className="text-sm text-foreground-secondary mb-4">
                  Eliminar tu cuenta borrará permanentemente todos tus datos, archivos y configuraciones. Esta acción no se puede deshacer.
                </p>
                <Button variant="destructive" onClick={() => {
                  if (confirm("¿Estás 100% seguro de que querés eliminar tu cuenta para siempre?")) {
                    toast.error("Próximamente: La eliminación requiere limpieza del auth en backend.");
                  }
                }}>
                  Eliminar mi cuenta
                </Button>
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-8 max-w-xl">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Sobre LESO Life OS</h2>
              <div className="bg-surface border border-border rounded-2xl p-6 mb-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-primary text-white font-bold text-2xl flex items-center justify-center rounded-2xl mb-4">
                  L
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">LESO Life OS</h3>
                <p className="text-sm font-medium text-foreground-secondary mb-4">v1.0 — Fase 1 completada</p>
                <p className="text-sm text-foreground-tertiary">
                  Un sistema operativo personal diseñado con foco en la estética, velocidad y organización sin fricción.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-xl font-bold text-foreground mb-2">Próximamente en Fase 2</h2>
            <p className="text-sm text-foreground-tertiary max-w-sm">Esta sección de configuración estará disponible en la próxima gran actualización de LESO Life OS.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-background">
      {/* Sidebar de Configuración */}
      <div className="w-full md:w-64 border-r border-border bg-surface flex-shrink-0 flex flex-col h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        </div>
        <nav className="px-3 pb-6 flex-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-surface-elevated text-foreground" 
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-foreground-tertiary"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto h-full scrollbar-none">
        {renderContent()}
      </div>
    </div>
  );
}
