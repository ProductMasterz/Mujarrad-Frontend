// src/services/api/node.service.ts

import apiClient from './client';
import type {
  Node,
  CreateNodeRequest,
  UpdateNodeRequest,
} from '@/types/backend-dtos';
import type { PaginatedResponse, PaginationParams, SearchParams } from '@/types/api';

export const nodeService = {
  /**
   * Get all nodes in workspace
   * API Contract: GET /api/workspaces/{id}/nodes
   */
  async getNodes(
    workspaceId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Node>> {
    const response = await apiClient.get<Node[]>(
      `/workspaces/${workspaceId}/nodes`,
      { params }
    );
    // Backend returns array, wrap in paginated response format
    return {
      content: response.data,
      totalElements: response.data.length,
      totalPages: 1,
      size: response.data.length,
      number: 0,
    };
  },

  /**
   * Get all nodes in workspace (returns array directly)
   * Alias for contract tests - returns unwrapped array
   * API Contract: GET /api/workspaces/{id}/nodes
   */
  async getWorkspaceNodes(workspaceId: string): Promise<Node[]> {
    const response = await apiClient.get<Node[]>(
      `/workspaces/${workspaceId}/nodes`
    );
    return response.data;
  },

  /**
   * Get node by ID
   * API Contract: GET /api/nodes/{id}
   */
  async getNode(nodeId: string): Promise<Node> {
    const response = await apiClient.get<Node>(`/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * Create new node
   * API Contract: POST /api/nodes
   */
  async createNode(data: CreateNodeRequest): Promise<Node> {
    const response = await apiClient.post<Node>(`/nodes`, data);
    return response.data;
  },

  /**
   * Update node
   * API Contract: PUT /api/nodes/{id}
   */
  async updateNode(
    nodeId: string,
    data: UpdateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.put<Node>(
      `/nodes/${nodeId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete node
   * API Contract: DELETE /api/nodes/{id}
   */
  async deleteNode(nodeId: string): Promise<void> {
    await apiClient.delete(`/nodes/${nodeId}`);
  },

  /**
   * Search nodes in workspace
   * API Contract: GET /api/workspaces/{id}/search
   */
  async searchNodes(
    workspaceId: string,
    params: SearchParams
  ): Promise<PaginatedResponse<Node>> {
    const response = await apiClient.get<PaginatedResponse<Node>>(
      `/workspaces/${workspaceId}/search`,
      { params }
    );
    return response.data;
  },
};
