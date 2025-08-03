import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchHabits,
  fetchDueHabits,
  fetchHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
} from '@/lib/api/habits';
import { type Habit, type HabitFormData } from '@/types/recurring';

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
  });
};

export const useDueHabits = (dueDate?: string) => {
  return useQuery({
    queryKey: ['habits', 'due', dueDate],
    queryFn: () => fetchDueHabits(dueDate),
  });
};

export const useHabit = (id: number) => {
  return useQuery({
    queryKey: ['habits', id],
    queryFn: () => fetchHabit(id),
    enabled: !!id,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HabitFormData> }) =>
      updateHabit(id, data),
    onSuccess: (updatedHabit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.setQueryData(['habits', updatedHabit.id], updatedHabit);
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useCompleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completionDate }: { id: number; completionDate?: string }) =>
      completeHabit(id, completionDate),
    onSuccess: (completedHabit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.setQueryData(['habits', completedHabit.id], completedHabit);
    },
  });
};