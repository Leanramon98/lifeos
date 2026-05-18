"use client";

import React from "react";
import Link from "next/link";
import { Pin, Archive, Trash2, MoreVertical, Clock, Tag } from "lucide-react";
import { Note } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface Props {
  note: Note;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onTogglePin, onArchive, onDelete }: Props) {
  const updatedAt = note.updatedAt?.seconds 
    ? new Date(note.updatedAt.seconds * 1000) 
    : note.updatedAt instanceof Date ? note.updatedAt : new Date();

  return (
    <div className="group bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-foreground-tertiary transition-all flex flex-col h-full relative">
      <div className="flex items-start justify-between mb-3">
        {note.workspaceId ? (
          <Badge variant="secondary" className="bg-surface-elevated border border-border text-[10px] font-bold uppercase tracking-tight py-0 px-1.5 h-5">
            <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: note.workspaceColor || '#ccc' }} />
            {note.workspaceName}
          </Badge>
        ) : (
          <div />
        )}
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7", note.isPinned && "text-primary opacity-100")} 
            onClick={(e) => { e.preventDefault(); onTogglePin(note.id); }}
          >
            <Pin className={cn("h-3.5 w-3.5", note.isPinned && "fill-primary")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.preventDefault()}>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onArchive(note.id)}>
                <Archive className="w-4 h-4 mr-2" /> {note.isArchived ? "Desarchivar" : "Archivar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger" onClick={() => onDelete(note.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Link href={`/notas/${note.id}`} className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {note.title || "Sin título"}
        </h3>
        <p className="text-sm text-foreground-secondary line-clamp-3 leading-relaxed mb-4">
          {note.contentText || "Sin contenido..."}
        </p>
      </Link>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] text-foreground-tertiary font-bold uppercase tracking-tight">#{tag}</span>
          ))}
          {note.tags?.length > 2 && (
            <span className="text-[10px] text-foreground-tertiary font-bold">+{note.tags.length - 2}</span>
          )}
        </div>
        <span className="text-[10px] text-foreground-tertiary font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(updatedAt, { addSuffix: true, locale: es })}
        </span>
      </div>
    </div>
  );
}
