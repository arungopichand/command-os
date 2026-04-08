import { LoaderCircle, MoonStar, ShieldAlert, TimerReset, Zap } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
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
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/60 backdrop-blur-xl">
          <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
          Restoring Focus Workflow
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deep Work"
        title="Protect a clear block of focused execution"
        description="The focus workflow should stay calm under pressure: one reliable timer, one distraction log, and a visible shell change when focus mode is active."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Focus Mode" value={isFocusModeEnabled ? 'On' : 'Off'} description="Shell visibility shifts when focus mode is enabled." icon={MoonStar} tone="warning" />
        <MetricCard label="Session Status" value={currentSession?.status === 'running' ? 'Running' : 'Idle'} description="Only one timer runs at a time." icon={Zap} tone="brand" />
        <MetricCard label="Sessions Today" value={summary.todayCompletedSessions} description="Completed focus sprints logged today." icon={TimerReset} tone="success" />
        <MetricCard label="Latest Session" value={getLatestSessionLabel(recentSession?.status)} description="Most recent session outcome." icon={TimerReset} tone="neutral" />
      </div>

      {error ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] p-3 text-[var(--shell-brand)]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Focus data is unavailable right now</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-100/80">{error}</p>
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
        <GlassCard className="border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Saved Note</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{currentDistractionNote}</p>
        </GlassCard>
      ) : null}
    </div>
  );
}
