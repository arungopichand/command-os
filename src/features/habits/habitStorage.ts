import type { Habit, HabitLog } from './habit.types';
import { sortHabits } from './habitUtils';

export const HABIT_STORAGE_KEYS = {
  habits: 'command-os-habits-v1',
  logs: 'command-os-habit-logs-v1',
} as const;

const HABITS_STORAGE_UPDATED_EVENT = 'command-os-habits-updated';

function isHabit(value: unknown): value is Habit {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Habit>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.created_at === 'string';
}

function isHabitLog(value: unknown): value is HabitLog {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HabitLog>;
  return typeof candidate.habit_id === 'string'
    && typeof candidate.date === 'string'
    && typeof candidate.completed === 'boolean';
}

function readStoredCollection<T>(key: string, validator: (value: unknown) => value is T, label: string): T[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return [];
  }

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    throw new Error(`Unable to read stored ${label}.`);
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter(validator);
}

function saveStoredCollection<T>(key: string, value: T[], label: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(`Unable to save ${label}.`);
  }
}

function notifyHabitsUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(HABITS_STORAGE_UPDATED_EVENT));
}

function dedupeLogs(logs: HabitLog[]): HabitLog[] {
  const logMap = new Map<string, HabitLog>();

  logs.forEach((log) => {
    logMap.set(`${log.habit_id}:${log.date}`, log);
  });

  return [...logMap.values()].sort((left, right) => {
    if (left.date === right.date) {
      return left.habit_id.localeCompare(right.habit_id);
    }

    return right.date.localeCompare(left.date);
  });
}

export function getHabits(): Habit[] {
  return sortHabits(readStoredCollection(HABIT_STORAGE_KEYS.habits, isHabit, 'habits'));
}

export function saveHabits(habits: Habit[]) {
  saveStoredCollection(HABIT_STORAGE_KEYS.habits, sortHabits(habits), 'habits');
  notifyHabitsUpdated();
}

export function getLogs(): HabitLog[] {
  return dedupeLogs(readStoredCollection(HABIT_STORAGE_KEYS.logs, isHabitLog, 'habit progress'));
}

export function saveLogs(logs: HabitLog[]) {
  saveStoredCollection(HABIT_STORAGE_KEYS.logs, dedupeLogs(logs), 'habit progress');
  notifyHabitsUpdated();
}

export function subscribeToHabitStorage(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== HABIT_STORAGE_KEYS.habits && event.key !== HABIT_STORAGE_KEYS.logs) {
      return;
    }

    onChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(HABITS_STORAGE_UPDATED_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(HABITS_STORAGE_UPDATED_EVENT, onChange);
  };
}
