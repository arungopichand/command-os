import { FileText, LoaderCircle, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import type { FocusSession } from './focus.types';

interface DistractionLogPanelProps {
  loading: boolean;
  noteTargetSession: FocusSession | null;
  noteValue: string;
  errorMessage: string | null;
  onChangeNote: (note: string) => Promise<void>;
}

function getSessionContextLabel(noteTargetSession: FocusSession | null) {
  if (!noteTargetSession) {
    return 'No session available';
  }

  return noteTargetSession.status === 'running'
    ? 'Saving notes to the active session'
    : 'Saving notes to the most recent session';
}

export function DistractionLogPanel({
  loading,
  noteTargetSession,
  noteValue,
  errorMessage,
  onChangeNote,
}: DistractionLogPanelProps) {
  if (loading) {
    return (
      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-6">
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-white/60">
            <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
            Loading distraction log
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
          <FileText size={18} />
        </div>
        <div>
          <p className="section-eyebrow">Distraction Log</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">Capture interruptions</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">This note auto-saves locally as you type and stays attached to the active or most recent focus session.</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-4 text-sm text-slate-100/90">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[var(--shell-brand)]" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {noteTargetSession ? (
        <>
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            {getSessionContextLabel(noteTargetSession)}
          </div>

          <textarea
            value={noteValue}
            onChange={(event) => void onChangeNote(event.target.value)}
            rows={10}
            className="input-surface mt-4 min-h-[220px] rounded-2xl"
            placeholder="Write down what broke concentration, what you need to revisit later, or what you should ignore until the session ends."
          />

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            {noteValue.trim().length > 0 ? 'Saved locally in real time.' : 'Start typing to save the first distraction note.'}
          </p>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/50">
            <FileText size={18} />
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">No session yet</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">Start a focus session to unlock the distraction log and attach notes to that session.</p>
        </div>
      )}
    </GlassCard>
  );
}
