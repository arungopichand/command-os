import { Download, FileText, History, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { exportCommandOsData, type CommandOsExportFormat } from './dailyReviewExport';
import { useDailyReview } from './useDailyReview';

function formatExportError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to export COMMAND.OS data.';
}

export function DailyReview() {
  const {
    todayEntry,
    historyEntries,
    noteValue,
    loading,
    error,
    saveStatus,
    saveEntry,
  } = useDailyReview();
  const [exportingFormat, setExportingFormat] = useState<CommandOsExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport(format: CommandOsExportFormat) {
    setExportingFormat(format);
    setExportError(null);

    try {
      await exportCommandOsData(format);
    } catch (error) {
      setExportError(formatExportError(error));
    } finally {
      setExportingFormat(null);
    }
  }

  const autosaveLabel = saveStatus === 'saving'
    ? 'Saving...'
    : saveStatus === 'saved'
      ? 'Saved'
      : todayEntry
        ? 'Auto-save enabled'
        : 'No entry yet';

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-red-500" />
          Loading Daily Review
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/70">After Action Log</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">Daily Review</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Write the day&apos;s review, let it auto-save, and keep a simple history of previous entries.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleExport('json')}
            disabled={exportingFormat !== null}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black uppercase tracking-[0.24em] text-slate-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} />
            {exportingFormat === 'json' ? 'Exporting JSON...' : 'Export JSON'}
          </button>
          <button
            type="button"
            onClick={() => void handleExport('csv')}
            disabled={exportingFormat !== null}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black uppercase tracking-[0.24em] text-slate-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} />
            {exportingFormat === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {exportError ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm leading-relaxed text-red-200/85">{exportError}</p>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Today</p>
          <p className="mt-3 text-3xl font-black text-white">{todayEntry ? 'Reviewed' : 'No entry yet'}</p>
        </GlassCard>
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">History Entries</p>
          <p className="mt-3 text-3xl font-black text-white">{historyEntries.length}</p>
        </GlassCard>
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Autosave</p>
          <p className="mt-3 text-3xl font-black text-white">{autosaveLabel}</p>
        </GlassCard>
      </div>

      {error ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Daily Review Unavailable</h2>
              <p className="mt-3 text-sm leading-relaxed text-red-200/80">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <GlassCard className="border-white/5 bg-black/40 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">Today&apos;s Review</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Write The Day Down</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">This editor auto-saves after a short delay. Clearing it removes today&apos;s entry and returns the journal to the empty state.</p>
            </div>
          </div>

          <textarea
            value={noteValue}
            onChange={(event) => saveEntry(event.target.value)}
            rows={14}
            className="mt-6 w-full rounded-3xl border border-white/10 bg-black/50 p-4 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            placeholder="What happened today? What worked? What broke? What needs to improve tomorrow?"
          />

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            {autosaveLabel}
          </p>
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
              <History size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">History</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Previous Days</h2>
            </div>
          </div>

          {historyEntries.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
              <h3 className="text-xl font-black uppercase tracking-tight text-white">No Previous Entries</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">Today&apos;s review will show up here tomorrow, and every saved day will stay in this list.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {historyEntries.map((entry) => (
                <div key={entry.date} className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">{entry.date}</p>
                  <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{entry.note}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
