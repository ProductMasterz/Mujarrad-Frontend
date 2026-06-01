/**
 * Whiteboard Service - Simplified context-only persistence
 */

import { apiClient, extractPage } from '@/services/api/client';
import {
  ExcalidrawElement,
  WhiteboardNode,
  WhiteboardContextContent,
} from '@/types/whiteboard';
import type { Attribute } from '@/types/backend-dtos';
import { generateTitle, getBoundText } from '@/lib/whiteboard/elementMapper';

export const whiteboardService = {
  /**
   * Get whiteboard nodes for a space
   * Uses the shared apiClient base URL so local Jest/MSW can hit localhost,
   * while deployed runtime can still use the Render backend URL.
   */
  async getWhiteboardNodes(
    spaceSlug: string,
    params?: Record<string, unknown>
  ): Promise<any> {
    const response = await apiClient.get(`/spaces/${spaceSlug}/nodes`, { params });
    return extractPage<any>(response.data);
  },

  /**
   * Create a whiteboard node in a space
   * Uses shared apiClient base URL resolution for local vs Render environments.
   */
  async createWhiteboardNode(
    spaceSlug: string,
    createDTO: Record<string, unknown>
  ): Promise<WhiteboardNode> {
    const response = await apiClient.post<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes`,
      createDTO
    );
    return response.data;
  },

  /**
   * Update a whiteboard node in a space
   * Uses shared apiClient base URL resolution for local vs Render environments.
   */
  async updateWhiteboardNode(
    spaceSlug: string,
    id: string,
    updateDTO: Record<string, unknown>
  ): Promise<WhiteboardNode> {
    const response = await apiClient.put<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${id}`,
      updateDTO
    );
    return response.data;
  },

  /**
   * Create a connector attribute from a source node to a target node
   * Uses shared apiClient base URL resolution for local vs Render environments.
   */
  async createConnector(
    sourceNodeId: string,
    createDTO: Record<string, unknown>
  ): Promise<Attribute> {
    const response = await apiClient.post<Attribute>(
      `/nodes/${sourceNodeId}/attributes`,
      createDTO
    );
    return response.data;
  },

  /**
   * Get the whiteboard context node for a space (if exists)
   */
  async getWhiteboardContext(spaceSlug: string): Promise<WhiteboardNode | null> {
    const response = await apiClient.get<any>(
      `/spaces/${spaceSlug}/nodes`,
      { params: { node_type: 'CONTEXT', size: 100 } }
    );

    const nodes = extractPage<WhiteboardNode>(response.data);
    const contextNode = nodes.find(
      (node) => (node.nodeDetails as any)?.whiteboard_context?.context_type === 'whiteboard'
    );

    if (!contextNode) {
      return null;
    }

    const fullNode = await apiClient.get<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${contextNode.id}`
    );

    return fullNode.data;
  },

  /**
   * Create a whiteboard context node with initial content
   */
  async createWhiteboardContext(
    spaceSlug: string,
    content: WhiteboardContextContent
  ): Promise<WhiteboardNode> {
    const now = new Date().toISOString();

    const response = await apiClient.post<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes`,
      {
        title: `${spaceSlug} Whiteboard`,
        nodeType: 'CONTEXT',
        content: JSON.stringify(content),
        nodeDetails: {
          whiteboard_context: {
            context_type: 'whiteboard',
            app_state: content.app_state,
            created_at: now,
            last_modified: now,
          },
        },
      }
    );

    return response.data;
  },

  /**
   * Save whiteboard content to context node (single atomic PUT)
   */
  async saveWhiteboardContent(
    spaceSlug: string,
    contextNodeId: string,
    content: WhiteboardContextContent
  ): Promise<WhiteboardNode> {
    const now = new Date().toISOString();

    const response = await apiClient.put<WhiteboardNode>(
      `/spaces/${spaceSlug}/nodes/${contextNodeId}`,
      {
        content: JSON.stringify(content),
        nodeDetails: {
          whiteboard_context: {
            context_type: 'whiteboard',
            app_state: content.app_state,
            last_modified: now,
          },
        },
      }
    );

    return response.data;
  },

  /**
   * Parse whiteboard content from context node, handling both old and new formats
   */
  parseWhiteboardContent(contextNode: WhiteboardNode): WhiteboardContextContent {
    if (!contextNode.content) {
      return { elements: [] };
    }

    try {
      const parsed = JSON.parse(contextNode.content);

      if (parsed.elements?.length > 0 && parsed.elements[0]?.excalidraw_element) {
        const elements = parsed.elements.map((entry: any) => ({
          ...entry.excalidraw_element,
          customData: {
            ...entry.excalidraw_element?.customData,
            nodeId: entry.node_id || undefined,
          },
        }));

        return {
          elements,
          app_state: parsed.app_state,
          files: parsed.files,
        };
      }

      return parsed as WhiteboardContextContent;
    } catch {
      return { elements: [] };
    }
  },

  /**
   * Create a shape node for "Show in Space List" promotion
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
          showInSpaceList: true,
        },
      }
    );

    return response.data;
  },

  /**
   * Auto-promote shapes to backend REGULAR nodes (for arrow attribute sync).
   * Creates nodes for elements that lack customData.nodeId.
   * Uses bound text elements for title/content when available.
   * Returns a map of elementId → created nodeId.
   */
  async autoPromoteShapes(
    spaceSlug: string,
    elements: ExcalidrawElement[],
    allElements: ExcalidrawElement[]
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    const createPromises = elements.map(async (element) => {
      try {
        const boundText = getBoundText(element, allElements);
        const title = boundText || generateTitle(element, 0);

        const response = await apiClient.post<WhiteboardNode>(
          `/spaces/${spaceSlug}/nodes`,
          {
            title,
            nodeType: 'REGULAR',
            content: boundText || '',
            nodeDetails: {
              showInSpaceList: false,
            },
          }
        );

        results.set(element.id, response.data.id);
      } catch {
        // Skip failed creates — will be retried on next save
      }
    });

    await Promise.allSettled(createPromises);
    return results;
  },

  /**
   * Delete a whiteboard node
   */
  async deleteWhiteboardNode(spaceSlug: string, id: string): Promise<void> {
    await apiClient.delete(`/spaces/${spaceSlug}/nodes/${id}`);
  },
};

export default whiteboardService;