import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { type Task, type TaskFormData, type Goal } from '@/types/project'
import { validateTaskHours } from '@/lib/utils/timeAllocation'
import { useCreateTask, useUpdateTask } from '@/lib/queries/tasks'

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  weekly_hours: z.number().min(0.5, 'Must allocate at least 0.5 hours').max(168, 'Cannot exceed 168 hours per week'),
  start_time: z.date().optional(),
  end_time: z.date().optional(),
  eta_hours: z.number().min(0).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["end_time"],
})

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  goal: Goal
  existingTasks: Task[]
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  goal,
  existingTasks,
}: TaskFormProps) {
  const [validationError, setValidationError] = useState<string>('')

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: task?.name || '',
      description: task?.description || '',
      weekly_hours: task?.weekly_hours || 1,
      start_time: task?.start_time ? new Date(task.start_time) : undefined,
      end_time: task?.end_time ? new Date(task.end_time) : undefined,
      eta_hours: task?.eta_hours || undefined,
      status: task?.status || 'Not Started',
    },
  })

  const watchedHours = form.watch('weekly_hours')

  // Validate hours in real-time
  const hoursValidation = validateTaskHours(
    goal,
    existingTasks,
    watchedHours || 0,
    task?.id
  )

  const handleSubmit = async (data: TaskFormData) => {
    setValidationError('')
    
    // Final validation before submission
    const validation = validateTaskHours(
      goal,
      existingTasks,
      data.weekly_hours,
      task?.id
    )
    
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid hours allocation')
      return
    }

    try {
      if (task) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          data,
        })
      } else {
        await createTaskMutation.mutateAsync({
          goalId: goal.id,
          data,
        })
      }
      form.reset()
      onOpenChange(false)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to save task')
    }
  }

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? 'Update the task details below.'
              : `Create a new task for ${goal.name}. Available hours: ${hoursValidation.remainingHours}h/week`
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this task..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weekly_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="168"
                        placeholder="1.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {!hoursValidation.isValid && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{hoursValidation.error}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eta_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ETA Hours (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="2.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Time (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP p')
                            ) : (
                              <span>Pick a date & time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const goalStart = new Date(goal.start_date)
                            const goalEnd = goal.end_date ? new Date(goal.end_date) : null
                            return date < goalStart || (goalEnd && date > goalEnd)
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, 'HH:mm') : ''}
                            onChange={(e) => {
                              if (field.value && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':')
                                const newDate = new Date(field.value)
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Time (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP p')
                            ) : (
                              <span>Pick a date & time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startTime = form.getValues('start_time')
                            const goalStart = new Date(goal.start_date)
                            const goalEnd = goal.end_date ? new Date(goal.end_date) : null
                            return (
                              date < goalStart ||
                              (goalEnd && date > goalEnd) ||
                              (startTime && date < startTime)
                            )
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, 'HH:mm') : ''}
                            onChange={(e) => {
                              if (field.value && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':')
                                const newDate = new Date(field.value)
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {validationError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>{validationError}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !hoursValidation.isValid}
                className="brand-gradient text-white"
              >
                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}