/**
 * useDeleteNode Hook (React Query Mutation)
 *
 * Deletes a node with cache invalidation (space-scoped)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { nodeKeys } from './useNodes';

export interface DeleteNodeVariables {
  spaceSlug: string;
  nodeId: string;
  force?: boolean;
}

export const useDeleteNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spaceSlug, nodeId, force }: DeleteNodeVariables) => {
      return await nodeService.deleteNode(spaceSlug, nodeId, force);
    },

    onSuccess: () => {
      // Invalidate all nodes queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
    },
  });
};
