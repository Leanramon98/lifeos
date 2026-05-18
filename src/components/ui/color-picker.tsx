import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PREDEFINED_COLORS = [
  "#6E8DA8", // azul
  "#7A9B6E", // verde
  "#A0795B", // marrón
  "#C9A861", // dorado
  "#D4A574", // ámbar
  "#C97B5D", // terracotta
  "#8A7BA8", // violeta
  "#D4859C", // rosa
];

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const isCustom = value && !PREDEFINED_COLORS.includes(value);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {PREDEFINED_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange?.(color)}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all",
            value === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-110"
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="h-4 w-4 text-white" />}
        </button>
      ))}
      <div className="relative flex items-center justify-center h-8 w-8 rounded-full border border-dashed border-border overflow-hidden">
        <input
          type="color"
          value={isCustom ? value : "#000000"}
          onChange={(e) => onChange?.(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
        />
        {isCustom ? (
          <div className="h-full w-full" style={{ backgroundColor: value }} />
        ) : (
          <span className="text-xl leading-none text-foreground-tertiary mb-1">+</span>
        )}
      </div>
    </div>
  );
}
