import { useEffect, useMemo, useState } from 'react';
import { GoalStatus } from '../goals/goal.types';
import { useFocus } from '../focus/useFocus';
import { formatRemainingTime } from '../focus/focusUtils';
import { useGoals } from '../goals/useGoals';
import { useHabits } from '../habits/useHabits';
import { getTodayEntry, subscribeToDailyReviewStorage } from '../daily-review/dailyReviewStorage';
import { useNotifications } from '../notifications/useNotifications';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useWidgetStore } from '../../store/useWidgetStore';

type SectorMetricStatus = 'ready' | 'empty' | 'loading' | 'error';

interface GoalSessionState {
  userId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LocalDashboardState {
  journalHasEntry: boolean;
  journalError: string | null;
}

export interface CommandCenterSectorMetric {
  status: SectorMetricStatus;
  label: string;
}

interface CommandCenterSummary {
  missionLabel: string;
  uplinkStatus: string;
  uplinkDetail: string;
  readyCount: number;
  emptyCount: number;
  loadingCount: number;
  errorCount: number;
}

export interface CommandCenterMetrics {
  sectors: Record<string, CommandCenterSectorMetric>;
  summary: CommandCenterSummary;
}

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function readLocalDashboardState(): LocalDashboardState {
  let journalHasEntry = false;
  let journalError: string | null = null;

  try {
    journalHasEntry = Boolean(getTodayEntry()?.note.trim());
  } catch {
    journalError = 'Unable to load today\'s review.';
  }

  return {
    journalHasEntry,
    journalError,
  };
}

export function useCommandCenterMetrics(): CommandCenterMetrics {
  const { totalXP } = useAppStore();
  const { tabs } = useWidgetStore();
  const habits = useHabits();
  const focus = useFocus();
  const notifications = useNotifications();
  const [sessionState, setSessionState] = useState<GoalSessionState>(() => (
    supabase
      ? {
          userId: null,
          isLoading: true,
          error: null,
        }
      : {
          userId: null,
          isLoading: false,
          error: 'Supabase client is not configured.',
        }
  ));
  const [localDashboardState, setLocalDashboardState] = useState<LocalDashboardState>(() => readLocalDashboardState());

  useEffect(() => {
    const refreshLocalDashboardState = () => {
      setLocalDashboardState(readLocalDashboardState());
    };

    refreshLocalDashboardState();
    window.addEventListener('focus', refreshLocalDashboardState);
    const unsubscribeDailyReview = subscribeToDailyReviewStorage(refreshLocalDashboardState);

    return () => {
      window.removeEventListener('focus', refreshLocalDashboardState);
      unsubscribeDailyReview();
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }
    const authClient = client.auth;

    let isMounted = true;

    async function syncSessionUser() {
      const { data, error } = await authClient.getUser();
      if (!isMounted) {
        return;
      }

      if (error) {
        setSessionState({
          userId: null,
          isLoading: false,
          error: error.message,
        });
        return;
      }

      setSessionState({
        userId: data.user?.id ?? null,
        isLoading: false,
        error: null,
      });
    }

    void syncSessionUser();

    const {
      data: { subscription },
    } = authClient.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setSessionState({
        userId: session?.user?.id ?? null,
        isLoading: false,
        error: null,
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const goalsQuery = useGoals(sessionState.userId);

  return useMemo(() => {
    const commandWidgets = tabs.command?.widgets ?? [];
    const totalWidgets = Object.values(tabs).reduce((sum, tab) => sum + tab.widgets.length, 0);
    const visibleWidgets = Object.values(tabs).reduce(
      (sum, tab) => sum + tab.widgets.filter((widget) => widget.visible).length,
      0,
    );
    const visibleCommandWidgets = commandWidgets.filter((widget) => widget.visible).length;

    const totalHabits = habits.summary.totalHabits;
    const completedHabitsToday = habits.summary.completedToday;
    const habitStreak = habits.summary.longestCurrentStreak;

    const goals = goalsQuery.data ?? [];
    const activeGoalCount = goals.filter((goal) => goal.status === GoalStatus.Active).length;
    const pausedGoalCount = goals.filter((goal) => goal.status === GoalStatus.Paused).length;
    const completedGoalCount = goals.filter((goal) => goal.status === GoalStatus.Completed).length;

    const sectors: Record<string, CommandCenterSectorMetric> = {
      command: commandWidgets.length === 0
        ? { status: 'empty', label: 'No widgets configured' }
        : visibleCommandWidgets === 0
          ? { status: 'empty', label: 'No widgets active' }
          : { status: 'ready', label: `${visibleCommandWidgets} of ${commandWidgets.length} widgets active` },
      market: { status: 'empty', label: 'No data yet' },
      physical: { status: 'empty', label: 'No data yet' },
      english: { status: 'empty', label: 'No data yet' },
      habits: habits.isLoading
        ? { status: 'loading', label: 'Loading habits' }
        : habits.error
          ? { status: 'error', label: 'Unable to load habits' }
          : totalHabits === 0
            ? { status: 'empty', label: 'No habits yet' }
            : habitStreak > 0
              ? { status: 'ready', label: `${habitStreak}-day streak active` }
              : { status: 'ready', label: `${completedHabitsToday}/${totalHabits} complete today` },
      focus: focus.loading
        ? { status: 'loading', label: 'Restoring focus state' }
        : focus.error
          ? { status: 'error', label: 'Unable to load focus' }
          : focus.currentSession
            ? { status: 'ready', label: `${formatRemainingTime(focus.remainingSeconds)} left in session` }
            : focus.summary.todayCompletedSessions > 0
              ? { status: 'ready', label: `${pluralize(focus.summary.todayCompletedSessions, 'session')} complete today` }
              : focus.isFocusModeEnabled
                ? { status: 'ready', label: 'Focus mode enabled' }
                : { status: 'empty', label: 'No focus session yet' },
      goals: sessionState.isLoading
        ? { status: 'loading', label: 'Resolving session' }
        : sessionState.error
          ? { status: 'error', label: 'Session unavailable' }
          : goalsQuery.isLoading || goalsQuery.isFetching
            ? { status: 'loading', label: 'Loading goals' }
            : goalsQuery.isError
              ? { status: 'error', label: 'Unable to load goals' }
              : goals.length === 0
                ? { status: 'empty', label: 'No goals yet' }
                : activeGoalCount > 0
                  ? { status: 'ready', label: `${pluralize(activeGoalCount, 'active goal')}` }
                  : pausedGoalCount > 0
                    ? { status: 'ready', label: `${pluralize(pausedGoalCount, 'paused goal')}` }
                  : { status: 'ready', label: `${pluralize(completedGoalCount, 'completed goal')}` },
      journal: localDashboardState.journalError
        ? { status: 'error', label: 'Unable to load today\'s review' }
        : localDashboardState.journalHasEntry
          ? { status: 'ready', label: 'Reviewed today' }
          : { status: 'empty', label: 'No entry yet' },
      settings: totalWidgets === 0
        ? { status: 'empty', label: 'No widgets configured' }
        : visibleWidgets === totalWidgets
          ? { status: 'ready', label: `All ${totalWidgets} widgets visible` }
          : { status: 'ready', label: `${visibleWidgets} visible, ${totalWidgets - visibleWidgets} hidden` },
      notifications: notifications.loading
        ? { status: 'loading', label: 'Loading alerts' }
        : notifications.error
        ? { status: 'error', label: 'Unable to load alerts' }
        : !notifications.notificationsSupported
          ? { status: 'error', label: 'Notifications unsupported' }
          : notifications.permission === 'denied'
            ? { status: 'empty', label: 'Permission denied' }
            : notifications.permission !== 'granted'
              ? { status: 'empty', label: 'Permission required' }
              : notifications.alerts.length === 0
              ? { status: 'empty', label: 'No alerts yet' }
              : notifications.enabledAlertCount === 0
                ? { status: 'empty', label: 'No alerts enabled' }
                : notifications.serviceWorkerRegistered
                  ? { status: 'ready', label: `${pluralize(notifications.enabledAlertCount, 'alert')} active` }
                  : { status: 'ready', label: `${pluralize(notifications.enabledAlertCount, 'alert')} ready while open` },
    };

    const sectorMetrics = Object.values(sectors);
    const readyCount = sectorMetrics.filter((sector) => sector.status === 'ready').length;
    const emptyCount = sectorMetrics.filter((sector) => sector.status === 'empty').length;
    const loadingCount = sectorMetrics.filter((sector) => sector.status === 'loading').length;
    const errorCount = sectorMetrics.filter((sector) => sector.status === 'error').length;

    const missionLabel = sessionState.isLoading || goalsQuery.isLoading
      ? 'Syncing dashboard state'
      : goalsQuery.isError || sessionState.error
        ? 'Goals need attention'
        : activeGoalCount > 0
          ? `${pluralize(activeGoalCount, 'active goal')} in motion`
        : pausedGoalCount > 0
          ? `${pluralize(pausedGoalCount, 'paused goal')} queued`
          : totalHabits > 0
            ? `${completedHabitsToday}/${totalHabits} habits complete today`
            : focus.summary.todayFocusMinutes > 0
              ? `${focus.summary.todayFocusMinutes} focus minutes logged`
              : localDashboardState.journalHasEntry
                ? 'Reviewed today'
              : totalXP > 0
                ? `${totalXP} XP recorded`
                : 'No tracked activity yet';

    const uplinkStatus = errorCount > 0
      ? 'Needs Attention'
      : loadingCount > 0
        ? 'Syncing'
        : readyCount > 0
          ? 'Live State'
          : 'No Data Yet';

    const uplinkDetail = errorCount > 0
      ? `${pluralize(errorCount, 'sector')} reporting errors`
      : loadingCount > 0
        ? `${pluralize(loadingCount, 'sector')} still loading`
        : readyCount > 0
          ? `${pluralize(readyCount, 'sector')} reporting real data`
          : 'Start with goals, habits, focus, journal, or alerts';

    return {
      sectors,
      summary: {
        missionLabel,
        uplinkStatus,
        uplinkDetail,
        readyCount,
        emptyCount,
        loadingCount,
        errorCount,
      },
    };
  }, [
    goalsQuery.data,
    goalsQuery.isError,
    goalsQuery.isFetching,
    goalsQuery.isLoading,
    habits.error,
    habits.isLoading,
    habits.summary.completedToday,
    habits.summary.longestCurrentStreak,
    habits.summary.totalHabits,
    focus.currentSession,
    focus.error,
    focus.isFocusModeEnabled,
    focus.loading,
    focus.remainingSeconds,
    focus.summary.todayCompletedSessions,
    focus.summary.todayFocusMinutes,
    localDashboardState,
    notifications.alerts.length,
    notifications.enabledAlertCount,
    notifications.error,
    notifications.loading,
    notifications.notificationsSupported,
    notifications.permission,
    notifications.serviceWorkerRegistered,
    sessionState.error,
    sessionState.isLoading,
    tabs,
    totalXP,
  ]);
}
