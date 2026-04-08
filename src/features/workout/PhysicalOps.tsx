import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Home,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../utils/cn';

const WEEK_SPLIT = [
  { day: 'Mon', focus: 'Push', status: 'completed' as const },
  { day: 'Tue', focus: 'Pull', status: 'completed' as const },
  { day: 'Wed', focus: 'Legs', status: 'active' as const },
  { day: 'Thu', focus: 'Reset', status: 'pending' as const },
  { day: 'Fri', focus: 'Upper', status: 'pending' as const },
  { day: 'Sat', focus: 'Lower', status: 'pending' as const },
  { day: 'Sun', focus: 'Mobility', status: 'pending' as const },
];

function DailyProtocol() {
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Elite Push-ups', sets: '4 x 25', completed: false, type: 'Strength' },
    { id: '2', name: 'Bulgarian Split Squats', sets: '3 x 15', completed: false, type: 'Power' },
    { id: '3', name: 'Plank Protocol', sets: '3 x 60s', completed: false, type: 'Core' },
    { id: '4', name: 'Explosive Burpees', sets: '5 x 10', completed: false, type: 'Conditioning' },
  ]);

  const completedCount = exercises.filter((exercise) => exercise.completed).length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  const toggleExercise = (id: string) => {
    setExercises((current) => current.map((exercise) => (
      exercise.id === id ? { ...exercise, completed: !exercise.completed } : exercise
    )));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Daily Protocol</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{progress}% complete</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Complete the minimum effective session cleanly before adding volume.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Completed</p>
          <p className="mt-2 text-xl font-semibold text-white">{completedCount}/{exercises.length}</p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f05a3d_0%,#46c287_100%)] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-3">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => toggleExercise(exercise.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition-all',
              exercise.completed
                ? 'border-emerald-500/18 bg-emerald-500/10 text-white'
                : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]',
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('rounded-2xl border p-2.5', exercise.completed ? 'border-emerald-500/18 bg-white/[0.04] text-emerald-300' : 'border-white/8 bg-white/[0.03] text-slate-500')}>
                {exercise.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{exercise.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{exercise.type}</p>
              </div>
            </div>

            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {exercise.sets}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WeeklySplit() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {WEEK_SPLIT.map((item) => (
        <div key={item.day} className="flex flex-col items-center gap-2 text-center">
          <div
            className={cn(
              'flex aspect-square w-full items-center justify-center rounded-[18px] border text-sm font-semibold',
              item.status === 'completed'
                ? 'border-emerald-500/18 bg-emerald-500/12 text-emerald-200'
                : item.status === 'active'
                  ? 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] text-white'
                  : 'border-white/8 bg-white/[0.03] text-slate-500',
            )}
          >
            {item.day}
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.focus}</p>
        </div>
      ))}
    </div>
  );
}

export function PhysicalOps() {
  const completedDays = WEEK_SPLIT.filter((day) => day.status === 'completed').length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Physical Ops"
        title="Train the body without turning the page into chaos"
        description="This module should stay practical: finish the session, track the streak, and keep the weekly structure visible. Stronger execution matters more than louder styling."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Streak"
          value="14 days"
          description="Current consistency run for physical training."
          icon={Flame}
          tone="warning"
        />
        <MetricCard
          label="Week Completed"
          value={`${completedDays}/7`}
          description="Finished training days in the current weekly split."
          icon={RotateCcw}
          tone="success"
        />
        <MetricCard
          label="Session Type"
          value="Bodyweight"
          description="Today's minimum effective protocol remains equipment-light."
          icon={Home}
          tone="neutral"
        />
        <MetricCard
          label="Next Milestone"
          value="3 reps"
          description="Sessions remaining to reach the next readiness level."
          icon={Trophy}
          tone="brand"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <GlassCard className="p-6">
          <DailyProtocol />
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Weekly Split</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Mission profile</h2>
              </div>
              <RotateCcw size={18} className="text-[var(--shell-brand)]" />
            </div>

            <div className="mt-6">
              <WeeklySplit />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Quick Session</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Home recon</h2>
              </div>
              <Home size={18} className="text-[var(--shell-brand)]" />
            </div>

            <div className="mt-6 space-y-3">
              {[
                '5 minute mobility reset',
                '3 rounds of push-ups, squats, and plank',
                '1 minute cool down breathing',
              ].map((step) => (
                <div key={step} className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                  {step}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-2.5 text-[color:var(--shell-brand)]">
                <Dumbbell size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Milestone in reach</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Titan level 3</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Three more finished sessions gets you to the next physical readiness checkpoint. Keep the bar realistic and repeatable.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export const PhysicalOpsWidget = DailyProtocol;
export const WeeklySplitWidget = WeeklySplit;
export const QuickWorkoutWidget = () => (
  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-2.5 text-[var(--shell-brand)]">
        <Home size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Quick Workout</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">15 minute reset</p>
      </div>
    </div>
    <p className="mt-4 text-sm leading-relaxed text-slate-300">
      Bodyweight circuit for days when consistency matters more than intensity.
    </p>
  </div>
);
