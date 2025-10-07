// src/services/api/auth.service.ts

import apiClient, { setAuthToken, clearAuthToken } from './client';
import type { User, LoginRequest, CreateUserRequest, LoginResponse } from '@/types/backend-dtos';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and store JWT token
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);

    // Store token in localStorage
    if (response.data.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Logout user and clear token
   */
  logout(): void {
    clearAuthToken();
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Refresh JWT token
   */
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data.token;
  },
};
