"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, SlidersHorizontal, Pin, X } from "lucide-react";
import Fuse from "fuse.js";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/lib/hooks/useNotes";
import { NoteCard } from "@/components/notes/NoteCard";
import { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NotasPage() {
  const { notes, pinnedNotes, isLoading, deleteNote, togglePinNote, archiveNote } = useNotes();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fuse.js search
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

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-8 pt-6 pb-4">
        <PageHeader 
          title="Notas" 
          description={`${notes.length + pinnedNotes.length} notas en total`}
          actions={
            <Link href="/notas/nueva">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva nota</Button>
            </Link>
          }
        />

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-tertiary" />
              <Input 
                placeholder="Buscar en tus notas..." 
                className="pl-9 h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-surface border border-border rounded-md p-1">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Filter className="w-3.5 h-3.5 mr-2" /> Workspace
            </Button>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2" /> Etiquetas
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-surface-elevated animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {filteredNotes.pinned.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-foreground-tertiary">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Fijadas</span>
                </div>
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {filteredNotes.pinned.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onTogglePin={togglePinNote} 
                      onArchive={archiveNote} 
                      onDelete={deleteNote} 
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              {filteredNotes.pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-foreground-tertiary">
                  <span className="text-xs font-bold uppercase tracking-widest">Todas las notas</span>
                </div>
              )}
              {filteredNotes.others.length > 0 ? (
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {filteredNotes.others.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onTogglePin={togglePinNote} 
                      onArchive={archiveNote} 
                      onDelete={deleteNote} 
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
                  {searchQuery ? (
                    <>
                      <p className="text-foreground-tertiary mb-2">No se encontraron notas para "{searchQuery}"</p>
                      <Button variant="ghost" onClick={() => setSearchQuery("")}>Limpiar búsqueda</Button>
                    </>
                  ) : (
                    <>
                      <p className="text-foreground-tertiary mb-4">Aún no tenés notas creadas</p>
                      <Link href="/notas/nueva">
                        <Button variant="outline">Crear mi primera nota</Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
