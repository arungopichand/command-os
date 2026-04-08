import { Flame, LoaderCircle, MoonStar, Play, Square, StopCircle } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import type { FocusSession, FocusSummary } from './focus.types';
import { formatRemainingTime } from './focusUtils';

interface FocusTimerPanelProps {
  currentSession: FocusSession | null;
  recentSession: FocusSession | null;
  remainingSeconds: number;
  defaultDurationMinutes: number;
  isFocusModeEnabled: boolean;
  summary: FocusSummary;
  loading: boolean;
  onStartSession: () => Promise<void>;
  onCancelSession: () => Promise<void>;
  onCompleteSession: () => Promise<void>;
  onToggleFocusMode: () => void;
}

function getSessionStatusLabel(currentSession: FocusSession | null, recentSession: FocusSession | null): string {
  if (currentSession?.status === 'running') {
    return 'Focus session active';
  }

  if (recentSession?.status === 'completed') {
    return 'Last session completed';
  }

  if (recentSession?.status === 'cancelled') {
    return 'Last session cancelled';
  }

  return 'No focus session yet';
}

export function FocusTimerPanel({
  currentSession,
  recentSession,
  remainingSeconds,
  defaultDurationMinutes,
  isFocusModeEnabled,
  summary,
  loading,
  onStartSession,
  onCancelSession,
  onCompleteSession,
  onToggleFocusMode,
}: FocusTimerPanelProps) {
  const isRunning = currentSession?.status === 'running';
  const displaySeconds = isRunning ? remainingSeconds : defaultDurationMinutes * 60;
  const displayLabel = getSessionStatusLabel(currentSession, recentSession);

  return (
    <GlassCard className="border-white/5 bg-black/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">Focus Timer</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Deep Work Session</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">The countdown is timestamp-based, so it restores accurately after refresh.</p>
        </div>
        <button
          type="button"
          onClick={onToggleFocusMode}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.26em] transition-colors ${
            isFocusModeEnabled
              ? 'bg-amber-500 text-black hover:bg-amber-400'
              : 'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]'
          }`}
        >
          <MoonStar size={14} />
          {isFocusModeEnabled ? 'Focus Mode On' : 'Enable Focus Mode'}
        </button>
      </div>

      <div className="mt-8 rounded-[2rem] border border-white/5 bg-black/50 p-8 text-center">
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
              <LoaderCircle size={18} className="animate-spin text-red-500" />
              Restoring Focus State
            </div>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{displayLabel}</p>
            <p className="mt-6 text-7xl font-black tracking-tight text-white">{formatRemainingTime(displaySeconds)}</p>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
              {isRunning
                ? `${summary.currentSessionProgressPercent}% through the current sprint`
                : `${defaultDurationMinutes}-minute default sprint`}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => void onStartSession()}
          disabled={loading || isRunning}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play size={16} />
          Start Session
        </button>

        <button
          type="button"
          onClick={() => void onCompleteSession()}
          disabled={loading || !isRunning}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-slate-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <StopCircle size={16} />
          Complete
        </button>

        <button
          type="button"
          onClick={() => void onCancelSession()}
          disabled={loading || !isRunning}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-slate-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Square size={16} />
          Cancel
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-red-400">
            <Flame size={12} />
            Sessions Today
          </div>
          <p className="mt-3 text-2xl font-black text-white">{summary.todayCompletedSessions}</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-400">
            <MoonStar size={12} />
            Focus Minutes
          </div>
          <p className="mt-3 text-2xl font-black text-white">{summary.todayFocusMinutes}</p>
        </div>
      </div>
    </GlassCard>
  );
}
