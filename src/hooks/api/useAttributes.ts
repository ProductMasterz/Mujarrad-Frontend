/**
 * useAttributes Hook (React Query)
 *
 * Fetches attributes (relationships) for a node with caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeService } from '@/services/api/attribute.service';
import type { CreateAttributeRequest } from '@/types/backend-dtos';

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

export const useIncomingAttributes = (
  nodeId: string | null,
  params?: { attributeType?: string }
) => {
  return useQuery({
    queryKey: ['incomingAttributes', nodeId, params],
    queryFn: async () => {
      if (!nodeId) throw new Error('Node ID is required');
      return await attributeService.getIncomingAttributes(nodeId, params);
    },
    enabled: !!nodeId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * useSpaceAttributes Hook
 *
 * Fetches all attributes in a space (for graph visualization)
 */
export const useSpaceAttributes = (spaceId: string | null) => {
  return useQuery({
    queryKey: ['spaceAttributes', spaceId],
    queryFn: async () => {
      if (!spaceId) throw new Error('Space ID is required');
      return await attributeService.getSpaceAttributes(spaceId);
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * useCreateAttribute Hook
 *
 * Creates a new attribute (relationship/edge) between nodes with optimistic updates
 */
export const useCreateAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceNodeId,
      data,
    }: {
      sourceNodeId: string;
      data: CreateAttributeRequest;
    }) => {
      return await attributeService.createAttribute(sourceNodeId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['nodeAttributes', variables.sourceNodeId] });
      queryClient.invalidateQueries({ queryKey: ['nodeAttributes', variables.data.targetNodeId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['spaceAttributes'] });
    },
  });
};
