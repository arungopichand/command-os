import { useMemo, useState } from 'react';
import { LoaderCircle, Pencil, Target, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../utils/cn';
import {
  GoalStatus,
  clampGoalProgress,
  getGoalStatusLabel,
  resolveGoalStatus,
  type Goal,
} from './goal.types';
import { useDeleteGoal, useUpdateGoal } from './useGoals';

interface GoalListProps {
  goals: Goal[];
  userId: string;
  onEdit: (goal: Goal) => void;
}

const STATUS_STYLES: Record<GoalStatus, string> = {
  [GoalStatus.Active]: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  [GoalStatus.Completed]: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  [GoalStatus.Paused]: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
};

function formatTimestamp(timestamp: string) {
  const parsedDate = new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function getNextStatusForProgress(goal: Goal, nextProgress: number) {
  return goal.status === GoalStatus.Paused && nextProgress < 100
    ? GoalStatus.Paused
    : resolveGoalStatus(nextProgress, goal.status);
}

export function GoalList({ goals, userId, onEdit }: GoalListProps) {
  const updateGoalMutation = useUpdateGoal(userId);
  const deleteGoalMutation = useDeleteGoal(userId);
  const [actionError, setActionError] = useState<string | null>(null);

  const updatingGoalId = useMemo(() => {
    return updateGoalMutation.isPending ? updateGoalMutation.variables?.id ?? null : null;
  }, [updateGoalMutation.isPending, updateGoalMutation.variables]);

  const deletingGoalId = useMemo(() => {
    return deleteGoalMutation.isPending ? deleteGoalMutation.variables?.id ?? null : null;
  }, [deleteGoalMutation.isPending, deleteGoalMutation.variables]);

  const handleProgressUpdate = async (goal: Goal, nextProgress: number) => {
    if (nextProgress === goal.progress) {
      return;
    }

    try {
      setActionError(null);
      await updateGoalMutation.mutateAsync({
        id: goal.id,
        userId,
        payload: {
          progress: nextProgress,
          status: getNextStatusForProgress(goal, nextProgress),
        },
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update goal progress right now.');
    }
  };

  const handleDelete = async (goal: Goal) => {
    const confirmed = window.confirm(`Delete "${goal.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      setActionError(null);
      await deleteGoalMutation.mutateAsync({ id: goal.id, userId });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete goal right now.');
    }
  };

  return (
    <div className="space-y-4">
      {actionError ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{actionError}</div> : null}

      {goals.map((goal) => {
        const isUpdating = updatingGoalId === goal.id;
        const isDeleting = deletingGoalId === goal.id;
        const isBusy = isUpdating || isDeleting;

        return (
          <GlassCard key={goal.id} className="border-white/5 bg-black/40 p-5 transition-colors duration-300 hover:border-red-500/20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">{goal.title}</h3>
                  <span className={cn('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]', STATUS_STYLES[goal.status])}>
                    {getGoalStatusLabel(goal.status)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-400">{goal.description || 'No additional description provided for this goal yet.'}</p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                      <Target size={12} />
                      Progress
                    </div>
                    <span className="text-sm font-semibold text-white">{goal.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-500 transition-[width] duration-300" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Updated {formatTimestamp(goal.updated_at)}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleProgressUpdate(goal, clampGoalProgress(goal.progress - 10))}
                    disabled={isBusy || goal.progress === 0}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -10%
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleProgressUpdate(goal, clampGoalProgress(goal.progress + 10))}
                    disabled={isBusy || goal.progress === 100}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleProgressUpdate(goal, 100)}
                    disabled={isBusy || goal.progress === 100}
                    className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? <LoaderCircle size={14} className="inline animate-spin" /> : 'Mark Complete'}
                  </button>
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(goal)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => void handleDelete(goal)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
