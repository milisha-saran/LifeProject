import { type Project } from '@/types/project';
import { type Chore, type Habit } from '@/types/recurring';
import { type DashboardStats, type Activity, type Deadline, type ProjectProgress, type HabitStreak } from '@/types/dashboard';
import { fetchProjects } from './projects';
import { fetchChores, fetchDueChores } from './chores';
import { fetchHabits, fetchDueHabits } from './habits';
import { fetchGoalsByProject } from './goals';
import { fetchTasksByGoal } from './tasks';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () => localStorage.getItem('auth_token');

// Helper function to check if a date is overdue
const isOverdue = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Helper function to check if a date is within the next 7 days
const isUpcoming = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return date >= today && date <= nextWeek;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [projects, chores, habits] = await Promise.all([
      fetchProjects(),
      fetchChores(),
      fetchHabits()
    ]);

    // Calculate active projects
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;

    // Get all goals and tasks to calculate completed tasks
    const allGoals = await Promise.all(
      projects.map(project => fetchGoalsByProject(project.id))
    );
    const flatGoals = allGoals.flat();
    
    const allTasks = await Promise.all(
      flatGoals.map(goal => fetchTasksByGoal(goal.id))
    );
    const flatTasks = allTasks.flat();
    const completedTasks = flatTasks.filter(t => t.status === 'Completed').length;

    // Calculate current streaks (habits with streak > 0)
    const currentStreaks = habits.filter(h => h.streak_count > 0).length;

    // Calculate weekly progress (percentage of completed vs total items this week)
    const totalItems = flatTasks.length + chores.length + habits.length;
    const completedItems = flatTasks.filter(t => t.status === 'Completed').length + 
                          chores.filter(c => c.status === 'Completed').length +
                          habits.filter(h => h.status === 'Completed').length;
    const weeklyProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Calculate overdue items
    const overdueChores = chores.filter(c => c.status !== 'Completed' && isOverdue(c.next_due_date)).length;
    const overdueHabits = habits.filter(h => h.status !== 'Completed' && isOverdue(h.next_due_date)).length;
    const overdueProjects = projects.filter(p => p.status !== 'Completed' && p.end_date && isOverdue(p.end_date)).length;
    const overdueItems = overdueChores + overdueHabits + overdueProjects;

    // Calculate upcoming deadlines
    const upcomingChores = chores.filter(c => c.status !== 'Completed' && isUpcoming(c.next_due_date)).length;
    const upcomingHabits = habits.filter(h => h.status !== 'Completed' && isUpcoming(h.next_due_date)).length;
    const upcomingProjects = projects.filter(p => p.status !== 'Completed' && p.end_date && isUpcoming(p.end_date)).length;
    const upcomingDeadlines = upcomingChores + upcomingHabits + upcomingProjects;

    return {
      activeProjects,
      completedTasks,
      currentStreaks,
      weeklyProgress,
      overdueItems,
      upcomingDeadlines
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};

export const fetchRecentActivity = async (): Promise<Activity[]> => {
  try {
    // For now, we'll generate mock recent activity since the backend doesn't have an activity log
    // In a real implementation, this would come from an activity/audit log API
    const activities: Activity[] = [
      {
        id: '1',
        type: 'task_completed',
        description: 'Completed task: Review project requirements',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        type: 'habit_completed',
        description: 'Completed habit: Morning exercise',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: '3',
        type: 'chore_completed',
        description: 'Completed chore: Weekly grocery shopping',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      },
      {
        id: '4',
        type: 'project_created',
        description: 'Created new project: Website redesign',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    throw new Error('Failed to fetch recent activity');
  }
};

export const fetchUpcomingDeadlines = async (): Promise<Deadline[]> => {
  try {
    const [projects, chores, habits] = await Promise.all([
      fetchProjects(),
      fetchDueChores(),
      fetchDueHabits()
    ]);

    const deadlines: Deadline[] = [];

    // Add project deadlines
    projects.forEach(project => {
      if (project.end_date && project.status !== 'Completed') {
        deadlines.push({
          id: project.id,
          name: project.name,
          type: 'project',
          dueDate: project.end_date,
          status: project.status,
          isOverdue: isOverdue(project.end_date),
          color: project.color
        });
      }
    });

    // Add chore deadlines
    chores.forEach(chore => {
      if (chore.status !== 'Completed') {
        deadlines.push({
          id: chore.id,
          name: chore.name,
          type: 'chore',
          dueDate: chore.next_due_date,
          status: chore.status,
          isOverdue: isOverdue(chore.next_due_date),
          color: '#f97316' // orange color for chores
        });
      }
    });

    // Add habit deadlines
    habits.forEach(habit => {
      if (habit.status !== 'Completed') {
        deadlines.push({
          id: habit.id,
          name: habit.name,
          type: 'habit',
          dueDate: habit.next_due_date,
          status: habit.status,
          isOverdue: isOverdue(habit.next_due_date),
          color: '#10b981' // green color for habits
        });
      }
    });

    // Sort by due date (overdue first, then by date)
    return deadlines.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } catch (error) {
    console.error('Failed to fetch upcoming deadlines:', error);
    throw new Error('Failed to fetch upcoming deadlines');
  }
};

export const fetchProjectProgress = async (): Promise<ProjectProgress[]> => {
  try {
    const projects = await fetchProjects();
    
    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        try {
          const goals = await fetchGoalsByProject(project.id);
          const completedGoals = goals.filter(g => g.status === 'Completed');
          
          // Calculate progress based on completed goals
          const progress = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;
          
          // Calculate total and completed hours
          const totalHours = goals.reduce((sum, goal) => sum + goal.weekly_hours, 0);
          const completedHours = completedGoals.reduce((sum, goal) => sum + goal.weekly_hours, 0);
          
          return {
            id: project.id,
            name: project.name,
            color: project.color,
            status: project.status,
            progress,
            totalHours,
            completedHours,
            goalsCount: goals.length,
            completedGoalsCount: completedGoals.length
          };
        } catch (error) {
          console.error(`Failed to fetch goals for project ${project.id}:`, error);
          return {
            id: project.id,
            name: project.name,
            color: project.color,
            status: project.status,
            progress: 0,
            totalHours: project.weekly_hours,
            completedHours: 0,
            goalsCount: 0,
            completedGoalsCount: 0
          };
        }
      })
    );

    return projectProgress.sort((a, b) => b.progress - a.progress);
  } catch (error) {
    console.error('Failed to fetch project progress:', error);
    throw new Error('Failed to fetch project progress');
  }
};

export const fetchHabitStreaks = async (): Promise<HabitStreak[]> => {
  try {
    const habits = await fetchHabits();
    
    return habits
      .map(habit => ({
        id: habit.id,
        name: habit.name,
        streakCount: habit.streak_count,
        lastCompleted: habit.last_completed_date,
        nextDue: habit.next_due_date,
        isOverdue: isOverdue(habit.next_due_date)
      }))
      .sort((a, b) => b.streakCount - a.streakCount);
  } catch (error) {
    console.error('Failed to fetch habit streaks:', error);
    throw new Error('Failed to fetch habit streaks');
  }
};