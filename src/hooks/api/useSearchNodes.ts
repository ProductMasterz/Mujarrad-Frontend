/**
 * useSearchNodes Hook (React Query)
 *
 * Searches nodes in a workspace with caching and auto-refetch
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { NodeType } from '@/types/backend-dtos';

export const useSearchNodes = (
  workspaceSlug: string,
  query: string,
  options?: { nodeType?: NodeType }
) => {
  return useQuery({
    queryKey: ['searchNodes', workspaceSlug, query, options],
    queryFn: async () => {
      const response = await nodeService.searchNodes(workspaceSlug, {
        q: query,
        nodeType: options?.nodeType,
      });
      return response;
    },
    enabled: !!workspaceSlug && !!query, // Only fetch if both are provided
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes (search results may change)
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
