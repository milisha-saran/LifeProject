import { type Project, type Goal, type Task } from '@/types/project';

export interface TimeAllocationSummary {
  projectHours: number;
  allocatedHours: number;
  remainingHours: number;
  isOverAllocated: boolean;
  utilizationPercentage: number;
}

export function calculateTimeAllocation(project: Project, goals: Goal[]): TimeAllocationSummary {
  const projectHours = project.weekly_hours;
  const allocatedHours = goals.reduce((sum, goal) => sum + goal.weekly_hours, 0);
  const remainingHours = projectHours - allocatedHours;
  const isOverAllocated = remainingHours < 0;
  const utilizationPercentage = Math.round((allocatedHours / projectHours) * 100);

  return {
    projectHours,
    allocatedHours,
    remainingHours,
    isOverAllocated,
    utilizationPercentage,
  };
}

export function validateGoalHours(
  project: Project, 
  existingGoals: Goal[], 
  newGoalHours: number,
  editingGoalId?: number
): { isValid: boolean; error?: string; remainingHours: number } {
  // Filter out the goal being edited if applicable
  const relevantGoals = editingGoalId 
    ? existingGoals.filter(goal => goal.id !== editingGoalId)
    : existingGoals;

  const currentAllocatedHours = relevantGoals.reduce((sum, goal) => sum + goal.weekly_hours, 0);
  const totalAfterNewGoal = currentAllocatedHours + newGoalHours;
  const remainingHours = project.weekly_hours - totalAfterNewGoal;

  if (totalAfterNewGoal > project.weekly_hours) {
    const excessHours = totalAfterNewGoal - project.weekly_hours;
    return {
      isValid: false,
      error: `This goal would exceed the project's weekly hour limit by ${excessHours} hours. Maximum allowed: ${project.weekly_hours - currentAllocatedHours} hours.`,
      remainingHours,
    };
  }

  return {
    isValid: true,
    remainingHours,
  };
}

export function getTimeAllocationStatus(summary: TimeAllocationSummary): {
  color: string;
  label: string;
  description: string;
} {
  if (summary.isOverAllocated) {
    return {
      color: 'text-red-600',
      label: 'Over-allocated',
      description: `Exceeds project limit by ${Math.abs(summary.remainingHours)} hours`,
    };
  }

  if (summary.utilizationPercentage >= 90) {
    return {
      color: 'text-orange-600',
      label: 'Nearly Full',
      description: `${summary.utilizationPercentage}% utilized`,
    };
  }

  if (summary.utilizationPercentage >= 50) {
    return {
      color: 'text-blue-600',
      label: 'Good Progress',
      description: `${summary.utilizationPercentage}% utilized`,
    };
  }

  return {
    color: 'text-green-600',
    label: 'Available',
    description: `${summary.remainingHours} hours remaining`,
  };
}

export interface TaskTimeAllocationSummary {
  goalHours: number;
  allocatedHours: number;
  remainingHours: number;
  isOverAllocated: boolean;
  utilizationPercentage: number;
}

export function calculateTaskTimeAllocation(goal: Goal, tasks: Task[]): TaskTimeAllocationSummary {
  const goalHours = goal.weekly_hours;
  const allocatedHours = tasks.reduce((sum, task) => sum + task.weekly_hours, 0);
  const remainingHours = goalHours - allocatedHours;
  const isOverAllocated = remainingHours < 0;
  const utilizationPercentage = Math.round((allocatedHours / goalHours) * 100);

  return {
    goalHours,
    allocatedHours,
    remainingHours,
    isOverAllocated,
    utilizationPercentage,
  };
}

export function validateTaskHours(
  goal: Goal, 
  existingTasks: Task[], 
  newTaskHours: number,
  editingTaskId?: number
): { isValid: boolean; error?: string; remainingHours: number } {
  // Filter out the task being edited if applicable
  const relevantTasks = editingTaskId 
    ? existingTasks.filter(task => task.id !== editingTaskId)
    : existingTasks;

  const currentAllocatedHours = relevantTasks.reduce((sum, task) => sum + task.weekly_hours, 0);
  const totalAfterNewTask = currentAllocatedHours + newTaskHours;
  const remainingHours = goal.weekly_hours - totalAfterNewTask;

  if (totalAfterNewTask > goal.weekly_hours) {
    const excessHours = totalAfterNewTask - goal.weekly_hours;
    return {
      isValid: false,
      error: `This task would exceed the goal's weekly hour limit by ${excessHours} hours. Maximum allowed: ${goal.weekly_hours - currentAllocatedHours} hours.`,
      remainingHours,
    };
  }

  return {
    isValid: true,
    remainingHours,
  };
}

export function getTaskTimeAllocationStatus(summary: TaskTimeAllocationSummary): {
  color: string;
  label: string;
  description: string;
} {
  if (summary.isOverAllocated) {
    return {
      color: 'text-red-600',
      label: 'Over-allocated',
      description: `Exceeds goal limit by ${Math.abs(summary.remainingHours)} hours`,
    };
  }

  if (summary.utilizationPercentage >= 90) {
    return {
      color: 'text-orange-600',
      label: 'Nearly Full',
      description: `${summary.utilizationPercentage}% utilized`,
    };
  }

  if (summary.utilizationPercentage >= 50) {
    return {
      color: 'text-blue-600',
      label: 'Good Progress',
      description: `${summary.utilizationPercentage}% utilized`,
    };
  }

  return {
    color: 'text-green-600',
    label: 'Available',
    description: `${summary.remainingHours} hours remaining`,
  };
}