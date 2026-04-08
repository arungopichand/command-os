import { Download, FileText, History, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
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
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/60 backdrop-blur-xl">
          <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
          Loading Daily Review
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="After Action Log"
        title="Close the day with a record you can trust"
        description="The daily review should stay simple: write what happened, let it auto-save, and keep enough history to notice patterns without turning journaling into homework."
        actions={
          <>
            <button
              type="button"
              onClick={() => void handleExport('json')}
              disabled={exportingFormat !== null}
              className="soft-action disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              {exportingFormat === 'json' ? 'Exporting JSON...' : 'Export JSON'}
            </button>
            <button
              type="button"
              onClick={() => void handleExport('csv')}
              disabled={exportingFormat !== null}
              className="soft-action disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              {exportingFormat === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
            </button>
          </>
        }
      />

      {exportError ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-4">
          <p className="text-sm leading-relaxed text-slate-100/85">{exportError}</p>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Today" value={todayEntry ? 'Reviewed' : 'No entry yet'} description="Whether the current day already has a saved note." icon={FileText} tone="brand" />
        <MetricCard label="History Entries" value={historyEntries.length} description="Saved entries from previous days." icon={History} tone="neutral" />
        <MetricCard label="Autosave" value={autosaveLabel} description="Current persistence state for the editor." icon={Download} tone="success" />
      </div>

      {error ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] p-3 text-[var(--shell-brand)]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Daily review is unavailable right now</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-100/80">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
              <FileText size={18} />
            </div>
            <div>
              <p className="section-eyebrow">Today&apos;s Review</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Write the day down</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">This editor auto-saves after a short delay. Clearing it removes today&apos;s entry and returns the journal to the empty state.</p>
            </div>
          </div>

          <textarea
            value={noteValue}
            onChange={(event) => saveEntry(event.target.value)}
            rows={14}
            className="input-surface mt-6 min-h-[320px] rounded-2xl"
            placeholder="What happened today? What worked? What broke? What needs to improve tomorrow?"
          />

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {autosaveLabel}
          </p>
        </GlassCard>

        <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">
              <History size={18} />
            </div>
            <div>
              <p className="section-eyebrow">History</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Previous days</h2>
            </div>
          </div>

          {historyEntries.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">No previous entries</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">Today&apos;s review will show up here tomorrow, and every saved day will stay in this list.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {historyEntries.map((entry) => (
                <div key={entry.date} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{entry.date}</p>
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
