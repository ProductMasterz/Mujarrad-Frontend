// src/services/api/attribute.service.ts

import apiClient from './client';
import type { Attribute, CreateAttributeRequest } from '@/types/backend-dtos';

export const attributeService = {
  /**
   * Get all attributes (edges) for a node
   */
  async getNodeAttributes(workspaceSlug: string, nodeId: number): Promise<Attribute[]> {
    const response = await apiClient.get<Attribute[]>(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}/attributes`
    );
    return response.data;
  },

  /**
   * Create new attribute (edge/relationship)
   */
  async createAttribute(
    workspaceSlug: string,
    nodeId: number,
    data: CreateAttributeRequest
  ): Promise<Attribute> {
    const response = await apiClient.post<Attribute>(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}/attributes`,
      data
    );
    return response.data;
  },

  /**
   * Delete attribute (edge/relationship)
   */
  async deleteAttribute(
    workspaceSlug: string,
    nodeId: number,
    attributeId: number
  ): Promise<void> {
    await apiClient.delete(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}/attributes/${attributeId}`
    );
  },

  /**
   * Get all edges for entire workspace graph
   */
  async getWorkspaceAttributes(workspaceSlug: string): Promise<Attribute[]> {
    const response = await apiClient.get<Attribute[]>(
      `/workspaces/${workspaceSlug}/attributes`
    );
    return response.data;
  },
};
