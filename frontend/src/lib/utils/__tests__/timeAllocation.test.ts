import { describe, it, expect } from 'vitest';
import { calculateTimeAllocation, validateGoalHours, getTimeAllocationStatus } from '../timeAllocation';
import { type Project, type Goal } from '@/types/project';

describe('Time Allocation Utils', () => {
  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    weekly_hours: 40,
    start_date: '2025-01-01',
    status: 'In Progress',
    color: '#3B82F6',
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockGoals: Goal[] = [
    {
      id: 1,
      name: 'Goal 1',
      weekly_hours: 15,
      start_date: '2025-01-01',
      status: 'In Progress',
      project_id: 1,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Goal 2',
      weekly_hours: 10,
      start_date: '2025-01-01',
      status: 'Not Started',
      project_id: 1,
      created_at: '2025-01-01T00:00:00Z',
    },
  ];

  describe('calculateTimeAllocation', () => {
    it('should calculate time allocation correctly', () => {
      const result = calculateTimeAllocation(mockProject, mockGoals);

      expect(result).toEqual({
        projectHours: 40,
        allocatedHours: 25,
        remainingHours: 15,
        isOverAllocated: false,
        utilizationPercentage: 63,
      });
    });

    it('should handle over-allocation', () => {
      const overAllocatedGoals: Goal[] = [
        ...mockGoals,
        {
          id: 3,
          name: 'Goal 3',
          weekly_hours: 20,
          start_date: '2025-01-01',
          status: 'Not Started',
          project_id: 1,
          created_at: '2025-01-01T00:00:00Z',
        },
      ];

      const result = calculateTimeAllocation(mockProject, overAllocatedGoals);

      expect(result).toEqual({
        projectHours: 40,
        allocatedHours: 45,
        remainingHours: -5,
        isOverAllocated: true,
        utilizationPercentage: 113,
      });
    });

    it('should handle empty goals array', () => {
      const result = calculateTimeAllocation(mockProject, []);

      expect(result).toEqual({
        projectHours: 40,
        allocatedHours: 0,
        remainingHours: 40,
        isOverAllocated: false,
        utilizationPercentage: 0,
      });
    });
  });

  describe('validateGoalHours', () => {
    it('should validate goal hours within limit', () => {
      const result = validateGoalHours(mockProject, mockGoals, 10);

      expect(result).toEqual({
        isValid: true,
        remainingHours: 5,
      });
    });

    it('should reject goal hours that exceed limit', () => {
      const result = validateGoalHours(mockProject, mockGoals, 20);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceed the project\'s weekly hour limit by 5 hours');
      expect(result.remainingHours).toBe(-5);
    });

    it('should handle editing existing goal', () => {
      const result = validateGoalHours(mockProject, mockGoals, 30, 1); // Editing goal with id 1

      expect(result).toEqual({
        isValid: true,
        remainingHours: 0, // 40 - 10 (goal 2) - 30 (new goal 1) = 0
      });
    });

    it('should reject editing goal that would exceed limit', () => {
      const result = validateGoalHours(mockProject, mockGoals, 35, 1); // Editing goal with id 1

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceed the project\'s weekly hour limit by 5 hours');
    });
  });

  describe('getTimeAllocationStatus', () => {
    it('should return over-allocated status', () => {
      const summary = {
        projectHours: 40,
        allocatedHours: 45,
        remainingHours: -5,
        isOverAllocated: true,
        utilizationPercentage: 113,
      };

      const result = getTimeAllocationStatus(summary);

      expect(result).toEqual({
        color: 'text-red-600',
        label: 'Over-allocated',
        description: 'Exceeds project limit by 5 hours',
      });
    });

    it('should return nearly full status', () => {
      const summary = {
        projectHours: 40,
        allocatedHours: 38,
        remainingHours: 2,
        isOverAllocated: false,
        utilizationPercentage: 95,
      };

      const result = getTimeAllocationStatus(summary);

      expect(result).toEqual({
        color: 'text-orange-600',
        label: 'Nearly Full',
        description: '95% utilized',
      });
    });

    it('should return good progress status', () => {
      const summary = {
        projectHours: 40,
        allocatedHours: 25,
        remainingHours: 15,
        isOverAllocated: false,
        utilizationPercentage: 63,
      };

      const result = getTimeAllocationStatus(summary);

      expect(result).toEqual({
        color: 'text-blue-600',
        label: 'Good Progress',
        description: '63% utilized',
      });
    });

    it('should return available status', () => {
      const summary = {
        projectHours: 40,
        allocatedHours: 10,
        remainingHours: 30,
        isOverAllocated: false,
        utilizationPercentage: 25,
      };

      const result = getTimeAllocationStatus(summary);

      expect(result).toEqual({
        color: 'text-green-600',
        label: 'Available',
        description: '30 hours remaining',
      });
    });
  });
});