import { cn } from "@/lib/utils/cn";

interface LogoProps {
  showText?: boolean;
  className?: string;
}

export function Logo({ showText = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-primary-foreground">
        <span className="font-sans font-bold text-lg leading-none">L</span>
      </div>
      {showText && (
        <span className="font-sans font-semibold text-[18px] tracking-tight text-primary">
          LESO
        </span>
      )}
    </div>
  );
}
