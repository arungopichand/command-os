import { CheckCircle2, Circle, Flame } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { HabitChecklistItem } from './habit.types';
import { formatStreakLabel } from './habitUtils';

interface HabitListProps {
  habits: HabitChecklistItem[];
  pendingHabitIds: string[];
  onToggleHabit: (habitId: string) => Promise<void>;
}

export function HabitList({ habits, pendingHabitIds, onToggleHabit }: HabitListProps) {
  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const isPending = pendingHabitIds.includes(habit.id);

        return (
          <button
            key={habit.id}
            type="button"
            onClick={() => void onToggleHabit(habit.id)}
            disabled={isPending}
            className={cn(
              'flex w-full flex-col items-start gap-4 rounded-2xl border bg-gradient-to-b from-white/5 to-transparent p-5 text-left shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_60px_rgba(0,0,0,0.45)] active:scale-[0.99] sm:flex-row sm:items-center sm:justify-between',
              habit.completedToday
                ? 'border-emerald-500/20 bg-emerald-500/10 text-white'
                : 'border-white/8 bg-white/[0.025] text-slate-200 hover:border-white/12 hover:bg-white/[0.04]',
              isPending && 'cursor-not-allowed opacity-60',
            )}
          >
            <div className="min-w-0">
              <p className="text-xl font-semibold tracking-[-0.02em] text-white">{habit.name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                <span className="inline-flex items-center gap-2">
                  <Flame size={12} className={habit.streak > 0 ? 'text-amber-400' : 'text-slate-600'} />
                  {formatStreakLabel(habit.streak)}
                </span>
                <span>{habit.completedToday ? 'Completed today' : 'Pending today'}</span>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-auto">
              {habit.completedToday ? (
                <CheckCircle2 size={22} className="text-emerald-400" />
              ) : (
                <Circle size={22} className="text-slate-500" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
