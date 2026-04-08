import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit3, EyeOff, GripVertical, Settings2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useWidgetStore, type WidgetSize } from '../../store/useWidgetStore';
import { cn } from '../../utils/cn';

interface WidgetContainerProps {
  tabId: string;
  widgetId: string;
  type: string;
  label: string;
  size: WidgetSize;
  children: React.ReactNode;
  isDraggable?: boolean;
}

const SIZE_LABELS: Record<WidgetSize, string> = {
  sm: 'Compact',
  md: 'Wide',
  lg: 'Wide',
  full: 'Full',
};

export function WidgetContainer({
  tabId,
  widgetId,
  type,
  label,
  size,
  children,
  isDraggable = true,
}: WidgetContainerProps) {
  const { toggleWidget, updateWidgetSize, renameWidget } = useWidgetStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabel, setNewLabel] = useState(label);

  const handleRename = (event: React.FormEvent) => {
    event.preventDefault();
    const nextLabel = newLabel.trim() || label;
    renameWidget(tabId, widgetId, nextLabel);
    setNewLabel(nextLabel);
    setIsEditingLabel(false);
  };

  const sizeClasses = {
    sm: 'col-span-1',
    md: 'col-span-1 md:col-span-2 xl:col-span-2',
    lg: 'col-span-1 md:col-span-2 xl:col-span-2',
    full: 'col-span-1 md:col-span-2 xl:col-span-4',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={cn('group/widget relative min-w-0', sizeClasses[size])}
    >
      <GlassCard className="flex h-full min-w-0 flex-col overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {isDraggable ? (
              <button
                type="button"
                className="mt-0.5 hidden cursor-grab rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/50 transition-all duration-200 hover:scale-[1.02] hover:text-white active:scale-[0.98] active:cursor-grabbing md:inline-flex"
              >
                <GripVertical size={14} />
              </button>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isEditingLabel ? (
                  <form onSubmit={handleRename} className="w-full max-w-xs">
                    <input
                      autoFocus
                      value={newLabel}
                      onChange={(event) => setNewLabel(event.target.value)}
                      onBlur={handleRename}
                      className="input-surface py-2 text-sm"
                    />
                  </form>
                ) : (
                  <>
                    <h3 className="truncate text-lg font-semibold tracking-tight text-white">{label}</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingLabel(true)}
                      className="inline-flex items-center justify-center rounded-full border border-transparent p-1 text-white/50 transition-all duration-200 hover:scale-[1.02] hover:border-white/8 hover:bg-white/[0.04] hover:text-white active:scale-[0.98]"
                    >
                      <Edit3 size={12} />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  {type.replace(/_/g, ' ')}
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  {SIZE_LABELS[size]}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:inline">
              View all
            </span>
            <button
              type="button"
              onClick={() => setShowSettings((value) => !value)}
              className="inline-flex items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] p-2.5 text-white/50 transition-all duration-200 hover:scale-[1.02] hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              <Settings2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => toggleWidget(tabId, widgetId)}
              className="inline-flex items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] p-2.5 text-white/50 transition-all duration-200 hover:scale-[1.02] hover:border-[rgba(240,90,61,0.18)] hover:bg-[rgba(240,90,61,0.1)] hover:text-white active:scale-[0.98]"
            >
              <EyeOff size={14} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden p-4 sm:p-6">
          {children}
        </div>

        <AnimatePresence>
          {showSettings ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-20 flex flex-col justify-center bg-[rgba(5,9,14,0.92)] p-6 backdrop-blur-2xl sm:p-8"
            >
              <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/8 bg-[rgba(12,18,26,0.92)] p-6 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
                <p className="section-eyebrow">Widget Size</p>
                <h4 className="mt-3 text-xl font-semibold tracking-tight text-white">Choose the right footprint</h4>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  Make this card compact or give it more room depending on how often you need it on the dashboard.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {(['sm', 'md', 'lg', 'full'] as WidgetSize[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateWidgetSize(tabId, widgetId, option);
                        setShowSettings(false);
                      }}
                      className={cn(
                        'rounded-[20px] border px-4 py-4 text-left transition-all',
                        size === option
                          ? 'border-[rgba(240,90,61,0.2)] bg-[rgba(240,90,61,0.12)] text-white shadow-[0_16px_28px_rgba(240,90,61,0.12)]'
                          : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]',
                      )}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{option}</p>
                      <p className="mt-2 text-sm font-semibold">{SIZE_LABELS[option]}</p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="soft-action mt-6 w-full justify-center"
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}
