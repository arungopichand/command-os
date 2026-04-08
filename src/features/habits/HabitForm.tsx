import { useState } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

interface HabitFormProps {
  isCreating: boolean;
  errorMessage: string | null;
  onCreateHabit: (name: string) => Promise<void>;
}

export function HabitForm({ isCreating, errorMessage, onCreateHabit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError('Habit name is required.');
      return;
    }

    setLocalError(null);

    try {
      await onCreateHabit(trimmedName);
      setName('');
    } catch (error) {
      if (error instanceof Error && error.message) {
        setLocalError(error.message);
        return;
      }

      setLocalError('Unable to create habit.');
    }
  }

  const activeError = localError ?? errorMessage;

  return (
    <GlassCard className="border-white/5 bg-black/40 p-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">Create Habit</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Add Daily Target</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">Create one habit at a time. New habits appear in today&apos;s checklist immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="habit-name" className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
            Habit Name
          </label>
          <input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isCreating}
            maxLength={80}
            placeholder="Example: Morning planning"
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {activeError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200/90">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-400" />
            <p>{activeError}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isCreating}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          {isCreating ? 'Creating Habit...' : 'Create Habit'}
        </button>
      </form>
    </GlassCard>
  );
}
