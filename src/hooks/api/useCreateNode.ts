/**
 * useCreateNode Hook (React Query Mutation)
 *
 * Creates a new node in a space - takes NO parameters (per project conventions)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { whiteboardSyncService } from '@/services/whiteboardSyncService';
import type { CreateNodeRequest } from '@/types/backend-dtos';
import { nodeKeys } from './useNodes';
import { spaceKeys } from './useSpaces';
import { contextNodeKeys } from './useContextNodes';
import { blankKeys } from './useBlankNodes';

export interface CreateNodeVariables {
  spaceSlug: string;
  data: CreateNodeRequest;
  contextSlug?: string;
}

export const useCreateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spaceSlug, data, contextSlug }: CreateNodeVariables) => {
      if (contextSlug) {
        return await nodeService.createNodeInContext(spaceSlug, contextSlug, data);
      }
      return await nodeService.createNode(spaceSlug, data);
    },

    // On success, invalidate all node queries to refetch
    onSuccess: (data, { spaceSlug, contextSlug }) => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.all });
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      queryClient.invalidateQueries({ queryKey: blankKeys.count(spaceSlug) });
      if (contextSlug) {
        queryClient.invalidateQueries({ queryKey: contextNodeKeys.nodes(spaceSlug, contextSlug) });
      }

      // Notify sync service of node creation (for Node→Frame sync)
      if (data?.id && data?.title) {
        whiteboardSyncService.onNodeCreated({ id: data.id, title: data.title });
      }
    },
  });
};
