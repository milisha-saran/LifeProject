export interface Project {
  id: number;
  name: string;
  description?: string;
  weekly_hours: number;
  start_date: string;
  end_date?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  color: string;
  created_at: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  weekly_hours: number;
  start_date: Date;
  end_date?: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  color: string;
}

export interface Goal {
  id: number;
  name: string;
  description?: string;
  weekly_hours: number;
  start_date: string;
  end_date?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  project_id: number;
  created_at: string;
}

export interface GoalFormData {
  name: string;
  description?: string;
  weekly_hours: number;
  start_date: Date;
  end_date?: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  weekly_hours: number;
  start_time?: string;
  end_time?: string;
  eta_hours?: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  goal_id: number;
  created_at: string;
}

export interface TaskFormData {
  name: string;
  description?: string;
  weekly_hours: number;
  start_time?: Date;
  end_time?: Date;
  eta_hours?: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface ProjectWithGoals extends Project {
  goals?: Goal[];
  total_goal_hours?: number;
  remaining_hours?: number;
}

export interface GoalWithTasks extends Goal {
  tasks?: Task[];
  total_task_hours?: number;
  remaining_hours?: number;
}

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed';