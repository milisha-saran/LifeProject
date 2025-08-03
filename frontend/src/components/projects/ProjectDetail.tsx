import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Plus, AlertTriangle } from 'lucide-react'
import { calculateTimeAllocation, getTimeAllocationStatus } from '@/lib/utils/timeAllocation'
import { useProject } from '@/lib/queries/projects'
import { useGoalsByProject, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/lib/queries/goals'
import { type Project, type Goal } from '@/types/project'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalList } from '@/components/goals/GoalList'
import { GoalDetail } from '@/components/goals/GoalDetail'

interface ProjectDetailProps {
  projectId: number
  onBack: () => void
  onEdit: (project: Project) => void
}

type ViewMode = 'project' | 'goal'

export function ProjectDetail({
  projectId,
  onBack,
  onEdit,
}: ProjectDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('project')
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId)
  const { data: goals, isLoading: goalsLoading } = useGoalsByProject(projectId)
  
  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()
  const deleteGoalMutation = useDeleteGoal()

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load project</div>
      </div>
    )
  }

  const timeAllocation = calculateTimeAllocation(project, goals || [])
  const allocationStatus = getTimeAllocationStatus(timeAllocation)

  const getStatusColor = (status: Project['status']) => {
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

  const handleCreateGoal = () => {
    setEditingGoal(undefined)
    setShowGoalForm(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  const handleViewGoal = (goal: Goal) => {
    setSelectedGoalId(goal.id)
    setViewMode('goal')
  }

  const handleDeleteGoal = async (goalId: number) => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      try {
        await deleteGoalMutation.mutateAsync(goalId)
      } catch (error) {
        console.error('Failed to delete goal:', error)
      }
    }
  }

  const handleGoalFormSubmit = async (data: any) => {
    if (editingGoal) {
      await updateGoalMutation.mutateAsync({
        id: editingGoal.id,
        data,
      })
    } else {
      await createGoalMutation.mutateAsync({
        projectId,
        data,
      })
    }
  }

  const handleBackToProject = () => {
    setViewMode('project')
    setSelectedGoalId(null)
  }

  // Show goal detail view
  if (viewMode === 'goal' && selectedGoalId) {
    return (
      <GoalDetail
        goalId={selectedGoalId}
        onBack={handleBackToProject}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
      />
    )
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
                  <div
                    className="w-8 h-8 rounded-full shadow-sm"
                    style={{ backgroundColor: project.color }}
                  />
                  <h1 className="text-4xl font-bold text-gray-900">
                    {project.name}
                  </h1>
                  <Badge
                    variant={getStatusColor(project.status)}
                    className="text-sm"
                  >
                    {project.status}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-gray-600 text-lg">{project.description}</p>
                )}
              </div>
              <Button
                onClick={() => onEdit(project)}
                className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>

          {/* Project Details */}
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
                    {project.weekly_hours}h/week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Allocated to Goals:
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
                      <div>Goals exceed project limit by {Math.abs(timeAllocation.remainingHours)} hours</div>
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
                    {formatDate(project.start_date)}
                  </span>
                </div>
                {project.end_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(project.end_date)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(project.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Goals Summary
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Goals:</span>
                  <span className="font-semibold text-gray-900">
                    {goals?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <span className="font-semibold text-gray-900">
                    {goals?.filter((g) => g.status === 'In Progress').length ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="font-semibold text-gray-900">
                    {goals?.filter((g) => g.status === 'Completed').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
                <p className="text-gray-600">
                  Goals associated with this project
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleCreateGoal}
                className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            <GoalList
              goals={goals || []}
              isLoading={goalsLoading}
              onEdit={handleEditGoal}
              onView={handleViewGoal}
              onDelete={handleDeleteGoal}
              onCreateGoal={handleCreateGoal}
            />
          </div>
        </div>
      </div>

      <GoalForm
        open={showGoalForm}
        onOpenChange={setShowGoalForm}
        onSubmit={handleGoalFormSubmit}
        goal={editingGoal}
        project={project}
        existingGoals={goals || []}
        isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
      />
    </div>
  )
}
