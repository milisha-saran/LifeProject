export type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ChoreBase {
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  eta_hours?: number;
  status: TaskStatus;
  frequency_type: FrequencyType;
  frequency_value: number;
  next_due_date: string;
}

export interface Chore extends ChoreBase {
  id: number;
  last_completed_date?: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface ChoreFormData {
  name: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
  eta_hours?: number;
  status: TaskStatus;
  frequency_type: FrequencyType;
  frequency_value: number;
  next_due_date: Date;
}

export interface HabitBase extends ChoreBase {
  // Habits have the same base structure as chores
}

export interface Habit extends HabitBase {
  id: number;
  last_completed_date?: string;
  streak_count: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface HabitFormData extends ChoreFormData {
  // Habits have the same form structure as chores
}

export interface ChoreComplete {
  completion_date?: string;
}

export interface HabitComplete {
  completion_date?: string;
}

export const FREQUENCY_OPTIONS = [
  { value: 'daily' as FrequencyType, label: 'Daily' },
  { value: 'weekly' as FrequencyType, label: 'Weekly' },
  { value: 'biweekly' as FrequencyType, label: 'Biweekly' },
  { value: 'monthly' as FrequencyType, label: 'Monthly' },
  { value: 'custom' as FrequencyType, label: 'Custom (Every N days)' },
];

export const STATUS_OPTIONS = [
  { value: 'Not Started' as TaskStatus, label: 'Not Started' },
  { value: 'In Progress' as TaskStatus, label: 'In Progress' },
  { value: 'Completed' as TaskStatus, label: 'Completed' },
];