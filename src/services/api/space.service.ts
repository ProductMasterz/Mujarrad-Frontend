// src/services/api/space.service.ts

import apiClient from './client';
import type {
  Space,
  CreateSpaceRequest,
  UpdateSpaceRequest,
} from '@/types/backend-dtos';
import type { PaginationParams } from '@/types/api';

/**
 * Space Service
 * Handles all API calls related to spaces (formerly workspaces)
 * Backend endpoints: /api/spaces/*
 */
export const spaceService = {
  /**
   * Get all spaces for current user
   * GET /api/spaces
   * @returns Array of Space objects
   */
  async getSpaces(params?: PaginationParams): Promise<Space[]> {
    const response = await apiClient.get<Space[]>('/spaces', {
      params,
    });
    return response.data;
  },

  /**
   * Get space by ID
   * GET /api/spaces/{id}
   * @param id - Space UUID
   * @returns Single Space object
   */
  async getSpace(id: string): Promise<Space> {
    const response = await apiClient.get<Space>(`/spaces/${id}`);
    return response.data;
  },

  /**
   * Get space by slug
   * GET /api/spaces/slug/{slug}
   * @param slug - Space slug (URL-friendly identifier)
   * @returns Single Space object
   */
  async getSpaceBySlug(slug: string): Promise<Space> {
    const response = await apiClient.get<Space>(`/spaces/slug/${slug}`);
    return response.data;
  },

  /**
   * Create new space
   * POST /api/spaces
   * @param data - Space creation data (name required, slug optional)
   * @returns Created Space object
   */
  async createSpace(data: CreateSpaceRequest): Promise<Space> {
    const response = await apiClient.post<Space>('/spaces', data);
    return response.data;
  },

  /**
   * Update space
   * PUT /api/spaces/{id}
   * @param id - Space UUID
   * @param data - Space update data (all fields optional)
   * @returns Updated Space object
   */
  async updateSpace(id: string, data: UpdateSpaceRequest): Promise<Space> {
    const response = await apiClient.put<Space>(`/spaces/${id}`, data);
    return response.data;
  },

  /**
   * Delete space
   * DELETE /api/spaces/{id}
   * @param id - Space UUID
   * @returns void (204 No Content)
   */
  async deleteSpace(id: string): Promise<void> {
    await apiClient.delete(`/spaces/${id}`);
  },
};

// Export type for use in hooks and components
export type SpaceService = typeof spaceService;
