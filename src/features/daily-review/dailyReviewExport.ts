import type { Goal } from '../goals/goal.types';
import { getGoals } from '../goals/goalService';
import { getHabits, getLogs } from '../habits/habitStorage';
import { getDistractionEntries, getFocusPreferences, getFocusSessions } from '../focus/focusStorage';
import { supabase } from '../../services/supabase';
import { getEntries } from './dailyReviewStorage';
import type { DailyEntry } from './dailyReview.types';

export type CommandOsExportFormat = 'json' | 'csv';

interface CommandOsExportBundle {
  exported_at: string;
  goals: Goal[];
  habits: ReturnType<typeof getHabits>;
  habit_logs: ReturnType<typeof getLogs>;
  focus_sessions: ReturnType<typeof getFocusSessions>;
  focus_preferences: ReturnType<typeof getFocusPreferences>;
  focus_distraction_entries: ReturnType<typeof getDistractionEntries>;
  daily_review_entries: DailyEntry[];
}

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function getExportGoals(): Promise<Goal[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id) {
      return [];
    }

    return await getGoals(data.user.id);
  } catch {
    return [];
  }
}

export async function buildCommandOsExportBundle(): Promise<CommandOsExportBundle> {
  return {
    exported_at: new Date().toISOString(),
    goals: await getExportGoals(),
    habits: getHabits(),
    habit_logs: getLogs(),
    focus_sessions: getFocusSessions(),
    focus_preferences: getFocusPreferences(),
    focus_distraction_entries: getDistractionEntries(),
    daily_review_entries: getEntries(),
  };
}

function buildCommandOsCsv(bundle: CommandOsExportBundle): string {
  const rows: string[] = [
    ['section', 'key', 'date', 'payload'].map(escapeCsvValue).join(','),
  ];

  bundle.goals.forEach((goal) => {
    rows.push([
      'goals',
      goal.id,
      goal.updated_at,
      JSON.stringify(goal),
    ].map(escapeCsvValue).join(','));
  });

  bundle.habits.forEach((habit) => {
    rows.push([
      'habits',
      habit.id,
      habit.created_at,
      JSON.stringify(habit),
    ].map(escapeCsvValue).join(','));
  });

  bundle.habit_logs.forEach((log) => {
    rows.push([
      'habit_logs',
      `${log.habit_id}:${log.date}`,
      log.date,
      JSON.stringify(log),
    ].map(escapeCsvValue).join(','));
  });

  bundle.focus_sessions.forEach((session) => {
    rows.push([
      'focus_sessions',
      session.id,
      session.startedAt,
      JSON.stringify(session),
    ].map(escapeCsvValue).join(','));
  });

  rows.push([
    'focus_preferences',
    'preferences',
    bundle.exported_at,
    JSON.stringify(bundle.focus_preferences),
  ].map(escapeCsvValue).join(','));

  bundle.focus_distraction_entries.forEach((entry) => {
    rows.push([
      'focus_distraction_entries',
      entry.id,
      entry.createdAt,
      JSON.stringify(entry),
    ].map(escapeCsvValue).join(','));
  });

  bundle.daily_review_entries.forEach((entry) => {
    rows.push([
      'daily_review_entries',
      entry.date,
      entry.updated_at,
      JSON.stringify(entry),
    ].map(escapeCsvValue).join(','));
  });

  return rows.join('\n');
}

export async function exportCommandOsData(format: CommandOsExportFormat = 'json') {
  const bundle = await buildCommandOsExportBundle();

  if (format === 'csv') {
    downloadFile(
      buildCommandOsCsv(bundle),
      `command-os-export-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8',
    );
    return;
  }

  downloadFile(
    JSON.stringify(bundle, null, 2),
    `command-os-export-${new Date().toISOString().slice(0, 10)}.json`,
    'application/json',
  );
}
