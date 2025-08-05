import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { CalendarFilters } from './CalendarFilters';
import { useCalendarEvents, useMoveEvent, useCompleteEvent } from '@/lib/queries/calendar';
import type { CalendarEvent, TimeSlot, CalendarFilters as FilterType } from '@/types/calendar';
import { toast } from 'sonner';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<FilterType>({
    showTasks: true,
    showChores: true,
    showHabits: true,
    projectIds: [],
  });

  const { data: events = [], isLoading, error } = useCalendarEvents(currentDate);
  const moveEventMutation = useMoveEvent();
  const completeEventMutation = useCompleteEvent();

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    if (!filters.showTasks && event.type === 'task') return false;
    if (!filters.showChores && event.type === 'chore') return false;
    if (!filters.showHabits && event.type === 'habit') return false;
    
    if (filters.projectIds.length > 0 && event.project) {
      return filters.projectIds.includes(event.project.id);
    }
    
    return true;
  });

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleEventMove = async (event: CalendarEvent, timeSlot: TimeSlot) => {
    try {
      await moveEventMutation.mutateAsync({ event, timeSlot });
      toast.success('Event moved successfully');
    } catch (error) {
      toast.error('Failed to move event');
      console.error('Error moving event:', error);
    }
  };

  const handleEventComplete = async (event: CalendarEvent) => {
    try {
      await completeEventMutation.mutateAsync(event);
      toast.success(`${event.type.charAt(0).toUpperCase() + event.type.slice(1)} completed!`);
    } catch (error) {
      toast.error('Failed to complete event');
      console.error('Error completing event:', error);
    }
  };

  const handleEventEdit = (event: CalendarEvent) => {
    // For now, just log the event
    // In a full implementation, this would open the appropriate edit form
    console.log('Edit event:', event);
    toast.info('Edit functionality coming soon');
  };

  const handleEventDelete = (event: CalendarEvent) => {
    // For now, just log the event
    // In a full implementation, this would delete the event
    console.log('Delete event:', event);
    toast.info('Delete functionality coming soon');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-600 mb-2">Failed to load calendar events</div>
          <div className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar with filters */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <CalendarFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Main calendar area */}
        <div className="flex-1 flex flex-col">
          <Calendar
            events={filteredEvents}
            date={currentDate}
            onDateChange={handleDateChange}
            onEventMove={handleEventMove}
            onEventComplete={handleEventComplete}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDelete}
            loading={isLoading || moveEventMutation.isPending || completeEventMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};