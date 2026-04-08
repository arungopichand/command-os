import { CheckCircle2, Flame, LoaderCircle, ShieldAlert, Target } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
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
      <PageHeader
        eyebrow="Discipline Engine"
        title="Build consistency one clean action at a time"
        description="Habits should be fast to create, obvious to review, and honest about whether today is actually complete. This surface stays local-first and focused on daily execution."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Habits"
          value={summary.totalHabits}
          description="Active habits currently tracked in the system."
          icon={Target}
          tone="neutral"
          trend={{ value: `${summary.completedToday} done today`, direction: summary.completedToday > 0 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Completed Today"
          value={summary.completedToday}
          description="Finished habits for the current day."
          icon={CheckCircle2}
          tone="success"
          trend={{ value: `${summary.completionPercent}% of plan`, direction: summary.completionPercent > 0 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Best Current Streak"
          value={summary.longestCurrentStreak}
          description="Longest active streak across today's habits."
          icon={Flame}
          tone="warning"
          trend={{ value: `${summary.totalCompletions} total wins`, direction: summary.totalCompletions > 0 ? 'up' : 'neutral' }}
        />
        <MetricCard
          label="Today Completion"
          value={`${summary.completionPercent}%`}
          description="Share of habits completed so far today."
          icon={Target}
          tone="brand"
          trend={{ value: summary.completionPercent >= 50 ? 'On track' : 'Needs push', direction: summary.completionPercent >= 50 ? 'up' : 'neutral' }}
        />
      </div>

      {error ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] p-3 text-[var(--shell-brand)]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Habit data is unavailable right now</h2>
              <p className="body-copy mt-3">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <HabitForm isCreating={isCreating} errorMessage={error} onCreateHabit={createHabit} />

        <div className="space-y-4">
          <div>
            <p className="section-eyebrow">Today's Checklist</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Daily execution</h2>
          </div>

          {isLoading ? (
            <GlassCard className="flex min-h-[240px] items-center justify-center border-white/8 bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center gap-3 text-sm font-semibold text-white/60">
                <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
                Loading Habits
              </div>
            </GlassCard>
          ) : todayChecklist.length === 0 ? (
            <GlassCard className="border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] text-[var(--shell-brand)]">
                <Target size={22} />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">No habits yet</h3>
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
