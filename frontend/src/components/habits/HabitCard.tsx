import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Edit, MoreVertical, Trash2, AlertTriangle, Flame } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Habit } from '@/types/recurring';
import { 
  getFrequencyLabel, 
  isOverdue, 
  isDueToday, 
  getDaysUntilDue, 
  formatTimeEstimate,
  getStreakColor,
  getStreakEmoji
} from '@/lib/utils/recurring';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onComplete: (habit: Habit) => void;
  isCompleting?: boolean;
}

export function HabitCard({ habit, onEdit, onDelete, onComplete, isCompleting }: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const overdue = isOverdue(habit.next_due_date);
  const dueToday = isDueToday(habit.next_due_date);
  const daysUntil = getDaysUntilDue(habit.next_due_date);

  const getStatusColor = () => {
    switch (habit.status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateColor = () => {
    if (overdue) return 'text-red-600';
    if (dueToday) return 'text-orange-600';
    if (daysUntil <= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getDueDateText = () => {
    if (overdue) {
      const daysPast = Math.abs(daysUntil);
      return `Overdue by ${daysPast} day${daysPast > 1 ? 's' : ''}`;
    }
    if (dueToday) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    return `Due ${format(new Date(habit.next_due_date), 'MMM d')}`;
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      overdue && 'border-red-200 bg-red-50/30',
      dueToday && 'border-orange-200 bg-orange-50/30'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{habit.name}</h3>
              {/* Streak indicator */}
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                habit.streak_count > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
              )}>
                <span className="text-sm">{getStreakEmoji(habit.streak_count)}</span>
                <span>{habit.streak_count}</span>
              </div>
            </div>
            {habit.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{habit.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getStatusColor()}>
              {habit.status}
            </Badge>
            
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1 bg-white border-gray-200 shadow-lg z-[100]" align="end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onEdit(habit);
                    setMenuOpen(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    onDelete(habit);
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Streak details */}
          {habit.streak_count > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className={cn('flex items-center gap-1', getStreakColor(habit.streak_count))}>
                <Flame className="h-4 w-4" />
                <span className="font-medium">
                  {habit.streak_count} day streak
                </span>
              </div>
              {habit.last_completed_date && (
                <span className="text-gray-500">
                  Last: {format(new Date(habit.last_completed_date), 'MMM d')}
                </span>
              )}
            </div>
          )}

          {/* Due date and frequency info */}
          <div className="flex items-center justify-between text-sm">
            <div className={cn('flex items-center gap-1', getDueDateColor())}>
              {overdue && <AlertTriangle className="h-4 w-4" />}
              <Clock className="h-4 w-4" />
              <span className="font-medium">{getDueDateText()}</span>
            </div>
            <span className="text-gray-500">
              {getFrequencyLabel(habit.frequency_type, habit.frequency_value)}
            </span>
          </div>

          {/* Time estimate */}
          {habit.eta_hours && (
            <div className="text-sm text-gray-600">
              <span>Est: {formatTimeEstimate(habit.eta_hours)}</span>
            </div>
          )}

          {/* Time range if specified */}
          {(habit.start_time || habit.end_time) && (
            <div className="text-sm text-gray-600">
              {habit.start_time && habit.end_time ? (
                <span>
                  {format(new Date(habit.start_time), 'h:mm a')} - {format(new Date(habit.end_time), 'h:mm a')}
                </span>
              ) : habit.start_time ? (
                <span>Starts: {format(new Date(habit.start_time), 'h:mm a')}</span>
              ) : (
                <span>Ends: {format(new Date(habit.end_time!), 'h:mm a')}</span>
              )}
            </div>
          )}

          {/* Complete button */}
          <div className="pt-2">
            <Button
              onClick={() => onComplete(habit)}
              disabled={isCompleting || habit.status === 'Completed'}
              className="w-full"
              variant={habit.status === 'Completed' ? 'outline' : 'default'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isCompleting ? 'Completing...' : 
               habit.status === 'Completed' ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}