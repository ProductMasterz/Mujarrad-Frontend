import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api';
import { nodeKeys } from './useNodes';
import { NodeType, type Node } from '@/types/backend-dtos';

export const blankKeys = {
  nodes: (spaceSlug: string) => ['blank-nodes', spaceSlug] as const,
  count: (spaceSlug: string) => ['blank-count', spaceSlug] as const,
};

function getNodeDetails(node: Node): Record<string, unknown> {
  if (typeof node.nodeDetails === 'string') {
    try {
      return JSON.parse(node.nodeDetails);
    } catch {
      return {};
    }
  }

  return (node.nodeDetails as Record<string, unknown> | undefined) ?? {};
}

function isBlankNode(node: Node): boolean {
  const details = getNodeDetails(node);
  const title = String(node.title || '').toLowerCase();
  const slugValue = String(node.slug || '').toLowerCase();

  if (node.isBuiltin) return false;
  if (node.nodeType === NodeType.CONTEXT) return false;

  if (details.showInSpaceList === false) return false;
  if (details.blockType) return false;

  // Already assigned to a context
  if (details.contextSlug) return false;
  if (details.parentContextSlug) return false;
  if (details.contextId) return false;

  // Hide chat/system infrastructure
  if (details.systemContext === 'chat') return false;
  if (details.chatNodeType) return false;
  if (details.createdFrom === 'chat') return false;
  if (details.createdFrom === 'assistant-ui') return false;

  if (details.role === 'conversation') return false;
  if (details.role === 'user') return false;
  if (details.role === 'assistant') return false;

  if (title === 'mujarrad chat') return false;
  if (slugValue === 'mujarrad-chat') return false;
  if (title.includes('conversation')) return false;
  if (title.includes('assistant message')) return false;
  if (title.includes('user message')) return false;

  return true;
}

export function useBlankNodes(spaceSlug: string) {
  return useQuery({
    queryKey: blankKeys.nodes(spaceSlug),
    queryFn: async () => {
      const nodes = await nodeService.getNodes(spaceSlug, {
        page: 0,
        size: 1000,
      });

      return Array.isArray(nodes) ? nodes.filter(isBlankNode) : [];
    },
    enabled: !!spaceSlug,

    // Keeps The Blank panel updated when chat/AI creates unassigned nodes.
    refetchInterval: 4000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useBlankCount(spaceSlug: string) {
  return useQuery({
    queryKey: blankKeys.count(spaceSlug),
    queryFn: async () => {
      const nodes = await nodeService.getNodes(spaceSlug, {
        page: 0,
        size: 1000,
      });

      return Array.isArray(nodes) ? nodes.filter(isBlankNode).length : 0;
    },
    enabled: !!spaceSlug,

    refetchInterval: 4000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useAssignFromBlank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spaceSlug,
      nodeId,
      contextSlug,
    }: {
      spaceSlug: string;
      nodeId: string;
      contextSlug: string;
    }) => nodeService.assignFromBlank(spaceSlug, nodeId, contextSlug),

    onSuccess: (_, { spaceSlug }) => {
      queryClient.invalidateQueries({ queryKey: blankKeys.nodes(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'graph-page', 'nodes'] });
    },
  });
}

export function useBulkAssignFromBlank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spaceSlug,
      nodeIds,
      contextSlug,
    }: {
      spaceSlug: string;
      nodeIds: string[];
      contextSlug: string;
    }) => nodeService.bulkAssignFromBlank(spaceSlug, nodeIds, contextSlug),

    onSuccess: (_, { spaceSlug }) => {
      queryClient.invalidateQueries({ queryKey: blankKeys.nodes(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'graph-page', 'nodes'] });
    },
  });
}