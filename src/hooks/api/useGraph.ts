// src/hooks/api/useGraph.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService, attributeService } from '@/services/api';
import type { GraphData, GraphNode, GraphEdge } from '@/types/graph';
import type { CreateAttributeRequest } from '@/types/backend-dtos';

/**
 * Fetch and combine nodes + attributes into graph data
 */
export function useGraphData(workspaceSlug: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'graph'],
    queryFn: async (): Promise<GraphData> => {
      const [nodesResponse, attributes] = await Promise.all([
        nodeService.getNodes(workspaceSlug),
        attributeService.getWorkspaceAttributes(workspaceSlug),
      ]);

      const nodes: GraphNode[] = nodesResponse.content.map((node, index) => ({
        id: String(node.id),
        type: 'custom',
        position: { x: index * 200, y: index * 100 }, // TODO: Calculate proper layout
        data: {
          node,
          label: node.title,
          nodeType: node.nodeType,
        },
      }));

      const edges: GraphEdge[] = attributes.map((attr) => ({
        id: String(attr.id),
        source: String(attr.sourceNodeId),
        target: String(attr.targetNodeId),
        type: 'custom',
        data: {
          attribute: attr,
          attributeKey: attr.attributeKey,
          label: attr.attributeValue,
        },
      }));

      return { nodes, edges };
    },
    enabled: !!workspaceSlug,
  });
}

export function useCreateEdge(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceNodeId, data }: { sourceNodeId: number; data: CreateAttributeRequest }) =>
      attributeService.createAttribute(workspaceSlug, sourceNodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'graph'] });
    },
  });
}

export function useDeleteEdge(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceNodeId, attributeId }: { sourceNodeId: number; attributeId: number }) =>
      attributeService.deleteAttribute(workspaceSlug, sourceNodeId, attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'graph'] });
    },
  });
}
