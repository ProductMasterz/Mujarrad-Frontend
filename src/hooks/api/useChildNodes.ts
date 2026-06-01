import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api';
import { nodeKeys } from './useNodes';
import type { CreateNodeRequest } from '@/types/backend-dtos';

export const childNodeKeys = {
  children: (spaceSlug: string, parentId: string) =>
    ['child-nodes', spaceSlug, parentId] as const,
};

export function useChildNodes(spaceSlug: string, parentId: string) {
  return useQuery({
    queryKey: childNodeKeys.children(spaceSlug, parentId),
    queryFn: () => nodeService.getChildNodes(spaceSlug, parentId),
    enabled: !!spaceSlug && !!parentId,
  });
}

export function useCreateChildNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, parentId, data }: { spaceSlug: string; parentId: string; data: CreateNodeRequest }) =>
      nodeService.createChildNode(spaceSlug, parentId, data),
    onSuccess: (_, { spaceSlug, parentId }) => {
      queryClient.invalidateQueries({ queryKey: childNodeKeys.children(spaceSlug, parentId) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
    },
  });
}

export function useReorderChildren() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, parentId, nodeIds }: { spaceSlug: string; parentId: string; nodeIds: string[] }) =>
      nodeService.reorderChildren(spaceSlug, parentId, nodeIds),
    onSuccess: (_, { spaceSlug, parentId }) => {
      queryClient.invalidateQueries({ queryKey: childNodeKeys.children(spaceSlug, parentId) });
    },
  });
}
