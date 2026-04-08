import { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { NotificationAlertForm } from './NotificationAlertForm';
import { NotificationAlertList } from './NotificationAlertList';
import type {
  NotificationAlert,
  NotificationAlertDraft,
  NotificationPermissionState,
} from './notification.types';
import { useNotifications } from './useNotifications';

function getPermissionTitle(permission: NotificationPermissionState) {
  switch (permission) {
    case 'granted':
      return 'Permission Granted';
    case 'denied':
      return 'Permission Denied';
    case 'unsupported':
      return 'Not Supported';
    default:
      return 'Permission Required';
  }
}

function getPermissionDetail(permission: NotificationPermissionState) {
  switch (permission) {
    case 'granted':
      return 'Browser notifications are available to COMMAND.OS on this device.';
    case 'denied':
      return 'Reminders are saved locally, but delivery stays inactive until permission is re-enabled in browser settings.';
    case 'unsupported':
      return 'This browser does not expose the Notification API required for reminder delivery.';
    default:
      return 'Grant permission to activate daily reminder delivery while COMMAND.OS is open.';
  }
}

export function Notifications() {
  const {
    alerts,
    permission,
    notificationsSupported,
    serviceWorkerSupported,
    serviceWorkerRegistered,
    serviceWorkerError,
    loading,
    error,
    isSaving,
    isRequestingPermission,
    enabledAlertCount,
    activeAlertCount,
    requestPermission,
    addAlert,
    editAlert,
    toggleAlert,
    removeAlert,
    rescheduleAlerts,
  } = useNotifications();
  const [editingAlert, setEditingAlert] = useState<NotificationAlert | null>(null);

  async function handleSubmit(draft: NotificationAlertDraft) {
    if (editingAlert) {
      await editAlert(editingAlert.id, draft);
      setEditingAlert(null);
      return;
    }

    await addAlert(draft);
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-400">
          <LoaderCircle size={18} className="animate-spin text-red-500" />
          Loading Notifications
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/70">Signal Desk</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">Notifications</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
            Reminders are local-first. They restore on app load and fire while COMMAND.OS stays open after browser permission is granted.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void rescheduleAlerts()}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-200 transition-colors hover:bg-white/[0.08]"
        >
          <RefreshCw size={14} />
          Restore Schedules
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Permission</p>
          <div className="mt-3 flex items-center gap-3">
            {permission === 'granted' ? (
              <ShieldCheck size={20} className="text-emerald-400" />
            ) : (
              <BellOff size={20} className="text-red-400" />
            )}
            <p className="text-2xl font-black text-white">{getPermissionTitle(permission)}</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{getPermissionDetail(permission)}</p>
          {permission === 'default' ? (
            <button
              type="button"
              onClick={() => void requestPermission()}
              disabled={isRequestingPermission}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Bell size={14} />
              {isRequestingPermission ? 'Requesting...' : 'Request Permission'}
            </button>
          ) : null}
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Service Worker</p>
          <div className="mt-3 flex items-center gap-3">
            <Workflow size={20} className={serviceWorkerRegistered ? 'text-emerald-400' : 'text-slate-500'} />
            <p className="text-2xl font-black text-white">
              {!serviceWorkerSupported
                ? 'Unsupported'
                : serviceWorkerRegistered
                  ? 'Registered'
                  : 'Pending'}
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {!serviceWorkerSupported
              ? 'This browser does not support service workers for COMMAND.OS.'
              : serviceWorkerRegistered
                ? 'The app startup flow is registering the service worker successfully.'
                : 'The app is attempting registration. Reminder delivery still only claims app-open behavior.'}
          </p>
        </GlassCard>

        <GlassCard className="border-white/5 bg-black/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Active Reminders</p>
          <p className="mt-3 text-3xl font-black text-white">{activeAlertCount}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {enabledAlertCount === 0
              ? 'No enabled reminders yet.'
              : permission === 'granted'
                ? `${activeAlertCount} enabled reminder${activeAlertCount === 1 ? '' : 's'} restored while the app is open.`
                : `${enabledAlertCount} reminder${enabledAlertCount === 1 ? '' : 's'} saved locally, waiting on permission.`}
          </p>
        </GlassCard>
      </div>

      {serviceWorkerError ? (
        <GlassCard className="border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-sm leading-relaxed text-amber-100/85">{serviceWorkerError}</p>
        </GlassCard>
      ) : null}

      {error ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Notifications Unavailable</h2>
              <p className="mt-3 text-sm leading-relaxed text-red-200/80">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {!notificationsSupported ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Browser Support Required</h2>
              <p className="mt-3 text-sm leading-relaxed text-red-200/80">
                This environment does not support browser notifications. You can still review reminders here, but delivery will stay inactive.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {permission === 'granted' && enabledAlertCount > 0 ? (
        <GlassCard className="border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5 text-emerald-400" />
            <p className="text-sm leading-relaxed text-emerald-100/85">
              Daily reminders are restored from local storage when the app loads. Delivery is designed for the app-open case and is not presented as guaranteed background push.
            </p>
          </div>
        </GlassCard>
      ) : null}

      <NotificationAlertForm
        key={editingAlert?.id ?? 'new-reminder'}
        editingAlert={editingAlert}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditingAlert(null)}
      />

      <NotificationAlertList
        alerts={alerts}
        runtimeState={{
          permission,
          notificationsSupported,
          serviceWorkerSupported,
          serviceWorkerRegistered,
          serviceWorkerError,
        }}
        isSaving={isSaving}
        onEdit={setEditingAlert}
        onToggle={toggleAlert}
        onDelete={removeAlert}
      />
    </div>
  );
}
