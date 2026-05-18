"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Minus,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  useEffect(() => setSelectedIndex(0), [props.items]);

  return (
    <div className="bg-surface-elevated border border-border shadow-xl rounded-lg overflow-hidden p-1 min-w-[180px]">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm text-left rounded-md transition-colors",
              index === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground-secondary hover:bg-surface-hover"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded flex items-center justify-center mr-3",
              index === selectedIndex ? "bg-primary text-white" : "bg-surface-elevated text-foreground-tertiary"
            )}>
              {item.icon}
            </div>
            <div>
              <div className="font-bold">{item.title}</div>
              <div className="text-[10px] opacity-70 uppercase tracking-tighter font-bold">{item.subtitle}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-foreground-tertiary">No hay resultados</div>
      )}
    </div>
  );
});

CommandList.displayName = "CommandList";
