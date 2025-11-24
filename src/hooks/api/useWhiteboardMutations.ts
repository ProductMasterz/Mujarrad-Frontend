/**
 * Whiteboard Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whiteboardService } from '@/services/api/whiteboard.service';
import {
  CreateWhiteboardNodeDTO,
  UpdateWhiteboardNodeDTO,
  CreateConnectorDTO,
  ExcalidrawElement,
} from '@/types/whiteboard';
import { mapExcalidrawToNode, categorizeElements, mapArrowToAttribute } from '@/lib/whiteboard/elementMapper';

/**
 * Create a new whiteboard node
 */
export function useCreateWhiteboardNode(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWhiteboardNodeDTO) =>
      whiteboardService.createWhiteboardNode(spaceSlug, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });
    },
  });
}

/**
 * Update an existing whiteboard node
 */
export function useUpdateWhiteboardNode(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWhiteboardNodeDTO }) =>
      whiteboardService.updateWhiteboardNode(spaceSlug, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });
    },
  });
}

/**
 * Delete a whiteboard node
 */
export function useDeleteWhiteboardNode(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => whiteboardService.deleteWhiteboardNode(spaceSlug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });
    },
  });
}

/**
 * Create a connector between nodes
 */
export function useCreateConnector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, dto }: { nodeId: string; dto: CreateConnectorDTO }) =>
      whiteboardService.createConnector(nodeId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/**
 * Save entire whiteboard state (batch operation)
 */
export function useSaveWhiteboard(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      elements,
      existingNodes,
    }: {
      elements: ExcalidrawElement[];
      existingNodes: Map<string, string>; // excalidraw ID -> node ID
    }): Promise<Map<string, string>> => {
      const { shapes, connectors } = categorizeElements(elements);

      const toCreate: CreateWhiteboardNodeDTO[] = [];
      const toUpdate: { id: string; dto: UpdateWhiteboardNodeDTO }[] = [];
      const toDelete: string[] = [];

      // Track element IDs for created nodes
      const createdElementIds: string[] = [];

      // Process shapes (skip bound text elements - they're part of their container)
      const validShapes = shapes.filter(el => !(el.type === 'text' && el.containerId));

      validShapes.forEach((element, index) => {
        const nodeId = existingNodes.get(element.id);
        const dto = mapExcalidrawToNode(element, spaceSlug, index);

        if (nodeId) {
          toUpdate.push({
            id: nodeId,
            dto: {
              id: nodeId,
              title: dto.title,
              node_details: dto.node_details,
            },
          });
        } else {
          toCreate.push(dto);
          createdElementIds.push(element.id);
        }
      });

      // Find deleted elements
      const currentElementIds = new Set(validShapes.map((e) => e.id));
      existingNodes.forEach((nodeId, elementId) => {
        if (!currentElementIds.has(elementId)) {
          toDelete.push(nodeId);
        }
      });

      // Execute batch save
      const { created } = await whiteboardService.batchSave(spaceSlug, toCreate, toUpdate, toDelete);

      // Build updated map with new node IDs
      const updatedMap = new Map(existingNodes);

      // Add created nodes to map
      created.forEach((node, index) => {
        const elementId = createdElementIds[index];
        if (elementId) {
          updatedMap.set(elementId, node.id);
        }
      });

      // Remove deleted elements from map
      toDelete.forEach(nodeId => {
        // Find and remove the element ID that maps to this node ID
        for (const [elementId, nId] of updatedMap) {
          if (nId === nodeId) {
            updatedMap.delete(elementId);
            break;
          }
        }
      });

      // Handle connectors (arrows with bindings)
      for (const arrow of connectors) {
        const sourceElementId = arrow.startBinding?.elementId;
        const targetElementId = arrow.endBinding?.elementId;

        if (sourceElementId && targetElementId) {
          const sourceNodeId = updatedMap.get(sourceElementId);
          const targetNodeId = updatedMap.get(targetElementId);

          if (sourceNodeId && targetNodeId) {
            try {
              const connectorDto = mapArrowToAttribute(arrow, sourceNodeId, targetNodeId);
              await whiteboardService.createConnector(sourceNodeId, connectorDto);
            } catch (err) {
              console.error('Failed to create connector:', err);
            }
          }
        }
      }

      return updatedMap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'nodes'] });
    },
  });
}
