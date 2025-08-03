import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, registerUser, getCurrentUser, refreshToken } from '../auth';

// Mock fetch globally
global.fetch = vi.fn();

describe('Auth API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('loginUser', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginUser({ username: 'testuser', password: 'password' });

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/login', {
        method: 'POST',
        body: expect.any(FormData),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed login', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(loginUser({ username: 'testuser', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('registerUser', () => {
    it('should register successfully with valid data', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await registerUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user with valid token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await getCurrentUser('test-token');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/me', {
        headers: { Authorization: 'Bearer test-token' }
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        access_token: 'new-token',
        token_type: 'bearer'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await refreshToken('old-token');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/refresh', {
        method: 'POST',
        headers: { Authorization: 'Bearer old-token' }
      });

      expect(result).toEqual(mockResponse);
    });
  });
});