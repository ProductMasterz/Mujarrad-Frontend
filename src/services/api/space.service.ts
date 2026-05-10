// src/services/api/space.service.ts

import apiClient from './client';
import type {
  Space,
  CreateSpaceRequest,
  UpdateSpaceRequest,
  SpaceCollaborator,
  InviteCollaboratorRequest,
} from '@/types/backend-dtos';
import type { PaginationParams } from '@/types/api';

export const spaceService = {
  /**
   * Get all spaces for current user
   * Note: Backend returns a plain array, not a PaginatedResponse
   */
  async getSpaces(params?: PaginationParams): Promise<Space[]> {
    const response = await apiClient.get<Space[]>('/spaces', {
      params,
    });
    return response.data;
  },

  /**
   * Get space by slug
   * Note: Backend doesn't support get-by-slug, so we fetch all and find by slug
   */
  async getSpaceBySlug(slug: string): Promise<Space> {
    const spaces = await this.getSpaces();
    const space = spaces.find((w) => w.slug === slug);

    if (!space) {
      throw new Error(`Space with slug "${slug}" not found`);
    }

    return space;
  },

  /**
   * Get space by ID
   */
  async getSpace(id: string | number): Promise<Space> {
    const response = await apiClient.get<Space>(`/spaces/${id}`);
    return response.data;
  },

  /**
   * Create new space
   */
  async createSpace(data: CreateSpaceRequest): Promise<Space> {
    const response = await apiClient.post<Space>('/spaces', data);
    return response.data;
  },

  /**
   * Update space
   * Backend uses PATCH /api/spaces/{id}
   */
  async updateSpace(id: string | number, data: UpdateSpaceRequest): Promise<Space> {
    const response = await apiClient.patch<Space>(`/spaces/${id}`, data);
    return response.data;
  },

  /**
   * Delete space
   */
  async deleteSpace(id: string | number): Promise<void> {
    await apiClient.delete(`/spaces/${id}`);
  },

  /**
   * Get collaborators for a space
   */
  async getCollaborators(spaceId: number): Promise<SpaceCollaborator[]> {
    const response = await apiClient.get<SpaceCollaborator[]>(
      `/spaces/${spaceId}/collaborators`
    );
    return response.data;
  },

  /**
   * Invite a collaborator to a space
   */
  async inviteCollaborator(
    spaceId: number,
    data: InviteCollaboratorRequest
  ): Promise<SpaceCollaborator> {
    const response = await apiClient.post<SpaceCollaborator>(
      `/spaces/${spaceId}/collaborators`,
      data
    );
    return response.data;
  },

  /**
   * Remove a collaborator from a space
   */
  async removeCollaborator(spaceId: number, userId: string): Promise<void> {
    await apiClient.delete(`/spaces/${spaceId}/collaborators/${userId}`);
  },
};
