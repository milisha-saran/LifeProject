import React, { useEffect, useRef } from 'react';
import type { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface EventPopoverProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const EventPopover: React.FC<EventPopoverProps> = ({
  event,
  position,
  onEdit,
  onComplete,
  onDelete,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getEventTypeColor = () => {
    switch (event.type) {
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'chore':
        return 'bg-green-100 text-green-800';
      case 'habit':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = () => {
    switch (event.type) {
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

  const isCompleted = () => {
    return event.data.status === 'Completed';
  };

  return (
    <div
      ref={popoverRef}
      className="calendar-popover"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="calendar-popover-arrow" />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getEventIcon()}</span>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{event.title}</h3>
              <Badge variant="secondary" className={`text-xs ${getEventTypeColor()}`}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Event details */}
        <div className="space-y-2 mb-4 text-xs text-gray-600">
          <div>
            <strong>Time:</strong> {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
          </div>
          
          {event.project && (
            <div>
              <strong>Project:</strong> {event.project.name}
            </div>
          )}
          
          {event.goal && (
            <div>
              <strong>Goal:</strong> {event.goal.name}
            </div>
          )}
          
          {event.data.description && (
            <div>
              <strong>Description:</strong> {event.data.description}
            </div>
          )}
          
          <div>
            <strong>Status:</strong> 
            <Badge 
              variant={isCompleted() ? "default" : "secondary"}
              className="ml-1 text-xs"
            >
              {event.data.status}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isCompleted() && (
            <Button
              size="sm"
              onClick={onComplete}
              className="flex-1 text-xs h-8"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-xs h-8"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-xs h-8 px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};