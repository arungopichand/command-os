import type { FocusSession, FocusSummary } from './focus.types';

export function formatFocusDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseFocusDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function sortFocusSessions(sessions: FocusSession[]): FocusSession[] {
  return [...sessions].sort(
    (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime(),
  );
}

export function getRemainingSeconds(session: FocusSession, now = new Date()): number {
  const endsAt = parseFocusDate(session.endsAt);
  if (!endsAt) {
    return 0;
  }

  return Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
}

export function getElapsedSeconds(session: FocusSession, now = new Date()): number {
  const startedAt = parseFocusDate(session.startedAt);
  const endsAt = parseFocusDate(session.endsAt);
  if (!startedAt || !endsAt) {
    return 0;
  }

  const effectiveEnd = Math.min(now.getTime(), endsAt.getTime());
  return Math.max(0, Math.floor((effectiveEnd - startedAt.getTime()) / 1000));
}

export function isRunningSessionExpired(session: FocusSession, now = new Date()): boolean {
  return session.status === 'running' && getRemainingSeconds(session, now) === 0;
}

export function reconcileRestoredSession(session: FocusSession, now = new Date()): FocusSession {
  if (!isRunningSessionExpired(session, now)) {
    return session;
  }

  return {
    ...session,
    status: 'completed',
  };
}

export function upsertFocusSession(sessions: FocusSession[], nextSession: FocusSession): FocusSession[] {
  const remainingSessions = sessions.filter((session) => session.id !== nextSession.id);
  return sortFocusSessions([nextSession, ...remainingSessions]);
}

export function getMostRecentFocusSession(sessions: FocusSession[]): FocusSession | null {
  return sortFocusSessions(sessions)[0] ?? null;
}

export function getTodayCompletedSessions(sessions: FocusSession[], todayKey = formatFocusDate(new Date())): FocusSession[] {
  return sessions.filter((session) => (
    session.status === 'completed'
    && formatFocusDate(new Date(session.startedAt)) === todayKey
  ));
}

export function getTodayFocusMinutes(
  sessions: FocusSession[],
  currentSession: FocusSession | null,
  now = new Date(),
  todayKey = formatFocusDate(now),
): number {
  const completedMinutes = getTodayCompletedSessions(sessions, todayKey).reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  if (!currentSession || currentSession.status !== 'running') {
    return completedMinutes;
  }

  if (formatFocusDate(new Date(currentSession.startedAt)) !== todayKey) {
    return completedMinutes;
  }

  return completedMinutes + Math.floor(getElapsedSeconds(currentSession, now) / 60);
}

export function getCurrentSessionProgressPercent(currentSession: FocusSession | null, now = new Date()): number {
  if (!currentSession) {
    return 0;
  }

  if (currentSession.status === 'completed') {
    return 100;
  }

  if (currentSession.status !== 'running') {
    return 0;
  }

  const totalSeconds = currentSession.durationMinutes * 60;
  if (totalSeconds <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((getElapsedSeconds(currentSession, now) / totalSeconds) * 100));
}

export function getFocusSummary(
  sessions: FocusSession[],
  currentSession: FocusSession | null,
  now = new Date(),
): FocusSummary {
  return {
    todayCompletedSessions: getTodayCompletedSessions(sessions, formatFocusDate(now)).length,
    todayFocusMinutes: getTodayFocusMinutes(sessions, currentSession, now, formatFocusDate(now)),
    currentSessionProgressPercent: getCurrentSessionProgressPercent(currentSession, now),
  };
}

export function formatRemainingTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
