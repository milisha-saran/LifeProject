export interface DashboardStats {
  activeProjects: number;
  completedTasks: number;
  currentStreaks: number;
  weeklyProgress: number;
  overdueItems: number;
  upcomingDeadlines: number;
}

export interface Activity {
  id: string;
  type: 'task_completed' | 'habit_completed' | 'chore_completed' | 'project_created' | 'goal_created';
  description: string;
  timestamp: string;
  entityId?: number;
  entityType?: 'project' | 'goal' | 'task' | 'chore' | 'habit';
}

export interface Deadline {
  id: number;
  name: string;
  type: 'project' | 'goal' | 'task' | 'chore' | 'habit';
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  isOverdue: boolean;
  color?: string;
}

export interface ProjectProgress {
  id: number;
  name: string;
  color: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number; // 0-100
  totalHours: number;
  completedHours: number;
  goalsCount: number;
  completedGoalsCount: number;
}

export interface HabitStreak {
  id: number;
  name: string;
  streakCount: number;
  lastCompleted?: string;
  nextDue: string;
  isOverdue: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  color: string;
}