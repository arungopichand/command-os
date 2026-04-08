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
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
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
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/60 backdrop-blur-xl">
          <LoaderCircle size={18} className="animate-spin text-[var(--shell-brand)]" />
          Loading Notifications
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Signal Desk"
        title="Make reminders useful, not noisy"
        description="Notifications are local-first and honest about their limits. This page should make permission state, reminder health, and scheduling status obvious at a glance."
        actions={
          <button
            type="button"
            onClick={() => void rescheduleAlerts()}
            className="soft-action"
          >
            <RefreshCw size={14} />
            Restore Schedules
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Permission"
          value={getPermissionTitle(permission)}
          description={getPermissionDetail(permission)}
          icon={permission === 'granted' ? ShieldCheck : BellOff}
          tone={permission === 'granted' ? 'success' : 'brand'}
          className="relative"
        />

        <MetricCard
          label="Service Worker"
          value={!serviceWorkerSupported ? 'Unsupported' : serviceWorkerRegistered ? 'Registered' : 'Pending'}
          description={
            !serviceWorkerSupported
              ? 'This browser does not support service workers for COMMAND.OS.'
              : serviceWorkerRegistered
                ? 'The app startup flow is registering the service worker successfully.'
                : 'Registration is still pending; reminder claims remain app-open only.'
          }
          icon={Workflow}
          tone={serviceWorkerRegistered ? 'success' : 'neutral'}
        />

        <MetricCard
          label="Active Reminders"
          value={activeAlertCount}
          description={
            enabledAlertCount === 0
              ? 'No enabled reminders yet.'
              : permission === 'granted'
                ? `${activeAlertCount} enabled reminder${activeAlertCount === 1 ? '' : 's'} restored while the app is open.`
                : `${enabledAlertCount} reminder${enabledAlertCount === 1 ? '' : 's'} saved locally, waiting on permission.`
          }
          icon={Bell}
          tone="warning"
        />
      </div>

      {permission === 'default' ? (
        <button
          type="button"
          onClick={() => void requestPermission()}
          disabled={isRequestingPermission}
          className="primary-action disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Bell size={14} />
          {isRequestingPermission ? 'Requesting...' : 'Request Permission'}
        </button>
      ) : null}

      {serviceWorkerError ? (
        <GlassCard className="border-amber-500/20 bg-amber-500/10 p-5">
          <p className="body-copy">{serviceWorkerError}</p>
        </GlassCard>
      ) : null}

      {error ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] p-3 text-[var(--shell-brand)]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Notifications are unavailable right now</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-100/80">{error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {!notificationsSupported ? (
        <GlassCard className="border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.08)] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] p-3 text-[var(--shell-brand)]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Browser support required</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-100/80">
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
