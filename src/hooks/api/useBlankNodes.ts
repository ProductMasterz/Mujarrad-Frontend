import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api';
import { nodeKeys } from './useNodes';
import { contextNodeKeys } from './useContextNodes';

export const blankKeys = {
  nodes: (spaceSlug: string) => ['blank-nodes', spaceSlug] as const,
  count: (spaceSlug: string) => ['blank-count', spaceSlug] as const,
};

export function useBlankNodes(spaceSlug: string) {
  return useQuery({
    queryKey: blankKeys.nodes(spaceSlug),
    queryFn: () => nodeService.getBlankNodes(spaceSlug),
    enabled: !!spaceSlug,
  });
}

export function useBlankCount(spaceSlug: string) {
  return useQuery({
    queryKey: blankKeys.count(spaceSlug),
    queryFn: () => nodeService.getBlankCount(spaceSlug),
    enabled: !!spaceSlug,
  });
}

export function useAssignFromBlank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, nodeId, contextSlug }: { spaceSlug: string; nodeId: string; contextSlug: string }) =>
      nodeService.assignFromBlank(spaceSlug, nodeId, contextSlug),
    onSuccess: (_, { spaceSlug, contextSlug }) => {
      queryClient.invalidateQueries({ queryKey: blankKeys.nodes(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
    },
  });
}

export function useBulkAssignFromBlank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, nodeIds, contextSlug }: { spaceSlug: string; nodeIds: string[]; contextSlug: string }) =>
      nodeService.bulkAssignFromBlank(spaceSlug, nodeIds, contextSlug),
    onSuccess: (_, { spaceSlug, contextSlug }) => {
      queryClient.invalidateQueries({ queryKey: blankKeys.nodes(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
    },
  });
}
