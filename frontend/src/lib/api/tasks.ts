import { type Task, type TaskFormData } from '@/types/project';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () => localStorage.getItem('auth_token');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const fetchTasksByGoal = async (goalId: number): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks/goals/${goalId}/tasks`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const fetchTask = async (id: number): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch task');
  return response.json();
};

export const createTask = async (goalId: number, data: TaskFormData): Promise<Task> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    start_time: data.start_time?.toISOString(),
    end_time: data.end_time?.toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/tasks/goals/${goalId}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create task');
  }
  return response.json();
};

export const updateTask = async (id: number, data: Partial<TaskFormData>): Promise<Task> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    ...(data.start_time && { start_time: data.start_time.toISOString() }),
    ...(data.end_time && { end_time: data.end_time.toISOString() }),
  };

  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update task');
  }
  return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete task');
  }
};