import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { whiteboardSyncService } from '@/services/whiteboardSyncService';
import { nodeKeys } from './useNodes';
import { childNodeKeys } from './useChildNodes';
import { contextNodeKeys } from './useContextNodes';

export interface DeleteNodeVariables {
  spaceSlug: string;
  nodeId: string;
  force?: boolean;
  parentNodeId?: string;
  contextSlug?: string;
}

export const useDeleteNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spaceSlug, nodeId, force }: DeleteNodeVariables) => {
      return await nodeService.deleteNode(spaceSlug, nodeId, force);
    },

    onSuccess: (_, { spaceSlug, nodeId, parentNodeId, contextSlug }) => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['searchNodes', spaceSlug] });

      if (parentNodeId) {
        queryClient.invalidateQueries({ queryKey: childNodeKeys.children(spaceSlug, parentNodeId) });
      }
      if (contextSlug) {
        queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
      }

      whiteboardSyncService.onNodeDeleted(nodeId);
    },
  });
};
