"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Pin } from "lucide-react";
import Fuse from "fuse.js";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/lib/hooks/useNotes";
import { useProject } from "@/lib/hooks/useProject";
import { NoteCard } from "@/components/notes/NoteCard";
import { cn } from "@/lib/utils";

export default function ProjectNotasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { project } = useProject(resolvedParams.id);
  const { notes, pinnedNotes, isLoading, deleteNote, togglePinNote, archiveNote } = useNotes({ projectId: resolvedParams.id });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  
  const fuse = useMemo(() => {
    return new Fuse([...pinnedNotes, ...notes], {
      keys: ['title', 'contentText'],
      threshold: 0.3,
    });
  }, [notes, pinnedNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return { pinned: pinnedNotes, others: notes };
    const results = fuse.search(searchQuery).map(r => r.item);
    return {
      pinned: results.filter(n => n.isPinned),
      others: results.filter(n => !n.isPinned)
    };
  }, [searchQuery, fuse, pinnedNotes, notes]);

  if (!project) return null;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground">
          Notas del proyecto <span className="text-foreground-tertiary ml-2 font-normal">{notes.length + pinnedNotes.length} documentos</span>
        </h3>
        <Link href={`/notas/nueva?projectId=${project.id}&workspaceId=${project.workspaceId}`}>
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Nueva nota</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-tertiary" />
            <Input 
              placeholder="Buscar en este proyecto..." 
              className="pl-9 h-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-surface border border-border rounded-md p-1">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-7 w-8 p-0" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-7 w-8 p-0" onClick={() => setViewMode('list')}><ListIcon className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface-elevated animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {filteredNotes.pinned.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-foreground-tertiary">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Fijadas</span>
                </div>
                <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                  {filteredNotes.pinned.map(note => <NoteCard key={note.id} note={note} onTogglePin={togglePinNote} onArchive={archiveNote} onDelete={deleteNote} />)}
                </div>
              </section>
            )}

            <section>
              <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                {filteredNotes.others.map(note => <NoteCard key={note.id} note={note} onTogglePin={togglePinNote} onArchive={archiveNote} onDelete={deleteNote} />)}
              </div>
              {filteredNotes.others.length === 0 && filteredNotes.pinned.length === 0 && (
                <div className="h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
                  <p className="text-foreground-tertiary">No hay notas en este proyecto</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
