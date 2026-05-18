"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-surface-elevated border border-border",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
