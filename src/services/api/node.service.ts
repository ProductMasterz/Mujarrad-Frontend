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
   */
  async getNodes(
    workspaceSlug: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Node>> {
    const response = await apiClient.get<Node[]>(
      `/workspaces/${workspaceSlug}/nodes`,
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
   * Get node by ID
   */
  async getNode(workspaceSlug: string, nodeId: number): Promise<Node> {
    const response = await apiClient.get<Node>(`/workspaces/${workspaceSlug}/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * Create new node
   */
  async createNode(workspaceSlug: string, data: CreateNodeRequest): Promise<Node> {
    const response = await apiClient.post<Node>(`/workspaces/${workspaceSlug}/nodes`, data);
    return response.data;
  },

  /**
   * Update node
   */
  async updateNode(
    workspaceSlug: string,
    nodeId: number,
    data: UpdateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.put<Node>(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete node
   */
  async deleteNode(workspaceSlug: string, nodeId: number): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceSlug}/nodes/${nodeId}`);
  },

  /**
   * Search nodes in workspace
   */
  async searchNodes(
    workspaceSlug: string,
    params: SearchParams
  ): Promise<PaginatedResponse<Node>> {
    const response = await apiClient.get<PaginatedResponse<Node>>(
      `/workspaces/${workspaceSlug}/nodes/search`,
      { params }
    );
    return response.data;
  },
};
