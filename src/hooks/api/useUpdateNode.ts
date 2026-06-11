/**
 * useUpdateNode Hook (React Query Mutation)
 *
 * Updates a node with optimistic updates (space-scoped)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { whiteboardSyncService } from '@/services/whiteboardSyncService';
import type { UpdateNodeRequest, Node } from '@/types/backend-dtos';
import { nodeKeys } from './useNodes';

export interface UpdateNodeVariables {
  spaceSlug: string;
  nodeId: string;
  data: UpdateNodeRequest;
}

export const useUpdateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spaceSlug, nodeId, data }: UpdateNodeVariables) => {
      return await nodeService.updateNode(spaceSlug, nodeId, data);
    },

    // Optimistic update
    onMutate: async ({ spaceSlug, nodeId, data }) => {
      // Cancel outgoing refetches
      const detailKey = nodeKeys.detail(spaceSlug, nodeId);
      await queryClient.cancelQueries({ queryKey: detailKey });

      // Snapshot previous value
      const previousNode = queryClient.getQueryData(detailKey);

      // Optimistically update cache
      queryClient.setQueryData<Node>(
        detailKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
      );

      return { previousNode, detailKey };
    },

    // On error, rollback
    onError: (err, variables, context) => {
      if (context?.previousNode && context?.detailKey) {
        queryClient.setQueryData(context.detailKey, context.previousNode);
      }
    },

    // On success, invalidate related queries
    onSuccess: (data, { spaceSlug, nodeId, data: updateData }) => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(spaceSlug, nodeId) });
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['searchNodes', spaceSlug] });

      if (updateData.nodeDetails) {
        queryClient.invalidateQueries({ queryKey: ['nodeAttributes', nodeId] });
        queryClient.invalidateQueries({ queryKey: ['spaceAttributes'] });
      }

      // Notify sync service of node update (for Node→Frame sync)
      if (data?.id && data?.title) {
        whiteboardSyncService.onNodeUpdated({ id: data.id, title: data.title });
      }
    },
  });
};
