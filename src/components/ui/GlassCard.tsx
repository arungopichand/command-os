import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:bg-white/10", className)}
      {...props}
    >
      {children}
    </div>
  );
}
