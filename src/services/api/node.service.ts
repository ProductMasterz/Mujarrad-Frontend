// src/services/api/node.service.ts

import apiClient from './client';
import type {
  Node,
  CreateNodeRequest,
  UpdateNodeRequest,
} from '@/types/backend-dtos';
import type { PaginatedResponse, PaginationParams, SearchParams } from '@/types/api';

/**
 * Node Service
 * Handles all API calls related to nodes
 * Backend endpoints: /api/spaces/{spaceSlug}/nodes/*
 *
 * IMPORTANT: All node operations are now space-scoped and require a spaceSlug parameter
 */
export const nodeService = {
  /**
   * Get all nodes in a space
   * API Contract: GET /api/spaces/{spaceSlug}/nodes
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param params - Optional pagination parameters
   * @returns Paginated response with nodes
   */
  async getNodes(
    spaceSlug: string,
    params?: PaginationParams
  ): Promise<Node[]> {
    const response = await apiClient.get<Node[]>(
      `/spaces/${spaceSlug}/nodes`,
      { params }
    );
    return response.data;
  },

  /**
   * Get single node by ID (space-scoped)
   * API Contract: GET /api/spaces/{spaceSlug}/nodes/{nodeId}
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param nodeId - Node UUID
   * @returns Single Node object
   */
  async getNode(spaceSlug: string, nodeId: string): Promise<Node> {
    const response = await apiClient.get<Node>(`/spaces/${spaceSlug}/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * Create new node in a space
   * API Contract: POST /api/spaces/{spaceSlug}/nodes
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param data - Node creation data
   * @returns Created Node object
   */
  async createNode(spaceSlug: string, data: CreateNodeRequest): Promise<Node> {
    const response = await apiClient.post<Node>(`/spaces/${spaceSlug}/nodes`, data);
    return response.data;
  },

  /**
   * Update node (space-scoped)
   * API Contract: PUT /api/spaces/{spaceSlug}/nodes/{nodeId}
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param nodeId - Node UUID
   * @param data - Node update data
   * @returns Updated Node object
   */
  async updateNode(
    spaceSlug: string,
    nodeId: string,
    data: UpdateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.put<Node>(
      `/spaces/${spaceSlug}/nodes/${nodeId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete node (space-scoped)
   * API Contract: DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}?force={boolean}
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param nodeId - Node UUID
   * @param force - Optional force delete parameter
   * @returns void (200 OK)
   */
  async deleteNode(spaceSlug: string, nodeId: string, force?: boolean): Promise<void> {
    const params = force !== undefined ? { force } : undefined;
    await apiClient.delete(`/spaces/${spaceSlug}/nodes/${nodeId}`, { params });
  },

  /**
   * Search nodes in a space
   * API Contract: GET /api/spaces/{spaceSlug}/search
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param params - Search parameters
   * @returns Paginated response with matching nodes
   */
  async searchNodes(
    spaceSlug: string,
    params: SearchParams
  ): Promise<PaginatedResponse<Node>> {
    const response = await apiClient.get<PaginatedResponse<Node>>(
      `/spaces/${spaceSlug}/search`,
      { params }
    );
    return response.data;
  },
};

// Export type for use in hooks and components
export type NodeService = typeof nodeService;
