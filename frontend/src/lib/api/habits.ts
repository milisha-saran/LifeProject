import { type Habit, type HabitFormData, type HabitComplete } from '@/types/recurring';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () => localStorage.getItem('auth_token');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const fetchHabits = async (): Promise<Habit[]> => {
  const response = await fetch(`${API_BASE_URL}/habits/`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch habits');
  return response.json();
};

export const fetchDueHabits = async (dueDate?: string): Promise<Habit[]> => {
  const url = dueDate ? `${API_BASE_URL}/habits/due?due_date=${dueDate}` : `${API_BASE_URL}/habits/due`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch due habits');
  return response.json();
};

export const fetchHabit = async (id: number): Promise<Habit> => {
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch habit');
  return response.json();
};

export const createHabit = async (data: HabitFormData): Promise<Habit> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    start_time: data.start_time?.toISOString(),
    end_time: data.end_time?.toISOString(),
    next_due_date: data.next_due_date.toISOString().split('T')[0],
  };

  const response = await fetch(`${API_BASE_URL}/habits/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create habit');
  }
  return response.json();
};

export const updateHabit = async (id: number, data: Partial<HabitFormData>): Promise<Habit> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    ...(data.start_time && { start_time: data.start_time.toISOString() }),
    ...(data.end_time && { end_time: data.end_time.toISOString() }),
    ...(data.next_due_date && { next_due_date: data.next_due_date.toISOString().split('T')[0] }),
  };

  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update habit');
  }
  return response.json();
};

export const deleteHabit = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete habit');
  }
};

export const completeHabit = async (id: number, completionDate?: string): Promise<Habit> => {
  const response = await fetch(`${API_BASE_URL}/habits/${id}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ completion_date: completionDate })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to complete habit');
  }
  return response.json();
};