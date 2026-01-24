/**
 * Whiteboard Service - Simplified context-only persistence
 */

import { apiClient } from '@/services/api/client';
import {
  ExcalidrawElement,
  WhiteboardNode,
  WhiteboardAppState,
  WhiteboardContextContent,
} from '@/types/whiteboard';
import { generateTitle, getBoundText } from '@/lib/whiteboard/elementMapper';

export const whiteboardService = {
  /**
   * Get the whiteboard context node for a space (if exists)
   */
  async getWhiteboardContext(spaceSlug: string): Promise<WhiteboardNode | null> {
    const response = await apiClient.get<WhiteboardNode[]>(
      `/spaces/${spaceSlug}/nodes`,
      { params: { node_type: 'CONTEXT', size: 100 } }
    );

    const contextNode = response.data.find(
      (node) => (node.nodeDetails as any)?.whiteboard_context?.context_type === 'whiteboard'
    );

    if (!contextNode) {
      return null;
    }

    // Fetch full node to get content field
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

      // Detect old format: elements are { node_id, excalidraw_element } entries
      if (parsed.elements?.length > 0 && parsed.elements[0]?.excalidraw_element) {
        // Migrate old format to flat elements with customData.nodeId
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

      // New format: elements are already flat ExcalidrawElement[]
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
