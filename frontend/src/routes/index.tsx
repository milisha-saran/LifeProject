import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.username}</span>! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Ready to boost your productivity today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Projects</h3>
              <p className="text-gray-600 mb-4">Organize and track your important projects</p>
              <div className="text-sm text-blue-600 font-medium">Coming soon →</div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Calendar</h3>
              <p className="text-gray-600 mb-4">Plan your day and manage your schedule</p>
              <div className="text-sm text-purple-600 font-medium">Coming soon →</div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Habits</h3>
              <p className="text-gray-600 mb-4">Build and maintain healthy daily habits</p>
              <div className="text-sm text-green-600 font-medium">Coming soon →</div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Your productivity journey starts here</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're building amazing features to help you stay organized, focused, and productive. 
                More tools are coming soon to make your daily workflow seamless.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}