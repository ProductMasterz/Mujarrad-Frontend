/**
 * useNodes Hook (React Query)
 *
 * Fetches all nodes in a space with caching and auto-refetch
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import type { Node, NodeType } from '@/types/backend-dtos';
import type { PaginationParams } from '@/types/api';

/**
 * Node Query Keys
 * Centralized query key factory for node-related queries
 */
export const nodeKeys = {
  all: ['nodes'] as const,
  lists: () => [...nodeKeys.all, 'list'] as const,
  list: (spaceSlug: string, params?: PaginationParams) =>
    [...nodeKeys.lists(), spaceSlug, params] as const,
  details: () => [...nodeKeys.all, 'detail'] as const,
  detail: (spaceSlug: string, nodeId: string) =>
    [...nodeKeys.details(), spaceSlug, nodeId] as const,
};

export const useNodes = (
  spaceSlug: string,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: nodeKeys.list(spaceSlug, params),
    queryFn: async () => {
      return await nodeService.getNodes(spaceSlug, params);
    },
    enabled: !!spaceSlug, // Only fetch if spaceSlug is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime)
  });
};

/**
 * useSpaceNodes Hook
 *
 * Fetches nodes in a space by slug with optional filtering by type
 */
export const useSpaceNodes = (
  spaceSlug: string,
  options?: { type?: NodeType }
) => {
  return useQuery({
    queryKey: [...nodeKeys.list(spaceSlug, { page: 1, size: 1000 }), 'filtered', options],
    queryFn: async () => {
      // Fetch nodes by space slug
      const nodes = await nodeService.getNodes(spaceSlug, { page: 1, size: 1000 });

      // Filter by type if specified
      if (options?.type) {
        return nodes.filter(node => node.nodeType === options.type);
      }

      return nodes;
    },
    enabled: !!spaceSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * @deprecated Use useSpaceNodes instead - workspace terminology is being phased out
 */
export const useWorkspaceNodes = useSpaceNodes;
