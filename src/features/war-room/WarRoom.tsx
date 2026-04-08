import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Bolt,
  BookMarked,
  CheckCircle2,
  Dumbbell,
  Layers,
  PencilLine,
  Shield,
  ShieldCheck,
  Target,
  Timer,
  Wallet,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { useCommandCenterMetrics } from './useCommandCenterMetrics';

interface StrategicSector {
  id: keyof ReturnType<typeof useCommandCenterMetrics>['sectors'];
  path: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const STATUS_STYLES = {
  ready: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    chip: 'border-emerald-500/18 bg-emerald-500/10',
  },
  empty: {
    dot: 'bg-slate-500',
    text: 'text-slate-300',
    chip: 'border-white/10 bg-white/[0.04]',
  },
  loading: {
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    chip: 'border-amber-500/18 bg-amber-500/10',
  },
  error: {
    dot: 'bg-[var(--shell-brand)]',
    text: 'text-[color:var(--shell-brand)]',
    chip: 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)]',
  },
} as const;

const STRATEGIC_SECTORS: StrategicSector[] = [
  {
    id: 'habits',
    path: '/habits',
    label: 'Habits',
    icon: ShieldCheck,
    description: 'Daily consistency, streaks, and checklist execution.',
  },
  {
    id: 'focus',
    path: '/focus',
    label: 'Focus',
    icon: Bolt,
    description: 'Deep work timer, focus mode, and distraction capture.',
  },
  {
    id: 'goals',
    path: '/goals',
    label: 'Goals',
    icon: Target,
    description: 'Tracked progress and clear next-step planning.',
  },
  {
    id: 'journal',
    path: '/journal',
    label: 'Daily Review',
    icon: PencilLine,
    description: 'Review today, capture lessons, and keep the record honest.',
  },
  {
    id: 'notifications',
    path: '/notifications',
    label: 'Alerts',
    icon: Bell,
    description: 'Reminder delivery, browser permission, and schedules.',
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Dashboard Control',
    icon: Layers,
    description: 'Widget visibility, layout reset, and shell management.',
  },
  {
    id: 'market',
    path: '/market',
    label: 'Market',
    icon: Wallet,
    description: 'Secondary intelligence module with local market snapshots.',
  },
  {
    id: 'physical',
    path: '/physical',
    label: 'Physical',
    icon: Dumbbell,
    description: 'Secondary readiness module for workouts and protocol.',
  },
  {
    id: 'english',
    path: '/english',
    label: 'Language',
    icon: Timer,
    description: 'Secondary module for vocabulary and practice flow.',
  },
];

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function CommandBriefWidget() {
  const navigate = useNavigate();
  const { summary, sectors } = useCommandCenterMetrics();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="section-eyebrow">Command Snapshot</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Run Today Cleanly</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{summary.missionLabel}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 sm:max-w-xs">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Uplink</p>
          <p className="mt-2 text-xl font-semibold text-white">{summary.uplinkStatus}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{summary.uplinkDetail}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {['habits', 'focus', 'goals', 'notifications'].map((sectorId) => {
          const sector = STRATEGIC_SECTORS.find((item) => item.id === sectorId)!;
          const metric = sectors[sector.id];

          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => navigate(sector.path)}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 text-left transition-all hover:border-white/14 hover:bg-white/[0.05]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-[var(--shell-brand)]">
                    <sector.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{sector.label}</p>
                    <p className={cn('mt-1 text-[11px] font-semibold uppercase tracking-[0.18em]', STATUS_STYLES[metric.status].text)}>
                      {metric.label}
                    </p>
                  </div>
                </div>
              </div>

              <ArrowRight size={16} className="mt-1 shrink-0 text-slate-600 transition-colors group-hover:text-slate-200" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WarRoom() {
  const navigate = useNavigate();
  const { totalXP } = useAppStore();
  const { sectors, summary } = useCommandCenterMetrics();

  const footerMessage = summary.errorCount > 0
    ? `${pluralize(summary.errorCount, 'surface')} still needs work before the dashboard feels fully trustworthy.`
    : summary.loadingCount > 0
      ? `${pluralize(summary.loadingCount, 'surface')} are syncing right now.`
      : summary.readyCount > 0
        ? `Core workflows are reporting across ${pluralize(summary.readyCount, 'surface')}.`
        : 'Start with goals, habits, focus, daily review, or alerts.';

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHeader
        eyebrow="Command Center"
        title="The daily loop in one disciplined surface"
        description="COMMAND.OS should help you plan, execute, track, review, and return to the plan without visual noise or fake confidence. This page is the operating summary for that loop."
        meta={
          <>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {summary.missionLabel}
            </div>
            <div className="rounded-full border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shell-brand)]">
              {summary.uplinkStatus}
            </div>
          </>
        }
        actions={
          <>
            <button type="button" className="primary-action" onClick={() => navigate('/focus')}>
              <Bolt size={14} />
              Start Focus
            </button>
            <button type="button" className="soft-action" onClick={() => navigate('/goals')}>
              <Target size={14} />
              Review Goals
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total XP"
          value={totalXP}
          description="Accumulated system experience from tracked activity."
          icon={Shield}
          tone="brand"
          trend={{ value: `${summary.readyCount} surfaces live`, direction: summary.readyCount > 0 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Ready Surfaces"
          value={summary.readyCount}
          description={`${pluralize(summary.readyCount, 'surface')} currently report live state.`}
          icon={CheckCircle2}
          tone="success"
          trend={{ value: summary.readyCount === STRATEGIC_SECTORS.length ? 'Full coverage' : 'Growing coverage', direction: summary.readyCount > 0 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Needs Attention"
          value={summary.errorCount}
          description={summary.errorCount > 0 ? 'These sections have errors or missing trust signals.' : 'No current dashboard blockers reported.'}
          icon={AlertCircle}
          tone={summary.errorCount > 0 ? 'brand' : 'neutral'}
          trend={{ value: summary.errorCount > 0 ? 'Review blockers' : 'Clear', direction: summary.errorCount > 0 ? 'down' : 'up' }}
        />
        <MetricCard
          label="Syncing"
          value={summary.loadingCount}
          description={summary.loadingCount > 0 ? 'Data is still resolving in some workflows.' : 'No active sync delay right now.'}
          icon={Activity}
          tone={summary.loadingCount > 0 ? 'warning' : 'neutral'}
          trend={{ value: summary.loadingCount > 0 ? 'In progress' : 'Stable', direction: summary.loadingCount > 0 ? 'neutral' : 'up' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <GlassCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Core Loop</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">What needs your attention today</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                Move through the essentials in order. The goal is less visual drama and more reliable execution.
              </p>
            </div>
            <BookMarked size={18} className="text-[var(--shell-brand)]" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: 'Plan the day', path: '/goals', sectorId: 'goals' as const },
              { label: 'Execute focused work', path: '/focus', sectorId: 'focus' as const },
              { label: 'Track habits', path: '/habits', sectorId: 'habits' as const },
              { label: 'Review the day', path: '/journal', sectorId: 'journal' as const },
            ].map((item) => {
              const metric = sectors[item.sectorId];
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 text-left transition-all hover:border-white/14 hover:bg-white/[0.05]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className={cn('mt-2 text-[11px] font-semibold uppercase tracking-[0.18em]', STATUS_STYLES[metric.status].text)}>
                      {metric.label}
                    </p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-slate-600 transition-colors group-hover:text-slate-200" />
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Quick Actions</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">Move the day forward</h2>
            </div>
            <Shield size={18} className="text-[var(--shell-brand)]" />
          </div>

          <div className="mt-6 space-y-3">
            {[
              { label: 'Open Deep Work', detail: 'Start or resume a focus sprint.', path: '/focus' },
              { label: 'Update Goals', detail: 'Adjust progress and status.', path: '/goals' },
              { label: 'Write Daily Review', detail: 'Capture what happened today.', path: '/journal' },
              { label: 'Check Alerts', detail: 'Make sure reminders are useful.', path: '/notifications' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 text-left transition-all hover:border-white/14 hover:bg-white/[0.05]"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{action.detail}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-600 transition-colors group-hover:text-slate-200" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STRATEGIC_SECTORS.map((sector, index) => {
          const metric = sectors[sector.id];
          const statusStyle = STATUS_STYLES[metric.status];

          return (
            <motion.button
              key={sector.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(sector.path)}
              className="group rounded-[28px] border border-white/8 bg-white/[0.025] p-5 text-left transition-all hover:border-white/14 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-[var(--shell-brand)]">
                  <sector.icon size={18} />
                </div>
                <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]', statusStyle.chip, statusStyle.text)}>
                  <div className={cn('h-2 w-2 rounded-full', statusStyle.dot)} />
                  {metric.status}
                </div>
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">{sector.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{sector.description}</p>
              <p className={cn('mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]', statusStyle.text)}>{metric.label}</p>

              <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors group-hover:text-slate-200">
                Open surface
                <ArrowRight size={14} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <GlassCard className="p-6 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-slate-300">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="section-eyebrow">Command Note</p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{footerMessage}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {pluralize(summary.readyCount, 'surface')} live
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {pluralize(summary.emptyCount, 'surface')} waiting setup
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
