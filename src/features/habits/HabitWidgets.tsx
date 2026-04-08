import { CheckCircle2, Flame, LoaderCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatStreakLabel } from './habitUtils';
import { useHabits } from './useHabits';

export function HabitSummaryWidget() {
  const { summary, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
          Loading Habits
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[color:var(--shell-brand)]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--shell-brand)]">Habit data unavailable</p>
            <p className="mt-2 text-sm text-slate-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (summary.totalHabits === 0) {
    return (
      <div className="flex h-full min-h-[180px] flex-col justify-between rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5">
        <div>
          <p className="section-eyebrow">Habits Summary</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">No habits yet</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">Create a habit in the habits module to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Today Completion</p>
          <p className="metric-value mt-3 text-4xl">{summary.completionPercent}%</p>
        </div>
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Completed</p>
          <p className="mt-2 text-xl font-semibold text-white">{summary.completedToday}/{summary.totalHabits}</p>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${summary.completionPercent}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
            <Flame size={12} />
            Best Streak
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{formatStreakLabel(summary.longestCurrentStreak)}</p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <CheckCircle2 size={12} />
            Total Wins
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{summary.totalCompletions}</p>
        </div>
      </div>
    </div>
  );
}

export function HabitPrioritiesWidget() {
  const { todayChecklist, isLoading, error, pendingHabitIds, toggleHabit } = useHabits();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
          Loading Habits
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--shell-brand)]">Habit data unavailable</p>
        <p className="mt-3 text-sm text-slate-200">{error}</p>
      </div>
    );
  }

  if (todayChecklist.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] flex-col justify-between rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5">
        <div>
          <p className="section-eyebrow">Today&apos;s Habits</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">No habits yet</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">Open the habits module and create the first habit.</p>
      </div>
    );
  }

  const visibleHabits = todayChecklist.slice(0, 4);
  const remainingCount = todayChecklist.length - visibleHabits.length;

  return (
    <div className="space-y-4">
      <div>
        <p className="section-eyebrow">Today&apos;s Habits</p>
        <p className="mt-2 text-sm text-slate-400">Quick checklist for the current day.</p>
      </div>

      <div className="space-y-3">
        {visibleHabits.map((habit) => {
          const isPending = pendingHabitIds.includes(habit.id);

          return (
            <button
              key={habit.id}
              type="button"
            onClick={() => void toggleHabit(habit.id)}
            disabled={isPending}
            className={cn(
                'flex w-full items-center justify-between gap-3 rounded-[22px] border px-4 py-4 text-left transition-all',
                habit.completedToday
                  ? 'border-emerald-500/18 bg-emerald-500/10 text-white'
                  : 'border-white/8 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]',
                isPending && 'cursor-not-allowed opacity-60',
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{habit.name}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{formatStreakLabel(habit.streak)}</p>
              </div>
              {habit.completedToday ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <div className="h-4 w-4 shrink-0 rounded-full border border-white/20" />}
            </button>
          );
        })}
      </div>

      {remainingCount > 0 ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">+{remainingCount} more habit{remainingCount === 1 ? '' : 's'} in the habits module</p>
      ) : null}
    </div>
  );
}
