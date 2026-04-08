import { BellOff, Clock3, Pencil, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import type { NotificationAlert, NotificationRuntimeState } from './notification.types';
import { formatAlertTime, getReminderStatusLabel } from './notificationUtils';

interface NotificationAlertListProps {
  alerts: NotificationAlert[];
  runtimeState: NotificationRuntimeState;
  isSaving: boolean;
  onEdit: (alert: NotificationAlert) => void;
  onToggle: (alertId: string) => Promise<void>;
  onDelete: (alertId: string) => Promise<void>;
}

export function NotificationAlertList({
  alerts,
  runtimeState,
  isSaving,
  onEdit,
  onToggle,
  onDelete,
}: NotificationAlertListProps) {
  if (alerts.length === 0) {
    return (
      <GlassCard className="border-white/5 bg-black/40 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/10 bg-white/[0.03] text-slate-500">
          <BellOff size={22} />
        </div>
        <h2 className="mt-5 text-2xl font-black uppercase tracking-tight text-white">No Reminders Yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Create a daily reminder to bring habits, focus, or review prompts back into your day.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <GlassCard
          key={alert.id}
          className={`border p-5 transition-colors ${alert.isEnabled ? 'border-white/5 bg-black/40' : 'border-white/5 bg-black/20 opacity-70'}`}
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-black uppercase tracking-tight text-white">{alert.title}</p>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${alert.isEnabled ? 'bg-red-500/15 text-red-300' : 'bg-white/5 text-slate-500'}`}>
                  {alert.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={14} />
                  {formatAlertTime(alert.hour, alert.minute)}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-300">{alert.message}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                {getReminderStatusLabel(alert, runtimeState)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void onToggle(alert.id)}
                disabled={isSaving}
                className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.24em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${alert.isEnabled ? 'bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]' : 'bg-red-600 text-white hover:bg-red-500'}`}
              >
                {alert.isEnabled ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={() => onEdit(alert)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-300 transition-colors hover:bg-white/[0.08]"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => void onDelete(alert.id)}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
