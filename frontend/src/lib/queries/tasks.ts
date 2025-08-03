import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTasksByGoal, 
  fetchTask, 
  createTask, 
  updateTask, 
  deleteTask 
} from '@/lib/api/tasks';
import { type TaskFormData } from '@/types/project';

export const useTasksByGoal = (goalId: number) => {
  return useQuery({
    queryKey: ['tasks', 'goal', goalId],
    queryFn: () => fetchTasksByGoal(goalId),
    enabled: !!goalId
  });
};

export const useTask = (id: number) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => fetchTask(id),
    enabled: !!id
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: number; data: TaskFormData }) => 
      createTask(goalId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', goalId] });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) => 
      updateTask(id, data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', task.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['goals', task.goal_id] });
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
};