import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { ArrowLeft, Edit, Plus, AlertTriangle, Trash2 } from 'lucide-react'
import { calculateTaskTimeAllocation, getTaskTimeAllocationStatus } from '@/lib/utils/timeAllocation'
import { useGoal } from '@/lib/queries/goals'
import { useTasksByGoal } from '@/lib/queries/tasks'
import { type Goal, type Task } from '@/types/project'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskList } from '@/components/tasks/TaskList'

interface GoalDetailProps {
  goalId: number
  onBack: () => void
  onEdit: (goal: Goal) => void
  onDelete: (goalId: number) => void
}

export function GoalDetail({
  goalId,
  onBack,
  onEdit,
  onDelete,
}: GoalDetailProps) {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  const {
    data: goal,
    isLoading: goalLoading,
    error: goalError,
  } = useGoal(goalId)
  const { data: tasks, isLoading: tasksLoading } = useTasksByGoal(goalId)

  if (goalLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading goal...</div>
      </div>
    )
  }

  if (goalError || !goal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load goal</div>
      </div>
    )
  }

  const timeAllocation = calculateTaskTimeAllocation(goal, tasks || [])
  const allocationStatus = getTaskTimeAllocationStatus(timeAllocation)

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

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCreateTask = () => {
    setEditingTask(undefined)
    setShowTaskForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-0">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🎯</span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    {goal.name}
                  </h1>
                  <Badge
                    variant={getStatusColor(goal.status)}
                    className="text-sm"
                  >
                    {goal.status}
                  </Badge>
                </div>
                {goal.description && (
                  <p className="text-gray-600 text-lg">{goal.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onDelete(goal.id)}
                  className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onEdit(goal)}
                  className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Goal
                </Button>
              </div>
            </div>
          </div>

          {/* Goal Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">⏱️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Time Allocation
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Hours:</span>
                  <span className="font-semibold text-gray-900">
                    {goal.weekly_hours}h/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Allocated to Tasks:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {timeAllocation.allocatedHours}h/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className={`font-semibold ${allocationStatus.color}`}>
                    {timeAllocation.remainingHours}h/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Utilization:</span>
                  <span className={`font-semibold ${allocationStatus.color}`}>
                    {timeAllocation.utilizationPercentage}%
                  </span>
                </div>
                {timeAllocation.isOverAllocated && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                      <div className="font-semibold">Over-allocated!</div>
                      <div>Tasks exceed goal limit by {Math.abs(timeAllocation.remainingHours)} hours</div>
                    </div>
                  </div>
                )}
                {!timeAllocation.isOverAllocated && timeAllocation.utilizationPercentage >= 90 && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mt-2">
                    ⚠️ Nearly at capacity - only {timeAllocation.remainingHours} hours remaining
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📅</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Date:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(goal.start_date)}
                  </span>
                </div>
                {goal.end_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(goal.end_date)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(goal.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">✅</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Tasks Summary
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tasks:</span>
                  <span className="font-semibold text-gray-900">
                    {tasks?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <span className="font-semibold text-gray-900">
                    {tasks?.filter((t) => t.status === 'In Progress').length ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="font-semibold text-gray-900">
                    {tasks?.filter((t) => t.status === 'Completed').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                <p className="text-gray-600">
                  Tasks associated with this goal
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleCreateTask}
                className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            <TaskList
              tasks={tasks || []}
              isLoading={tasksLoading}
              onEdit={handleEditTask}
              onCreateTask={handleCreateTask}
            />
          </div>
        </div>
      </div>

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editingTask}
        goal={goal}
        existingTasks={tasks || []}
      />
    </div>
  )
}