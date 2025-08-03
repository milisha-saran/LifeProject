import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchCalendarData, transformToCalendarEvents } from '@/lib/api/calendar';
import { updateTask } from '@/lib/api/tasks';
import { completeChore } from '@/lib/api/chores';
import { completeHabit } from '@/lib/api/habits';
import { CalendarEvent, TimeSlot } from '@/types/calendar';
import { Task } from '@/types/project';

export const useCalendarEvents = (date: Date) => {
  return useQuery({
    queryKey: ['calendar-events', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const data = await fetchCalendarData(date);
      return transformToCalendarEvents(data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMoveEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ event, timeSlot }: { event: CalendarEvent; timeSlot: TimeSlot }) => {
      if (event.type === 'task') {
        const task = event.data as Task;
        return await updateTask(task.id, {
          start_time: timeSlot.start,
          end_time: timeSlot.end,
        });
      }
      // For now, only tasks can be moved
      throw new Error('Only tasks can be moved');
    },
    onSuccess: (_, { event }) => {
      // Invalidate calendar queries to refresh the view
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      
      // Also invalidate related queries
      if (event.type === 'task') {
        const task = event.data as Task;
        queryClient.invalidateQueries({ queryKey: ['tasks', 'goal', task.goal_id] });
      }
    },
  });
};

export const useCompleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: CalendarEvent) => {
      switch (event.type) {
        case 'chore':
          return await completeChore(event.data.id);
        case 'habit':
          return await completeHabit(event.data.id);
        case 'task':
          const task = event.data as Task;
          return await updateTask(task.id, { status: 'Completed' });
        default:
          throw new Error('Unknown event type');
      }
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};