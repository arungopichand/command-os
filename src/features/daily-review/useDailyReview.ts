import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getEntries,
  getTodayEntry,
  saveTodayEntry,
  subscribeToDailyReviewStorage,
} from './dailyReviewStorage';
import type { DailyEntry } from './dailyReview.types';
import { formatDailyReviewDate } from './dailyReviewUtils';

type SaveStatus = 'idle' | 'saving' | 'saved';

interface DailyReviewState {
  entries: DailyEntry[];
  loading: boolean;
  error: string | null;
}

export interface UseDailyReviewResult {
  todayEntry: DailyEntry | null;
  historyEntries: DailyEntry[];
  noteValue: string;
  loading: boolean;
  error: string | null;
  saveStatus: SaveStatus;
  saveEntry: (note: string) => void;
  refresh: () => void;
}

function formatError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useDailyReview(): UseDailyReviewResult {
  const [state, setState] = useState<DailyReviewState>({
    entries: [],
    loading: true,
    error: null,
  });
  const [noteValue, setNoteValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const lastSavedNoteRef = useRef('');

  const refresh = useCallback(() => {
    try {
      const entries = getEntries();
      const todayEntry = getTodayEntry();
      const nextNote = todayEntry?.note ?? '';

      lastSavedNoteRef.current = nextNote;
      setState({
        entries,
        loading: false,
        error: null,
      });
      setNoteValue(nextNote);
      setSaveStatus('idle');
    } catch (error) {
      setState({
        entries: [],
        loading: false,
        error: formatError(error, 'Unable to load daily review data.'),
      });
      setNoteValue('');
      setSaveStatus('idle');
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToDailyReviewStorage(refresh);
  }, [refresh]);

  useEffect(() => {
    if (state.loading) {
      return undefined;
    }

    if (noteValue === lastSavedNoteRef.current) {
      return undefined;
    }

    setSaveStatus('saving');

    const timeout = window.setTimeout(() => {
      try {
        const savedEntry = saveTodayEntry(noteValue, formatDailyReviewDate(new Date()));
        const nextNote = savedEntry?.note ?? '';

        lastSavedNoteRef.current = nextNote;
        setState({
          entries: getEntries(),
          loading: false,
          error: null,
        });
        setSaveStatus('saved');
      } catch (error) {
        setState((currentState) => ({
          ...currentState,
          error: formatError(error, 'Unable to save daily review entry.'),
        }));
        setSaveStatus('idle');
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [noteValue, state.loading]);

  useEffect(() => {
    if (saveStatus !== 'saved') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSaveStatus('idle');
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [saveStatus]);

  const todayKey = formatDailyReviewDate(new Date());
  const todayEntry = useMemo(
    () => state.entries.find((entry) => entry.date === todayKey) ?? null,
    [state.entries, todayKey],
  );
  const historyEntries = useMemo(
    () => state.entries.filter((entry) => entry.date !== todayKey),
    [state.entries, todayKey],
  );

  const saveEntry = useCallback((note: string) => {
    setState((currentState) => ({
      ...currentState,
      error: null,
    }));
    setNoteValue(note);
  }, []);

  return {
    todayEntry,
    historyEntries,
    noteValue,
    loading: state.loading,
    error: state.error,
    saveStatus,
    saveEntry,
    refresh,
  };
}
