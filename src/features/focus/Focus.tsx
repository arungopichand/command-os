import { LoaderCircle, MoonStar, ShieldAlert, TimerReset, Zap } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { DistractionLogPanel } from './DistractionLogPanel';
import { FocusTimerPanel } from './FocusTimerPanel';
import { useFocus } from './useFocus';

function getLatestSessionLabel(status: string | undefined) {
  if (status === 'completed') {
    return 'Completed';
  }

  if (status === 'cancelled') {
    return 'Cancelled';
  }

  if (status === 'running') {
    return 'Running';
  }

  return 'No sessions yet';
}

export function Focus() {
  const {
    currentSession,
    recentSession,
    distractionEntries,
    currentDistractionNote,
    remainingSeconds,
    isFocusModeEnabled,
    defaultDurationMinutes,
    summary,
    loading,
    error,
    startSession,
    cancelSession,
    completeSession,
    toggleFocusMode,
    saveDistractionNote,
  } = useFocus();

  const noteTargetSession = currentSession ?? recentSession;

  if (loading && !currentSession && !recentSession) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-red-500" />
          Restoring Focus Workflow
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/70">Deep Work</p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">Focus Module</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Run one reliable focus session at a time, keep the timer stable across refresh, and capture distractions without leaving the workflow.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-400">
            <MoonStar size={12} />
            Focus Mode
          </div>
          <p className="mt-3 text-3xl font-black text-white">{isFocusModeEnabled ? 'On' : 'Off'}</p>
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-red-400">
            <Zap size={12} />
            Session Status
          </div>
          <p className="mt-3 text-3xl font-black text-white">{currentSession?.status === 'running' ? 'Running' : 'Idle'}</p>
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
            <TimerReset size={12} />
            Sessions Today
          </div>
          <p className="mt-3 text-3xl font-black text-white">{summary.todayCompletedSessions}</p>
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Latest Session</p>
          <p className="mt-3 text-3xl font-black text-white">{getLatestSessionLabel(recentSession?.status)}</p>
        </GlassCard>
      </div>

      {error ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Focus Data Unavailable</h2>
              <p className="mt-3 text-sm leading-relaxed text-red-200/80">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <FocusTimerPanel
          currentSession={currentSession}
          recentSession={recentSession}
          remainingSeconds={remainingSeconds}
          defaultDurationMinutes={defaultDurationMinutes}
          isFocusModeEnabled={isFocusModeEnabled}
          summary={summary}
          loading={loading}
          onStartSession={startSession}
          onCancelSession={cancelSession}
          onCompleteSession={completeSession}
          onToggleFocusMode={toggleFocusMode}
        />

        <DistractionLogPanel
          loading={loading}
          noteTargetSession={noteTargetSession}
          noteValue={currentDistractionNote}
          errorMessage={error}
          onChangeNote={saveDistractionNote}
        />
      </div>

      {distractionEntries.length > 0 ? (
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Saved Note</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{currentDistractionNote}</p>
        </GlassCard>
      ) : null}
    </div>
  );
}
