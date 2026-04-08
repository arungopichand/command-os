import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Orbit,
  Shield,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { useAppStore } from '../../store/useAppStore';
import { useWidgetStore } from '../../store/useWidgetStore';
import { cn } from '../../utils/cn';
import { useFocus } from '../focus/useFocus';
import { formatRemainingTime } from '../focus/focusUtils';
import { useHabits } from '../habits/useHabits';

const STORAGE_KEYS = {
  checklist: 'command-os-checklist',
};

const DAILY_CHECKLIST = [
  { id: 'review_mission', label: 'Review mission objectives' },
  { id: 'plan_focus', label: 'Plan a focus sprint' },
  { id: 'hydrate', label: 'Drink water' },
  { id: 'stretch', label: 'Quick mobility reset' },
];

function readStoredState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }

    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function formatCurrency(value: number) {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(0)}`;
}

export function StatsWidget() {
  const { totalXP } = useAppStore();
  const { summary, isLoading, error } = useHabits();
  const focus = useFocus();
  const coherence = Math.min(
    100,
    Math.round(totalXP / 10)
      + summary.completionPercent
      + Math.min(40, focus.summary.todayFocusMinutes)
      + (focus.isFocusModeEnabled ? 10 : 0),
  );
  const focusProgress = focus.currentSession
    ? focus.summary.currentSessionProgressPercent
    : Math.min(100, focus.summary.todayFocusMinutes);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label="Operational Grade"
          value={`${coherence}%`}
          description={
            focus.currentSession
              ? `${formatRemainingTime(focus.remainingSeconds)} remaining in the live sprint`
              : focus.error
                ? 'Focus workflow currently unavailable'
                : `Built from XP, habits, focus minutes, and focus mode state`
          }
          icon={Orbit}
          tone="brand"
          trend={{ value: `${focus.summary.todayFocusMinutes}m focused`, direction: coherence >= 70 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Habits Today"
          value={isLoading ? '--' : `${summary.completedToday}/${summary.totalHabits || 0}`}
          description={
            error
              ? 'Habit data unavailable'
              : summary.totalHabits === 0
                ? 'No habits created yet'
                : `${summary.completionPercent}% completion for the current day`
          }
          icon={Sparkles}
          tone="success"
          trend={{ value: `${summary.longestCurrentStreak} day streak`, direction: summary.longestCurrentStreak > 0 ? 'up' : 'neutral' }}
        />
      </div>

      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Focus Workflow</p>
            <p className="metric-value mt-3 text-2xl">
              {focus.loading
                ? 'Syncing'
                : focus.currentSession
                  ? `${formatRemainingTime(focus.remainingSeconds)} left`
                  : focus.summary.todayCompletedSessions > 0
                    ? `${focus.summary.todayCompletedSessions} complete`
                    : focus.isFocusModeEnabled
                      ? 'Focus mode on'
                      : 'Ready'}
            </p>
          </div>

          <div className="rounded-full border border-white/8 bg-white/6 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-200">
            {focus.currentSession ? 'Active' : focus.isFocusModeEnabled ? 'Locked' : 'Idle'}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/6">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#f05a3d_0%,#f1b94d_100%)]"
            style={{ width: `${focus.currentSession ? focusProgress : coherence}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">XP Total</p>
            <p className="mt-2 text-lg font-semibold text-white">{totalXP}</p>
          </div>
          <div className="rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Focus Minutes</p>
            <p className="mt-2 text-lg font-semibold text-white">{focus.summary.todayFocusMinutes}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export function PnlWidget() {
  const positions = [
    { symbol: 'AAPL', pnl: 420, exposure: 1.9 },
    { symbol: 'BTC', pnl: -130, exposure: 3.5 },
    { symbol: 'TSLA', pnl: 280, exposure: 2.2 },
  ];
  const totalPnl = positions.reduce((sum, item) => sum + item.pnl, 0);
  const dailyChange = 78;

  return (
    <div className="space-y-4">
      <MetricCard
        label="Market Snapshot"
        value={formatCurrency(totalPnl)}
        description={`Daily change +$${dailyChange}. Local demo data until live market integrations are connected.`}
        icon={Orbit}
        tone={totalPnl >= 0 ? 'success' : 'warning'}
        trend={{ value: `${dailyChange >= 0 ? '+' : '-'}$${Math.abs(dailyChange)}`, direction: dailyChange >= 0 ? 'up' : 'down' }}
      />

      <div className="space-y-3">
        {positions.map((position) => (
          <div
            key={position.symbol}
            className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-4"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">{position.symbol}</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(position.pnl)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Exposure</p>
              <p className="mt-2 text-sm font-semibold text-slate-200">{position.exposure}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StreakWidget() {
  const { summary, isLoading, error } = useHabits();
  const currentStreak = summary.longestCurrentStreak;
  const consistency = summary.completionPercent;

  return (
    <div className="space-y-4">
      <MetricCard
        label="Current Streak"
        value={isLoading ? '--' : `${currentStreak} day${currentStreak === 1 ? '' : 's'}`}
        description={
          error
            ? 'Habit data unavailable'
            : summary.totalHabits === 0
              ? 'Create habits to start measuring streaks'
              : currentStreak > 0
                ? 'Best active habit streak in motion'
                : 'No streak established today'
        }
        icon={Flame}
        tone="warning"
        trend={{ value: `${consistency}% consistency`, direction: consistency > 0 ? 'up' : 'neutral' }}
      />

      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Consistency</p>
            <p className="metric-value mt-3 text-2xl">{isLoading ? '--' : `${consistency}%`}</p>
          </div>
          <Sparkles size={18} className="text-[var(--shell-success)]" />
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/6">
          <div className="h-full rounded-full bg-[var(--shell-success)]" style={{ width: `${consistency}%` }} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          {error ? 'Consistency unavailable right now.' : `${summary.completedToday} habit${summary.completedToday === 1 ? '' : 's'} completed today.`}
        </p>
      </GlassCard>
    </div>
  );
}

export function ChecklistWidget() {
  const saveKey = STORAGE_KEYS.checklist;
  const [state, setState] = useState<Record<string, boolean>>(() => readStoredState<Record<string, boolean>>(saveKey, {}));

  useEffect(() => {
    localStorage.setItem(saveKey, JSON.stringify(state));
  }, [saveKey, state]);

  const toggle = (id: string) => {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = DAILY_CHECKLIST.filter((task) => state[task.id]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Daily Checklist</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{completedCount}/{DAILY_CHECKLIST.length} mission anchors complete.</p>
        </div>
        <button type="button" onClick={() => setState({})} className="soft-action px-3 py-2 text-[10px]">
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {DAILY_CHECKLIST.map((task) => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all',
              state[task.id]
                ? 'border-emerald-500/18 bg-emerald-500/8 text-white'
                : 'border-white/6 bg-white/[0.025] text-slate-300 hover:bg-white/[0.04]',
            )}
          >
            <p className="text-sm font-semibold text-white">{task.label}</p>
            {state[task.id] ? (
              <CheckCircle2 size={18} className="text-emerald-300" />
            ) : (
              <div className="h-5 w-5 rounded-full border border-white/12" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfigWidget() {
  const { tabs, toggleWidget } = useWidgetStore();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Dashboard Visibility</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Keep the command surface tight. Show only the widgets that help with the daily loop.
          </p>
        </div>
        <Shield size={18} className="text-[var(--shell-brand)]" />
      </div>

      <div className="space-y-4">
        {Object.values(tabs).map((tab) => (
          <GlassCard key={tab.id} className="border-white/8 bg-[rgba(255,255,255,0.02)] p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">{tab.label}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {tab.widgets.filter((widget) => widget.visible).length}/{tab.widgets.length} visible
                </p>
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                Tab
              </div>
            </div>

            <div className="grid gap-3">
              {tab.widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(tab.id, widget.id)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all',
                    widget.visible
                      ? 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] text-white'
                      : 'border-white/6 bg-white/[0.025] text-slate-400 hover:bg-white/[0.04]',
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{widget.label}</span>
                  {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
