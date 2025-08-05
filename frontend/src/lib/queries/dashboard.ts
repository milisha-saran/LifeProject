import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardStats,
  fetchRecentActivity,
  fetchUpcomingDeadlines,
  fetchProjectProgress,
  fetchHabitStreaks
} from '@/lib/api/dashboard';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchRecentActivity,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

export const useUpcomingDeadlines = () => {
  return useQuery({
    queryKey: ['dashboard', 'deadlines'],
    queryFn: fetchUpcomingDeadlines,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useProjectProgress = () => {
  return useQuery({
    queryKey: ['dashboard', 'project-progress'],
    queryFn: fetchProjectProgress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useHabitStreaks = () => {
  return useQuery({
    queryKey: ['dashboard', 'habit-streaks'],
    queryFn: fetchHabitStreaks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};