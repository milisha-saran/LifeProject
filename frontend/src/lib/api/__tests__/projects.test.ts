import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchProjects, createProject, updateProject, deleteProject } from '../projects';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('fetchProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Test Project',
          description: 'Test Description',
          weekly_hours: 10,
          start_date: '2025-01-01',
          status: 'In Progress',
          color: '#3B82F6',
          created_at: '2025-01-01T00:00:00Z',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      });

      const result = await fetchProjects();

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/projects/', {
        headers: { Authorization: 'Bearer mock-token' },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should throw error when fetch fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchProjects()).rejects.toThrow('Failed to fetch projects');
    });
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const projectData = {
        name: 'New Project',
        description: 'New Description',
        weekly_hours: 15,
        start_date: new Date('2025-01-01'),
        status: 'Not Started' as const,
        color: '#10B981',
      };

      const mockResponse = {
        id: 2,
        ...projectData,
        start_date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createProject(projectData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify({
          ...projectData,
          start_date: '2025-01-01',
        }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const updateData = {
        name: 'Updated Project',
        weekly_hours: 20,
      };

      const mockResponse = {
        id: 1,
        ...updateData,
        description: 'Test Description',
        start_date: '2025-01-01',
        status: 'In Progress',
        color: '#3B82F6',
        created_at: '2025-01-01T00:00:00Z',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateProject(1, updateData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/projects/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await deleteProject(1);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/projects/1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer mock-token' },
      });
    });

    it('should throw error when delete fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Project not found' }),
      });

      await expect(deleteProject(1)).rejects.toThrow('Project not found');
    });
  });
});