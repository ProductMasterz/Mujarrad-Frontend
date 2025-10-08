/**
 * useDeleteNode Hook (React Query Mutation)
 *
 * Deletes a node with cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';

export const useDeleteNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nodeId: string) => {
      return await nodeService.deleteNode(nodeId);
    },

    onSuccess: () => {
      // Invalidate all nodes queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaceNodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-nodes'] });
    },
  });
};
