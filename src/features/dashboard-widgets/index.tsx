import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
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
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Total XP</p>
          <p className="mt-3 text-4xl font-black text-white">{totalXP}</p>
        </GlassCard>
        <GlassCard className="border-emerald-500/10 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
            <Sparkles size={12} /> Habit Wins
          </div>
          <p className="mt-3 text-4xl font-black text-white">
            {isLoading ? '--' : summary.completedToday}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-slate-500">
            {error
              ? 'Habit data unavailable'
              : summary.totalHabits === 0
                ? 'No habits yet'
                : `${summary.completedToday}/${summary.totalHabits} complete today`}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="border-red-500/10 bg-black/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Focus Workflow</p>
            <p className="mt-2 text-2xl font-black text-white">
              {focus.loading
                ? 'Syncing'
                : focus.currentSession
                  ? `${formatRemainingTime(focus.remainingSeconds)} left`
                  : focus.summary.todayCompletedSessions > 0
                    ? `${focus.summary.todayCompletedSessions} today`
                    : focus.isFocusModeEnabled
                      ? 'Mode enabled'
                      : 'Idle'}
            </p>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-[10px] uppercase tracking-[0.35em] font-black text-white">
            {focus.currentSession ? 'ACTIVE' : focus.isFocusModeEnabled ? 'MODE' : 'READY'}
          </div>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-red-500" style={{ width: `${focus.currentSession ? focusProgress : coherence}%` }} />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          {focus.error
            ? 'Focus data unavailable'
            : focus.currentSession
              ? `${focus.summary.todayFocusMinutes} focus minutes logged today`
              : focus.summary.todayCompletedSessions > 0
                ? `${focus.summary.todayCompletedSessions} focus session${focus.summary.todayCompletedSessions === 1 ? '' : 's'} complete today`
                : focus.isFocusModeEnabled
                  ? 'Focus mode is changing the shell'
                  : `Operational coherence: ${coherence}%`}
        </p>
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
    <div className="space-y-5">
      <GlassCard className="border-white/5 bg-black/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Unrealized P&L</p>
            <p className="mt-2 text-3xl font-black text-white">{formatCurrency(totalPnl)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">+${dailyChange}</p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {positions.map((position) => (
          <GlassCard key={position.symbol} className="border-white/5 bg-black/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">{position.symbol}</p>
                <p className="mt-2 text-xl font-black text-white">{formatCurrency(position.pnl)}</p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Exposure {position.exposure}%</p>
            </div>
          </GlassCard>
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
    <div className="space-y-5">
      <GlassCard className="border-white/5 bg-black/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Current Streak</p>
            <p className="mt-2 text-4xl font-black text-white">
              {isLoading ? '--' : `${currentStreak} days`}
            </p>
          </div>
          <Sparkles size={28} className="text-amber-400" />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          {error
            ? 'Habit data unavailable'
            : summary.totalHabits === 0
              ? 'No habits yet'
              : currentStreak > 0
                ? 'Best active habit streak'
                : 'No active streak today'}
        </p>
      </GlassCard>

      <GlassCard className="border-emerald-500/10 bg-black/40 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Completion Consistency</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${consistency}%` }} />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          {isLoading
            ? 'Loading habit consistency'
            : error
              ? 'Habit consistency unavailable'
              : `${consistency}% complete today`}
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Daily Checklist</p>
          <p className="mt-2 text-xs text-slate-400">Check off the squad-ready tasks for today.</p>
        </div>
        <button onClick={() => setState({})} className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500 hover:text-white">Reset</button>
      </div>

      <div className="space-y-3">
        {DAILY_CHECKLIST.map((task) => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-3xl border p-4 text-left transition-all',
              state[task.id]
                ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
            )}
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em]">{task.label}</p>
            </div>
            {state[task.id] ? <CheckCircle2 size={18} className="text-emerald-400" /> : <div className="h-5 w-5 rounded-full border border-white/10" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfigWidget() {
  const { tabs, toggleWidget } = useWidgetStore();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Module Visibility</p>
          <p className="mt-2 text-xs text-slate-400">Toggle the dashboard widgets that matter most.</p>
        </div>
        <button type="button" className="rounded-3xl bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-200 hover:bg-white/10">
          Apply Settings
        </button>
      </div>

      <div className="space-y-4">
        {Object.values(tabs).map((tab) => (
          <GlassCard key={tab.id} className="border-white/5 bg-black/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">{tab.label}</p>
                <p className="text-[10px] text-slate-400">{tab.widgets.length} widgets</p>
              </div>
              <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-slate-200">Tab</div>
            </div>
            <div className="grid gap-3">
              {tab.widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(tab.id, widget.id)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-[10px] uppercase tracking-[0.3em] transition-all',
                    widget.visible ? 'border-emerald-500/30 bg-emerald-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                  )}
                >
                  <span>{widget.label}</span>
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
