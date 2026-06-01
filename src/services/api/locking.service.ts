// src/services/api/locking.service.ts

import apiClient from './client';
import type {
  Node,
  Space,
  LockResponse,
  LockNodeRequest,
} from '@/types/backend-dtos';

/**
 * Locking Service
 * Handles all API calls related to locking/unlocking nodes, attributes, and spaces
 * Backend endpoints: /api/spaces/{spaceSlug}/lock, /api/spaces/{spaceSlug}/unlock,
 *   /api/spaces/{spaceSlug}/nodes/{nodeId}/lock, /api/spaces/{spaceSlug}/nodes/{nodeId}/unlock,
 *   /api/spaces/{spaceSlug}/attributes/{attributeId}/lock, /api/spaces/{spaceSlug}/attributes/{attributeId}/unlock
 */
export const lockingService = {
  /**
   * Lock a node with a specified lock level
   * API Contract: PATCH /api/spaces/{spaceSlug}/nodes/{nodeId}/lock
   * @param spaceSlug - Space slug
   * @param nodeId - Node UUID
   * @param data - Lock level request
   * @returns Updated Node object
   */
  async lockNode(spaceSlug: string, nodeId: string, data: LockNodeRequest): Promise<Node> {
    const response = await apiClient.patch<Node>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/lock`,
      data
    );
    return response.data;
  },

  /**
   * Unlock a node
   * API Contract: PATCH /api/spaces/{spaceSlug}/nodes/{nodeId}/unlock
   * @param spaceSlug - Space slug
   * @param nodeId - Node UUID
   * @returns Updated Node object
   */
  async unlockNode(spaceSlug: string, nodeId: string): Promise<Node> {
    const response = await apiClient.patch<Node>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/unlock`
    );
    return response.data;
  },

  /**
   * Lock an attribute
   * API Contract: PATCH /api/spaces/{spaceSlug}/attributes/{attributeId}/lock
   * @param spaceSlug - Space slug
   * @param attributeId - Attribute UUID
   * @returns Lock response
   */
  async lockAttribute(spaceSlug: string, attributeId: string): Promise<LockResponse> {
    const response = await apiClient.patch<LockResponse>(
      `/spaces/${spaceSlug}/attributes/${attributeId}/lock`
    );
    return response.data;
  },

  /**
   * Unlock an attribute
   * API Contract: PATCH /api/spaces/{spaceSlug}/attributes/{attributeId}/unlock
   * @param spaceSlug - Space slug
   * @param attributeId - Attribute UUID
   * @returns Lock response
   */
  async unlockAttribute(spaceSlug: string, attributeId: string): Promise<LockResponse> {
    const response = await apiClient.patch<LockResponse>(
      `/spaces/${spaceSlug}/attributes/${attributeId}/unlock`
    );
    return response.data;
  },

  /**
   * Lock a space
   * API Contract: PATCH /api/spaces/{spaceSlug}/lock
   * @param spaceSlug - Space slug
   * @returns Updated Space object
   */
  async lockSpace(spaceSlug: string): Promise<Space> {
    const response = await apiClient.patch<Space>(`/spaces/${spaceSlug}/lock`);
    return response.data;
  },

  /**
   * Unlock a space
   * API Contract: PATCH /api/spaces/{spaceSlug}/unlock
   * @param spaceSlug - Space slug
   * @returns Updated Space object
   */
  async unlockSpace(spaceSlug: string): Promise<Space> {
    const response = await apiClient.patch<Space>(`/spaces/${spaceSlug}/unlock`);
    return response.data;
  },
};

// Export type for use in hooks and components
export type LockingService = typeof lockingService;
