import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

function RootComponent() {
  return (
    <AuthProvider>
      <RootLayout />
      <Toaster />
    </AuthProvider>
  )
}

function RootLayout() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <>
      <div className="glass-effect border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center shadow-md">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 brand-gradient rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">ProductivityApp</span>
            </Link>
            {isAuthenticated && (
              <nav className="flex space-x-1">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-brand-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors [&.active]:text-brand-600 [&.active]:bg-brand-50 [&.active]:font-semibold"
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2 rounded-lg border-gray-200 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="rounded-lg border-gray-200 hover:bg-gray-50">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-1 bg-gradient-to-br from-neutral-50 to-neutral-100 min-h-screen">
        <Outlet />
      </main>
      
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})