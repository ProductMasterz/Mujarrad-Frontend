/**
 * useAttributes Hook (React Query)
 *
 * Fetches attributes (relationships) for a node with caching
 */

import { useQuery } from '@tanstack/react-query';
import { attributeService } from '@/services/api/attribute.service';

export const useAttributes = (
  nodeId: string | null,
  params?: { attributeType?: string }
) => {
  return useQuery({
    queryKey: ['nodeAttributes', nodeId, params],
    queryFn: async () => {
      if (!nodeId) throw new Error('Node ID is required');
      return await attributeService.getNodeAttributes(nodeId, params);
    },
    enabled: !!nodeId, // Only fetch if nodeId is provided
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

/**
 * useWorkspaceAttributes Hook
 *
 * Fetches all attributes in a workspace (for graph visualization)
 */
export const useWorkspaceAttributes = (workspaceId: string | null) => {
  return useQuery({
    queryKey: ['workspaceAttributes', workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      return await attributeService.getWorkspaceAttributes(workspaceId);
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
