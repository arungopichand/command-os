import type { Habit, HabitChecklistItem, HabitLog, HabitSummary } from './habit.types';

export function formatHabitDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseHabitDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map((value) => Number(value));
  return new Date(year, month - 1, day);
}

export function sortHabits(habits: Habit[]): Habit[] {
  return [...habits].sort((left, right) => {
    const createdAtDelta = new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
    if (createdAtDelta !== 0) {
      return createdAtDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

export function isHabitCompletedOnDate(logs: HabitLog[], habitId: string, dateKey: string): boolean {
  return logs.some((log) => log.habit_id === habitId && log.date === dateKey && log.completed);
}

export function calculateHabitStreak(logs: HabitLog[], habitId: string, fromDateKey = formatHabitDate(new Date())): number {
  let streak = 0;
  const cursor = parseHabitDate(fromDateKey);

  while (isHabitCompletedOnDate(logs, habitId, formatHabitDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildTodayHabitChecklist(habits: Habit[], logs: HabitLog[], todayKey = formatHabitDate(new Date())): HabitChecklistItem[] {
  return sortHabits(habits).map((habit) => ({
    ...habit,
    completedToday: isHabitCompletedOnDate(logs, habit.id, todayKey),
    streak: calculateHabitStreak(logs, habit.id, todayKey),
  }));
}

export function calculateHabitSummary(habits: Habit[], logs: HabitLog[], todayKey = formatHabitDate(new Date())): HabitSummary {
  const totalHabits = habits.length;
  const completedToday = habits.filter((habit) => isHabitCompletedOnDate(logs, habit.id, todayKey)).length;
  const completionPercent = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);
  const longestCurrentStreak = habits.reduce(
    (highestStreak, habit) => Math.max(highestStreak, calculateHabitStreak(logs, habit.id, todayKey)),
    0,
  );
  const totalCompletions = logs.filter((log) => log.completed).length;

  return {
    totalHabits,
    completedToday,
    completionPercent,
    longestCurrentStreak,
    totalCompletions,
  };
}

export function formatStreakLabel(streak: number): string {
  if (streak === 0) {
    return 'No streak yet';
  }

  return `${streak} day${streak === 1 ? '' : 's'}`;
}
