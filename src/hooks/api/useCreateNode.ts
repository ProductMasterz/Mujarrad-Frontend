/**
 * useCreateNode Hook (React Query Mutation)
 *
 * Creates a new node with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { CreateNodeRequest, Node } from '@/types/backend-dtos';

export const useCreateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNodeRequest) => {
      return await nodeService.createNode(data);
    },

    // Optimistic update
    onMutate: async (newNode) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['nodes', newNode.workspaceId] });

      // Snapshot previous value
      const previousNodes = queryClient.getQueryData(['nodes', newNode.workspaceId]);

      // Optimistically update cache with temp ID
      queryClient.setQueryData<Node[]>(
        ['nodes', newNode.workspaceId],
        (old) => {
          if (!old) return old;
          const tempNode: Node = {
            id: Date.now(),
            workspaceId: typeof newNode.workspaceId === 'string' ? parseInt(newNode.workspaceId) : newNode.workspaceId,
            title: newNode.title,
            nodeType: newNode.nodeType,
            content: newNode.markdownContent || '',
            nodeDetails: newNode.nodeDetails || {},
            createdBy: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          };
          return [...old, tempNode];
        }
      );

      return { previousNodes };
    },

    // On error, rollback
    onError: (err, newNode, context) => {
      if (context?.previousNodes) {
        queryClient.setQueryData(
          ['nodes', newNode.workspaceId],
          context.previousNodes
        );
      }
    },

    // On success, invalidate and refetch
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', variables.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaceAttributes', variables.workspaceId] });
    },
  });
};
