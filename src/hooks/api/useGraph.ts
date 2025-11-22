// src/hooks/api/useGraph.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService, attributeService } from '@/services/api';
import type { GraphData, GraphNode, GraphEdge } from '@/types/graph';
import type { CreateAttributeRequest } from '@/types/backend-dtos';

/**
 * Fetch and combine nodes + attributes into graph data
 */
export function useGraphData(spaceSlug: string) {
  return useQuery({
    queryKey: ['spaces', spaceSlug, 'graph'],
    queryFn: async (): Promise<GraphData> => {
      const [nodesResponse, attributes] = await Promise.all([
        nodeService.getNodes(spaceSlug),
        attributeService.getSpaceAttributes(spaceSlug),
      ]);

      const nodes: GraphNode[] = nodesResponse.map((node, index) => ({
        id: String(node.id),
        type: node.nodeType.toLowerCase() as 'context' | 'regular',
        position: { x: index * 200, y: index * 100 }, // TODO: Calculate proper layout
        data: {
          node,
          label: node.title,
          isSelected: false,
        },
      }));

      const edges: GraphEdge[] = attributes.map((attr) => {
        // Determine edge type based on attribute key
        const edgeType = attr.attributeKey === 'contains' ? 'contains' : 'default';

        return {
          id: String(attr.id),
          source: String(attr.sourceNodeId),
          target: String(attr.targetNodeId),
          type: edgeType,
          data: {
            attribute: attr,
            isBidirectional: false, // TODO: Detect bidirectional relationships
            label: attr.attributeValue,
          },
        };
      });

      return { nodes, edges };
    },
    enabled: !!spaceSlug,
  });
}

export function useCreateEdge(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceNodeId, data }: { sourceNodeId: string; data: CreateAttributeRequest }) =>
      attributeService.createAttribute(sourceNodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'graph'] });
    },
  });
}

export function useDeleteEdge(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceNodeId, attributeId }: { sourceNodeId: string; attributeId: string }) =>
      attributeService.deleteAttribute(sourceNodeId, attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'graph'] });
    },
  });
}
