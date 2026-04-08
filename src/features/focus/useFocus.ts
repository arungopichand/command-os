import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateUUID } from '../../utils/uuid';
import type { DistractionEntry, FocusPreferences, FocusSession, FocusSummary } from './focus.types';
import {
  clearCurrentFocusSession,
  DEFAULT_FOCUS_PREFERENCES,
  getCurrentFocusSession,
  getDistractionEntries,
  getFocusPreferences,
  getFocusSessions,
  saveCurrentFocusSession,
  saveDistractionEntries,
  saveFocusPreferences,
  saveFocusSessions,
  subscribeToFocusStorage,
} from './focusStorage';
import {
  getFocusSummary,
  getMostRecentFocusSession,
  getRemainingSeconds,
  reconcileRestoredSession,
  upsertFocusSession,
} from './focusUtils';

interface FocusSnapshot {
  currentSession: FocusSession | null;
  sessions: FocusSession[];
  entries: DistractionEntry[];
  preferences: FocusPreferences;
}

interface FocusHookState extends FocusSnapshot {
  loading: boolean;
  error: string | null;
}

export interface UseFocusResult {
  currentSession: FocusSession | null;
  recentSession: FocusSession | null;
  distractionEntries: DistractionEntry[];
  currentDistractionNote: string;
  remainingSeconds: number;
  isFocusModeEnabled: boolean;
  defaultDurationMinutes: number;
  summary: FocusSummary;
  loading: boolean;
  error: string | null;
  startSession: (durationMinutes?: number) => Promise<void>;
  cancelSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  toggleFocusMode: () => void;
  saveDistractionNote: (note: string) => Promise<void>;
  refresh: () => void;
}

function formatError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function areSessionsEqual(left: FocusSession[], right: FocusSession[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((session, index) => {
    const comparison = right[index];
    return comparison
      && session.id === comparison.id
      && session.startedAt === comparison.startedAt
      && session.endsAt === comparison.endsAt
      && session.durationMinutes === comparison.durationMinutes
      && session.status === comparison.status;
  });
}

function buildFocusSnapshot(): FocusSnapshot {
  const currentSession = getCurrentFocusSession();
  const sessions = getFocusSessions();
  const entries = getDistractionEntries();
  const preferences = getFocusPreferences();

  if (!currentSession) {
    return {
      currentSession: null,
      sessions,
      entries,
      preferences,
    };
  }

  const restoredSession = reconcileRestoredSession(currentSession);
  const nextSessions = upsertFocusSession(sessions, restoredSession);
  const sessionsChanged = !areSessionsEqual(sessions, nextSessions);

  if (restoredSession.status === 'running') {
    if (sessionsChanged) {
      saveFocusSessions(nextSessions);
    }

    return {
      currentSession: restoredSession,
      sessions: nextSessions,
      entries,
      preferences,
    };
  }

  if (sessionsChanged) {
    saveFocusSessions(nextSessions);
  }
  clearCurrentFocusSession();

  return {
    currentSession: null,
    sessions: nextSessions,
    entries,
    preferences,
  };
}

export function useFocus(): UseFocusResult {
  const [state, setState] = useState<FocusHookState>({
    currentSession: null,
    sessions: [],
    entries: [],
    preferences: DEFAULT_FOCUS_PREFERENCES,
    loading: true,
    error: null,
  });
  const [now, setNow] = useState(() => new Date());

  const refresh = useCallback(() => {
    try {
      const snapshot = buildFocusSnapshot();
      setState((currentState) => ({
        ...currentState,
        ...snapshot,
        loading: false,
        error: null,
      }));
      setNow(new Date());
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        currentSession: null,
        sessions: [],
        entries: [],
        preferences: DEFAULT_FOCUS_PREFERENCES,
        loading: false,
        error: formatError(error, 'Unable to load focus data.'),
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToFocusStorage(refresh);
  }, [refresh]);

  useEffect(() => {
    if (!state.currentSession || state.currentSession.status !== 'running') {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const storedSession = getCurrentFocusSession();
      if (!storedSession) {
        refresh();
        return;
      }

      const restoredSession = reconcileRestoredSession(storedSession);
      if (restoredSession.status !== 'running') {
        saveFocusSessions(upsertFocusSession(getFocusSessions(), restoredSession));
        clearCurrentFocusSession();
        refresh();
        return;
      }

      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [refresh, state.currentSession]);

  const startSession = useCallback(async (durationMinutes?: number) => {
    try {
      const existingSession = getCurrentFocusSession();
      if (existingSession && reconcileRestoredSession(existingSession).status === 'running') {
        throw new Error('A focus session is already running.');
      }

      const resolvedDuration = Math.max(
        1,
        Math.round(durationMinutes ?? getFocusPreferences().defaultDurationMinutes),
      );
      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + resolvedDuration * 60 * 1000);
      const nextSession: FocusSession = {
        id: generateUUID(),
        startedAt: startedAt.toISOString(),
        endsAt: endsAt.toISOString(),
        durationMinutes: resolvedDuration,
        status: 'running',
      };

      saveCurrentFocusSession(nextSession);
      saveFocusSessions(upsertFocusSession(getFocusSessions(), nextSession));
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: formatError(error, 'Unable to start focus session.'),
      }));
      throw error instanceof Error ? error : new Error('Unable to start focus session.');
    }
  }, [refresh]);

  const finalizeCurrentSession = useCallback(async (status: 'completed' | 'cancelled') => {
    try {
      const existingSession = getCurrentFocusSession();
      if (!existingSession) {
        return;
      }

      const nextSession: FocusSession = {
        ...existingSession,
        status,
      };

      saveFocusSessions(upsertFocusSession(getFocusSessions(), nextSession));
      clearCurrentFocusSession();
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: formatError(error, `Unable to ${status} focus session.`),
      }));
      throw error instanceof Error ? error : new Error(`Unable to ${status} focus session.`);
    }
  }, [refresh]);

  const cancelSession = useCallback(async () => finalizeCurrentSession('cancelled'), [finalizeCurrentSession]);
  const completeSession = useCallback(async () => finalizeCurrentSession('completed'), [finalizeCurrentSession]);

  const toggleFocusMode = useCallback(() => {
    try {
      const currentPreferences = getFocusPreferences();
      saveFocusPreferences({
        ...currentPreferences,
        isFocusModeEnabled: !currentPreferences.isFocusModeEnabled,
      });
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: formatError(error, 'Unable to update focus mode.'),
      }));
    }
  }, [refresh]);

  const recentSession = useMemo(
    () => getMostRecentFocusSession(state.sessions),
    [state.sessions],
  );
  const noteTargetSession = state.currentSession ?? recentSession;

  const distractionEntries = useMemo(() => (
    noteTargetSession
      ? state.entries.filter((entry) => entry.sessionId === noteTargetSession.id)
      : []
  ), [noteTargetSession, state.entries]);

  const currentDistractionNote = distractionEntries[0]?.note ?? '';

  const saveDistractionNote = useCallback(async (note: string) => {
    if (!noteTargetSession) {
      return;
    }

    try {
      const existingEntries = getDistractionEntries();
      const nextEntries = existingEntries.filter((entry) => entry.sessionId !== noteTargetSession.id);
      const trimmedNote = note.trim();

      if (trimmedNote.length > 0) {
        nextEntries.unshift({
          id: noteTargetSession.id,
          sessionId: noteTargetSession.id,
          note,
          createdAt: existingEntries.find((entry) => entry.sessionId === noteTargetSession.id)?.createdAt ?? new Date().toISOString(),
        });
      }

      saveDistractionEntries(nextEntries);
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: formatError(error, 'Unable to save distraction note.'),
      }));
      throw error instanceof Error ? error : new Error('Unable to save distraction note.');
    }
  }, [noteTargetSession, refresh]);

  const remainingSeconds = state.currentSession?.status === 'running'
    ? getRemainingSeconds(state.currentSession, now)
    : 0;

  const summary = useMemo(
    () => getFocusSummary(state.sessions, state.currentSession, now),
    [now, state.currentSession, state.sessions],
  );

  return {
    currentSession: state.currentSession,
    recentSession,
    distractionEntries,
    currentDistractionNote,
    remainingSeconds,
    isFocusModeEnabled: state.preferences.isFocusModeEnabled,
    defaultDurationMinutes: state.preferences.defaultDurationMinutes,
    summary,
    loading: state.loading,
    error: state.error,
    startSession,
    cancelSession,
    completeSession,
    toggleFocusMode,
    saveDistractionNote,
    refresh,
  };
}
