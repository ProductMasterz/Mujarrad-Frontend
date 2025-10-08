/**
 * useNode Hook (React Query)
 *
 * Fetches a single node by ID with caching
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';

export const useNode = (nodeId: string | null) => {
  return useQuery({
    queryKey: ['node', nodeId],
    queryFn: async () => {
      if (!nodeId) throw new Error('Node ID is required');
      return await nodeService.getNode(nodeId);
    },
    enabled: !!nodeId, // Only fetch if nodeId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
