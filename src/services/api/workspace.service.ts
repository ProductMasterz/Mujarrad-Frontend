// src/services/api/workspace.service.ts

import apiClient from './client';
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '@/types/backend-dtos';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

export const workspaceService = {
  /**
   * Get all workspaces for current user
   */
  async getWorkspaces(params?: PaginationParams): Promise<PaginatedResponse<Workspace>> {
    const response = await apiClient.get<PaginatedResponse<Workspace>>('/workspaces', {
      params,
    });
    return response.data;
  },

  /**
   * Get workspace by slug
   */
  async getWorkspaceBySlug(slug: string): Promise<Workspace> {
    const response = await apiClient.get<Workspace>(`/workspaces/${slug}`);
    return response.data;
  },

  /**
   * Get workspace by ID
   */
  async getWorkspace(id: number): Promise<Workspace> {
    const response = await apiClient.get<Workspace>(`/workspaces/${id}`);
    return response.data;
  },

  /**
   * Create new workspace
   */
  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.post<Workspace>('/workspaces', data);
    return response.data;
  },

  /**
   * Update workspace
   */
  async updateWorkspace(id: number, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.put<Workspace>(`/workspaces/${id}`, data);
    return response.data;
  },

  /**
   * Delete workspace
   */
  async deleteWorkspace(id: number): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`);
  },
};
