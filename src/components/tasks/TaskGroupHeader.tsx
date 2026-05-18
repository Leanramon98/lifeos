import React from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  count: number;
  icon?: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  onAddClick?: () => void;
  color?: string;
}

export function TaskGroupHeader({ title, count, icon, isCollapsed, onToggle, onAddClick, color }: Props) {
  return (
    <div className="flex items-center group h-10 px-2 mt-4 first:mt-0 select-none">
      <button 
        onClick={onToggle}
        className="p-1 hover:bg-surface-elevated rounded transition-colors text-foreground-tertiary mr-1"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <div className="flex items-center gap-2 flex-1 overflow-hidden" onClick={onToggle} style={{ cursor: 'pointer' }}>
        {icon}
        {color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
        <span className="text-sm font-semibold text-foreground truncate">{title}</span>
        <span className="text-xs text-foreground-tertiary font-medium">{count}</span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onAddClick?.(); }}
        className="p-1 hover:bg-surface-elevated rounded transition-colors text-foreground-tertiary opacity-0 group-hover:opacity-100"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
