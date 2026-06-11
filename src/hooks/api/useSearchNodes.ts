/**
 * useSearchNodes Hook (React Query)
 *
 * Searches nodes in a space with caching and auto-refetch
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { NodeType } from '@/types/backend-dtos';

export const useSearchNodes = (
  spaceSlug: string,
  query: string,
  options?: { nodeType?: NodeType }
) => {
  return useQuery({
    queryKey: ['searchNodes', spaceSlug, query, options],
    queryFn: async () => {
      const response = await nodeService.searchNodes(spaceSlug, {
        q: query,
        nodeType: options?.nodeType,
      });
      return response;
    },
    enabled: !!spaceSlug && !!query, // Only fetch if both are provided
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
