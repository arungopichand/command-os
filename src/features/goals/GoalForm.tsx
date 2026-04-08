import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, Target, X } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../utils/cn';
import {
  GoalStatus,
  GOAL_STATUS_OPTIONS,
  clampGoalProgress,
  getGoalStatusLabel,
  resolveGoalStatus,
  type Goal,
  type GoalStatus as GoalStatusValue,
} from './goal.types';
import { useCreateGoal, useUpdateGoal } from './useGoals';

interface GoalFormProps {
  userId: string;
  goal?: Goal | null;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
}

interface GoalFormState {
  title: string;
  description: string;
  progress: number;
  status: GoalStatusValue;
}

const INITIAL_FORM_STATE: GoalFormState = {
  title: '',
  description: '',
  progress: 0,
  status: GoalStatus.Active,
};

const EDITABLE_STATUS_OPTIONS = GOAL_STATUS_OPTIONS.filter((option) => option.value !== GoalStatus.Completed);

const STATUS_STYLES: Record<GoalStatusValue, string> = {
  [GoalStatus.Active]: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  [GoalStatus.Completed]: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  [GoalStatus.Paused]: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
};

function createFormState(goal?: Goal | null): GoalFormState {
  if (!goal) {
    return INITIAL_FORM_STATE;
  }

  return {
    title: goal.title,
    description: goal.description ?? '',
    progress: goal.progress,
    status: goal.status === GoalStatus.Paused ? GoalStatus.Paused : GoalStatus.Active,
  };
}

export function GoalForm({ userId, goal, onCancelEdit, onSuccess }: GoalFormProps) {
  const isEditing = Boolean(goal);
  const [formState, setFormState] = useState<GoalFormState>(() => createFormState(goal));
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const createGoalMutation = useCreateGoal(userId);
  const updateGoalMutation = useUpdateGoal(userId);

  const resolvedStatus = useMemo(
    () => resolveGoalStatus(formState.progress, formState.status),
    [formState.progress, formState.status],
  );
  const isSubmitting = createGoalMutation.isPending || updateGoalMutation.isPending;
  const activeError = submissionError ?? createGoalMutation.error?.message ?? updateGoalMutation.error?.message ?? null;

  const handleFieldChange = <K extends keyof GoalFormState>(field: K, value: GoalFormState[K]) => {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(null);

    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        progress: clampGoalProgress(formState.progress),
        status: resolvedStatus,
      };

      if (isEditing && goal) {
        await updateGoalMutation.mutateAsync({ id: goal.id, userId, payload });
      } else {
        await createGoalMutation.mutateAsync({ user_id: userId, ...payload });
      }

      setFormState(INITIAL_FORM_STATE);
      onSuccess?.();
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Unable to save goal right now.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Goal Control</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{isEditing ? 'Edit goal' : 'Create goal'}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/60">Capture the goal, its progress, and whether it is actively in motion or paused.</p>
        </div>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="soft-action p-3 text-white/60 hover:text-white"
            aria-label="Cancel editing goal"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="goal-title" className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">Title</label>
          <input
            id="goal-title"
            type="text"
            value={formState.title}
            onChange={(event) => handleFieldChange('title', event.target.value)}
            placeholder="Ship the Goals feature to production"
            className="input-surface"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="goal-description" className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">Description</label>
          <textarea
            id="goal-description"
            value={formState.description}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            placeholder="Add scope, expected outcome, or delivery notes."
            rows={4}
            className="input-surface"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="goal-status" className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">Status Mode</label>
            <select
              id="goal-status"
              value={formState.status}
              onChange={(event) => handleFieldChange('status', event.target.value as GoalStatusValue)}
              className="input-surface"
            >
              {EDITABLE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-black text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-white/60">Set progress to 100% to mark the goal completed.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-progress" className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">Progress</label>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]">
                <span className="text-white/50">Completion</span>
                <span className="text-white">{formState.progress}%</span>
              </div>
              <input
                id="goal-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                value={formState.progress}
                onChange={(event) => handleFieldChange('progress', clampGoalProgress(Number(event.target.value)))}
                className="w-full accent-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] p-2 text-[var(--shell-brand)]">
              <Target size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Resolved Status</p>
              <p className="mt-1 text-sm font-semibold text-white">{getGoalStatusLabel(resolvedStatus)}</p>
            </div>
          </div>
          <span className={cn('rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', STATUS_STYLES[resolvedStatus])}>
            {getGoalStatusLabel(resolvedStatus)}
          </span>
        </div>

        {activeError ? <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] px-4 py-3 text-sm text-slate-100">{activeError}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-action w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="soft-action w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      </GlassCard>
    </motion.div>
  );
}
