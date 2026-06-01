// src/services/api/attribute.service.ts

import apiClient, { extractPage } from './client';
import type { Attribute, CreateAttributeRequest } from '@/types/backend-dtos';

export const attributeService = {
  /**
   * Get all attributes (edges) for a node
   * API Contract: GET /api/nodes/{id}/attributes
   * Supports optional query parameters for filtering (e.g., attributeType)
   */
  async getNodeAttributes(
    nodeId: string,
    params?: { attributeType?: string }
  ): Promise<Attribute[]> {
    const response = await apiClient.get<any>(
      `/nodes/${nodeId}/attributes`,
      { params }
    );
    return extractPage<Attribute>(response.data);
  },

  /**
   * Create new attribute (edge/relationship)
   * API Contract: POST /api/nodes/{id}/attributes
   */
  async createAttribute(
    nodeId: string,
    data: CreateAttributeRequest
  ): Promise<Attribute> {
    const response = await apiClient.post<Attribute>(
      `/nodes/${nodeId}/attributes`,
      data
    );
    return response.data;
  },

  /**
   * Delete attribute (edge/relationship)
   * API Contract: DELETE /api/nodes/{nodeId}/attributes/{attrId}
   */
  async deleteAttribute(
    nodeId: string,
    attributeId: string
  ): Promise<void> {
    await apiClient.delete(
      `/nodes/${nodeId}/attributes/${attributeId}`
    );
  },

  /**
   * Get all edges for entire space graph
   * API Contract: GET /api/spaces/{id}/attributes
   */
  async getSpaceAttributes(spaceId: string): Promise<Attribute[]> {
    const response = await apiClient.get<any>(
      `/spaces/${spaceId}/attributes`
    );
    return extractPage<Attribute>(response.data);
  },
};
