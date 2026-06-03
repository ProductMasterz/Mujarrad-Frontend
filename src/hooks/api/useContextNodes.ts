import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api';
import { nodeKeys } from './useNodes';
import type { CreateNodeRequest } from '@/types/backend-dtos';

export const contextNodeKeys = {
  nodes: (spaceSlug: string, contextSlug: string) => ['context-nodes', spaceSlug, contextSlug] as const,
  children: (spaceSlug: string, contextSlug: string) => ['context-children', spaceSlug, contextSlug] as const,
};

export function useContextNodes(spaceSlug: string, contextSlug: string) {
  return useQuery({
    queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug),
    queryFn: () => nodeService.getNodesInContext(spaceSlug, contextSlug),
    enabled: !!spaceSlug && !!contextSlug,
  });
}

export function useChildContexts(spaceSlug: string, contextSlug: string) {
  return useQuery({
    queryKey: contextNodeKeys.children(spaceSlug, contextSlug),
    queryFn: () => nodeService.getChildContexts(spaceSlug, contextSlug),
    enabled: !!spaceSlug && !!contextSlug,
  });
}

export function useCreateNodeInContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, contextSlug, data }: { spaceSlug: string; contextSlug: string; data: CreateNodeRequest }) =>
      nodeService.createNodeInContext(spaceSlug, contextSlug, data),
    onSuccess: (_, { spaceSlug, contextSlug }) => {
      queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
    },
  });
}

export function useRemoveFromContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, contextSlug, nodeId }: { spaceSlug: string; contextSlug: string; nodeId: string }) =>
      nodeService.removeFromContext(spaceSlug, contextSlug, nodeId),
    onSuccess: (_, { spaceSlug, contextSlug }) => {
      queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
    },
  });
}

export function useCreateNestedContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, parentContextSlug, data }: { spaceSlug: string; parentContextSlug: string; data: CreateNodeRequest }) =>
      nodeService.createNestedContext(spaceSlug, parentContextSlug, data),
    onSuccess: (_, { spaceSlug, parentContextSlug }) => {
      queryClient.invalidateQueries({ queryKey: contextNodeKeys.children(spaceSlug, parentContextSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
    },
  });
}
