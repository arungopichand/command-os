import { Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LayoutGrid, RefreshCcw, Settings2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { WidgetContainer } from '../components/ui/WidgetContainer';
import { WIDGET_REGISTRY } from '../config/widgetRegistry';
import { useWidgetStore } from '../store/useWidgetStore';

interface DashboardLayoutProps {
  tabId: string;
}

const TAB_DESCRIPTIONS: Record<string, string> = {
  command: 'The compact summary surface for the full daily loop.',
  market: 'Secondary market context with charts, watchlist, and risk snapshots.',
  physical: 'Secondary readiness surface for workouts and movement.',
  english: 'Vocabulary and practice cards for daily language reps.',
  habits: 'Full habit workflow with completion, streaks, and summaries.',
  focus: 'Deep work control surface with session state and distraction capture.',
  goals: 'Goal tracking, progress updates, and next-step planning.',
  journal: 'Daily review, notes, and exported reflections.',
};

export function DashboardLayout({ tabId }: DashboardLayoutProps) {
  const { tabs, resetTab } = useWidgetStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const tab = tabs[tabId];

  if (!tab) {
    return (
      <GlassCard className="flex min-h-[22rem] flex-col items-center justify-center p-12 text-center">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <LayoutGrid size={28} className="text-slate-500" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-[-0.05em] text-white">Surface unavailable</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          This dashboard tab is missing from the current configuration. Reset the stored layout or verify the tab registry.
        </p>
      </GlassCard>
    );
  }

  const visibleWidgets = (isEditMode ? tab.widgets : tab.widgets.filter((widget) => widget.visible))
    .slice()
    .sort((a, b) => a.order - b.order);
  const activeWidgetCount = tab.widgets.filter((widget) => widget.visible).length;
  const hiddenWidgetCount = tab.widgets.length - activeWidgetCount;
  const isSingleSurface = tab.widgets.length === 1 && tab.widgets[0]?.size === 'full';

  return (
    <div className="space-y-6 md:space-y-8">
      <GlassCard className="p-6 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="section-eyebrow">Dashboard Surface</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{tab.label}</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {TAB_DESCRIPTIONS[tabId] ?? 'A configurable surface for the current workflow.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {activeWidgetCount}/{tab.widgets.length} visible
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {hiddenWidgetCount} hidden
              </div>
              <div className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${isEditMode ? 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] text-[color:var(--shell-brand)]' : 'border-white/8 bg-white/[0.03] text-slate-300'}`}>
                {isEditMode ? 'Layout edit mode' : isSingleSurface ? 'Full surface' : 'Multi-widget grid'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <button
              type="button"
              onClick={() => setIsEditMode((value) => !value)}
              className={isEditMode ? 'primary-action' : 'soft-action'}
            >
              {isEditMode ? <Eye size={14} /> : <Settings2 size={14} />}
              {isEditMode ? 'Done Editing' : 'Customize Layout'}
            </button>
            <button
              type="button"
              onClick={() => resetTab(tabId)}
              className="soft-action"
            >
              <RefreshCcw size={14} />
              Reset Layout
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <AnimatePresence>
          {visibleWidgets.map((widget) => {
            const WidgetComponent = WIDGET_REGISTRY[widget.type];

            return (
              <WidgetContainer
                key={widget.id}
                tabId={tabId}
                widgetId={widget.id}
                type={widget.type}
                label={widget.label}
                size={widget.size}
              >
                {!widget.visible && isEditMode ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-[rgba(5,9,14,0.88)] p-6 text-center backdrop-blur-xl">
                    <div className="rounded-full border border-white/8 bg-white/[0.03] p-3">
                      <EyeOff size={18} className="text-slate-500" />
                    </div>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Hidden in normal view</p>
                  </div>
                ) : null}

                <Suspense
                  fallback={(
                    <div className="flex h-48 items-center justify-center">
                      <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/10 border-t-[var(--shell-brand)]" />
                    </div>
                  )}
                >
                  {WidgetComponent ? (
                    <WidgetComponent />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm text-slate-400">
                      This widget is not connected to a component yet.
                    </div>
                  )}
                </Suspense>
              </WidgetContainer>
            );
          })}
        </AnimatePresence>

        {visibleWidgets.length === 0 && !isEditMode ? (
          <div className="col-span-full">
            <GlassCard className="flex min-h-[18rem] flex-col items-center justify-center p-10 text-center">
              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                <EyeOff size={26} className="text-slate-500" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white">No widgets are visible</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                Open layout customization and turn on the surfaces you want on this page.
              </p>
            </GlassCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}
