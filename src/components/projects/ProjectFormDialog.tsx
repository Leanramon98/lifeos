"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Project, ProjectStatus } from "@/lib/types";
import { useProjects } from "@/lib/hooks/useProjects";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useAreas } from "@/lib/hooks/useAreas";

const formSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  workspaceId: z.string().min(1, "Selecciona un workspace"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  status: z.enum(["active", "paused", "done", "archived"]),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  tags: z.array(z.string()).optional(),
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return data.dueDate >= data.startDate;
  }
  return true;
}, {
  message: "La fecha de vencimiento no puede ser anterior a la de inicio",
  path: ["dueDate"]
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  defaultWorkspaceId?: string;
}

export function ProjectFormDialog({ open, onOpenChange, project, defaultWorkspaceId }: Props) {
  const { createProject, updateProject, projects } = useProjects();
  const { workspaces } = useWorkspaces();
  const { areas } = useAreas();
  const isEdit = !!project;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      workspaceId: project?.workspaceId || defaultWorkspaceId || "",
      description: project?.description || "",
      status: project?.status || "active",
      startDate: project?.startDate ? new Date((project.startDate as any).seconds ? (project.startDate as any).seconds * 1000 : project.startDate) : null,
      dueDate: project?.dueDate ? new Date((project.dueDate as any).seconds ? (project.dueDate as any).seconds * 1000 : project.dueDate) : null,
      tags: project?.tags || [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name || "",
        workspaceId: project?.workspaceId || defaultWorkspaceId || "",
        description: project?.description || "",
        status: project?.status || "active",
        startDate: project?.startDate ? new Date((project.startDate as any).seconds ? (project.startDate as any).seconds * 1000 : project.startDate) : null,
        dueDate: project?.dueDate ? new Date((project.dueDate as any).seconds ? (project.dueDate as any).seconds * 1000 : project.dueDate) : null,
        tags: project?.tags || [],
      });
    }
  }, [open, project, defaultWorkspaceId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEdit && project) {
        await updateProject({ id: project.id, data: values });
      } else {
        await createProject(values as any);
      }
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Get all unique tags from existing projects for suggestions
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar proyecto" : "Nuevo proyecto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Rediseño App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workspaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areas.map(area => {
                          const areaWorkspaces = workspaces.filter(w => w.areaSlug === area.slug);
                          if (areaWorkspaces.length === 0) return null;
                          return (
                            <SelectGroup key={area.id}>
                              <SelectLabel>{area.name}</SelectLabel>
                              {areaWorkspaces.map(w => (
                                <SelectItem key={w.id} value={w.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                                    {w.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                        <SelectItem value="done">Completado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Objetivos del proyecto..." 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Using native date inputs for simplicity in this iteration */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? field.value.toISOString().split('T')[0] : ''} 
                        onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha límite</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? field.value.toISOString().split('T')[0] : ''} 
                        onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <TagInput 
                      value={field.value || []} 
                      onChange={field.onChange} 
                      suggestions={allTags}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear proyecto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
