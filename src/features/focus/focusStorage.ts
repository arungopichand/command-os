import type { DistractionEntry, FocusPreferences, FocusSession, FocusSessionStatus } from './focus.types';
import { sortFocusSessions } from './focusUtils';

export const DEFAULT_FOCUS_PREFERENCES: FocusPreferences = {
  isFocusModeEnabled: false,
  defaultDurationMinutes: 25,
};

export const FOCUS_STORAGE_KEYS = {
  currentSession: 'command-os-focus-current-session-v1',
  sessionHistory: 'command-os-focus-session-history-v1',
  distractionEntries: 'command-os-focus-distraction-entries-v1',
  preferences: 'command-os-focus-preferences-v1',
} as const;

const FOCUS_STORAGE_UPDATED_EVENT = 'command-os-focus-storage-updated';
const VALID_SESSION_STATUSES: FocusSessionStatus[] = ['idle', 'running', 'completed', 'cancelled'];

function isFocusSession(value: unknown): value is FocusSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<FocusSession>;
  return typeof candidate.id === 'string'
    && typeof candidate.startedAt === 'string'
    && typeof candidate.endsAt === 'string'
    && typeof candidate.durationMinutes === 'number'
    && VALID_SESSION_STATUSES.includes(candidate.status as FocusSessionStatus);
}

function isDistractionEntry(value: unknown): value is DistractionEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<DistractionEntry>;
  return typeof candidate.id === 'string'
    && typeof candidate.sessionId === 'string'
    && typeof candidate.note === 'string'
    && typeof candidate.createdAt === 'string';
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
    throw new Error(`Unable to read stored data for ${key}.`);
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

function notifyFocusStorageUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(FOCUS_STORAGE_UPDATED_EVENT));
}

export function getCurrentFocusSession(): FocusSession | null {
  const storedValue = readStoredValue(FOCUS_STORAGE_KEYS.currentSession);
  return isFocusSession(storedValue) ? storedValue : null;
}

export function saveCurrentFocusSession(session: FocusSession) {
  writeStoredValue(FOCUS_STORAGE_KEYS.currentSession, session, 'current focus session');
  notifyFocusStorageUpdated();
}

export function clearCurrentFocusSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(FOCUS_STORAGE_KEYS.currentSession);
  notifyFocusStorageUpdated();
}

export function getFocusSessions(): FocusSession[] {
  const storedValue = readStoredValue(FOCUS_STORAGE_KEYS.sessionHistory);
  if (!Array.isArray(storedValue)) {
    return [];
  }

  return sortFocusSessions(storedValue.filter(isFocusSession));
}

export function saveFocusSessions(sessions: FocusSession[]) {
  writeStoredValue(FOCUS_STORAGE_KEYS.sessionHistory, sortFocusSessions(sessions), 'focus session history');
  notifyFocusStorageUpdated();
}

export function getDistractionEntries(): DistractionEntry[] {
  const storedValue = readStoredValue(FOCUS_STORAGE_KEYS.distractionEntries);
  if (!Array.isArray(storedValue)) {
    return [];
  }

  return storedValue
    .filter(isDistractionEntry)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function saveDistractionEntries(entries: DistractionEntry[]) {
  const sortedEntries = [...entries].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  writeStoredValue(FOCUS_STORAGE_KEYS.distractionEntries, sortedEntries, 'distraction entries');
  notifyFocusStorageUpdated();
}

export function getFocusPreferences(): FocusPreferences {
  const storedValue = readStoredValue(FOCUS_STORAGE_KEYS.preferences);
  if (!storedValue || typeof storedValue !== 'object') {
    return DEFAULT_FOCUS_PREFERENCES;
  }

  const candidate = storedValue as Partial<FocusPreferences>;
  return {
    isFocusModeEnabled: typeof candidate.isFocusModeEnabled === 'boolean'
      ? candidate.isFocusModeEnabled
      : DEFAULT_FOCUS_PREFERENCES.isFocusModeEnabled,
    defaultDurationMinutes: typeof candidate.defaultDurationMinutes === 'number' && candidate.defaultDurationMinutes > 0
      ? Math.round(candidate.defaultDurationMinutes)
      : DEFAULT_FOCUS_PREFERENCES.defaultDurationMinutes,
  };
}

export function saveFocusPreferences(preferences: FocusPreferences) {
  writeStoredValue(FOCUS_STORAGE_KEYS.preferences, preferences, 'focus preferences');
  notifyFocusStorageUpdated();
}

export function subscribeToFocusStorage(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key
      && event.key !== FOCUS_STORAGE_KEYS.currentSession
      && event.key !== FOCUS_STORAGE_KEYS.sessionHistory
      && event.key !== FOCUS_STORAGE_KEYS.distractionEntries
      && event.key !== FOCUS_STORAGE_KEYS.preferences
    ) {
      return;
    }

    onChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(FOCUS_STORAGE_UPDATED_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(FOCUS_STORAGE_UPDATED_EVENT, onChange);
  };
}
