import { CheckCircle2, Flame, LoaderCircle, ShieldAlert, Target } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { HabitForm } from './HabitForm';
import { HabitList } from './HabitList';
import { useHabits } from './useHabits';

export function Habits() {
  const {
    todayChecklist,
    summary,
    isLoading,
    error,
    isCreating,
    pendingHabitIds,
    createHabit,
    toggleHabit,
  } = useHabits();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/70">Discipline Engine</p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">Habits Module</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Create habits, check them off for today, and keep your streaks honest with local-first persistence.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Total Habits</p>
          <p className="mt-3 text-3xl font-black text-white">{summary.totalHabits}</p>
        </GlassCard>

        <GlassCard className="border-emerald-500/10 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
            <CheckCircle2 size={12} />
            Completed Today
          </div>
          <p className="mt-3 text-3xl font-black text-white">{summary.completedToday}</p>
        </GlassCard>

        <GlassCard className="border-amber-500/10 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-400">
            <Flame size={12} />
            Best Current Streak
          </div>
          <p className="mt-3 text-3xl font-black text-white">{summary.longestCurrentStreak}</p>
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today Completion</p>
          <p className="mt-3 text-3xl font-black text-white">{summary.completionPercent}%</p>
        </GlassCard>
      </div>

      {error ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Habit Data Unavailable</h2>
              <p className="mt-3 text-sm leading-relaxed text-red-200/80">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <HabitForm isCreating={isCreating} errorMessage={error} onCreateHabit={createHabit} />

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today&apos;s Checklist</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Daily Execution</h2>
          </div>

          {isLoading ? (
            <GlassCard className="flex min-h-[240px] items-center justify-center border-white/5 bg-black/40 p-6">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                <LoaderCircle size={18} className="animate-spin text-red-500" />
                Loading Habits
              </div>
            </GlassCard>
          ) : todayChecklist.length === 0 ? (
            <GlassCard className="border-dashed border-white/10 bg-black/30 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                <Target size={22} />
              </div>
              <h3 className="mt-5 text-2xl font-black uppercase tracking-tight text-white">No Habits Yet</h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500">Create the first habit in the form panel to start tracking it today.</p>
            </GlassCard>
          ) : (
            <HabitList habits={todayChecklist} pendingHabitIds={pendingHabitIds} onToggleHabit={toggleHabit} />
          )}
        </div>
      </div>
    </div>
  );
}
