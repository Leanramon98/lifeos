"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Flag, 
  Tag, 
  Paperclip, 
  MessageSquare, 
  Activity, 
  Plus, 
  Trash2, 
  Download, 
  GripVertical,
  ChevronRight,
  User as UserIcon,
  Send,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTask } from "@/lib/hooks/useTask";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useProjects } from "@/lib/hooks/useProjects";
import { Task, TaskStatus, TaskPriority, Subtask, TaskUpdate } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils/dates";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { cn } from "@/lib/utils";

interface Props {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetail({ task: initialTask, open, onOpenChange }: Props) {
  const taskId = initialTask?.id || "";
  const { 
    task, 
    subtasks, 
    updates, 
    activity, 
    attachments, 
    isLoading,
    updateTask,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    createUpdate,
    deleteUpdate,
    uploadAttachment,
    deleteAttachment
  } = useTask(taskId);

  const { workspaces } = useWorkspaces();
  const { projects } = useProjects();
  
  // Local state for inline edits
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description);
    }
  }, [task]);

  // Debounced save for description
  useEffect(() => {
    if (!task || editDesc === task.description) return;
    
    const timer = setTimeout(async () => {
      setIsSavingDesc(true);
      await updateTask({ description: editDesc });
      setIsSavingDesc(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [editDesc, task, updateTask]);

  if (!initialTask) return null;

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (editTitle.trim() && editTitle !== task?.title) {
      updateTask({ title: editTitle });
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    await createSubtask(newSubtask.trim());
    setNewSubtask("");
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await createUpdate(newComment.trim());
    setNewComment("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAttachment(file);
    }
  };

  const project = projects.find(p => p.id === task?.projectId);
  const workspace = workspaces.find(w => w.id === task?.workspaceId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[680px] p-0 flex flex-col h-full bg-background border-l border-border shadow-2xl">
        {isLoading && !task ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-surface-elevated flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
                <span className="hover:text-foreground cursor-pointer transition-colors">Tareas</span>
                <ChevronRight className="w-3 h-3" />
                <span className="hover:text-foreground cursor-pointer transition-colors">{task?.workspaceName}</span>
                {task?.projectName && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="hover:text-foreground cursor-pointer transition-colors">{task.projectName}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem>Archivar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-danger">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Title Section */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    checked={task?.status === 'done'} 
                    onCheckedChange={() => task?.status === 'done' ? updateTask({ status: 'todo' }) : updateTask({ status: 'done' })}
                    className="w-6 h-6 rounded-full border-foreground-tertiary"
                  />
                  {isEditingTitle ? (
                    <Input 
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                      autoFocus
                      className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    />
                  ) : (
                    <h2 
                      className={cn(
                        "text-2xl font-semibold text-foreground cursor-text hover:bg-surface-hover px-2 py-1 -ml-2 rounded transition-colors",
                        task?.status === 'done' && "line-through text-foreground-tertiary"
                      )}
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {task?.title}
                    </h2>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-surface border border-border cursor-pointer hover:bg-surface-hover">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="capitalize">{task?.status}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-surface border border-border cursor-pointer hover:bg-surface-hover">
                    <Flag className="w-3.5 h-3.5" />
                    <span className="capitalize">{task?.priority}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-surface border border-border cursor-pointer hover:bg-surface-hover">
                    <Calendar className="w-3.5 h-3.5" />
                    {task?.dueDate ? formatRelativeDate(new Date(task.dueDate.seconds * 1000)) : "Sin fecha"}
                  </Badge>
                  {task?.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 border-dashed hover:border-foreground-tertiary transition-colors">
                      <Tag className="w-3.5 h-3.5" />
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-surface border border-dashed border-border cursor-pointer hover:bg-surface-hover">
                    <Plus className="w-3.5 h-3.5" />
                    Añadir
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    Descripción
                    {isSavingDesc && <Loader2 className="w-3 h-3 animate-spin text-foreground-tertiary" />}
                  </h3>
                </div>
                <Textarea 
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Agregá detalles de esta tarea..."
                  className="min-h-[120px] bg-surface-elevated/50 border-none focus-visible:ring-1 focus-visible:ring-border resize-none leading-relaxed text-sm"
                />
              </div>

              {/* Subtasks */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Subtareas {subtasks.length > 0 && `(${subtasks.filter(s => s.isDone).length}/${subtasks.length})`}
                  </h3>
                </div>
                {subtasks.length > 0 && (
                  <Progress value={(subtasks.filter(s => s.isDone).length / subtasks.length) * 100} className="h-1 mb-4" />
                )}
                <div className="space-y-1">
                  {subtasks.map(s => (
                    <div key={s.id} className="group flex items-center gap-3 p-2 hover:bg-surface-hover rounded-md transition-colors">
                      <Checkbox 
                        checked={s.isDone} 
                        onCheckedChange={() => toggleSubtask(s.id)}
                        className="rounded-full"
                      />
                      <span className={cn("text-sm text-foreground flex-1", s.isDone && "line-through text-foreground-tertiary")}>
                        {s.title}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 text-foreground-tertiary hover:text-danger transition-all"
                        onClick={() => deleteSubtask(s.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddSubtask} className="mt-2 pl-9">
                  <Input 
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    placeholder="Añadir subtarea..."
                    className="h-8 text-sm bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-foreground-tertiary"
                  />
                </form>
              </div>

              {/* Attachments */}
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Archivos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {attachments.map(att => (
                    <div key={att.id} className="group flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-foreground-tertiary transition-all">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{att.fileName}</p>
                        <p className="text-[10px] text-foreground-tertiary uppercase">{(att.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
                          <a href={att.downloadUrl} download target="_blank" rel="noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-danger" onClick={() => deleteAttachment(att.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-surface-hover hover:border-foreground-tertiary transition-all">
                    <Plus className="w-5 h-5 text-foreground-tertiary mb-1" />
                    <span className="text-xs text-foreground-tertiary">Subir archivo</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Activity & Comments Tabs */}
              <Tabs defaultValue="comments" className="mt-12">
                <TabsList className="bg-surface-elevated p-1 w-full flex justify-start gap-4 h-auto border-b border-border rounded-none mb-6">
                  <TabsTrigger 
                    value="comments" 
                    className="bg-transparent border-none shadow-none p-0 pb-2 text-foreground-tertiary data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Comentarios
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="bg-transparent border-none shadow-none p-0 pb-2 text-foreground-tertiary data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    <Activity className="w-4 h-4 mr-2" /> Actividad
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="comments" className="mt-0">
                  <div className="space-y-6">
                    {/* Comment Composer */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        TÚ
                      </div>
                      <div className="flex-1 bg-surface-elevated rounded-lg p-3 border border-border focus-within:border-primary transition-colors">
                        <textarea 
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Agregá un update o comentario..."
                          className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none h-20 outline-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button size="sm" disabled={!newComment.trim()} onClick={handleAddComment}>
                            Publicar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6 pt-4">
                      {updates.map(upd => (
                        <div key={upd.id} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-foreground-tertiary/20 flex items-center justify-center text-foreground-secondary text-xs font-bold flex-shrink-0">
                            LE
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground">Lean Ramón</span>
                              <span className="text-[10px] text-foreground-tertiary uppercase">
                                {format(upd.createdAt?.seconds ? upd.createdAt.seconds * 1000 : new Date(), "d MMM p", { locale: es })}
                              </span>
                            </div>
                            <div className="bg-surface p-3 rounded-lg border border-border">
                              <MarkdownContent content={upd.content} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <div className="space-y-6 pl-4 border-l-2 border-border ml-2">
                    {activity.map(act => (
                      <div key={act.id} className="relative flex items-center gap-4">
                        <div className="absolute -left-[1.35rem] w-4 h-4 rounded-full bg-background border-2 border-border flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-foreground-tertiary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground-secondary">
                            <span className="font-medium text-foreground">Usuario</span> {act.type.replace('_', ' ')}
                            {act.meta?.from && ` de ${act.meta.from} a ${act.meta.to}`}
                          </p>
                          <p className="text-[10px] text-foreground-tertiary uppercase">
                            {format(act.createdAt?.seconds ? act.createdAt.seconds * 1000 : new Date(), "d MMM p", { locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
