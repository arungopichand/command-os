export interface Habit {
  id: string;
  name: string;
  created_at: string;
}

export interface HabitLog {
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface HabitChecklistItem extends Habit {
  completedToday: boolean;
  streak: number;
}

export interface HabitSummary {
  totalHabits: number;
  completedToday: number;
  completionPercent: number;
  longestCurrentStreak: number;
  totalCompletions: number;
}
