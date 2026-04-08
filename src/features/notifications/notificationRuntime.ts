import { registerSW } from 'virtual:pwa-register';
import type {
  NotificationAlert,
  NotificationPermissionState,
  NotificationRuntimeState,
} from './notification.types';
import {
  getAlerts,
  getNotificationState,
  saveNotificationState,
  subscribeToNotificationStorage,
} from './notificationStorage';
import {
  canDeliverAlerts,
  computeNextReminderTime,
  getBrowserNotificationPermission,
  isNotificationsSupported,
  isServiceWorkerSupported,
} from './notificationUtils';

type NotificationRuntimeListener = () => void;

const runtimeListeners = new Set<NotificationRuntimeListener>();
const scheduledTimers = new Map<string, number>();

let initialized = false;
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
let runtimeSnapshot: NotificationRuntimeState = {
  ...getNotificationState(),
  notificationsSupported: isNotificationsSupported(),
  serviceWorkerSupported: isServiceWorkerSupported(),
  serviceWorkerError: null,
};

function emitRuntimeUpdate() {
  runtimeListeners.forEach((listener) => listener());
}

function formatRuntimeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function persistRuntimeSnapshot() {
  const currentState = getNotificationState();
  if (
    currentState.permission === runtimeSnapshot.permission
    && currentState.serviceWorkerRegistered === runtimeSnapshot.serviceWorkerRegistered
  ) {
    return;
  }

  saveNotificationState({
    permission: runtimeSnapshot.permission,
    serviceWorkerRegistered: runtimeSnapshot.serviceWorkerRegistered,
  });
}

function setRuntimeSnapshot(updates: Partial<NotificationRuntimeState>) {
  runtimeSnapshot = {
    ...runtimeSnapshot,
    ...updates,
  };

  persistRuntimeSnapshot();
  emitRuntimeUpdate();
}

function syncBrowserNotificationState() {
  setRuntimeSnapshot({
    permission: getBrowserNotificationPermission(),
    notificationsSupported: isNotificationsSupported(),
    serviceWorkerSupported: isServiceWorkerSupported(),
  });
}

function clearScheduledAlerts() {
  scheduledTimers.forEach((timeoutId) => window.clearTimeout(timeoutId));
  scheduledTimers.clear();
}

async function showAlertNotification(alert: NotificationAlert) {
  const notificationOptions: NotificationOptions = {
    body: alert.message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `command-os-alert-${alert.id}`,
  };

  try {
    const registration = serviceWorkerRegistration ?? (runtimeSnapshot.serviceWorkerSupported
      ? await navigator.serviceWorker.getRegistration()
      : undefined);

    if (registration) {
      serviceWorkerRegistration = registration;
      await registration.showNotification(`COMMAND.OS - ${alert.title}`, notificationOptions);
      if (!runtimeSnapshot.serviceWorkerRegistered) {
        setRuntimeSnapshot({
          serviceWorkerRegistered: true,
          serviceWorkerError: null,
        });
      }
      return;
    }

    new Notification(`COMMAND.OS - ${alert.title}`, notificationOptions);
  } catch (error) {
    setRuntimeSnapshot({
      serviceWorkerError: formatRuntimeError(error, 'Unable to deliver browser notification.'),
    });
  }
}

function scheduleAlert(alert: NotificationAlert) {
  if (!alert.isEnabled || !canDeliverAlerts(runtimeSnapshot)) {
    return;
  }

  const nextReminder = computeNextReminderTime(alert.hour, alert.minute);
  const delay = Math.max(0, nextReminder.getTime() - Date.now());
  const timerId = window.setTimeout(() => {
    void showAlertNotification(alert).finally(() => {
      scheduledTimers.delete(alert.id);
      scheduleAlert(alert);
    });
  }, delay);

  scheduledTimers.set(alert.id, timerId);
}

function registerNotificationServiceWorker() {
  if (!runtimeSnapshot.serviceWorkerSupported) {
    setRuntimeSnapshot({
      serviceWorkerRegistered: false,
      serviceWorkerError: null,
    });
    return;
  }

  registerSW({
    immediate: true,
    onRegisteredSW: (_swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) => {
      serviceWorkerRegistration = registration ?? null;
      setRuntimeSnapshot({
        serviceWorkerRegistered: Boolean(registration),
        serviceWorkerError: registration ? null : 'Service worker registration unavailable.',
      });
      void rescheduleNotificationAlerts();
    },
    onRegisterError: (error: unknown) => {
      serviceWorkerRegistration = null;
      setRuntimeSnapshot({
        serviceWorkerRegistered: false,
        serviceWorkerError: formatRuntimeError(error, 'Unable to register the service worker.'),
      });
    },
  });
}

export function getNotificationRuntimeSnapshot(): NotificationRuntimeState {
  return runtimeSnapshot;
}

export function subscribeToNotificationRuntime(listener: NotificationRuntimeListener) {
  runtimeListeners.add(listener);

  return () => {
    runtimeListeners.delete(listener);
  };
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationsSupported()) {
    syncBrowserNotificationState();
    return runtimeSnapshot.permission;
  }

  const permission = await Notification.requestPermission();
  setRuntimeSnapshot({
    permission,
    serviceWorkerError: null,
  });
  await rescheduleNotificationAlerts();
  return permission;
}

export async function rescheduleNotificationAlerts() {
  if (typeof window === 'undefined') {
    return;
  }

  syncBrowserNotificationState();
  clearScheduledAlerts();

  getAlerts().forEach((alert) => {
    scheduleAlert(alert);
  });
}

export function initializeNotificationsRuntime() {
  if (typeof window === 'undefined') {
    return;
  }

  syncBrowserNotificationState();

  if (initialized) {
    void rescheduleNotificationAlerts();
    return;
  }

  initialized = true;
  registerNotificationServiceWorker();

  const handleEnvironmentSync = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    syncBrowserNotificationState();
    void rescheduleNotificationAlerts();
  };

  window.addEventListener('focus', handleEnvironmentSync);
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleEnvironmentSync);
  }

  subscribeToNotificationStorage(() => {
    syncBrowserNotificationState();
    void rescheduleNotificationAlerts();
  });

  void rescheduleNotificationAlerts();
}
