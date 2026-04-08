import type { DailyEntry } from './dailyReview.types';

export function formatDailyReviewDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function sortDailyEntries(entries: DailyEntry[]): DailyEntry[] {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}
