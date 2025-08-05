import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCalendarData, transformToCalendarEvents } from '../calendar';
import * as projectsApi from '../projects';
import * as tasksApi from '../tasks';
import * as choresApi from '../chores';
import * as habitsApi from '../habits';
import * as goalsApi from '../goals';

// Mock all the API modules
vi.mock('../projects');
vi.mock('../tasks');
vi.mock('../chores');
vi.mock('../habits');
vi.mock('../goals');

describe('Calendar API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCalendarData', () => {
    it('fetches all calendar data successfully', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1', color: '#3b82f6', weekly_hours: 10, start_date: '2024-01-01', status: 'In Progress', created_at: '2024-01-01T00:00:00Z' },
      ];
      const mockGoals = [
        { id: 1, name: 'Goal 1', project_id: 1, weekly_hours: 5, start_date: '2024-01-01', status: 'In Progress', created_at: '2024-01-01T00:00:00Z' },
      ];
      const mockTasks = [
        { id: 1, name: 'Task 1', goal_id: 1, weekly_hours: 2, status: 'Not Started', created_at: '2024-01-01T00:00:00Z' },
      ];
      const mockChores = [
        { id: 1, name: 'Chore 1', status: 'Not Started', frequency_type: 'daily', frequency_value: 1, next_due_date: '2024-01-01', user_id: 1, created_at: '2024-01-01T00:00:00Z' },
      ];
      const mockHabits = [
        { id: 1, name: 'Habit 1', status: 'Not Started', frequency_type: 'daily', frequency_value: 1, next_due_date: '2024-01-01', streak_count: 0, user_id: 1, created_at: '2024-01-01T00:00:00Z' },
      ];

      vi.mocked(projectsApi.fetchProjects).mockResolvedValue(mockProjects);
      vi.mocked(goalsApi.fetchGoalsByProject).mockResolvedValue(mockGoals);
      vi.mocked(tasksApi.fetchTasksByGoal).mockResolvedValue(mockTasks);
      vi.mocked(choresApi.fetchDueChores).mockResolvedValue(mockChores);
      vi.mocked(habitsApi.fetchDueHabits).mockResolvedValue(mockHabits);

      const result = await fetchCalendarData(new Date('2024-01-01'));

      expect(result).toEqual({
        tasks: mockTasks,
        chores: mockChores,
        habits: mockHabits,
        projects: mockProjects,
        goals: mockGoals,
      });

      expect(projectsApi.fetchProjects).toHaveBeenCalled();
      expect(choresApi.fetchDueChores).toHaveBeenCalledWith('2024-01-01');
      expect(habitsApi.fetchDueHabits).toHaveBeenCalledWith('2024-01-01');
    });

    it('handles API errors', async () => {
      vi.mocked(projectsApi.fetchProjects).mockRejectedValue(new Error('API Error'));

      await expect(fetchCalendarData(new Date('2024-01-01'))).rejects.toThrow('API Error');
    });
  });

  describe('transformToCalendarEvents', () => {
    it('transforms tasks with time slots to calendar events', () => {
      const data = {
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            goal_id: 1,
            weekly_hours: 2,
            status: 'Not Started' as const,
            start_time: '2024-01-01T09:00:00Z',
            end_time: '2024-01-01T10:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        chores: [],
        habits: [],
        projects: [
          {
            id: 1,
            name: 'Project 1',
            color: '#3b82f6',
            weekly_hours: 10,
            start_date: '2024-01-01',
            status: 'In Progress' as const,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        goals: [
          {
            id: 1,
            name: 'Goal 1',
            project_id: 1,
            weekly_hours: 5,
            start_date: '2024-01-01',
            status: 'In Progress' as const,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      const events = transformToCalendarEvents(data);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        id: 'task-1',
        title: 'Task 1',
        type: 'task',
        color: '#3b82f6',
      });
      expect(events[0].start).toEqual(new Date('2024-01-01T09:00:00Z'));
      expect(events[0].end).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('transforms chores with default time slots', () => {
      const data = {
        tasks: [],
        chores: [
          {
            id: 1,
            name: 'Chore 1',
            status: 'Not Started' as const,
            frequency_type: 'daily' as const,
            frequency_value: 1,
            next_due_date: '2024-01-01',
            eta_hours: 2,
            user_id: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        habits: [],
        projects: [],
        goals: [],
      };

      const events = transformToCalendarEvents(data);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        id: 'chore-1',
        title: 'Chore 1',
        type: 'chore',
        color: '#10b981',
      });
    });

    it('transforms habits with default time slots', () => {
      const data = {
        tasks: [],
        chores: [],
        habits: [
          {
            id: 1,
            name: 'Habit 1',
            status: 'Not Started' as const,
            frequency_type: 'daily' as const,
            frequency_value: 1,
            next_due_date: '2024-01-01',
            eta_hours: 1,
            streak_count: 0,
            user_id: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        projects: [],
        goals: [],
      };

      const events = transformToCalendarEvents(data);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        id: 'habit-1',
        title: 'Habit 1',
        type: 'habit',
        color: '#8b5cf6',
      });
    });
  });
});