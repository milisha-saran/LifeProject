import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Plus, Clock, Eye, Trash2 } from 'lucide-react'
import { type Goal } from '@/types/project'

interface GoalListProps {
  goals: Goal[]
  isLoading: boolean
  onEdit: (goal: Goal) => void
  onView: (goal: Goal) => void
  onDelete: (goalId: number) => void
  onCreateGoal: () => void
}

export function GoalList({
  goals,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onCreateGoal,
}: GoalListProps) {
  const getStatusColor = (status: Goal['status']) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading goals...
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🎯</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No goals yet
        </h3>
        <p className="text-gray-600 mb-6">
          Break down this project into manageable goals
        </p>
        <Button
          size="sm"
          onClick={onCreateGoal}
          className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create your first goal
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="flex items-center justify-between p-6 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">
                {goal.name}
              </h4>
              <Badge
                variant={getStatusColor(goal.status)}
                className="text-xs"
              >
                {goal.status}
              </Badge>
            </div>
            
            {goal.description && (
              <p className="text-gray-600 mb-3">{goal.description}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{goal.weekly_hours}h/week</span>
              </div>
              
              <span>Start: {formatDate(goal.start_date)}</span>
              
              {goal.end_date && (
                <span>End: {formatDate(goal.end_date)}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal)}
              className="rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(goal)}
              className="rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}