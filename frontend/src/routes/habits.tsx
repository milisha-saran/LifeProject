import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { HabitList } from '@/components/habits/HabitList';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useCompleteHabit } from '@/lib/queries/habits';
import { type HabitFormData } from '@/types/recurring';

export const Route = createFileRoute('/habits')({
  component: HabitsPage,
});

function HabitsPage() {
  const [completingIds, setCompletingIds] = useState<number[]>([]);

  const { data: habits = [], isLoading, error } = useHabits();
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const completeHabitMutation = useCompleteHabit();

  const handleCreateHabit = async (data: HabitFormData) => {
    try {
      await createHabitMutation.mutateAsync(data);
      toast.success('Habit created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create habit');
      throw error;
    }
  };

  const handleUpdateHabit = async (id: number, data: Partial<HabitFormData>) => {
    try {
      await updateHabitMutation.mutateAsync({ id, data });
      toast.success('Habit updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update habit');
      throw error;
    }
  };

  const handleDeleteHabit = async (id: number) => {
    try {
      await deleteHabitMutation.mutateAsync(id);
      toast.success('Habit deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete habit');
      throw error;
    }
  };

  const handleCompleteHabit = async (id: number) => {
    try {
      setCompletingIds(prev => [...prev, id]);
      await completeHabitMutation.mutateAsync({ id });
      toast.success('Habit completed! Streak updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete habit');
      throw error;
    } finally {
      setCompletingIds(prev => prev.filter(habitId => habitId !== id));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Habits</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <HabitList
        habits={habits}
        onCreateHabit={handleCreateHabit}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
        onCompleteHabit={handleCompleteHabit}
        isLoading={isLoading}
        isCreating={createHabitMutation.isPending}
        isUpdating={updateHabitMutation.isPending}
        isDeleting={deleteHabitMutation.isPending}
        completingIds={completingIds}
      />
    </div>
  );
}
