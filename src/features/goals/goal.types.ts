export const GoalStatus = {
  Active: 'active',
  Completed: 'completed',
  Paused: 'paused',
} as const;

export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus];

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalPayload {
  user_id: Goal['user_id'];
  title: Goal['title'];
  description?: Goal['description'];
  status?: GoalStatus;
  progress?: Goal['progress'];
}

export interface UpdateGoalPayload {
  title?: Goal['title'];
  description?: Goal['description'];
  status?: GoalStatus;
  progress?: Goal['progress'];
}

export const GOAL_STATUS_OPTIONS: ReadonlyArray<{ value: GoalStatus; label: string }> = [
  { value: GoalStatus.Active, label: 'Active' },
  { value: GoalStatus.Paused, label: 'Paused' },
  { value: GoalStatus.Completed, label: 'Completed' },
];

export function clampGoalProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function resolveGoalStatus(progress: number, preferredStatus: GoalStatus = GoalStatus.Active): GoalStatus {
  const normalizedProgress = clampGoalProgress(progress);

  if (normalizedProgress >= 100) {
    return GoalStatus.Completed;
  }

  if (preferredStatus === GoalStatus.Paused) {
    return GoalStatus.Paused;
  }

  return GoalStatus.Active;
}

export function getGoalStatusLabel(status: GoalStatus): string {
  if (status === GoalStatus.Completed) {
    return 'Completed';
  }

  if (status === GoalStatus.Paused) {
    return 'Paused';
  }

  return 'Active';
}
