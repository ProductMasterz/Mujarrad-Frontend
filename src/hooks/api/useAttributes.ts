// src/hooks/api/useAttributes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeService } from '@/services/api';
import type { CreateAttributeRequest } from '@/types/backend-dtos';

export function useNodeAttributes(workspaceSlug: string, nodeId: number) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'attributes'],
    queryFn: () => attributeService.getNodeAttributes(workspaceSlug, nodeId),
    enabled: !!workspaceSlug && !!nodeId,
  });
}

export function useCreateAttribute(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceNodeId, data }: { sourceNodeId: number; data: CreateAttributeRequest }) =>
      attributeService.createAttribute(workspaceSlug, sourceNodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'nodes']
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'graph']
      });
    },
  });
}

export function useDeleteAttribute(workspaceSlug: string, nodeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attributeId: number) =>
      attributeService.deleteAttribute(workspaceSlug, nodeId, attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'attributes']
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'graph']
      });
    },
  });
}

export function useWorkspaceAttributes(workspaceSlug: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'attributes'],
    queryFn: () => attributeService.getWorkspaceAttributes(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}
