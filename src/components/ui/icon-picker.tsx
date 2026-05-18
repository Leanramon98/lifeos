import * as React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";

const POPULAR_ICONS = [
  "Briefcase", "Rocket", "Coffee", "Plane", "Code", "Heart", 
  "Home", "Star", "Sparkles", "BookOpen", "Music", "Camera", 
  "Dumbbell", "Gamepad2", "Palette", "Pencil", "Laptop", "Building", 
  "ShoppingBag", "Lightbulb", "Target", "Award", "Trophy", "Flag", 
  "Map", "Compass", "Smile", "Folder", "FileText"
];

interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  color?: string;
  className?: string;
}

export function IconPicker({ value, onChange, color, className }: IconPickerProps) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filteredIcons = React.useMemo(() => {
    if (!search) return POPULAR_ICONS;
    const lowerSearch = search.toLowerCase();
    return Object.keys(LucideIcons).filter(
      name => name.toLowerCase().includes(lowerSearch) && typeof (LucideIcons as any)[name] === "object"
    ).slice(0, 50); // limit to 50 for perf
  }, [search]);

  const SelectedIcon = value ? (LucideIcons as any)[value] : LucideIcons.HelpCircle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-12 h-12 p-0 flex items-center justify-center", className)}
          style={value && color ? { backgroundColor: `${color}20`, color: color, borderColor: color } : {}}
        >
          <SelectedIcon className="h-6 w-6" strokeWidth={1.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input 
          placeholder="Buscar icono..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8 text-sm"
        />
        <ScrollArea className="h-48">
          <div className="grid grid-cols-5 gap-1 p-1">
            {filteredIcons.map(name => {
              const IconComp = (LucideIcons as any)[name];
              if (!IconComp) return null;
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  onClick={() => {
                    onChange?.(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md hover:bg-surface-elevated transition-colors",
                    isSelected && "bg-surface-elevated"
                  )}
                  style={isSelected && color ? { color } : {}}
                  title={name}
                >
                  <IconComp className="h-5 w-5" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-sm text-foreground-secondary py-4">No se encontraron iconos</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
