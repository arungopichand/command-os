export type FocusSessionStatus = 'idle' | 'running' | 'completed' | 'cancelled';

export interface FocusSession {
  id: string;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
  status: FocusSessionStatus;
}

export interface DistractionEntry {
  id: string;
  sessionId: string;
  note: string;
  createdAt: string;
}

export interface FocusPreferences {
  isFocusModeEnabled: boolean;
  defaultDurationMinutes: number;
}

export interface FocusSummary {
  todayCompletedSessions: number;
  todayFocusMinutes: number;
  currentSessionProgressPercent: number;
}
