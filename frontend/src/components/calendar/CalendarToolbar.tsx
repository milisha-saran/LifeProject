import React from 'react';
import { type View, Views } from 'react-big-calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';

interface CalendarToolbarProps {
  date: Date;
  view: View;
  onDateChange: (date: Date) => void;
  onViewChange: (view: View) => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  date,
  view,
  onDateChange,
  onViewChange,
}) => {
  const navigateBack = () => {
    if (view === Views.DAY) {
      onDateChange(subDays(date, 1));
    } else if (view === Views.WEEK) {
      onDateChange(subWeeks(date, 1));
    }
  };

  const navigateForward = () => {
    if (view === Views.DAY) {
      onDateChange(addDays(date, 1));
    } else if (view === Views.WEEK) {
      onDateChange(addWeeks(date, 1));
    }
  };

  const navigateToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    if (view === Views.DAY) {
      return format(date, 'EEEE, MMMM d, yyyy');
    } else if (view === Views.WEEK) {
      const startOfWeek = subDays(date, date.getDay());
      const endOfWeek = addDays(startOfWeek, 6);
      return `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
    }
    return format(date, 'MMMM yyyy');
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={navigateToday}
          className="text-sm"
        >
          <CalendarIcon className="h-4 w-4 mr-1" />
          Today
        </Button>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateForward}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center - Date label */}
      <div className="flex-1 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {getDateLabel()}
        </h2>
      </div>

      {/* Right side - View selector */}
      <div className="flex items-center gap-1">
        <Button
          variant={view === Views.DAY ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.DAY)}
          className="text-sm"
        >
          Day
        </Button>
        
        <Button
          variant={view === Views.WEEK ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(Views.WEEK)}
          className="text-sm"
        >
          Week
        </Button>
      </div>
    </div>
  );
};