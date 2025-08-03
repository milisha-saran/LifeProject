import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchGoalsByProject, 
  fetchGoal, 
  createGoal, 
  updateGoal, 
  deleteGoal 
} from '@/lib/api/goals';
import { type GoalFormData } from '@/types/project';

export const useGoalsByProject = (projectId: number) => {
  return useQuery({
    queryKey: ['goals', 'project', projectId],
    queryFn: () => fetchGoalsByProject(projectId),
    enabled: !!projectId
  });
};

export const useGoal = (id: number) => {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => fetchGoal(id),
    enabled: !!id
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: GoalFormData }) => 
      createGoal(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    }
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GoalFormData> }) => 
      updateGoal(id, data),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals', goal.id] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'project', goal.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects', goal.project_id] });
    }
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};