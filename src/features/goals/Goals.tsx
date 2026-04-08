import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle, Pause, ShieldAlert, Target, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
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
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-red-500" />
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
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Goal Session Unavailable</h2>
            <p className="mt-3 text-sm leading-relaxed text-red-200/80">{sessionError ?? 'We could not resolve the authenticated user for the goals module.'}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/70">Mission Planning</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">Goals Module</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Create, track, update, and complete goals with real Supabase persistence.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingGoal(null);
            void refetch();
          }}
          disabled={isFetching}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black uppercase tracking-[0.24em] text-slate-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Goals'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Total Goals</p>
          <p className="mt-3 text-3xl font-black text-white">{summary.total}</p>
        </GlassCard>

        <GlassCard className="border-amber-500/10 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-400">
            <TrendingUp size={12} />
            Active
          </div>
          <p className="mt-3 text-3xl font-black text-white">{summary.active}</p>
        </GlassCard>

        <GlassCard className="border-emerald-500/10 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
            <CheckCircle2 size={12} />
            Completed
          </div>
          <p className="mt-3 text-3xl font-black text-white">{summary.completed}</p>
        </GlassCard>

        <GlassCard className="border-white/10 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            <Pause size={12} />
            Paused
          </div>
          <p className="mt-3 text-3xl font-black text-white">{summary.paused}</p>
        </GlassCard>
      </div>

      {isError ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Goals Load Failed</h2>
          <p className="mt-3 text-sm leading-relaxed text-red-200/80">{formatError(error)}</p>
          <button type="button" onClick={() => void refetch()} className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-500">
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
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Goals</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Execution Queue</h2>
          </div>

          {isLoading ? (
            <GlassCard className="flex min-h-[240px] items-center justify-center border-white/5 bg-black/40 p-6">
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                <LoaderCircle size={18} className="animate-spin text-red-500" />
                Loading Goals
              </div>
            </GlassCard>
          ) : goals.length === 0 ? (
            <GlassCard className="border-dashed border-white/10 bg-black/30 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                <Target size={22} />
              </div>
              <h3 className="mt-5 text-2xl font-black uppercase tracking-tight text-white">No Goals Yet</h3>
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
