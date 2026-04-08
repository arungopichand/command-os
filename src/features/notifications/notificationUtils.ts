import type {
  NotificationAlert,
  NotificationPermissionState,
  NotificationRuntimeState,
} from './notification.types';

function padTimeUnit(value: number): string {
  return String(value).padStart(2, '0');
}

export function isNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (!isNotificationsSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
}

export function formatAlertTime(hour: number, minute: number): string {
  return `${padTimeUnit(hour)}:${padTimeUnit(minute)}`;
}

export function parseAlertTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

export function isValidAlertTime(hour: number, minute: number): boolean {
  return Number.isInteger(hour)
    && Number.isInteger(minute)
    && hour >= 0
    && hour <= 23
    && minute >= 0
    && minute <= 59;
}

export function sortAlerts(alerts: NotificationAlert[]): NotificationAlert[] {
  return [...alerts].sort((left, right) => {
    if (left.hour !== right.hour) {
      return left.hour - right.hour;
    }

    if (left.minute !== right.minute) {
      return left.minute - right.minute;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

export function computeNextReminderTime(
  hour: number,
  minute: number,
  now = new Date(),
): Date {
  const nextReminder = new Date(now);
  nextReminder.setHours(hour, minute, 0, 0);

  if (nextReminder.getTime() <= now.getTime()) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  return nextReminder;
}

export function getReminderStatusLabel(
  alert: NotificationAlert,
  runtimeState: NotificationRuntimeState,
  now = new Date(),
): string {
  if (!alert.isEnabled) {
    return 'Disabled';
  }

  if (!runtimeState.notificationsSupported) {
    return 'Notifications unsupported in this browser';
  }

  if (runtimeState.permission === 'denied') {
    return 'Inactive until browser permission is re-enabled';
  }

  if (runtimeState.permission !== 'granted') {
    return 'Saved locally until permission is granted';
  }

  const nextReminder = computeNextReminderTime(alert.hour, alert.minute, now);
  const nextTime = formatAlertTime(nextReminder.getHours(), nextReminder.getMinutes());
  const nextDayLabel = nextReminder.toDateString() === now.toDateString() ? 'Today' : 'Tomorrow';

  if (!runtimeState.serviceWorkerRegistered) {
    return `${nextDayLabel} at ${nextTime}; service worker unavailable, app-open delivery only`;
  }

  return `${nextDayLabel} at ${nextTime} while COMMAND.OS stays open`;
}

export function canDeliverAlerts(runtimeState: NotificationRuntimeState): boolean {
  return runtimeState.notificationsSupported && runtimeState.permission === 'granted';
}
