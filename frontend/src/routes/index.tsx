import { createFileRoute, Link } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ProjectProgressWidget } from '@/components/dashboard/ProjectProgressWidget'
import { UpcomingDeadlinesWidget } from '@/components/dashboard/UpcomingDeadlinesWidget'
import { HabitStreaksWidget } from '@/components/dashboard/HabitStreaksWidget'
import { RecentActivityWidget } from '@/components/dashboard/RecentActivityWidget'
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget'
import { useDashboardStats } from '@/lib/queries/dashboard'
import { 
  Target, 
  CheckSquare, 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Loader2 
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.username}</span>! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's your productivity overview for today
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {statsLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : statsError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-muted-foreground">Failed to load dashboard statistics</p>
              </div>
            ) : (
              <>
                <StatsCard
                  title="Active Projects"
                  value={stats?.activeProjects || 0}
                  description="Projects in progress"
                  icon={Target}
                  color="bg-blue-500"
                  onClick={() => window.location.href = '/projects'}
                />
                <StatsCard
                  title="Completed Tasks"
                  value={stats?.completedTasks || 0}
                  description="Tasks finished"
                  icon={CheckSquare}
                  color="bg-green-500"
                  onClick={() => window.location.href = '/projects'}
                />
                <StatsCard
                  title="Current Streaks"
                  value={stats?.currentStreaks || 0}
                  description="Active habit streaks"
                  icon={Flame}
                  color="bg-orange-500"
                  onClick={() => window.location.href = '/habits'}
                />
                <StatsCard
                  title="Weekly Progress"
                  value={`${stats?.weeklyProgress || 0}%`}
                  description="Completion rate"
                  icon={TrendingUp}
                  color="bg-purple-500"
                />
                <StatsCard
                  title="Overdue Items"
                  value={stats?.overdueItems || 0}
                  description="Need attention"
                  icon={AlertTriangle}
                  color="bg-red-500"
                />
                <StatsCard
                  title="Upcoming"
                  value={stats?.upcomingDeadlines || 0}
                  description="Due this week"
                  icon={Calendar}
                  color="bg-indigo-500"
                />
              </>
            )}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ProjectProgressWidget />
              <QuickActionsWidget />
            </div>

            {/* Middle Column */}
            <div className="space-y-6">
              <UpcomingDeadlinesWidget />
              <RecentActivityWidget />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <HabitStreaksWidget />
              
              {/* Navigation Cards */}
              <div className="grid grid-cols-1 gap-4">
                <Link to="/projects" className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105 block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">📋</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Projects</h3>
                      <p className="text-sm text-gray-600">Manage your projects</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/chores" className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105 block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">🧹</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Chores</h3>
                      <p className="text-sm text-gray-600">Track recurring tasks</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/habits" className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105 block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">✅</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Habits</h3>
                      <p className="text-sm text-gray-600">Build daily habits</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile-specific adjustments */}
          <div className="lg:hidden mt-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
              <h2 className="text-xl font-bold text-gray-900 mb-3">🚀 Stay productive</h2>
              <p className="text-gray-600 text-sm">
                Use the dashboard to track your progress and stay on top of your goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}