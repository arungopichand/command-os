import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateUUID } from '../../utils/uuid';
import { getHabits, getLogs, saveHabits, saveLogs, subscribeToHabitStorage } from './habitStorage';
import type { Habit, HabitChecklistItem, HabitLog, HabitSummary } from './habit.types';
import { buildTodayHabitChecklist, calculateHabitSummary, formatHabitDate } from './habitUtils';

interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  pendingHabitIds: string[];
}

export interface UseHabitsResult {
  habits: Habit[];
  logs: HabitLog[];
  todayChecklist: HabitChecklistItem[];
  summary: HabitSummary;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  pendingHabitIds: string[];
  createHabit: (name: string) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  refresh: () => void;
}

function formatError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function loadHabitsSnapshot() {
  return {
    habits: getHabits(),
    logs: getLogs(),
  };
}

export function useHabits(): UseHabitsResult {
  const [state, setState] = useState<HabitsState>({
    habits: [],
    logs: [],
    isLoading: true,
    error: null,
    isCreating: false,
    pendingHabitIds: [],
  });

  const refresh = useCallback(() => {
    try {
      const snapshot = loadHabitsSnapshot();
      setState((currentState) => ({
        ...currentState,
        ...snapshot,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        habits: [],
        logs: [],
        isLoading: false,
        error: formatError(error, 'Unable to load habits.'),
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToHabitStorage(refresh);
  }, [refresh]);

  const createHabit = useCallback(async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      const errorMessage = 'Habit name is required.';
      setState((currentState) => ({
        ...currentState,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }

    setState((currentState) => ({
      ...currentState,
      isCreating: true,
      error: null,
    }));

    try {
      const nextHabit: Habit = {
        id: generateUUID(),
        name: trimmedName,
        created_at: new Date().toISOString(),
      };

      saveHabits([...getHabits(), nextHabit]);

      setState((currentState) => ({
        ...currentState,
        isCreating: false,
      }));
    } catch (error) {
      const errorMessage = formatError(error, 'Unable to create habit.');
      setState((currentState) => ({
        ...currentState,
        isCreating: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const toggleHabit = useCallback(async (habitId: string) => {
    setState((currentState) => ({
      ...currentState,
      pendingHabitIds: [...currentState.pendingHabitIds, habitId],
      error: null,
    }));

    try {
      const habits = getHabits();
      const habitExists = habits.some((habit) => habit.id === habitId);
      if (!habitExists) {
        throw new Error('Habit not found.');
      }

      const todayKey = formatHabitDate(new Date());
      const logs = getLogs();
      const existingLogIndex = logs.findIndex((log) => log.habit_id === habitId && log.date === todayKey);
      const nextLogs = existingLogIndex === -1
        ? [...logs, { habit_id: habitId, date: todayKey, completed: true }]
        : logs.map((log, index) => (
            index === existingLogIndex
              ? { ...log, completed: !log.completed }
              : log
          ));

      saveLogs(nextLogs);

      setState((currentState) => ({
        ...currentState,
        pendingHabitIds: currentState.pendingHabitIds.filter((id) => id !== habitId),
      }));
    } catch (error) {
      const errorMessage = formatError(error, 'Unable to update habit.');
      setState((currentState) => ({
        ...currentState,
        pendingHabitIds: currentState.pendingHabitIds.filter((id) => id !== habitId),
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const todayKey = formatHabitDate(new Date());
  const todayChecklist = useMemo(
    () => buildTodayHabitChecklist(state.habits, state.logs, todayKey),
    [state.habits, state.logs, todayKey],
  );
  const summary = useMemo(
    () => calculateHabitSummary(state.habits, state.logs, todayKey),
    [state.habits, state.logs, todayKey],
  );

  return {
    habits: state.habits,
    logs: state.logs,
    todayChecklist,
    summary,
    isLoading: state.isLoading,
    error: state.error,
    isCreating: state.isCreating,
    pendingHabitIds: state.pendingHabitIds,
    createHabit,
    toggleHabit,
    refresh,
  };
}
