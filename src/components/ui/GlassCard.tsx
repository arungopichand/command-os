import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to gracefully merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:bg-white/10", className)}>
      {children}
    </div>
  );
}
