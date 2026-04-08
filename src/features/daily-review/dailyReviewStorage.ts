import type { DailyEntry } from './dailyReview.types';
import { formatDailyReviewDate, sortDailyEntries } from './dailyReviewUtils';

export const DAILY_REVIEW_STORAGE_KEYS = {
  entries: 'command-os-daily-review-entries-v1',
} as const;

const DAILY_REVIEW_UPDATED_EVENT = 'command-os-daily-review-updated';

function isDailyEntry(value: unknown): value is DailyEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<DailyEntry>;
  return typeof candidate.date === 'string'
    && typeof candidate.note === 'string'
    && typeof candidate.created_at === 'string'
    && typeof candidate.updated_at === 'string';
}

function notifyDailyReviewUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(DAILY_REVIEW_UPDATED_EVENT));
}

export function getEntries(): DailyEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(DAILY_REVIEW_STORAGE_KEYS.entries);
  if (!rawValue) {
    return [];
  }

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    throw new Error('Unable to read stored daily review entries.');
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return sortDailyEntries(parsedValue.filter(isDailyEntry));
}

export function saveEntries(entries: DailyEntry[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      DAILY_REVIEW_STORAGE_KEYS.entries,
      JSON.stringify(sortDailyEntries(entries)),
    );
  } catch {
    throw new Error('Unable to save daily review entries.');
  }

  notifyDailyReviewUpdated();
}

export function getTodayEntry(todayKey = formatDailyReviewDate(new Date())): DailyEntry | null {
  return getEntries().find((entry) => entry.date === todayKey) ?? null;
}

export function saveTodayEntry(note: string, todayKey = formatDailyReviewDate(new Date())): DailyEntry | null {
  const existingEntries = getEntries();
  const existingEntry = existingEntries.find((entry) => entry.date === todayKey) ?? null;
  const trimmedNote = note.trim();

  if (trimmedNote.length === 0) {
    saveEntries(existingEntries.filter((entry) => entry.date !== todayKey));
    return null;
  }

  const timestamp = new Date().toISOString();
  const nextEntry: DailyEntry = {
    date: todayKey,
    note,
    created_at: existingEntry?.created_at ?? timestamp,
    updated_at: timestamp,
  };

  saveEntries([
    nextEntry,
    ...existingEntries.filter((entry) => entry.date !== todayKey),
  ]);

  return nextEntry;
}

export function subscribeToDailyReviewStorage(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== DAILY_REVIEW_STORAGE_KEYS.entries) {
      return;
    }

    onChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(DAILY_REVIEW_UPDATED_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(DAILY_REVIEW_UPDATED_EVENT, onChange);
  };
}
