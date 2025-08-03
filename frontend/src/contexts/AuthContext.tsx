import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthContextType, User, LoginCredentials, RegisterData } from '@/types/auth';
import { loginUser, registerUser, getCurrentUser, refreshToken } from '@/lib/api/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const queryClient = useQueryClient();

  // Query to get current user when token exists
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(token!),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setToken(data.access_token);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      // Fetch user data after successful login
      try {
        const userData = await getCurrentUser(data.access_token);
        setUser(userData);
        queryClient.setQueryData(['currentUser'], userData);
        toast.success('Login successful!');
      } catch (error) {
        toast.error('Failed to fetch user data');
        logout();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // Registration returns user data directly, but we need to login to get token
      toast.success('Registration successful! Please log in.');
      // Note: We could auto-login here, but for security it's better to require explicit login
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Token refresh mutation
  const refreshMutation = useMutation({
    mutationFn: () => refreshToken(token!),
    onSuccess: (data) => {
      setToken(data.access_token);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      // User data should remain the same, no need to refetch
    },
    onError: () => {
      // If refresh fails, logout user
      logout();
    },
  });

  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
    setIsLoading(userLoading);
  }, [userData, userLoading]);

  // Handle token expiration and automatic refresh
  useEffect(() => {
    if (token) {
      // Set up automatic token refresh
      const refreshInterval = setInterval(() => {
        refreshMutation.mutate();
      }, 14 * 60 * 1000); // Refresh every 14 minutes (tokens typically expire in 15 minutes)

      return () => clearInterval(refreshInterval);
    }
  }, [token, refreshMutation]);

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};