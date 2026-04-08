import { CheckCircle2, Flame, LoaderCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatStreakLabel } from './habitUtils';
import { useHabits } from './useHabits';

export function HabitSummaryWidget() {
  const { summary, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-red-500" />
          Loading Habits
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">Habit Data Error</p>
            <p className="mt-2 text-sm text-red-100/90">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (summary.totalHabits === 0) {
    return (
      <div className="flex h-full min-h-[180px] flex-col justify-between rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Habits Summary</p>
          <p className="mt-3 text-2xl font-black uppercase tracking-tight text-white">No Habits Yet</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">Create a habit in the habits module to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today Completion</p>
          <p className="mt-2 text-4xl font-black text-white">{summary.completionPercent}%</p>
        </div>
        <div className="rounded-3xl bg-white/5 px-4 py-3 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Completed</p>
          <p className="mt-2 text-xl font-black text-white">{summary.completedToday}/{summary.totalHabits}</p>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${summary.completionPercent}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-400">
            <Flame size={12} />
            Best Streak
          </div>
          <p className="mt-3 text-2xl font-black text-white">{formatStreakLabel(summary.longestCurrentStreak)}</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-400">
            <CheckCircle2 size={12} />
            Total Wins
          </div>
          <p className="mt-3 text-2xl font-black text-white">{summary.totalCompletions}</p>
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
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-red-500" />
          Loading Habits
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">Habit Data Error</p>
        <p className="mt-3 text-sm text-red-100/90">{error}</p>
      </div>
    );
  }

  if (todayChecklist.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] flex-col justify-between rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today&apos;s Habits</p>
          <p className="mt-3 text-2xl font-black uppercase tracking-tight text-white">No Habits Yet</p>
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
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today&apos;s Habits</p>
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
                'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                habit.completedToday
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                  : 'border-white/5 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]',
                isPending && 'cursor-not-allowed opacity-60',
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase tracking-[0.16em] text-white">{habit.name}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{formatStreakLabel(habit.streak)}</p>
              </div>
              {habit.completedToday ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <div className="h-4 w-4 shrink-0 rounded-full border border-white/20" />}
            </button>
          );
        })}
      </div>

      {remainingCount > 0 ? (
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">+{remainingCount} more habit{remainingCount === 1 ? '' : 's'} in the habits module</p>
      ) : null}
    </div>
  );
}
