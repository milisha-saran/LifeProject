import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChoreCard } from './ChoreCard';
import { ChoreForm } from './ChoreForm';
import { type Chore, type ChoreFormData, type FrequencyType, type TaskStatus } from '@/types/recurring';
import { isOverdue, isDueToday } from '@/lib/utils/recurring';

interface ChoreListProps {
  chores: Chore[];
  onCreateChore: (data: ChoreFormData) => Promise<void>;
  onUpdateChore: (id: number, data: Partial<ChoreFormData>) => Promise<void>;
  onDeleteChore: (id: number) => Promise<void>;
  onCompleteChore: (id: number) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  completingIds?: number[];
}

type FilterType = 'all' | 'overdue' | 'due-today' | 'upcoming' | 'completed';

export function ChoreList({
  chores,
  onCreateChore,
  onUpdateChore,
  onDeleteChore,
  onCompleteChore,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  completingIds = [],
}: ChoreListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyType | 'all'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<FilterType>('all');

  const filteredChores = chores.filter((chore) => {
    // Search filter
    if (searchQuery && !chore.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !chore.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && chore.status !== statusFilter) {
      return false;
    }

    // Frequency filter
    if (frequencyFilter !== 'all' && chore.frequency_type !== frequencyFilter) {
      return false;
    }

    // Due date filter
    if (dueDateFilter !== 'all') {
      switch (dueDateFilter) {
        case 'overdue':
          return isOverdue(chore.next_due_date);
        case 'due-today':
          return isDueToday(chore.next_due_date);
        case 'upcoming':
          return !isOverdue(chore.next_due_date) && !isDueToday(chore.next_due_date);
        case 'completed':
          return chore.status === 'Completed';
        default:
          return true;
      }
    }

    return true;
  });

  // Sort chores: overdue first, then due today, then by due date
  const sortedChores = [...filteredChores].sort((a, b) => {
    const aOverdue = isOverdue(a.next_due_date);
    const bOverdue = isOverdue(b.next_due_date);
    const aDueToday = isDueToday(a.next_due_date);
    const bDueToday = isDueToday(b.next_due_date);

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (aDueToday && !bDueToday) return -1;
    if (!aDueToday && bDueToday) return 1;

    return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
  });

  const handleCreateChore = async (data: ChoreFormData) => {
    await onCreateChore(data);
  };

  const handleUpdateChore = async (data: ChoreFormData) => {
    if (editingChore) {
      await onUpdateChore(editingChore.id, data);
      setEditingChore(undefined);
    }
  };

  const handleEditChore = (chore: Chore) => {
    setEditingChore(chore);
    setFormOpen(true);
  };

  const handleDeleteChore = async (chore: Chore) => {
    if (confirm(`Are you sure you want to delete "${chore.name}"?`)) {
      await onDeleteChore(chore.id);
    }
  };

  const handleCompleteChore = async (chore: Chore) => {
    await onCompleteChore(chore.id);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingChore(undefined);
  };

  const overdueCount = chores.filter(chore => isOverdue(chore.next_due_date)).length;
  const dueTodayCount = chores.filter(chore => isDueToday(chore.next_due_date)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chores</h1>
          <p className="text-gray-600 mt-1">
            Manage your recurring maintenance tasks
          </p>
          {(overdueCount > 0 || dueTodayCount > 0) && (
            <div className="flex gap-4 mt-2 text-sm">
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
          )}
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chore
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chores..."
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
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due-today">Due Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectContent>
            <SelectItem value="all">All Frequencies</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Biweekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chore Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading chores...</p>
        </div>
      ) : sortedChores.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {chores.length === 0 ? 'No chores yet. Create your first chore!' : 'No chores match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChores.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              onEdit={handleEditChore}
              onDelete={handleDeleteChore}
              onComplete={handleCompleteChore}
              isCompleting={completingIds.includes(chore.id)}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <ChoreForm
        chore={editingChore}
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingChore ? handleUpdateChore : handleCreateChore}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}