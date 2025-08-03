import { format } from 'date-fns';
import { fetchProjects } from './projects';
import { fetchTasksByGoal } from './tasks';
import { fetchDueChores } from './chores';
import { fetchDueHabits } from './habits';
import { fetchGoalsByProject } from './goals';
import { CalendarEventData, CalendarEvent } from '@/types/calendar';
import { Task, Project, Goal } from '@/types/project';
import { Chore, Habit } from '@/types/recurring';

export const fetchCalendarData = async (date: Date): Promise<CalendarEventData> => {
  const dateString = format(date, 'yyyy-MM-dd');
  
  try {
    // Fetch all data in parallel
    const [projects, chores, habits] = await Promise.all([
      fetchProjects(),
      fetchDueChores(dateString),
      fetchDueHabits(dateString)
    ]);

    // Fetch goals for all projects
    const goalsPromises = projects.map(project => fetchGoalsByProject(project.id));
    const goalsArrays = await Promise.all(goalsPromises);
    const goals = goalsArrays.flat();

    // Fetch tasks for all goals
    const tasksPromises = goals.map(goal => fetchTasksByGoal(goal.id));
    const tasksArrays = await Promise.all(tasksPromises);
    const tasks = tasksArrays.flat();

    return {
      tasks,
      chores,
      habits,
      projects,
      goals
    };
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    throw error;
  }
};

export const transformToCalendarEvents = (data: CalendarEventData): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Transform tasks
  data.tasks.forEach(task => {
    if (task.start_time && task.end_time) {
      const goal = data.goals.find(g => g.id === task.goal_id);
      const project = goal ? data.projects.find(p => p.id === goal.project_id) : undefined;
      
      events.push({
        id: `task-${task.id}`,
        title: task.name,
        start: new Date(task.start_time),
        end: new Date(task.end_time),
        type: 'task',
        color: project?.color || '#3b82f6',
        data: task,
        project,
        goal
      });
    }
  });

  // Transform chores
  data.chores.forEach(chore => {
    if (chore.start_time && chore.end_time) {
      events.push({
        id: `chore-${chore.id}`,
        title: chore.name,
        start: new Date(chore.start_time),
        end: new Date(chore.end_time),
        type: 'chore',
        color: '#10b981', // Green for chores
        data: chore
      });
    } else if (chore.eta_hours) {
      // Create a default time slot for chores without specific times
      const start = new Date();
      start.setHours(9, 0, 0, 0); // Default to 9 AM
      const end = new Date(start);
      end.setHours(start.getHours() + chore.eta_hours);
      
      events.push({
        id: `chore-${chore.id}`,
        title: chore.name,
        start,
        end,
        type: 'chore',
        color: '#10b981',
        data: chore
      });
    }
  });

  // Transform habits
  data.habits.forEach(habit => {
    if (habit.start_time && habit.end_time) {
      events.push({
        id: `habit-${habit.id}`,
        title: habit.name,
        start: new Date(habit.start_time),
        end: new Date(habit.end_time),
        type: 'habit',
        color: '#8b5cf6', // Purple for habits
        data: habit
      });
    } else if (habit.eta_hours) {
      // Create a default time slot for habits without specific times
      const start = new Date();
      start.setHours(7, 0, 0, 0); // Default to 7 AM for habits
      const end = new Date(start);
      end.setHours(start.getHours() + habit.eta_hours);
      
      events.push({
        id: `habit-${habit.id}`,
        title: habit.name,
        start,
        end,
        type: 'habit',
        color: '#8b5cf6',
        data: habit
      });
    }
  });

  return events;
};