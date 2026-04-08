import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel group/card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_12px_60px_rgba(0,0,0,0.45)]",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-90 transition-opacity duration-300 group-hover/card:opacity-100" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
