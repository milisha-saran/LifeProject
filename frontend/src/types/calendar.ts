import { Task, Project, Goal } from './project';
import { Chore, Habit } from './recurring';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'chore' | 'habit';
  color: string;
  data: Task | Chore | Habit;
  project?: Project;
  goal?: Goal;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface CalendarEventData {
  tasks: Task[];
  chores: Chore[];
  habits: Habit[];
  projects: Project[];
  goals: Goal[];
}

export interface EventPopoverProps {
  event: CalendarEvent;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export interface CreateEventData {
  type: 'task' | 'chore' | 'habit';
  timeSlot: TimeSlot;
  goalId?: number;
}

export interface CalendarFilters {
  showTasks: boolean;
  showChores: boolean;
  showHabits: boolean;
  projectIds: number[];
}