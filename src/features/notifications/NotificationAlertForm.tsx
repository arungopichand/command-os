import { useState } from 'react';
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
    <GlassCard className="border-white/5 bg-black/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">
            {editingAlert ? 'Edit Reminder' : 'Create Reminder'}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
            {editingAlert ? 'Update Daily Alert' : 'Add Daily Alert'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Reminders are stored locally and fire while COMMAND.OS stays open with browser permission enabled.
          </p>
        </div>

        {editingAlert ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-300 transition-colors hover:bg-white/[0.08]"
          >
            <X size={14} />
            Cancel
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
            Title
          </label>
          <input
            value={formState.title}
            onChange={(event) => setFormState((currentState) => ({ ...currentState, title: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            placeholder="Morning Review"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
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
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 [color-scheme:dark]"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
            Message
          </label>
          <input
            value={formState.message}
            onChange={(event) => setFormState((currentState) => ({ ...currentState, message: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            placeholder="Open the Command Center and start the day."
          />
        </div>

        <div className="flex items-end lg:col-span-2">
          <label className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
              Enabled
            </span>
            <input
              type="checkbox"
              checked={formState.isEnabled}
              onChange={(event) => setFormState((currentState) => ({ ...currentState, isEnabled: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-black text-red-500 focus:ring-red-500"
            />
          </label>
        </div>

        {formError ? (
          <div className="lg:col-span-12">
            <p className="text-sm text-red-300">{formError}</p>
          </div>
        ) : null}

        <div className="lg:col-span-12 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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
  );
}
