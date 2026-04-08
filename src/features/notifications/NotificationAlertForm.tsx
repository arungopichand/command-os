import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, X } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import type { NotificationAlert, NotificationAlertDraft } from './notification.types';
import { formatAlertTime, parseAlertTime } from './notificationUtils';

interface NotificationAlertFormProps {
  editingAlert: NotificationAlert | null;
  isSaving: boolean;
  onSubmit: (draft: NotificationAlertDraft) => Promise<void>;
  onCancelEdit: () => void;
}

const EMPTY_FORM: NotificationAlertDraft = {
  title: '',
  message: '',
  hour: 9,
  minute: 0,
  isEnabled: true,
};

function getInitialFormState(editingAlert: NotificationAlert | null): NotificationAlertDraft {
  if (!editingAlert) {
    return EMPTY_FORM;
  }

  return {
    title: editingAlert.title,
    message: editingAlert.message,
    hour: editingAlert.hour,
    minute: editingAlert.minute,
    isEnabled: editingAlert.isEnabled,
  };
}

export function NotificationAlertForm({
  editingAlert,
  isSaving,
  onSubmit,
  onCancelEdit,
}: NotificationAlertFormProps) {
  const [formState, setFormState] = useState<NotificationAlertDraft>(() => getInitialFormState(editingAlert));
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedTitle = formState.title.trim();
    const trimmedMessage = formState.message.trim();
    if (!trimmedTitle || !trimmedMessage) {
      setFormError('Title and message are required.');
      return;
    }

    await onSubmit({
      ...formState,
      title: trimmedTitle,
      message: trimmedMessage,
    });

    if (!editingAlert) {
      setFormState(EMPTY_FORM);
      setFormError(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">
            {editingAlert ? 'Edit Reminder' : 'Create Reminder'}
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
            {editingAlert ? 'Update daily alert' : 'Add daily alert'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Reminders are stored locally and fire while COMMAND.OS stays open with browser permission enabled.
          </p>
        </div>

        {editingAlert ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="soft-action"
          >
            <X size={14} />
            Cancel
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            Title
          </label>
          <input
            value={formState.title}
            onChange={(event) => setFormState((currentState) => ({ ...currentState, title: event.target.value }))}
            className="input-surface"
            placeholder="Morning Review"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            Time
          </label>
          <input
            type="time"
            value={formatAlertTime(formState.hour, formState.minute)}
            onChange={(event) => {
              const nextTime = parseAlertTime(event.target.value);
              if (!nextTime) {
                return;
              }

              setFormState((currentState) => ({
                ...currentState,
                hour: nextTime.hour,
                minute: nextTime.minute,
              }));
            }}
            className="input-surface [color-scheme:dark]"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            Message
          </label>
          <input
            value={formState.message}
            onChange={(event) => setFormState((currentState) => ({ ...currentState, message: event.target.value }))}
            className="input-surface"
            placeholder="Open the Command Center and start the day."
          />
        </div>

        <div className="flex items-end lg:col-span-2">
          <label className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Enabled
            </span>
            <input
              type="checkbox"
              checked={formState.isEnabled}
              onChange={(event) => setFormState((currentState) => ({ ...currentState, isEnabled: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-[rgba(5,9,14,0.8)] text-blue-400 focus:ring-blue-400/40"
            />
          </label>
        </div>

        {formError ? (
          <div className="lg:col-span-12">
            <p className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] px-4 py-3 text-sm text-slate-100">{formError}</p>
          </div>
        ) : null}

        <div className="lg:col-span-12 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="primary-action w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {editingAlert ? <Save size={16} /> : <Plus size={16} />}
            {isSaving
              ? editingAlert
                ? 'Saving...'
                : 'Creating...'
              : editingAlert
                ? 'Save Reminder'
                : 'Add Reminder'}
          </button>
        </div>
      </form>
      </GlassCard>
    </motion.div>
  );
}
