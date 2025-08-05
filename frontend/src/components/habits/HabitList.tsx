import { useState } from 'react';
import { Plus, Filter, Search, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';
import { type Habit, type HabitFormData, type FrequencyType, type TaskStatus } from '@/types/recurring';
import { isOverdue, isDueToday } from '@/lib/utils/recurring';

interface HabitListProps {
  habits: Habit[];
  onCreateHabit: (data: HabitFormData) => Promise<void>;
  onUpdateHabit: (id: number, data: Partial<HabitFormData>) => Promise<void>;
  onDeleteHabit: (id: number) => Promise<void>;
  onCompleteHabit: (id: number) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  completingIds?: number[];
}

type FilterType = 'all' | 'overdue' | 'due-today' | 'upcoming' | 'completed';
type StreakFilter = 'all' | 'active' | 'broken' | 'long';

export function HabitList({
  habits,
  onCreateHabit,
  onUpdateHabit,
  onDeleteHabit,
  onCompleteHabit,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  completingIds = [],
}: HabitListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyType | 'all'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<FilterType>('all');
  const [streakFilter, setStreakFilter] = useState<StreakFilter>('all');

  const filteredHabits = habits.filter((habit) => {
    // Search filter
    if (searchQuery && !habit.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !habit.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && habit.status !== statusFilter) {
      return false;
    }

    // Frequency filter
    if (frequencyFilter !== 'all' && habit.frequency_type !== frequencyFilter) {
      return false;
    }

    // Due date filter
    if (dueDateFilter !== 'all') {
      switch (dueDateFilter) {
        case 'overdue':
          return isOverdue(habit.next_due_date);
        case 'due-today':
          return isDueToday(habit.next_due_date);
        case 'upcoming':
          return !isOverdue(habit.next_due_date) && !isDueToday(habit.next_due_date);
        case 'completed':
          return habit.status === 'Completed';
        default:
          return true;
      }
    }

    // Streak filter
    if (streakFilter !== 'all') {
      switch (streakFilter) {
        case 'active':
          return habit.streak_count > 0;
        case 'broken':
          return habit.streak_count === 0 && habit.last_completed_date;
        case 'long':
          return habit.streak_count >= 7;
        default:
          return true;
      }
    }

    return true;
  });

  // Sort habits: overdue first, then due today, then by streak (highest first), then by due date
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    const aOverdue = isOverdue(a.next_due_date);
    const bOverdue = isOverdue(b.next_due_date);
    const aDueToday = isDueToday(a.next_due_date);
    const bDueToday = isDueToday(b.next_due_date);

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (aDueToday && !bDueToday) return -1;
    if (!aDueToday && bDueToday) return 1;

    // Sort by streak count (descending)
    if (b.streak_count !== a.streak_count) {
      return b.streak_count - a.streak_count;
    }

    return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
  });

  const handleCreateHabit = async (data: HabitFormData) => {
    await onCreateHabit(data);
  };

  const handleUpdateHabit = async (data: HabitFormData) => {
    if (editingHabit) {
      await onUpdateHabit(editingHabit.id, data);
      setEditingHabit(undefined);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleDeleteHabit = async (habit: Habit) => {
    if (confirm(`Are you sure you want to delete "${habit.name}"? This will reset your streak.`)) {
      await onDeleteHabit(habit.id);
    }
  };

  const handleCompleteHabit = async (habit: Habit) => {
    await onCompleteHabit(habit.id);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingHabit(undefined);
  };

  const overdueCount = habits.filter(habit => isOverdue(habit.next_due_date)).length;
  const dueTodayCount = habits.filter(habit => isDueToday(habit.next_due_date)).length;
  const activeStreaks = habits.filter(habit => habit.streak_count > 0).length;
  const totalStreakDays = habits.reduce((sum, habit) => sum + habit.streak_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-gray-600 mt-1">
            Build positive routines and track your progress
          </p>
          <div className="flex gap-6 mt-2 text-sm">
            {activeStreaks > 0 && (
              <div className="flex items-center gap-1 text-orange-600 font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>{activeStreaks} active streak{activeStreaks > 1 ? 's' : ''}</span>
              </div>
            )}
            {totalStreakDays > 0 && (
              <span className="text-green-600 font-medium">
                {totalStreakDays} total streak days
              </span>
            )}
            {overdueCount > 0 && (
              <span className="text-red-600 font-medium">
                {overdueCount} overdue
              </span>
            )}
            {dueTodayCount > 0 && (
              <span className="text-orange-600 font-medium">
                {dueTodayCount} due today
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={dueDateFilter} onValueChange={(value) => setDueDateFilter(value as FilterType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Due date" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due-today">Due Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={streakFilter} onValueChange={(value) => setStreakFilter(value as StreakFilter)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Streak" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
            <SelectItem value="all">All Streaks</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="broken">Broken</SelectItem>
            <SelectItem value="long">7+ Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={frequencyFilter} onValueChange={(value) => setFrequencyFilter(value as FrequencyType | 'all')}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
            <SelectItem value="all">All Frequencies</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Biweekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Habit Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading habits...</p>
        </div>
      ) : sortedHabits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {habits.length === 0 ? 'No habits yet. Create your first habit!' : 'No habits match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
              onComplete={handleCompleteHabit}
              isCompleting={completingIds.includes(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <HabitForm
        habit={editingHabit}
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}