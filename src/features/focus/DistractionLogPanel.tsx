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
      <GlassCard className="border-white/5 bg-black/40 p-6">
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
            <LoaderCircle size={18} className="animate-spin text-red-500" />
            Loading Distraction Log
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="border-white/5 bg-black/40 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
          <FileText size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">Distraction Log</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Capture Interruptions</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">This note auto-saves locally as you type and stays attached to the active or most recent focus session.</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200/90">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {noteTargetSession ? (
        <>
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            {getSessionContextLabel(noteTargetSession)}
          </div>

          <textarea
            value={noteValue}
            onChange={(event) => void onChangeNote(event.target.value)}
            rows={10}
            className="mt-4 w-full rounded-3xl border border-white/10 bg-black/50 p-4 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            placeholder="Write down what broke concentration, what you need to revisit later, or what you should ignore until the session ends."
          />

          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            {noteValue.trim().length > 0 ? 'Saved locally in real time.' : 'Start typing to save the first distraction note.'}
          </p>
        </>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
          <h3 className="text-xl font-black uppercase tracking-tight text-white">No Session Yet</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Start a focus session to unlock the distraction log and attach notes to that session.</p>
        </div>
      )}
    </GlassCard>
  );
}
