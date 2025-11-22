/**
 * Whiteboard Service - API operations for whiteboard elements
 * Generated with assistance from ollama:llama3.1:8b
 */

import { apiClient } from '@/services/api/client';
import {
  WhiteboardNode,
  CreateWhiteboardNodeDTO,
  UpdateWhiteboardNodeDTO,
  WhiteboardConnector,
  CreateConnectorDTO,
  WhiteboardNodesResponse,
} from '@/types/whiteboard';

export const whiteboardService = {
  /**
   * Get all whiteboard nodes for a space
   */
  async getWhiteboardNodes(spaceSlug: string): Promise<WhiteboardNode[]> {
    const response = await apiClient.get<WhiteboardNodesResponse>(
      `/api/spaces/${spaceSlug}/nodes`,
      {
        params: {
          // Filter for nodes that have element_subtype (whiteboard elements)
          size: 1000, // Get all elements
        },
      }
    );

    // Filter to only whiteboard nodes (those with element_subtype)
    return response.data.content.filter(
      (node) => node.node_details?.element_subtype
    );
  },

  /**
   * Create a new whiteboard node
   */
  async createWhiteboardNode(
    spaceSlug: string,
    dto: CreateWhiteboardNodeDTO
  ): Promise<WhiteboardNode> {
    const response = await apiClient.post<WhiteboardNode>(
      `/api/spaces/${spaceSlug}/nodes`,
      dto
    );
    return response.data;
  },

  /**
   * Update an existing whiteboard node
   */
  async updateWhiteboardNode(
    spaceSlug: string,
    id: string,
    dto: UpdateWhiteboardNodeDTO
  ): Promise<WhiteboardNode> {
    const response = await apiClient.put<WhiteboardNode>(
      `/api/spaces/${spaceSlug}/nodes/${id}`,
      dto
    );
    return response.data;
  },

  /**
   * Delete a whiteboard node
   */
  async deleteWhiteboardNode(spaceSlug: string, id: string): Promise<void> {
    await apiClient.delete(`/api/spaces/${spaceSlug}/nodes/${id}`);
  },

  /**
   * Get all connectors (connects_to attributes) for a space
   */
  async getConnectors(spaceSlug: string): Promise<WhiteboardConnector[]> {
    const response = await apiClient.get<WhiteboardConnector[]>(
      `/api/spaces/${spaceSlug}/attributes`,
      {
        params: {
          attribute_key: 'connects_to',
        },
      }
    );
    return response.data;
  },

  /**
   * Create a connector between two nodes
   */
  async createConnector(
    nodeId: string,
    dto: CreateConnectorDTO
  ): Promise<WhiteboardConnector> {
    const response = await apiClient.post<WhiteboardConnector>(
      `/api/nodes/${nodeId}/attributes`,
      dto
    );
    return response.data;
  },

  /**
   * Delete a connector
   */
  async deleteConnector(nodeId: string, attributeId: string): Promise<void> {
    await apiClient.delete(`/api/nodes/${nodeId}/attributes/${attributeId}`);
  },

  /**
   * Batch save multiple nodes (create/update/delete)
   */
  async batchSave(
    spaceSlug: string,
    toCreate: CreateWhiteboardNodeDTO[],
    toUpdate: { id: string; dto: UpdateWhiteboardNodeDTO }[],
    toDelete: string[]
  ): Promise<void> {
    // Execute all operations in parallel
    await Promise.all([
      ...toCreate.map((dto) => this.createWhiteboardNode(spaceSlug, dto)),
      ...toUpdate.map(({ id, dto }) => this.updateWhiteboardNode(spaceSlug, id, dto)),
      ...toDelete.map((id) => this.deleteWhiteboardNode(spaceSlug, id)),
    ]);
  },
};

export default whiteboardService;
