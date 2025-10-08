/**
 * useUpdateNode Hook (React Query Mutation)
 *
 * Updates a node with optimistic updates and version conflict handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { UpdateNodeRequest, Node } from '@/types/backend-dtos';

export interface UpdateNodeVariables {
  nodeId: string;
  data: UpdateNodeRequest;
}

export const useUpdateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nodeId, data }: UpdateNodeVariables) => {
      return await nodeService.updateNode(nodeId, data);
    },

    // Optimistic update
    onMutate: async ({ nodeId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['node', nodeId] });

      // Snapshot previous value
      const previousNode = queryClient.getQueryData(['node', nodeId]);

      // Optimistically update cache
      queryClient.setQueryData<Node>(
        ['node', nodeId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            updatedAt: new Date().toISOString(),
            version: old.version + 1,
          };
        }
      );

      return { previousNode };
    },

    // On error, rollback
    onError: (err, { nodeId }, context) => {
      if (context?.previousNode) {
        queryClient.setQueryData(['node', nodeId], context.previousNode);
      }
    },

    // On success, invalidate related queries
    onSuccess: (data, { nodeId }) => {
      queryClient.invalidateQueries({ queryKey: ['node', nodeId] });
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      queryClient.invalidateQueries({ queryKey: ['nodeAttributes', nodeId] });
    },
  });
};
