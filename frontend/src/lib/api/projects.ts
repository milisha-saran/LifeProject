import { type Project, type ProjectFormData } from '@/types/project';

const API_BASE_URL = 'http://localhost:8000';

const getToken = () => localStorage.getItem('auth_token');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects/`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export const fetchProject = async (id: number): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
};

export const createProject = async (data: ProjectFormData): Promise<Project> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    start_date: data.start_date.toISOString().split('T')[0],
    end_date: data.end_date?.toISOString().split('T')[0],
  };

  const response = await fetch(`${API_BASE_URL}/projects/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create project');
  }
  return response.json();
};

export const updateProject = async (id: number, data: Partial<ProjectFormData>): Promise<Project> => {
  // Convert dates to ISO strings for API
  const apiData = {
    ...data,
    ...(data.start_date && { start_date: data.start_date.toISOString().split('T')[0] }),
    ...(data.end_date && { end_date: data.end_date.toISOString().split('T')[0] }),
  };

  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update project');
  }
  return response.json();
};

export const deleteProject = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete project');
  }
};

