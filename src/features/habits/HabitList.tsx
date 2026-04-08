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
              'flex w-full items-center justify-between gap-4 rounded-3xl border p-5 text-left transition-all',
              habit.completedToday
                ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                : 'border-white/5 bg-white/[0.03] text-slate-200 hover:border-white/10 hover:bg-white/[0.05]',
              isPending && 'cursor-not-allowed opacity-60',
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white">{habit.name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <Flame size={12} className={habit.streak > 0 ? 'text-amber-400' : 'text-slate-600'} />
                  {formatStreakLabel(habit.streak)}
                </span>
                <span>{habit.completedToday ? 'Completed today' : 'Pending today'}</span>
              </div>
            </div>

            <div className="shrink-0">
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
