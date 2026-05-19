"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  MoreVertical, 
  Pin, 
  Archive, 
  Trash2, 
  PanelRightClose, 
  PanelRightOpen,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  Link as LinkIcon,
  Tag,
  Plus,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import TurndownService from "turndown";
import { useNote } from "@/lib/hooks/useNotes";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { extractOutline } from "@/lib/utils/note-outline";
import { extractMentionsFromContent } from "@/lib/utils/note-mentions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { note, isLoading, updateNote } = useNote(resolvedParams.id);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-focus header title if blank
  useEffect(() => {
    if (note && !note.title) {
      // Focus logic could go here
    }
  }, [note]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold mb-4">Nota no encontrada</h2>
        <Button onClick={() => router.push("/notas")}>Volver a notas</Button>
      </div>
    );
  }

  const outline = useMemo(() => note ? extractOutline(note.content) : [], [note?.content]);

  const handleExportMarkdown = () => {
    if (!note) return;
    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    // This is a bit hacky as we don't have the editor HTML here directly easily, 
    // but TipTap can be converted. For now, a simplified version or just download a placeholder.
    const markdown = `# ${note.title}\n\n${note.contentText}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'nota'}.md`;
    a.click();
  };

  // Debounced autosave
  const [debouncedContent, setDebouncedContent] = useState<any>(null);

  useEffect(() => {
    if (!debouncedContent) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      const { content, text, words } = debouncedContent;
      const mentions = extractMentionsFromContent(content);
      
      try {
        await updateNote({ 
          content, 
          contentText: text, 
          wordCount: words,
          readingTime: Math.ceil(words / 200),
          mentions
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Autosave error:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [debouncedContent]);

  const handleContentChange = (content: string, text: string, words: number) => {
    setDebouncedContent({ content, text, words });
  };

  return (
    <div className={cn(
      "flex h-full bg-background transition-all duration-300",
      isFocusMode && "bg-background z-50 fixed inset-0"
    )}>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor Header */}
        <header className={cn(
          "flex-shrink-0 h-14 border-b border-border flex items-center justify-between px-4 transition-opacity duration-300",
          isFocusMode && "opacity-0 hover:opacity-100 border-none bg-background/80 backdrop-blur-sm fixed top-0 w-full z-10"
        )}>
          <div className="flex items-center gap-3">
            {!isFocusMode && (
              <Button variant="ghost" size="icon" onClick={() => router.push("/notas")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
              <Link href="/notas" className="hover:text-foreground">Notas</Link>
              {note.workspaceId && (
                <>
                  <span className="mx-0.5">/</span>
                  <Link href={`/workspaces/${note.workspaceSlug}/notas`} className="hover:text-foreground">{note.workspaceName}</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 mr-4 text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary">
              {isSaving ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-1.5 text-success">
                  <CheckCircle2 className="w-3 h-3" /> Guardado
                </div>
              ) : null}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", note.isPinned && "text-primary")}
              onClick={() => updateNote({ isPinned: !note.isPinned })}
            >
              <Pin className={cn("h-4 w-4", note.isPinned && "fill-primary")} />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFocusMode(!isFocusMode)}>
              {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" /> Compartir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" /> Exportar Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateNote({ isArchived: !note.isArchived })}>
                  <Archive className="w-4 h-4 mr-2" /> {note.isArchived ? "Desarchivar" : "Archivar"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-danger">
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isFocusMode && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-foreground-tertiary ml-2" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <PanelRightClose className="h-5 h-5" /> : <PanelRightOpen className="h-5 h-5" />}
              </Button>
            )}
          </div>
        </header>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
            <input 
              type="text"
              value={note.title}
              onChange={(e) => updateNote({ title: e.target.value })}
              placeholder="Sin título"
              className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none mb-4 placeholder:text-foreground-tertiary"
            />
            
            <div className="flex flex-wrap items-center gap-3 mb-10 text-[11px] text-foreground-tertiary font-bold uppercase tracking-wider">
              <span>{format(note.createdAt?.seconds ? note.createdAt.seconds * 1000 : new Date(), "d 'de' MMMM, yyyy", { locale: es })}</span>
              <span>·</span>
              <span>{note.wordCount} palabras</span>
              <span>·</span>
              <span>{note.readingTime} min de lectura</span>
              
              <div className="flex-1" />
              
              <div className="flex flex-wrap gap-1.5">
                {note.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-surface-elevated text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                <button className="h-5 w-5 rounded-full border border-dashed border-border flex items-center justify-center hover:border-foreground-tertiary transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <NoteEditor 
              content={note.content} 
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar: Outline & Backlinks */}
      {!isFocusMode && isSidebarOpen && (
        <aside className="w-[300px] border-l border-border bg-surface/30 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-10">
            <section>
              <h3 className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest mb-4">Estructura</h3>
              {outline.length > 0 ? (
                <div className="space-y-1">
                  {outline.map((item, i) => (
                    <button 
                      key={i} 
                      className={cn(
                        "block w-full text-left text-xs py-1.5 px-2 rounded hover:bg-surface-elevated transition-colors",
                        item.level === 1 ? "font-bold text-foreground" : 
                        item.level === 2 ? "pl-4 text-foreground-secondary" : 
                        "pl-6 text-foreground-tertiary"
                      )}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-foreground-tertiary italic px-2">
                  No hay encabezados
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest mb-4">Backlinks</h3>
              <div className="text-sm text-foreground-tertiary italic">
                (Backlinks en desarrollo...)
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest mb-4">Relaciones</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-foreground-tertiary">Workspace</label>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-[11px]">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: note.workspaceColor || '#ccc' }} />
                    {note.workspaceName || "Sin vincular"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-foreground-tertiary">Proyecto</label>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-[11px]" disabled={!note.workspaceId}>
                    {note.projectName || "Sin vincular"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
          
          <div className="p-4 border-t border-border bg-surface/50 text-[10px] text-foreground-tertiary space-y-1 uppercase font-bold tracking-tight">
            <p>Creada: {format(note.createdAt?.seconds ? note.createdAt.seconds * 1000 : new Date(), "d MMM yyyy", { locale: es })}</p>
            <p>Actualizada: {format(note.updatedAt?.seconds ? note.updatedAt.seconds * 1000 : new Date(), "d MMM yyyy", { locale: es })}</p>
          </div>
        </aside>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return [];
}
