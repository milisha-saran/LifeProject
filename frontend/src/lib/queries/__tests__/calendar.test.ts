import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCalendarEvents } from '../calendar';
import * as calendarApi from '../../api/calendar';

// Mock the calendar API
vi.mock('../../api/calendar');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Calendar Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCalendarEvents', () => {
    it('fetches and transforms calendar events', async () => {
      const mockData = {
        tasks: [],
        chores: [],
        habits: [],
        projects: [],
        goals: [],
      };
      
      const mockEvents = [
        {
          id: 'task-1',
          title: 'Test Task',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
          type: 'task',
          color: '#3b82f6',
          data: {
            id: 1,
            name: 'Test Task',
            status: 'Not Started',
            weekly_hours: 1,
            goal_id: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      ];

      vi.mocked(calendarApi.fetchCalendarData).mockResolvedValue(mockData);
      vi.mocked(calendarApi.transformToCalendarEvents).mockReturnValue(mockEvents);

      const { result } = renderHook(
        () => useCalendarEvents(new Date('2024-01-01')),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEvents);
      expect(calendarApi.fetchCalendarData).toHaveBeenCalledWith(new Date('2024-01-01'));
    });

    it('handles fetch errors', async () => {
      vi.mocked(calendarApi.fetchCalendarData).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useCalendarEvents(new Date('2024-01-01')),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});