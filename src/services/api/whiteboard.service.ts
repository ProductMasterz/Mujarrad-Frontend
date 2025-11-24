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
  WhiteboardContextDetails,
  WhiteboardAppState,
} from '@/types/whiteboard';

export const whiteboardService = {
  /**
   * Get the whiteboard context node for a space (if exists)
   */
  async getWhiteboardContext(spaceSlug: string): Promise<WhiteboardNode | null> {
    const response = await apiClient.get<WhiteboardNode[]>(
      `/spaces/${spaceSlug}/nodes`,
      {
        params: {
          node_type: 'CONTEXT',
          size: 100,
        },
      }
    );

    // Find the whiteboard context node
    return response.data.find(
      (node) => (node.node_details as any)?.whiteboard_context?.context_type === 'whiteboard'
    ) || null;
  },

  /**
   * Create a whiteboard context node
   */
  async createWhiteboardContext(
    spaceSlug: string,
    appState?: Partial<WhiteboardAppState>
  ): Promise<WhiteboardNode> {
    const now = new Date().toISOString();
    const response = await apiClient.post<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes`,
      {
        title: `${spaceSlug} Whiteboard`,
        node_type: 'CONTEXT',
        node_details: {
          whiteboard_context: {
            context_type: 'whiteboard',
            app_state: appState,
            created_at: now,
            last_modified: now,
          },
        },
      }
    );
    return response.data;
  },

  /**
   * Update whiteboard context metadata
   */
  async updateWhiteboardContext(
    spaceSlug: string,
    contextNodeId: string,
    appState?: Partial<WhiteboardAppState>
  ): Promise<WhiteboardNode> {
    const now = new Date().toISOString();
    const response = await apiClient.put<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${contextNodeId}`,
      {
        node_details: {
          whiteboard_context: {
            context_type: 'whiteboard',
            app_state: appState,
            last_modified: now,
          },
        },
      }
    );
    return response.data;
  },

  /**
   * Get all whiteboard nodes for a space
   */
  async getWhiteboardNodes(spaceSlug: string): Promise<WhiteboardNode[]> {
    const response = await apiClient.get<WhiteboardNode[]>(
      `/spaces/${spaceSlug}/nodes`,
      {
        params: {
          size: 1000, // Get all elements
        },
      }
    );

    // Filter to only whiteboard nodes (those with element_subtype)
    return response.data.filter(
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
      `/spaces/${spaceSlug}/nodes`,
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
      `/spaces/${spaceSlug}/nodes/${id}`,
      dto
    );
    return response.data;
  },

  /**
   * Delete a whiteboard node
   */
  async deleteWhiteboardNode(spaceSlug: string, id: string): Promise<void> {
    await apiClient.delete(`/spaces/${spaceSlug}/nodes/${id}`);
  },

  /**
   * Get all connectors (connects_to attributes) for a space
   */
  async getConnectors(spaceSlug: string): Promise<WhiteboardConnector[]> {
    const response = await apiClient.get<WhiteboardConnector[]>(
      `/spaces/${spaceSlug}/attributes`,
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
      `/nodes/${nodeId}/attributes`,
      dto
    );
    return response.data;
  },

  /**
   * Delete a connector
   */
  async deleteConnector(nodeId: string, attributeId: string): Promise<void> {
    await apiClient.delete(`/nodes/${nodeId}/attributes/${attributeId}`);
  },

  /**
   * Batch save multiple nodes (create/update/delete)
   * Returns created nodes so we can track their IDs
   */
  async batchSave(
    spaceSlug: string,
    toCreate: CreateWhiteboardNodeDTO[],
    toUpdate: { id: string; dto: UpdateWhiteboardNodeDTO }[],
    toDelete: string[]
  ): Promise<{ created: WhiteboardNode[] }> {
    // Execute all operations in parallel
    const [createdNodes] = await Promise.all([
      Promise.all(toCreate.map((dto) => this.createWhiteboardNode(spaceSlug, dto))),
      Promise.all(toUpdate.map(({ id, dto }) => this.updateWhiteboardNode(spaceSlug, id, dto))),
      Promise.all(toDelete.map((id) => this.deleteWhiteboardNode(spaceSlug, id))),
    ]);

    return { created: createdNodes };
  },
};

export default whiteboardService;
