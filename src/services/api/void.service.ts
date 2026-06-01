// src/services/api/void.service.ts

import apiClient from './client';
import type {
  Node,
  VoidNodeCreateRequest,
  VoidNodeUpdateRequest,
  AssignToSpaceRequest,
} from '@/types/backend-dtos';

/**
 * Void Service
 * Handles all API calls related to the per-user spaceless holding area
 * Backend endpoints: /api/void/nodes/*
 */
export const voidService = {
  /**
   * List all void nodes for the current user
   * API Contract: GET /api/void/nodes
   * @returns Array of nodes
   */
  async listVoidNodes(): Promise<Node[]> {
    const response = await apiClient.get<Node[]>('/void/nodes');
    return response.data;
  },

  /**
   * Get a single void node by ID
   * API Contract: GET /api/void/nodes/{nodeId}
   * @param nodeId - Node UUID
   * @returns Node object
   */
  async getVoidNode(nodeId: string): Promise<Node> {
    const response = await apiClient.get<Node>(`/void/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * Create a new void node
   * API Contract: POST /api/void/nodes
   * @param data - Void node creation data
   * @returns Created Node object
   */
  async createVoidNode(data: VoidNodeCreateRequest): Promise<Node> {
    const response = await apiClient.post<Node>('/void/nodes', data);
    return response.data;
  },

  /**
   * Update a void node
   * API Contract: PUT /api/void/nodes/{nodeId}
   * @param nodeId - Node UUID
   * @param data - Void node update data
   * @returns Updated Node object
   */
  async updateVoidNode(nodeId: string, data: VoidNodeUpdateRequest): Promise<Node> {
    const response = await apiClient.put<Node>(`/void/nodes/${nodeId}`, data);
    return response.data;
  },

  /**
   * Delete a void node
   * API Contract: DELETE /api/void/nodes/{nodeId}
   * @param nodeId - Node UUID
   * @returns void
   */
  async deleteVoidNode(nodeId: string): Promise<void> {
    await apiClient.delete(`/void/nodes/${nodeId}`);
  },

  /**
   * Assign a void node to a space
   * API Contract: POST /api/void/nodes/{nodeId}/assign
   * @param nodeId - Node UUID
   * @param data - Assignment data with target space ID
   * @returns Node object after assignment
   */
  async assignToSpace(nodeId: string, data: AssignToSpaceRequest): Promise<Node> {
    const response = await apiClient.post<Node>(`/void/nodes/${nodeId}/assign`, data);
    return response.data;
  },
};

// Export type for use in hooks and components
export type VoidService = typeof voidService;
