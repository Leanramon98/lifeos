"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "./input";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
}

export function TagInput({ value = [], onChange, placeholder = "Añadir etiqueta...", className, suggestions = [] }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-foreground-secondary hover:text-foreground rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={value.length === 0 ? placeholder : "Añadir más..."}
        className="w-full"
      />
      {suggestions.length > 0 && inputValue && (
        <div className="flex flex-wrap gap-1 mt-1">
          {suggestions
            .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s))
            .map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="text-xs px-2 py-1 bg-surface-hover rounded-md hover:bg-surface-elevated text-foreground-secondary"
              >
                {s}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}
