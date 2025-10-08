/**
 * useCreateNode Hook (React Query Mutation)
 *
 * Creates a new node - takes NO parameters (per project conventions)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { CreateNodeRequest } from '@/types/backend-dtos';

export const useCreateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNodeRequest) => {
      return await nodeService.createNode(data);
    },

    // On success, invalidate all node queries to refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaceNodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaceAttributes'] });
    },
  });
};
