import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { IconPicker } from "@/components/ui/icon-picker";
import { Workspace, AreaSlug } from "@/lib/types";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useAreas } from "@/lib/hooks/useAreas";

const formSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  areaSlug: z.string().min(1, "Selecciona un área"),
  color: z.string().min(1, "Selecciona un color"),
  icon: z.string().min(1, "Selecciona un icono"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: Workspace;
  defaultAreaSlug?: AreaSlug;
}

export function WorkspaceFormDialog({ open, onOpenChange, workspace, defaultAreaSlug }: Props) {
  const { createWorkspace, updateWorkspace } = useWorkspaces();
  const { areas } = useAreas();
  const isEdit = !!workspace;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workspace?.name || "",
      areaSlug: workspace?.areaSlug || defaultAreaSlug || "",
      color: workspace?.color || "#6E8DA8",
      icon: workspace?.icon || "Briefcase",
      description: workspace?.description || "",
    },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: workspace?.name || "",
        areaSlug: workspace?.areaSlug || defaultAreaSlug || "",
        color: workspace?.color || "#6E8DA8",
        icon: workspace?.icon || "Briefcase",
        description: workspace?.description || "",
      });
    }
  }, [open, workspace, defaultAreaSlug, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEdit && workspace) {
        await updateWorkspace({ id: workspace.id, data: values });
      } else {
        await createWorkspace(values as any);
      }
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar workspace" : "Nuevo workspace"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="flex gap-4 items-start">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="flex-shrink-0 pt-6">
                    <FormControl>
                      <IconPicker value={field.value} onChange={field.onChange} color={form.watch("color")} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. QuintoAndar" {...field} />
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
                  <FormLabel>Área</FormLabel>
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
                  <FormLabel>Color</FormLabel>
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
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Breve descripción del propósito de este workspace..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear workspace"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
