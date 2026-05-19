"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";
import { IconPicker } from "@/components/ui/icon-picker";
import { useWorkspace, useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useAreas } from "@/lib/hooks/useAreas";

const formSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  areaSlug: z.string().min(1, "Selecciona un área"),
  color: z.string().min(1, "Selecciona un color"),
  icon: z.string().min(1, "Selecciona un icono"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
  isActive: z.boolean(),
});

export default function WorkspaceSettings({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { workspace } = useWorkspace(resolvedParams.slug);
  const { updateWorkspace, archiveWorkspace, deleteWorkspace } = useWorkspaces();
  const { areas } = useAreas();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workspace?.name || "",
      areaSlug: workspace?.areaSlug || "",
      color: workspace?.color || "#6E8DA8",
      icon: workspace?.icon || "Briefcase",
      description: workspace?.description || "",
      isActive: workspace?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        areaSlug: workspace.areaSlug,
        color: workspace.color,
        icon: workspace.icon,
        description: workspace.description || "",
        isActive: workspace.isActive,
      });
    }
  }, [workspace, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!workspace) return;
    try {
      await updateWorkspace({ id: workspace.id, data: values });
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async () => {
    if (!workspace) return;
    await archiveWorkspace(workspace.id);
    router.push("/workspaces");
  };

  const handleDelete = async () => {
    if (!workspace) return;
    await deleteWorkspace(workspace.id);
    router.push("/workspaces");
  };

  if (!workspace) return null;

  const isChanged = form.formState.isDirty;

  return (
    <div className="max-w-2xl">
      <div className="bg-surface border border-border rounded-card p-6 mb-8">
        <h3 className="text-lg font-medium text-foreground mb-6">Configuración general</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-4 items-start">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="flex-shrink-0 pt-6">
                    <FormControl>
                      <IconPicker value={field.value} onChange={field.onChange} color={form.watch("color")} className="w-14 h-14" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nombre del workspace</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="areaSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área a la que pertenece</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map(a => (
                        <SelectItem key={a.slug} value={a.slug}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color de identificación</FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Propósito de este workspace..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Workspace activo</FormLabel>
                    <div className="text-sm text-foreground-secondary">
                      Si lo desactivás, se ocultará de la barra lateral sin ser archivado.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button type="submit" disabled={!isChanged || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="bg-surface border border-border rounded-card p-6 space-y-6">
        <h3 className="text-lg font-medium text-foreground text-danger">Zona de peligro</h3>
        
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h4 className="font-medium text-foreground">Archivar workspace</h4>
            <p className="text-sm text-foreground-secondary mt-1">
              Pasará a estado de solo-lectura y se moverá a la sección de archivados.
            </p>
          </div>
          <Button variant="outline" onClick={handleArchive}>Archivar</Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Eliminar workspace</h4>
            <p className="text-sm text-foreground-secondary mt-1">
              Esta acción eliminará todos los datos asociados permanentemente.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Eliminar permanentemente</Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar workspace?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los proyectos, tareas y notas vinculadas a este workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-3">
            <p className="text-sm text-foreground">
              Por favor, escribí <span className="font-semibold select-none">{workspace.name}</span> para confirmar.
            </p>
            <Input 
              value={deleteConfirmText} 
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder={workspace.name}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              disabled={deleteConfirmText !== workspace.name}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

