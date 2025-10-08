/**
 * useNodes Hook (React Query)
 *
 * Fetches all nodes in a workspace with caching and auto-refetch
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { Node, NodeType } from '@/types/backend-dtos';
import type { PaginationParams } from '@/types/api';

export const useNodes = (
  workspaceId: string,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: ['nodes', workspaceId, params],
    queryFn: async () => {
      const response = await nodeService.getNodes(workspaceId, params);
      return response.content; // Return array of nodes
    },
    enabled: !!workspaceId, // Only fetch if workspaceId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime)
  });
};

/**
 * useWorkspaceNodes Hook
 *
 * Fetches nodes in a workspace by slug with optional filtering by type
 */
export const useWorkspaceNodes = (
  workspaceSlug: string,
  options?: { type?: NodeType }
) => {
  return useQuery({
    queryKey: ['workspaceNodes', workspaceSlug, options],
    queryFn: async () => {
      // Fetch nodes by workspace slug (API accepts slugs or IDs)
      const response = await nodeService.getNodes(workspaceSlug, { page: 1, size: 1000 });
      const nodes = response.content;

      // Filter by type if specified
      if (options?.type) {
        return nodes.filter(node => node.nodeType === options.type);
      }

      return nodes;
    },
    enabled: !!workspaceSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
