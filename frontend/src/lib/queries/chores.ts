import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchChores,
  fetchDueChores,
  fetchChore,
  createChore,
  updateChore,
  deleteChore,
  completeChore,
} from '@/lib/api/chores';
import { type Chore, type ChoreFormData } from '@/types/recurring';

export const useChores = () => {
  return useQuery({
    queryKey: ['chores'],
    queryFn: fetchChores,
  });
};

export const useDueChores = (dueDate?: string) => {
  return useQuery({
    queryKey: ['chores', 'due', dueDate],
    queryFn: () => fetchDueChores(dueDate),
  });
};

export const useChore = (id: number) => {
  return useQuery({
    queryKey: ['chores', id],
    queryFn: () => fetchChore(id),
    enabled: !!id,
  });
};

export const useCreateChore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
};

export const useUpdateChore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChoreFormData> }) =>
      updateChore(id, data),
    onSuccess: (updatedChore) => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.setQueryData(['chores', updatedChore.id], updatedChore);
    },
  });
};

export const useDeleteChore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
};

export const useCompleteChore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completionDate }: { id: number; completionDate?: string }) =>
      completeChore(id, completionDate),
    onSuccess: (completedChore) => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.setQueryData(['chores', completedChore.id], completedChore);
    },
  });
};