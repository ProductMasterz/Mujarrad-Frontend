/**
 * useNode Hook (React Query)
 *
 * Fetches a single node by ID with caching (space-scoped)
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { nodeKeys } from './useNodes';

export const useNode = (spaceSlug: string, nodeId: string | null) => {
  return useQuery({
    queryKey: nodeId ? nodeKeys.detail(spaceSlug, nodeId) : ['node', 'null'],
    queryFn: async () => {
      if (!nodeId) throw new Error('Node ID is required');
      if (!spaceSlug) throw new Error('Space slug is required');
      return await nodeService.getNode(spaceSlug, nodeId);
    },
    enabled: !!nodeId && !!spaceSlug, // Only fetch if both are provided
    // Use default staleTime (0) for real-time updates
  });
};
