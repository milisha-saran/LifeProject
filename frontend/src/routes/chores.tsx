import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { ChoreList } from '@/components/chores/ChoreList';
import { useChores, useCreateChore, useUpdateChore, useDeleteChore, useCompleteChore } from '@/lib/queries/chores';
import { type ChoreFormData } from '@/types/recurring';

export const Route = createFileRoute('/chores')({
  component: ChoresPage,
});

function ChoresPage() {
  const [completingIds, setCompletingIds] = useState<number[]>([]);

  const { data: chores = [], isLoading, error } = useChores();
  const createChoreMutation = useCreateChore();
  const updateChoreMutation = useUpdateChore();
  const deleteChoreMutation = useDeleteChore();
  const completeChoreMutation = useCompleteChore();

  const handleCreateChore = async (data: ChoreFormData) => {
    try {
      await createChoreMutation.mutateAsync(data);
      toast.success('Chore created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create chore');
      throw error;
    }
  };

  const handleUpdateChore = async (id: number, data: Partial<ChoreFormData>) => {
    try {
      await updateChoreMutation.mutateAsync({ id, data });
      toast.success('Chore updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update chore');
      throw error;
    }
  };

  const handleDeleteChore = async (id: number) => {
    try {
      await deleteChoreMutation.mutateAsync(id);
      toast.success('Chore deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete chore');
      throw error;
    }
  };

  const handleCompleteChore = async (id: number) => {
    try {
      setCompletingIds(prev => [...prev, id]);
      await completeChoreMutation.mutateAsync({ id });
      toast.success('Chore completed! Next instance scheduled.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete chore');
      throw error;
    } finally {
      setCompletingIds(prev => prev.filter(choreId => choreId !== id));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Chores</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChoreList
        chores={chores}
        onCreateChore={handleCreateChore}
        onUpdateChore={handleUpdateChore}
        onDeleteChore={handleDeleteChore}
        onCompleteChore={handleCompleteChore}
        isLoading={isLoading}
        isCreating={createChoreMutation.isPending}
        isUpdating={updateChoreMutation.isPending}
        isDeleting={deleteChoreMutation.isPending}
        completingIds={completingIds}
      />
    </div>
  );
}
