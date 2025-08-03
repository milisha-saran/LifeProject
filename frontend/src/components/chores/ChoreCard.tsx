import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Edit, MoreVertical, Trash2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Chore } from '@/types/recurring';
import { 
  getFrequencyLabel, 
  isOverdue, 
  isDueToday, 
  getDaysUntilDue, 
  formatTimeEstimate 
} from '@/lib/utils/recurring';
import { cn } from '@/lib/utils';

interface ChoreCardProps {
  chore: Chore;
  onEdit: (chore: Chore) => void;
  onDelete: (chore: Chore) => void;
  onComplete: (chore: Chore) => void;
  isCompleting?: boolean;
}

export function ChoreCard({ chore, onEdit, onDelete, onComplete, isCompleting }: ChoreCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const overdue = isOverdue(chore.next_due_date);
  const dueToday = isDueToday(chore.next_due_date);
  const daysUntil = getDaysUntilDue(chore.next_due_date);

  const getStatusColor = () => {
    switch (chore.status) {
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
    return `Due ${format(new Date(chore.next_due_date), 'MMM d')}`;
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
            <h3 className="font-semibold text-lg truncate">{chore.name}</h3>
            {chore.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{chore.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getStatusColor()}>
              {chore.status}
            </Badge>
            
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onEdit(chore);
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
                    onDelete(chore);
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
          {/* Due date and frequency info */}
          <div className="flex items-center justify-between text-sm">
            <div className={cn('flex items-center gap-1', getDueDateColor())}>
              {overdue && <AlertTriangle className="h-4 w-4" />}
              <Clock className="h-4 w-4" />
              <span className="font-medium">{getDueDateText()}</span>
            </div>
            <span className="text-gray-500">
              {getFrequencyLabel(chore.frequency_type, chore.frequency_value)}
            </span>
          </div>

          {/* Time estimate and last completed */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {chore.eta_hours && (
                <span>Est: {formatTimeEstimate(chore.eta_hours)}</span>
              )}
            </div>
            <div>
              {chore.last_completed_date && (
                <span>Last: {format(new Date(chore.last_completed_date), 'MMM d')}</span>
              )}
            </div>
          </div>

          {/* Time range if specified */}
          {(chore.start_time || chore.end_time) && (
            <div className="text-sm text-gray-600">
              {chore.start_time && chore.end_time ? (
                <span>
                  {format(new Date(chore.start_time), 'h:mm a')} - {format(new Date(chore.end_time), 'h:mm a')}
                </span>
              ) : chore.start_time ? (
                <span>Starts: {format(new Date(chore.start_time), 'h:mm a')}</span>
              ) : (
                <span>Ends: {format(new Date(chore.end_time!), 'h:mm a')}</span>
              )}
            </div>
          )}

          {/* Complete button */}
          <div className="pt-2">
            <Button
              onClick={() => onComplete(chore)}
              disabled={isCompleting || chore.status === 'Completed'}
              className="w-full"
              variant={chore.status === 'Completed' ? 'outline' : 'default'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isCompleting ? 'Completing...' : 
               chore.status === 'Completed' ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}