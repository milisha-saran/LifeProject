import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Plus, Clock, Calendar } from 'lucide-react'
import { type Task } from '@/types/project'
import { format } from 'date-fns'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onCreateTask: () => void
}

export function TaskList({
  tasks,
  isLoading,
  onEdit,
  onCreateTask,
}: TaskListProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Not Started':
        return 'secondary'
      case 'In Progress':
        return 'default'
      case 'Completed':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading tasks...
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-gray-600 mb-6">
          Break down this goal into actionable tasks
        </p>
        <Button
          size="sm"
          onClick={onCreateTask}
          className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create your first task
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-6 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">
                {task.name}
              </h4>
              <Badge
                variant={getStatusColor(task.status)}
                className="text-xs"
              >
                {task.status}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-gray-600 mb-3">{task.description}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{task.weekly_hours}h/week</span>
              </div>
              
              {task.eta_hours && (
                <div className="flex items-center gap-1">
                  <span>ETA: {task.eta_hours}h</span>
                </div>
              )}
              
              {task.start_time && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {formatDateTime(task.start_time)}</span>
                </div>
              )}
              
              {task.end_time && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>End: {formatDateTime(task.end_time)}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
            className="rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      ))}
    </div>
  )
}