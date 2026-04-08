import { supabase } from '../../services/supabase';
import {
  GoalStatus,
  clampGoalProgress,
  resolveGoalStatus,
  type CreateGoalPayload,
  type Goal,
  type GoalStatus as GoalStatusValue,
  type UpdateGoalPayload,
} from './goal.types';

const GOALS_TABLE = 'goals';
const GOAL_COLUMNS = 'id, user_id, title, description, status, progress, created_at, updated_at';

type GoalRecord = Goal & { description: string | null };
type GoalInsertPayload = Omit<CreateGoalPayload, 'user_id'>;

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  return supabase;
}

function normalizeTitle(title: string) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error('Goal title is required.');
  }

  return normalizedTitle;
}

function normalizeDescription(description?: string) {
  const normalizedDescription = description?.trim();
  return normalizedDescription ? normalizedDescription : null;
}

function normalizeProgressForStatus(progress: number | undefined, status?: GoalStatusValue) {
  const normalizedProgress = clampGoalProgress(progress ?? 0);

  if (status === GoalStatus.Completed && normalizedProgress < 100) {
    return 100;
  }

  return normalizedProgress;
}

function getErrorMessage(action: string, error: unknown) {
  if (error instanceof Error) {
    return `Failed to ${action}: ${error.message}`;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return `Failed to ${action}: ${message}`;
    }
  }

  return `Failed to ${action}.`;
}

async function resolveUserId(userId?: string) {
  const normalizedUserId = userId?.trim();
  if (normalizedUserId) {
    return normalizedUserId;
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new Error(getErrorMessage('resolve user session', error));
  }

  const authenticatedUserId = data.user?.id?.trim();

  if (!authenticatedUserId) {
    throw new Error('No authenticated user found for goals operation.');
  }

  return authenticatedUserId;
}

function mapGoalRecord(record: GoalRecord): Goal {
  const progress = normalizeProgressForStatus(record.progress, record.status);

  return {
    ...record,
    description: record.description ?? undefined,
    progress,
    status: resolveGoalStatus(progress, record.status),
  };
}

function buildCreatePayload(payload: CreateGoalPayload) {
  const progress = normalizeProgressForStatus(payload.progress, payload.status);

  return {
    user_id: payload.user_id,
    title: normalizeTitle(payload.title),
    description: normalizeDescription(payload.description),
    progress,
    status: resolveGoalStatus(progress, payload.status ?? GoalStatus.Active),
  };
}

function buildUpdatePayload(payload: UpdateGoalPayload) {
  const updates: Record<string, string | number | null> = {};
  let nextProgress = typeof payload.progress === 'number'
    ? normalizeProgressForStatus(payload.progress, payload.status)
    : undefined;

  if (typeof payload.title === 'string') {
    updates.title = normalizeTitle(payload.title);
  }

  if ('description' in payload) {
    updates.description = normalizeDescription(payload.description);
  }

  if (payload.status === GoalStatus.Completed && typeof nextProgress !== 'number') {
    nextProgress = 100;
  }

  if (typeof nextProgress === 'number') {
    updates.progress = nextProgress;
    updates.status = resolveGoalStatus(nextProgress, payload.status ?? GoalStatus.Active);
  } else if (payload.status) {
    updates.status = payload.status;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No goal changes provided.');
  }

  updates.updated_at = new Date().toISOString();

  return updates;
}

export async function getGoals(userId?: string): Promise<Goal[]> {
  const client = getSupabaseClient();
  const resolvedUserId = await resolveUserId(userId);

  try {
    const { data, error } = await client
      .from(GOALS_TABLE)
      .select(GOAL_COLUMNS)
      .eq('user_id', resolvedUserId)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((record) => mapGoalRecord(record as GoalRecord));
  } catch (error) {
    throw new Error(getErrorMessage('fetch goals', error));
  }
}

export async function createGoal(payload: CreateGoalPayload): Promise<Goal>;
export async function createGoal(userId: string, payload: GoalInsertPayload): Promise<Goal>;
export async function createGoal(userIdOrPayload: string | CreateGoalPayload, payload?: GoalInsertPayload): Promise<Goal> {
  const client = getSupabaseClient();
  const sourcePayload = typeof userIdOrPayload === 'string' ? payload : userIdOrPayload;

  if (!sourcePayload) {
    throw new Error('Goal payload is required.');
  }

  const resolvedUserId = await resolveUserId(
    typeof userIdOrPayload === 'string' ? userIdOrPayload : userIdOrPayload.user_id,
  );
  const insertPayload = buildCreatePayload({ ...sourcePayload, user_id: resolvedUserId });

  try {
    const { data, error } = await client
      .from(GOALS_TABLE)
      .insert(insertPayload)
      .select(GOAL_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    return mapGoalRecord(data as GoalRecord);
  } catch (error) {
    throw new Error(getErrorMessage('create goal', error));
  }
}

export async function updateGoal(id: string, payload: UpdateGoalPayload): Promise<Goal>;
export async function updateGoal(id: string, userId: string, payload: UpdateGoalPayload): Promise<Goal>;
export async function updateGoal(id: string, userIdOrPayload: string | UpdateGoalPayload, payload?: UpdateGoalPayload): Promise<Goal> {
  const client = getSupabaseClient();
  const resolvedUserId = await resolveUserId(typeof userIdOrPayload === 'string' ? userIdOrPayload : undefined);
  const updatePayload = buildUpdatePayload(typeof userIdOrPayload === 'string' ? payload ?? {} : userIdOrPayload);

  try {
    const { data, error } = await client
      .from(GOALS_TABLE)
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', resolvedUserId)
      .select(GOAL_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    return mapGoalRecord(data as GoalRecord);
  } catch (error) {
    throw new Error(getErrorMessage('update goal', error));
  }
}

export async function deleteGoal(id: string): Promise<void>;
export async function deleteGoal(id: string, userId: string): Promise<void>;
export async function deleteGoal(id: string, userId?: string): Promise<void> {
  const client = getSupabaseClient();
  const resolvedUserId = await resolveUserId(userId);

  try {
    const { error } = await client
      .from(GOALS_TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', resolvedUserId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(getErrorMessage('delete goal', error));
  }
}
