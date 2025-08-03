import { type Chore, type ChoreFormData, type ChoreComplete } from '@/types/recurring';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () => localStorage.getItem('auth_token');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const fetchChores = async (): Promise<Chore[]> => {
  const response = await fetch(`${API_BASE_URL}/chores/`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch chores');
  return response.json();
};

export const fetchDueChores = async (dueDate?: string): Promise<Chore[]> => {
  const url = dueDate ? `${API_BASE_URL}/chores/due?due_date=${dueDate}` : `${API_BASE_URL}/chores/due`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch due chores');
  return response.json();
};

export const fetchChore = async (id: number): Promise<Chore> => {
  const response = await fetch(`${API_BASE_URL}/chores/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch chore');
  return response.json();
};

export const createChore = async (data: ChoreFormData): Promise<Chore> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    start_time: data.start_time?.toISOString(),
    end_time: data.end_time?.toISOString(),
    next_due_date: data.next_due_date.toISOString().split('T')[0],
  };

  const response = await fetch(`${API_BASE_URL}/chores/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create chore');
  }
  return response.json();
};

export const updateChore = async (id: number, data: Partial<ChoreFormData>): Promise<Chore> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    ...(data.start_time && { start_time: data.start_time.toISOString() }),
    ...(data.end_time && { end_time: data.end_time.toISOString() }),
    ...(data.next_due_date && { next_due_date: data.next_due_date.toISOString().split('T')[0] }),
  };

  const response = await fetch(`${API_BASE_URL}/chores/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update chore');
  }
  return response.json();
};

export const deleteChore = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chores/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete chore');
  }
};

export const completeChore = async (id: number, completionDate?: string): Promise<Chore> => {
  const response = await fetch(`${API_BASE_URL}/chores/${id}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ completion_date: completionDate })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to complete chore');
  }
  return response.json();
};