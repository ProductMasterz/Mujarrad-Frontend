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
  WhiteboardContextContent,
  WhiteboardElementEntry,
  ExcalidrawElement,
  BinaryFileData,
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

    console.log('[whiteboardService] Fetched CONTEXT nodes:', {
      count: response.data.length,
      nodes: response.data.map(n => ({
        id: n.id,
        title: n.title,
        nodeDetails: n.nodeDetails,
      })),
    });

    // Find the whiteboard context node in list
    const contextNode = response.data.find(
      (node) => (node.nodeDetails as any)?.whiteboard_context?.context_type === 'whiteboard'
    );

    console.log('[whiteboardService] Found whiteboard context node:', contextNode?.id);

    if (!contextNode) {
      return null;
    }

    // Fetch full node to get content field (list endpoint may not include it)
    const fullNode = await apiClient.get<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${contextNode.id}`
    );

    console.log('[whiteboardService] Fetched full context node:', {
      id: fullNode.data.id,
      hasContent: !!fullNode.data.content,
      contentLength: fullNode.data.content?.length,
      contentPreview: fullNode.data.content?.substring(0, 100),
    });

    return fullNode.data;
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
        nodeType: 'CONTEXT',
        nodeDetails: {
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
   * Update whiteboard context with all element data
   */
  async updateWhiteboardContext(
    spaceSlug: string,
    contextNodeId: string,
    content: WhiteboardContextContent
  ): Promise<WhiteboardNode> {
    const now = new Date().toISOString();

    const contentString = JSON.stringify(content);
    console.log('[whiteboardService] Updating context node:', {
      contextNodeId,
      elementsCount: content.elements.length,
      contentLength: contentString.length,
      contentPreview: contentString.substring(0, 200),
    });

    const response = await apiClient.put<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${contextNodeId}`,
      {
        content: contentString,
        nodeDetails: {
          whiteboard_context: {
            context_type: 'whiteboard',
            app_state: content.app_state,
            last_modified: now,
          },
        },
      }
    );

    console.log('[whiteboardService] Context node updated successfully');

    return response.data;
  },

  /**
   * Parse whiteboard content from context node
   */
  parseWhiteboardContent(contextNode: WhiteboardNode): WhiteboardContextContent {
    if (!contextNode.content) {
      return { elements: [] };
    }
    try {
      return JSON.parse(contextNode.content) as WhiteboardContextContent;
    } catch {
      return { elements: [] };
    }
  },

  /**
   * Create a simple shape node with title and content
   * Whiteboard shapes are hidden from the space node list by default
   */
  async createShapeNode(
    spaceSlug: string,
    title: string,
    content?: string
  ): Promise<WhiteboardNode> {
    const response = await apiClient.post<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes`,
      {
        title,
        nodeType: 'REGULAR',
        content: content || '',
        nodeDetails: {
          showInSpaceList: false,  // Whiteboard shapes don't appear in the main node list
        },
      }
    );
    return response.data;
  },

  /**
   * Update a shape node's title and content
   */
  async updateShapeNode(
    spaceSlug: string,
    nodeId: string,
    title: string,
    content?: string
  ): Promise<WhiteboardNode> {
    const response = await apiClient.put<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${nodeId}`,
      {
        title,
        content: content || '',
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
      (node) => node.nodeDetails?.element_subtype
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
   * Batch save shape nodes (create/update/delete)
   * Handles titles and content - element data is stored in context node
   */
  async batchSaveShapeNodes(
    spaceSlug: string,
    toCreate: { title: string; content?: string }[],
    toUpdate: { id: string; title: string; content?: string }[],
    toDelete: string[]
  ): Promise<{ created: WhiteboardNode[] }> {
    // Execute all operations in parallel
    const [createdNodes] = await Promise.all([
      Promise.all(toCreate.map(({ title, content }) => this.createShapeNode(spaceSlug, title, content))),
      Promise.all(toUpdate.map(({ id, title, content }) => this.updateShapeNode(spaceSlug, id, title, content))),
      Promise.all(toDelete.map((id) => this.deleteWhiteboardNode(spaceSlug, id))),
    ]);

    return { created: createdNodes };
  },
};

export default whiteboardService;
