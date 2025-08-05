import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimeSlot } from '@/types/calendar';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

interface CreateEventDialogProps {
  timeSlot: TimeSlot;
  onClose: () => void;
}

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  timeSlot,
  onClose,
}) => {
  const [eventType, setEventType] = useState<'task' | 'chore' | 'habit' | ''>('');

  const handleCreate = () => {
    if (!eventType) return;
    
    // For now, just close the dialog
    // In a full implementation, this would navigate to the appropriate form
    // or open a specific creation dialog for the selected type
    console.log(`Creating ${eventType} for time slot:`, timeSlot);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'chore':
        return '🧹';
      case 'habit':
        return '⭐';
      default:
        return '📅';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'task':
        return 'Create a new task for a specific goal';
      case 'chore':
        return 'Schedule a recurring chore';
      case 'habit':
        return 'Add a habit to track';
      default:
        return '';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Time slot info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Selected Time Slot
            </div>
            <div className="text-sm text-gray-600">
              {format(timeSlot.start, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-sm text-gray-600">
              {format(timeSlot.start, 'HH:mm')} - {format(timeSlot.end, 'HH:mm')}
            </div>
          </div>

          {/* Event type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Event Type
            </label>
            <Select value={eventType} onValueChange={(value: 'task' | 'chore' | 'habit') => setEventType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
                <SelectItem value="task">
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon('task')}</span>
                    <div>
                      <div className="font-medium">Task</div>
                      <div className="text-xs text-gray-500">
                        {getTypeDescription('task')}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="chore">
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon('chore')}</span>
                    <div>
                      <div className="font-medium">Chore</div>
                      <div className="text-xs text-gray-500">
                        {getTypeDescription('chore')}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="habit">
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon('habit')}</span>
                    <div>
                      <div className="font-medium">Habit</div>
                      <div className="text-xs text-gray-500">
                        {getTypeDescription('habit')}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!eventType}
              className="flex-1"
            >
              Create {eventType && eventType.charAt(0).toUpperCase() + eventType.slice(1)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};