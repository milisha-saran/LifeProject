import React from 'react';
import type { CalendarEvent } from '@/types/calendar';

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

export const CalendarEventComponent: React.FC<CalendarEventComponentProps> = ({ event }) => {
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

  const getEventSubtitle = () => {
    if (event.type === 'task' && event.project) {
      return event.project.name;
    }
    return event.type.charAt(0).toUpperCase() + event.type.slice(1);
  };

  return (
    <div className={`calendar-event-${event.type} h-full flex flex-col justify-center px-1`}>
      <div className="flex items-center gap-1 text-xs font-medium">
        <span className="text-xs">{getEventIcon()}</span>
        <span className="truncate">{event.title}</span>
      </div>
      <div className="text-xs opacity-75 truncate">
        {getEventSubtitle()}
      </div>
    </div>
  );
};