import { cn } from '@/lib/utils/cn';
import { forwardRef, HTMLAttributes } from 'react';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string; // hex del workspace
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'xs' | 'sm';
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, color, variant = 'soft', size = 'sm', style, ...props }, ref) => {
    const sizeClasses = size === 'xs' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

    const customStyle = color
      ? variant === 'soft'
        ? { backgroundColor: `${color}20`, color: color, ...style }
        : variant === 'solid'
        ? { backgroundColor: color, color: '#fff', ...style }
        : { borderColor: color, color: color, ...style }
      : style;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-chip font-medium',
          sizeClasses,
          !color && variant === 'soft' && 'bg-secondary text-foreground',
          variant === 'outline' && !color && 'border bg-transparent',
          className
        )}
        style={customStyle}
        {...props}
      />
    );
  }
);
Chip.displayName = 'Chip';
