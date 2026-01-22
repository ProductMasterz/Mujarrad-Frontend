/**
 * Whiteboard Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whiteboardService } from '@/services/api/whiteboard.service';
import { whiteboardSyncService } from '@/services/whiteboardSyncService';
import { nodeKeys } from './useNodes';
import {
  ExcalidrawElement,
  WhiteboardElementEntry,
  WhiteboardContextContent,
  WhiteboardAppState,
  BinaryFileData,
  WhiteboardNode,
} from '@/types/whiteboard';
import { generateTitle, categorizeElements } from '@/lib/whiteboard/elementMapper';

/**
 * Save entire whiteboard state
 * - Creates/updates/deletes shape nodes (just titles)
 * - Stores all element data in context node's content
 */
export function useSaveWhiteboard(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      elements,
      existingNodes,
      contextNodeId,
      appState,
      files,
    }: {
      elements: ExcalidrawElement[];
      existingNodes: Map<string, string>; // excalidraw ID -> node ID
      contextNodeId: string | null;
      appState?: Partial<WhiteboardAppState>;
      files?: Record<string, BinaryFileData>;
    }): Promise<{ nodeMap: Map<string, string>; contextNodeId: string }> => {
      const { shapes, connectors } = categorizeElements(elements);

      // Filter valid shapes (skip bound text elements)
      const validShapes = shapes.filter(el => !(el.type === 'text' && el.containerId));

      // Track context node ID - always check for existing context first
      let currentContextId = contextNodeId;

      // ALWAYS check if a context node exists in this space first
      // This ensures we never create duplicates
      try {
        const existingContext = await whiteboardService.getWhiteboardContext(spaceSlug);
        if (existingContext) {
          // Use existing context, even if ID doesn't match what we had
          if (currentContextId && existingContext.id !== currentContextId) {
            console.log('[useSaveWhiteboard] Using existing context node instead of passed ID:', existingContext.id);
          }
          currentContextId = existingContext.id;
        } else if (!currentContextId && validShapes.length > 0) {
          // No existing context and we have shapes - create one
          const newContext = await whiteboardService.createWhiteboardContext(spaceSlug, appState);
          currentContextId = newContext.id;
          console.log('[useSaveWhiteboard] Created new context node:', currentContextId);
        }
      } catch (err) {
        console.error('[useSaveWhiteboard] Failed to check/create context node:', err);
        throw err;
      }

      // If no context node and no shapes, nothing to do
      if (!currentContextId) {
        return { nodeMap: new Map(), contextNodeId: '' };
      }

      // Prepare shape node operations
      const toCreate: { title: string; content: string; elementId: string }[] = [];
      const toUpdate: { id: string; title: string; content: string }[] = [];
      const toDelete: string[] = [];

      // Process shapes
      validShapes.forEach((element, index) => {
        const nodeId = existingNodes.get(element.id);

        // Extract text content from the element
        // For shapes with bound text, find the bound text element
        let content = '';
        if (element.text) {
          // Direct text on element
          content = element.text;
        } else if (element.boundElements) {
          // Find bound text element
          const boundText = elements.find(
            el => el.type === 'text' && el.containerId === element.id
          );
          if (boundText && boundText.text) {
            content = boundText.text;
          }
        }

        // Use content as title if available, otherwise fallback to generated title
        let title: string;
        if (content) {
          // Use first 50 chars of content as title
          title = content.length > 50 ? content.substring(0, 47) + '...' : content;
        } else {
          title = generateTitle(element, index);
        }

        if (nodeId) {
          toUpdate.push({ id: nodeId, title, content });
        } else {
          toCreate.push({ title, content, elementId: element.id });
        }
      });

      // Find deleted elements
      const currentElementIds = new Set(validShapes.map(e => e.id));
      existingNodes.forEach((nodeId, elementId) => {
        if (!currentElementIds.has(elementId)) {
          toDelete.push(nodeId);
        }
      });

      // Batch create/update/delete shape nodes
      let created: WhiteboardNode[] = [];

      try {
        const result = await whiteboardService.batchSaveShapeNodes(
          spaceSlug,
          toCreate.map(({ title, content }) => ({ title, content })),
          toUpdate,
          toDelete
        );
        created = result.created;
      } catch (error) {
        console.error('[useSaveWhiteboard] Failed to batch save shape nodes:', error);
        throw error;
      }

      // Build updated node map
      const updatedMap = new Map(existingNodes);

      // Add created nodes to map and sync service
      created.forEach((node, index) => {
        const elementId = toCreate[index]?.elementId;
        if (elementId) {
          updatedMap.set(elementId, node.id);
          // Register mapping in sync service
          whiteboardSyncService.linkFrameToNode(elementId, node.id);
        }
      });

      // Remove deleted elements from map and sync service
      toDelete.forEach(nodeId => {
        for (const [elementId, nId] of updatedMap) {
          if (nId === nodeId) {
            updatedMap.delete(elementId);
            // Remove mapping from sync service
            whiteboardSyncService.unlinkFrame(elementId);
            break;
          }
        }
      });

      // Build element entries for context node content
      // Include both shapes and their bound text elements
      // Also embed nodeId in customData for bidirectional sync
      const elementEntries: WhiteboardElementEntry[] = [];

      validShapes.forEach(element => {
        const nodeId = updatedMap.get(element.id) || '';
        if (nodeId) {
          // Add the shape element with customData.nodeId for sync
          elementEntries.push({
            node_id: nodeId,
            excalidraw_element: {
              ...element,
              customData: { ...element.customData, nodeId },
            },
          });

          // If this shape has bound text, include it too
          if (element.boundElements) {
            const boundTextElement = elements.find(
              el => el.type === 'text' && el.containerId === element.id
            );
            if (boundTextElement) {
              elementEntries.push({
                node_id: nodeId, // Same node ID as parent shape
                excalidraw_element: boundTextElement,
              });
            }
          }
        }
      });

      // Include connector elements in the content (for rendering arrows)
      const connectorEntries: WhiteboardElementEntry[] = connectors.map(connector => ({
        node_id: '', // Connectors don't have their own nodes
        excalidraw_element: connector,
      }));

      // Build context content
      const contextContent: WhiteboardContextContent = {
        elements: [...elementEntries, ...connectorEntries],
        app_state: appState,
        files,
      };

      // Update context node with all element data
      try {
        await whiteboardService.updateWhiteboardContext(
          spaceSlug,
          currentContextId,
          contextContent
        );
      } catch (error) {
        console.error('[useSaveWhiteboard] Failed to update context node:', error);

        // CLEANUP: Delete any nodes we just created to prevent orphaned duplicates
        if (created.length > 0) {
          console.warn('[useSaveWhiteboard] Rolling back created nodes:', created.map(n => n.id));
          try {
            await Promise.all(
              created.map(node =>
                whiteboardService.deleteWhiteboardNode(spaceSlug, node.id)
              )
            );
            console.log('[useSaveWhiteboard] Successfully rolled back created nodes');
          } catch (cleanupError) {
            console.error('[useSaveWhiteboard] Failed to cleanup nodes:', cleanupError);
            // Throw the original error, not the cleanup error
          }
        }

        throw error;
      }

      return { nodeMap: updatedMap, contextNodeId: currentContextId };
    },
    onSuccess: (result, variables) => {
      // Only invalidate whiteboard query - don't cascade to nodes
      // The nodes are managed internally via the nodeMap
      // Invalidating nodes causes refetches that can trigger race conditions
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });

      // Only invalidate nodes if we actually created or deleted nodes
      // This prevents unnecessary refetches that can cause duplication
      const hasNodeChanges = result.nodeMap.size !== variables.existingNodes.size;
      if (hasNodeChanges) {
        // Use a small delay to prevent race conditions with ongoing operations
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
        }, 100);
      }
    },
  });
}
