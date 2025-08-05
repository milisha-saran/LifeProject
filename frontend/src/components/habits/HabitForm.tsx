import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type Habit, type HabitFormData, FREQUENCY_OPTIONS, STATUS_OPTIONS } from '@/types/recurring';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  description: z.string().optional(),
  start_time: z.date().optional(),
  end_time: z.date().optional(),
  eta_hours: z.number().min(0.1, 'ETA must be at least 0.1 hours').optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']),
  frequency_type: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']),
  frequency_value: z.number().min(1, 'Frequency value must be at least 1'),
  next_due_date: z.date(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
}).refine((data) => {
  if (data.frequency_type !== 'custom') {
    return data.frequency_value === 1;
  }
  return true;
}, {
  message: 'Frequency value must be 1 for non-custom frequency types',
  path: ['frequency_value'],
});

interface HabitFormProps {
  habit?: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
  isLoading?: boolean;
}

export function HabitForm({ habit, open, onOpenChange, onSubmit, isLoading }: HabitFormProps) {
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: habit ? {
      name: habit.name,
      description: habit.description || '',
      start_time: habit.start_time ? new Date(habit.start_time) : undefined,
      end_time: habit.end_time ? new Date(habit.end_time) : undefined,
      eta_hours: habit.eta_hours,
      status: habit.status,
      frequency_type: habit.frequency_type,
      frequency_value: habit.frequency_value,
      next_due_date: new Date(habit.next_due_date),
    } : {
      status: 'Not Started',
      frequency_type: 'daily',
      frequency_value: 1,
      next_due_date: new Date(),
    },
  });

  const watchedFrequencyType = watch('frequency_type');
  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');
  const watchedDueDate = watch('next_due_date');

  const handleFormSubmit = async (data: HabitFormData) => {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter habit name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter habit description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="frequency_type">Frequency *</Label>
              <Select
                value={watchedFrequencyType}
                onValueChange={(value) => {
                  setValue('frequency_type', value as any);
                  if (value !== 'custom') {
                    setValue('frequency_value', 1);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequency_type && (
                <p className="text-sm text-red-600 mt-1">{errors.frequency_type.message}</p>
              )}
            </div>

            {watchedFrequencyType === 'custom' && (
              <div>
                <Label htmlFor="frequency_value">Every N Days *</Label>
                <Input
                  id="frequency_value"
                  type="number"
                  min="1"
                  {...register('frequency_value', { valueAsNumber: true })}
                  placeholder="Enter number of days"
                />
                {errors.frequency_value && (
                  <p className="text-sm text-red-600 mt-1">{errors.frequency_value.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg z-[100]">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Next Due Date *</Label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchedDueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedDueDate ? format(watchedDueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-white border-gray-200 shadow-lg z-[100]">
                  <Calendar
                    mode="single"
                    selected={watchedDueDate}
                    onSelect={(date) => {
                      if (date) {
                        setValue('next_due_date', date);
                        setDueDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.next_due_date && (
                <p className="text-sm text-red-600 mt-1">{errors.next_due_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="eta_hours">Estimated Hours</Label>
              <Input
                id="eta_hours"
                type="number"
                step="0.1"
                min="0.1"
                {...register('eta_hours', { valueAsNumber: true })}
                placeholder="e.g., 0.5"
              />
              {errors.eta_hours && (
                <p className="text-sm text-red-600 mt-1">{errors.eta_hours.message}</p>
              )}
            </div>

            <div>
              <Label>Start Time</Label>
              <Popover open={startTimeOpen} onOpenChange={setStartTimeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchedStartTime && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedStartTime ? format(watchedStartTime, 'PPP p') : 'Pick start time'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-lg z-[100]">
                  <Calendar
                    mode="single"
                    selected={watchedStartTime}
                    onSelect={(date) => {
                      if (date) {
                        setValue('start_time', date);
                        setStartTimeOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Time</Label>
              <Popover open={endTimeOpen} onOpenChange={setEndTimeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchedEndTime && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedEndTime ? format(watchedEndTime, 'PPP p') : 'Pick end time'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-lg z-[100]">
                  <Calendar
                    mode="single"
                    selected={watchedEndTime}
                    onSelect={(date) => {
                      if (date) {
                        setValue('end_time', date);
                        setEndTimeOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.end_time && (
                <p className="text-sm text-red-600 mt-1">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}