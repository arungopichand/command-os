import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGoal, deleteGoal, getGoals, updateGoal } from './goalService';
import type { CreateGoalPayload, Goal, UpdateGoalPayload } from './goal.types';

const goalsQueryKeys = {
  all: ['goals'] as const,
  list: (userId: string | null | undefined) => [...goalsQueryKeys.all, userId ?? 'anonymous'] as const,
};

type CreateGoalMutationInput = Omit<CreateGoalPayload, 'user_id'> & Partial<Pick<CreateGoalPayload, 'user_id'>>;

interface UpdateGoalMutationInput {
  id: string;
  payload: UpdateGoalPayload;
  userId?: string;
}

interface DeleteGoalMutationInput {
  id: string;
  userId?: string;
}

function sortGoals(goals: Goal[]) {
  return [...goals].sort((left, right) => {
    const updatedAtDelta = new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    if (updatedAtDelta !== 0) {
      return updatedAtDelta;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

function updateGoalCache(queryClient: ReturnType<typeof useQueryClient>, userId: string, updater: (goals: Goal[]) => Goal[]) {
  queryClient.setQueryData<Goal[]>(goalsQueryKeys.list(userId), (currentGoals) => updater(currentGoals ?? []));
}

async function invalidateGoals(queryClient: ReturnType<typeof useQueryClient>, userId?: string | null) {
  if (userId) {
    await queryClient.invalidateQueries({ queryKey: goalsQueryKeys.list(userId) });
    return;
  }

  await queryClient.invalidateQueries({ queryKey: goalsQueryKeys.all });
}

export function useGoals(userId: string | null | undefined) {
  return useQuery({
    queryKey: goalsQueryKeys.list(userId),
    queryFn: async () => getGoals(userId ?? undefined),
    enabled: Boolean(userId),
  });
}

export function useCreateGoal(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, CreateGoalMutationInput>({
    mutationFn: async (payload) => {
      const resolvedUserId = userId ?? payload.user_id;
      return resolvedUserId ? createGoal(resolvedUserId, payload) : createGoal(payload as CreateGoalPayload);
    },
    onSuccess: async (createdGoal, variables) => {
      const resolvedUserId = userId ?? variables.user_id ?? createdGoal.user_id;
      if (resolvedUserId) {
        updateGoalCache(queryClient, resolvedUserId, (currentGoals) =>
          sortGoals([createdGoal, ...currentGoals.filter((goal) => goal.id !== createdGoal.id)]),
        );
      }

      await invalidateGoals(queryClient, resolvedUserId);
    },
  });
}

export function useUpdateGoal(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, UpdateGoalMutationInput>({
    mutationFn: async ({ id, payload, userId: mutationUserId }) => {
      const resolvedUserId = mutationUserId ?? userId;
      return resolvedUserId ? updateGoal(id, resolvedUserId, payload) : updateGoal(id, payload);
    },
    onSuccess: async (updatedGoal, variables) => {
      const resolvedUserId = variables.userId ?? userId ?? updatedGoal.user_id;
      if (resolvedUserId) {
        updateGoalCache(queryClient, resolvedUserId, (currentGoals) =>
          sortGoals(currentGoals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))),
        );
      }

      await invalidateGoals(queryClient, resolvedUserId);
    },
  });
}

export function useDeleteGoal(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteGoalMutationInput>({
    mutationFn: async ({ id, userId: mutationUserId }) => {
      const resolvedUserId = mutationUserId ?? userId;
      return resolvedUserId ? deleteGoal(id, resolvedUserId) : deleteGoal(id);
    },
    onSuccess: async (_data, variables) => {
      const resolvedUserId = variables.userId ?? userId ?? null;
      if (resolvedUserId) {
        updateGoalCache(queryClient, resolvedUserId, (currentGoals) =>
          currentGoals.filter((goal) => goal.id !== variables.id),
        );
      }

      await invalidateGoals(queryClient, resolvedUserId);
    },
  });
}
