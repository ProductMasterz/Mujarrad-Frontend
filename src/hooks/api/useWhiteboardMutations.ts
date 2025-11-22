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
    }) => {
      const { shapes, connectors } = categorizeElements(elements);

      const toCreate: CreateWhiteboardNodeDTO[] = [];
      const toUpdate: { id: string; dto: UpdateWhiteboardNodeDTO }[] = [];
      const toDelete: string[] = [];

      // Process shapes
      shapes.forEach((element, index) => {
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
        }
      });

      // Find deleted elements
      const currentElementIds = new Set(shapes.map((e) => e.id));
      existingNodes.forEach((nodeId, elementId) => {
        if (!currentElementIds.has(elementId)) {
          toDelete.push(nodeId);
        }
      });

      // Execute batch save
      await whiteboardService.batchSave(spaceSlug, toCreate, toUpdate, toDelete);

      // TODO: Handle connectors separately
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });
    },
  });
}
