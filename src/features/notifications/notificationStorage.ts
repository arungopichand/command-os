import { generateUUID } from '../../utils/uuid';
import type {
  NotificationAlert,
  NotificationAlertDraft,
  NotificationState,
} from './notification.types';
import {
  getBrowserNotificationPermission,
  isValidAlertTime,
  parseAlertTime,
  sortAlerts,
} from './notificationUtils';

export const NOTIFICATION_STORAGE_KEYS = {
  alerts: 'command_notification_alerts_v2',
  state: 'command_notification_state_v1',
} as const;

const NOTIFICATIONS_STORAGE_UPDATED_EVENT = 'command-os-notifications-updated';

interface LegacyAlert {
  id: string;
  label: string;
  time: string;
  message: string;
  enabled: boolean;
}

const LEGACY_DEFAULT_ALERTS: LegacyAlert[] = [
  { id: '1', label: 'Morning Deploy', time: '07:00', message: 'War Room is open. Initiate your Build Phase.', enabled: true },
  { id: '2', label: '1H Check-In', time: '08:00', message: 'One hour in. Are you on mission?', enabled: true },
  { id: '3', label: 'Midday Recon', time: '13:00', message: 'Hydrate. Are your afternoon tasks on track?', enabled: true },
  { id: '4', label: 'English Protocol', time: '17:00', message: 'Initiate the 20-min English Lexicon session.', enabled: true },
  { id: '5', label: 'Evening Debrief', time: '20:00', message: 'Log your progress and prepare for tomorrow.', enabled: false },
  { id: '6', label: 'Sleep Protocol', time: '22:30', message: 'System shutdown. Lights off in 30 minutes.', enabled: false },
];

function notifyNotificationsUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(NOTIFICATIONS_STORAGE_UPDATED_EVENT));
}

function readStoredValue(key: string): unknown {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    throw new Error(`Unable to read stored notification data for ${key}.`);
  }
}

function writeStoredValue(key: string, value: unknown, label: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(`Unable to save ${label}.`);
  }
}

function isNotificationAlert(value: unknown): value is NotificationAlert {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<NotificationAlert>;
  return typeof candidate.id === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.message === 'string'
    && typeof candidate.hour === 'number'
    && typeof candidate.minute === 'number'
    && isValidAlertTime(candidate.hour, candidate.minute)
    && typeof candidate.isEnabled === 'boolean'
    && typeof candidate.createdAt === 'string'
    && typeof candidate.updatedAt === 'string';
}

function isLegacyAlert(value: unknown): value is LegacyAlert {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LegacyAlert>;
  return typeof candidate.id === 'string'
    && typeof candidate.label === 'string'
    && typeof candidate.time === 'string'
    && typeof candidate.message === 'string'
    && typeof candidate.enabled === 'boolean';
}

function isNotificationState(value: unknown): value is NotificationState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<NotificationState>;
  return (candidate.permission === 'default'
      || candidate.permission === 'granted'
      || candidate.permission === 'denied'
      || candidate.permission === 'unsupported')
    && typeof candidate.serviceWorkerRegistered === 'boolean';
}

function isLegacyDefaultAlerts(value: LegacyAlert[]): boolean {
  if (value.length !== LEGACY_DEFAULT_ALERTS.length) {
    return false;
  }

  return value.every((alert, index) => {
    const legacyAlert = LEGACY_DEFAULT_ALERTS[index];
    return alert.id === legacyAlert.id
      && alert.label === legacyAlert.label
      && alert.time === legacyAlert.time
      && alert.message === legacyAlert.message
      && alert.enabled === legacyAlert.enabled;
  });
}

function normalizeLegacyAlert(alert: LegacyAlert): NotificationAlert | null {
  const parsedTime = parseAlertTime(alert.time);
  if (!parsedTime) {
    return null;
  }

  const timestamp = new Date().toISOString();
  return {
    id: alert.id,
    title: alert.label,
    message: alert.message,
    hour: parsedTime.hour,
    minute: parsedTime.minute,
    isEnabled: alert.enabled,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function normalizeAlerts(value: unknown): NotificationAlert[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const currentAlerts = value.filter(isNotificationAlert);
  if (currentAlerts.length > 0) {
    return sortAlerts(currentAlerts);
  }

  const legacyAlerts = value.filter(isLegacyAlert);
  if (legacyAlerts.length === 0 || isLegacyDefaultAlerts(legacyAlerts)) {
    return [];
  }

  return sortAlerts(legacyAlerts.map(normalizeLegacyAlert).filter((alert): alert is NotificationAlert => alert !== null));
}

function validateAlertDraft(draft: NotificationAlertDraft) {
  if (!draft.title.trim()) {
    throw new Error('Reminder title is required.');
  }

  if (!draft.message.trim()) {
    throw new Error('Reminder message is required.');
  }

  if (!isValidAlertTime(draft.hour, draft.minute)) {
    throw new Error('Reminder time is invalid.');
  }
}

export function getAlerts(): NotificationAlert[] {
  return normalizeAlerts(readStoredValue(NOTIFICATION_STORAGE_KEYS.alerts));
}

export function saveAlerts(alerts: NotificationAlert[]) {
  writeStoredValue(NOTIFICATION_STORAGE_KEYS.alerts, sortAlerts(alerts), 'alerts');
  notifyNotificationsUpdated();
}

export function createAlert(draft: NotificationAlertDraft): NotificationAlert {
  validateAlertDraft(draft);
  const now = new Date().toISOString();
  const nextAlert: NotificationAlert = {
    id: generateUUID(),
    title: draft.title.trim(),
    message: draft.message.trim(),
    hour: draft.hour,
    minute: draft.minute,
    isEnabled: draft.isEnabled,
    createdAt: now,
    updatedAt: now,
  };

  saveAlerts([...getAlerts(), nextAlert]);
  return nextAlert;
}

export function updateAlert(
  alertId: string,
  updates: Partial<NotificationAlertDraft>,
): NotificationAlert {
  const alerts = getAlerts();
  const existingAlert = alerts.find((alert) => alert.id === alertId);

  if (!existingAlert) {
    throw new Error('Unable to find the alert you are trying to update.');
  }

  const nextDraft: NotificationAlertDraft = {
    title: updates.title?.trim() ?? existingAlert.title,
    message: updates.message?.trim() ?? existingAlert.message,
    hour: updates.hour ?? existingAlert.hour,
    minute: updates.minute ?? existingAlert.minute,
    isEnabled: updates.isEnabled ?? existingAlert.isEnabled,
  };
  validateAlertDraft(nextDraft);

  const nextAlert: NotificationAlert = {
    ...existingAlert,
    ...nextDraft,
    updatedAt: new Date().toISOString(),
  };

  saveAlerts(alerts.map((alert) => (alert.id === alertId ? nextAlert : alert)));
  return nextAlert;
}

export function deleteAlert(alertId: string) {
  saveAlerts(getAlerts().filter((alert) => alert.id !== alertId));
}

export function getNotificationState(): NotificationState {
  const storedValue = readStoredValue(NOTIFICATION_STORAGE_KEYS.state);
  if (isNotificationState(storedValue)) {
    return storedValue;
  }

  return {
    permission: getBrowserNotificationPermission(),
    serviceWorkerRegistered: false,
  };
}

export function saveNotificationState(state: NotificationState) {
  writeStoredValue(NOTIFICATION_STORAGE_KEYS.state, state, 'notification state');
  notifyNotificationsUpdated();
}

export function subscribeToNotificationStorage(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key
      && event.key !== NOTIFICATION_STORAGE_KEYS.alerts
      && event.key !== NOTIFICATION_STORAGE_KEYS.state
    ) {
      return;
    }

    onChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(NOTIFICATIONS_STORAGE_UPDATED_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(NOTIFICATIONS_STORAGE_UPDATED_EVENT, onChange);
  };
}
