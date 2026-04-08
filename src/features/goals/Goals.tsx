import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle, Pause, ShieldAlert, Target, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { supabase } from '../../services/supabase';
import { GoalForm } from './GoalForm';
import { GoalList } from './GoalList';
import { GoalStatus, type Goal } from './goal.types';
import { useGoals } from './useGoals';

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load goals right now.';
}

export function Goals() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isResolvingUser, setIsResolvingUser] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncUser() {
      if (!supabase) {
        if (isMounted) {
          setSessionError('Supabase client is not configured.');
          setUserId(null);
          setIsResolvingUser(false);
        }
        return;
      }

      setSessionError(null);
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) {
        return;
      }

      if (error) {
        setSessionError(error.message);
        setUserId(null);
        setIsResolvingUser(false);
        return;
      }

      setUserId(data.user?.id ?? null);
      setIsResolvingUser(false);
    }

    void syncUser();

    const { data: { subscription } } = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          if (!isMounted) {
            return;
          }

          setSessionError(null);
          setUserId(session?.user?.id ?? null);
          setIsResolvingUser(false);
        })
      : { data: { subscription: null } };

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const { data: goals = [], isLoading, isFetching, isError, error, refetch } = useGoals(userId);

  const summary = useMemo(() => {
    const active = goals.filter((goal) => goal.status === GoalStatus.Active).length;
    const completed = goals.filter((goal) => goal.status === GoalStatus.Completed).length;
    const paused = goals.filter((goal) => goal.status === GoalStatus.Paused).length;

    return {
      total: goals.length,
      active,
      completed,
      paused,
    };
  }, [goals]);

  if (isResolvingUser) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/60 backdrop-blur-xl">
          <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
          Resolving Goal Context
        </div>
      </div>
    );
  }

  if (sessionError || !userId) {
    return (
      <GlassCard className="border-red-500/20 bg-red-500/10 p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Goal session unavailable</h2>
            <p className="body-copy mt-3">{sessionError ?? 'We could not resolve the authenticated user for the goals module.'}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mission Planning"
        title="Track the work that actually matters"
        description="Goals should be clear, updateable, and tied to visible progress. This module is Supabase-backed, so it is one of the main sources of truth in COMMAND.OS."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              void refetch();
            }}
            disabled={isFetching}
            className="soft-action disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? 'Refreshing...' : 'Refresh Goals'}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Goals" value={summary.total} description="All tracked goals for the current user." icon={Target} tone="neutral" />
        <MetricCard label="Active" value={summary.active} description="Goals currently in motion." icon={TrendingUp} tone="warning" />
        <MetricCard label="Completed" value={summary.completed} description="Goals closed successfully." icon={CheckCircle2} tone="success" />
        <MetricCard label="Paused" value={summary.paused} description="Goals waiting to be resumed." icon={Pause} tone="brand" />
      </div>

      {isError ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Goals failed to load</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-100/80">{formatError(error)}</p>
          <button type="button" onClick={() => void refetch()} className="primary-action mt-5">
            Retry
          </button>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <GoalForm
          key={editingGoal?.id ?? 'create-goal'}
          userId={userId}
          goal={editingGoal}
          onCancelEdit={() => setEditingGoal(null)}
          onSuccess={() => setEditingGoal(null)}
        />

        <div className="space-y-4">
          <div>
            <p className="section-eyebrow">Goals</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Execution queue</h2>
          </div>

          {isLoading ? (
            <GlassCard className="flex min-h-[240px] items-center justify-center border-white/8 bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center gap-3 text-sm font-semibold text-white/60">
                <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
                Loading Goals
              </div>
            </GlassCard>
          ) : goals.length === 0 ? (
            <GlassCard className="border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] text-[var(--shell-brand)]">
                <Target size={22} />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">No goals yet</h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500">Create the first goal in the form panel to start tracking it right away.</p>
            </GlassCard>
          ) : (
            <GoalList goals={goals} userId={userId} onEdit={setEditingGoal} />
          )}
        </div>
      </div>
    </div>
  );
}
