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
      <GlassCard className="border-white/8 bg-[rgba(255,255,255,0.02)] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-white/50">
          <BellOff size={22} />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">No reminders yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
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
          className={`border p-5 transition-colors ${alert.isEnabled ? 'border-white/8 bg-[rgba(255,255,255,0.02)]' : 'border-white/8 bg-[rgba(255,255,255,0.015)] opacity-75'}`}
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-semibold tracking-tight text-white">{alert.title}</p>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${alert.isEnabled ? 'bg-[rgba(240,90,61,0.12)] text-[var(--shell-brand)]' : 'bg-white/5 text-slate-500'}`}>
                  {alert.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  <Clock3 size={14} />
                  {formatAlertTime(alert.hour, alert.minute)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  {getReminderStatusLabel(alert, runtimeState)}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/80">{alert.message}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => void onToggle(alert.id)}
                disabled={isSaving}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${alert.isEnabled ? 'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]' : 'border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.1)] text-white hover:bg-[rgba(240,90,61,0.16)]'}`}
              >
                {alert.isEnabled ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={() => onEdit(alert)}
                className="soft-action w-full justify-center sm:w-auto"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => void onDelete(alert.id)}
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-brand)] transition-all duration-200 hover:scale-[1.02] hover:bg-[rgba(240,90,61,0.14)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
