// src/services/api/workspace.service.ts

import apiClient from './client';
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceCollaborator,
  InviteCollaboratorRequest,
} from '@/types/backend-dtos';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

export const workspaceService = {
  /**
   * Get all workspaces for current user
   * Note: Backend returns a plain array, not a PaginatedResponse
   */
  async getWorkspaces(params?: PaginationParams): Promise<Workspace[]> {
    console.log('workspaceService.getWorkspaces() called with params:', params);
    console.log('Auth token:', typeof window !== 'undefined' ? localStorage.getItem('auth_token')?.substring(0, 20) + '...' : 'N/A');
    try {
      const response = await apiClient.get<Workspace[]>('/workspaces', {
        params,
      });
      console.log('workspaceService.getWorkspaces() response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('workspaceService.getWorkspaces() error:', error);
      console.error('Error status:', error?.response?.status);
      console.error('Error data:', error?.response?.data);
      throw error;
    }
  },

  /**
   * Get workspace by slug
   * Note: Backend doesn't support get-by-slug, so we fetch all and find by slug
   */
  async getWorkspaceBySlug(slug: string): Promise<Workspace> {
    const workspaces = await this.getWorkspaces();
    const workspace = workspaces.find((w) => w.slug === slug);

    if (!workspace) {
      throw new Error(`Workspace with slug "${slug}" not found`);
    }

    return workspace;
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

  /**
   * Get collaborators for a workspace
   */
  async getCollaborators(workspaceId: number): Promise<WorkspaceCollaborator[]> {
    const response = await apiClient.get<WorkspaceCollaborator[]>(
      `/workspaces/${workspaceId}/collaborators`
    );
    return response.data;
  },

  /**
   * Invite a collaborator to a workspace
   */
  async inviteCollaborator(
    workspaceId: number,
    data: InviteCollaboratorRequest
  ): Promise<WorkspaceCollaborator> {
    const response = await apiClient.post<WorkspaceCollaborator>(
      `/workspaces/${workspaceId}/collaborators`,
      data
    );
    return response.data;
  },

  /**
   * Remove a collaborator from a workspace
   */
  async removeCollaborator(workspaceId: number, userId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/collaborators/${userId}`);
  },
};
