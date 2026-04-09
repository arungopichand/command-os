import {
  Cloud,
  Eye,
  EyeOff,
  Layout,
  Settings,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useWidgetStore } from '../../store/useWidgetStore';
import { cn } from '../../utils/cn';
import { exportData } from '../../utils/exportData';

export function OSControl() {
  const { tabs, toggleWidget } = useWidgetStore();
  const commandTab = tabs.command;
  const commandWidgets = commandTab?.widgets ?? [];
  const totalWidgets = commandWidgets.length;
  const visibleWidgets = commandWidgets.filter((widget) => widget.visible).length;
  const hiddenWidgets = totalWidgets - visibleWidgets;

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHeader
        eyebrow="OS Control"
        title="Tune the Command Center without turning the app into widgets"
        description="Primary workflows now live as full pages. This control surface is only for shaping the home Command Center summary, so keep it lean and high-signal."
        meta={(
          <>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Full-page modules
            </div>
            <div className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Command Center layout
            </div>
          </>
        )}
        actions={(
          <button type="button" className="soft-action" onClick={exportData}>
            <Cloud size={14} />
            Export Snapshot
          </button>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Command Widgets"
          value={totalWidgets}
          description="Summary panels available on the home Command Center."
          icon={Settings}
          tone="brand"
        />
        <MetricCard
          label="Visible Widgets"
          value={visibleWidgets}
          description="Panels currently shown on the home surface."
          icon={Eye}
          tone="success"
        />
        <MetricCard
          label="Hidden Widgets"
          value={hiddenWidgets}
          description="Useful when the Command Center starts feeling crowded."
          icon={EyeOff}
          tone={hiddenWidgets > 0 ? 'warning' : 'neutral'}
        />
        <MetricCard
          label="Persistence"
          value="Live"
          description="Widget preferences stay stored between sessions."
          icon={Cloud}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <GlassCard className="p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Command Center Layout</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Control the home summary directly</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                Hide anything decorative, repetitive, or low-value. The app should feel page-first, with the Command Center acting as a compact mission overview.
              </p>
            </div>
            <Layout size={18} className="text-[var(--shell-brand)]" />
          </div>

          <div className="mt-7 space-y-6">
            {commandTab ? (
              <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-5">
                <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">{commandTab.label}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {visibleWidgets}/{totalWidgets} widgets visible
                    </p>
                  </div>
                  <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    home
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {commandWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      type="button"
                      onClick={() => toggleWidget('command', widget.id)}
                      className={cn(
                        'flex items-center justify-between rounded-[22px] border px-4 py-4 text-left transition-all',
                        widget.visible
                          ? 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] text-white'
                          : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('rounded-2xl border p-2.5', widget.visible ? 'border-[rgba(240,90,61,0.18)] bg-white/[0.04] text-[var(--shell-brand)]' : 'border-white/8 bg-white/[0.03] text-slate-500')}>
                          {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{widget.label}</p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{widget.size}</p>
                        </div>
                      </div>
                      {widget.visible ? <ToggleRight size={22} className="text-[var(--shell-brand)]" /> : <ToggleLeft size={22} className="text-slate-500" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-relaxed text-slate-400">
                Command Center layout data is unavailable right now.
              </div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Guidance</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">What a stronger v1 looks like</h2>
              </div>
              <ShieldCheck size={18} className="text-[var(--shell-brand)]" />
            </div>

            <div className="mt-6 space-y-4">
              {[
                'Keep the Command Center centered on habits, focus, goals, daily review, and alerts.',
                'Let the real work happen in full pages, not inside oversized cards.',
                'Use the home widgets only for orientation, quick status, and short actions.',
                'Prefer fewer panels with stronger signal over a crowded summary grid.',
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="section-eyebrow">Sync State</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Layout memory is local-first</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Command Center visibility, labels, and sizes are stored in the browser so the summary surface feels consistent each time you return.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Realtime sync</span>
                <span className="text-sm font-semibold text-emerald-300">Ready</span>
              </div>
              <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Layout memory</span>
                <span className="text-sm font-semibold text-white">Persisted</span>
              </div>
              <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Next priority</span>
                <span className="text-sm font-semibold text-white">Page polish</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
