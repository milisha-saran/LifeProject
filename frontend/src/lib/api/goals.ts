import { type Goal, type GoalFormData } from '@/types/project';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () => localStorage.getItem('auth_token');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const fetchGoalsByProject = async (projectId: number): Promise<Goal[]> => {
  const response = await fetch(`${API_BASE_URL}/goals/projects/${projectId}/goals`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch goals');
  return response.json();
};

export const fetchGoal = async (id: number): Promise<Goal> => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch goal');
  return response.json();
};

export const createGoal = async (projectId: number, data: GoalFormData): Promise<Goal> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    start_date: data.start_date.toISOString().split('T')[0],
    end_date: data.end_date?.toISOString().split('T')[0],
  };

  const response = await fetch(`${API_BASE_URL}/goals/projects/${projectId}/goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create goal');
  }
  return response.json();
};

export const updateGoal = async (id: number, data: Partial<GoalFormData>): Promise<Goal> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    ...(data.start_date && { start_date: data.start_date.toISOString().split('T')[0] }),
    ...(data.end_date && { end_date: data.end_date.toISOString().split('T')[0] }),
  };

  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update goal');
  }
  return response.json();
};

export const deleteGoal = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete goal');
  }
};