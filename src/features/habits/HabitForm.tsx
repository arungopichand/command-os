import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-5">
      <div>
        <p className="section-eyebrow">Create Habit</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">Add a daily target</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">Keep the input clean and specific. New habits appear in today&apos;s checklist immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="habit-name" className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            Habit Name
          </label>
          <input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isCreating}
            maxLength={80}
            placeholder="Example: Morning planning"
            className="input-surface disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {activeError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-4 text-sm text-slate-100/90">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[var(--shell-brand)]" />
            <p>{activeError}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isCreating}
          className="primary-action w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          {isCreating ? 'Creating Habit...' : 'Create Habit'}
        </button>
      </form>
      </GlassCard>
    </motion.div>
  );
}
